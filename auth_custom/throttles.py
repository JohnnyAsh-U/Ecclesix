from django.core.cache import cache
from django.utils import timezone
from rest_framework.throttling import SimpleRateThrottle


def _get_ident(request):
    """Return a best-effort client identifier (IP). Uses X-Forwarded-For first."""
    try:
        xff = request.META.get('HTTP_X_FORWARDED_FOR')
        if xff:
            return xff.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR') or request.META.get('REMOTE_HOST')
    except Exception:
        return None


def _extract_email_from_request(request):
    # Try common locations for email in login/reset requests
    try:
        if isinstance(request.data, dict):
            vals = request.data.get('values') if 'values' in request.data else request.data
            if isinstance(vals, dict):
                return vals.get('email') or request.data.get('email')
        # fallback to query params
        return request.query_params.get('email')
    except Exception:
        return None


def register_failed_login(request, email=None):
    """Record a failed login attempt for IP and optionally email, and apply exponential backoff lockouts."""
    ident = _get_ident(request)
    now = timezone.now().timestamp()
    keys = []
    if ident:
        keys.append(('ip', ident))
    if email:
        keys.append(('email', email.lower()))

    for ktype, key in keys:
        fail_key = f'login:fail:{ktype}:{key}'
        attempts = cache.get(fail_key, 0) + 1
        cache.set(fail_key, attempts, timeout=60 * 60 * 24)  # keep attempts for 24h

        # exponential backoff: base 5s, double each attempt, cap 1h
        backoff = min(3600, 5 * (2 ** (max(0, attempts - 1))))
        lock_key = f'login:lock:{ktype}:{key}'
        lock_until = now + backoff
        cache.set(lock_key, lock_until, timeout=backoff)


def clear_failed_login(request, email=None):
    ident = _get_ident(request)
    keys = []
    if ident:
        keys.append(('ip', ident))
    if email:
        keys.append(('email', email.lower()))
    for ktype, key in keys:
        cache.delete(f'login:fail:{ktype}:{key}')
        cache.delete(f'login:lock:{ktype}:{key}')


class LoginThrottle(SimpleRateThrottle):
    """Throttle for login attempts with per-IP and per-email backoff/locks.

    Behavior:
    - Enforces a simple rate (default 5/min) per IP.
    - Checks for explicit lockouts created by `register_failed_login` (per-IP and per-email).
    - Returns False (throttle) if either lock is active or rate exceeded.
    """
    scope = 'login'

    def allow_request(self, request, view):
        ident = _get_ident(request)
        email = _extract_email_from_request(request) or ''
        now = timezone.now().timestamp()

        # check lock keys first (ip and email)
        if ident:
            lock_ip = cache.get(f'login:lock:ip:{ident}')
            if lock_ip and lock_ip > now:
                # remember locked until for wait() computation
                self.locked_until = lock_ip
                return False

        if email:
            lock_email = cache.get(f'login:lock:email:{email.lower()}')
            if lock_email and lock_email > now:
                self.locked_until = lock_email
                return False

        # fallback to simple rate per IP using parent implementation
        # parent expects get_cache_key to generate key based on ident
        return super().allow_request(request, view)

    def wait(self):
        """Return seconds to wait. If locked by exponential backoff, compute from cache lock."""
        now = timezone.now().timestamp()
        if hasattr(self, 'locked_until') and self.locked_until:
            secs = max(0, int(self.locked_until - now))
            return secs
        # fallback to parent behavior (rate-based)
        return super().wait()

    def get_cache_key(self, request, view):
        """Return a cache key based on client ident (IP)."""
        ident = _get_ident(request)
        if not ident:
            return None
        # use DRF's cache_format to stay consistent
        return self.cache_format % {'scope': self.scope, 'ident': ident}


class PasswordResetThrottle(SimpleRateThrottle):
    """Throttle password reset / OTP requests per IP+email using DRF sliding window."""
    scope = 'pwreset'

    def get_cache_key(self, request, view):
        ident = _get_ident(request)
        email = _extract_email_from_request(request) or ''
        if not ident and not email:
            return None
        # include both ident and email in key so it's scoped to the combination
        return f'pwreset:{ident}:{email.lower()}'
