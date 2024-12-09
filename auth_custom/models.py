from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from django.utils import timezone
from django.core.mail import send_mail


class User(AbstractBaseUser):

    is_superuser = models.BooleanField(
        "superuser status",
        default=False,
        help_text="Designates that this user has all permissions without "
        "explicitly assigning them.",
    )

    is_staff = models.BooleanField(
        "staff status",
        default=False,
        help_text="Designates whether the user can log into this admin site.",
    )
    is_active = models.BooleanField(
        "active",
        default=True,
        help_text="Designates whether this user should be treated as active. "
        "Unselect this instead of deleting accounts.",
    )
    date_joined = models.DateTimeField("date joined", default=timezone.now)
    first_name = models.CharField("first name", max_length=150, blank=True)
    last_name = models.CharField("last name", max_length=150, blank=True)
    email = models.EmailField("email address", blank=True, unique=True, null=True)
    is_admin = models.BooleanField(default=False)
    device_id = models.CharField(max_length=100, null=True)
    otp_key = models.CharField(max_length=50, null=True, blank=True, default=None)
    verified = models.BooleanField(default=False)
    verification_code = models.CharField(max_length=100, null=True)

    EMAIL_FIELD = "email"
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    class Meta:
        verbose_name = "user"
        verbose_name_plural = "users"
        abstract = True

    def clean(self):
        super().clean()
        self.email = self.__class__.objects.normalize_email(self.email)

    def get_full_name(self):
        """
        Return the first_name plus the last_name, with a space in between.
        """
        full_name = "%s %s" % (self.first_name, self.last_name)
        return full_name.strip()

    def get_short_name(self):
        """Return the short name for the user."""
        return self.first_name

    def email_user(self, subject, message, from_email=None, **kwargs):
        """Send an email to this user."""
        send_mail(subject, message, from_email, [self.email], **kwargs)
        
    def get_all_permissions(self):
        permissions = self.role.permission.all()
        return permissions
    
    def has_perm_custom(self, perm):
        if not self.role: return False
        has_perm = self.role.permission.filter(
            codename = perm
        )
        return True if len(has_perm) != 0 else False
    
        
        
        
    #for django admin site

    def has_module_perms(self, app_label):
        if self.is_staff and self.is_superuser and self.is_admin and self.is_active:
            return True

    def has_perms(self, perm_list, obj=None):
        if self.is_staff and self.is_superuser and self.is_admin and self.is_active:
            return True

    def has_perm(self, perm, obj=None):
        if self.is_staff and self.is_superuser and self.is_admin and self.is_active:
            return True
