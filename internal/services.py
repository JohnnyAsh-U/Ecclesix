from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags


def send_welcome_email(superadmin_email, church_name, password, domain):
    """Send welcome email with credentials to superadmin (in French)."""
    try:
        subject = f"Bienvenue sur {church_name} - Compte ChMS Créé"
        
        context = {
            "church_name": church_name,
            "superadmin_email": superadmin_email,
            "password": password,
            "domain": domain,
            "login_url": f"https://{domain}/login",
        }
        
        # Try to use HTML template, fallback to French plain text
        try:
            html_message = render_to_string("emails/welcome.html", context)
            plain_message = strip_tags(html_message)
        except Exception:
            plain_message = f"""Bienvenue sur {church_name} Ecclesix!

Votre compte superadmin a été créé avec succès.

Email: {superadmin_email}
Mot de passe: {password}

Connectez-vous à: https://{domain}/login

Veuillez changer votre mot de passe après votre première connexion.
"""
            html_message = None

        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[superadmin_email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Failed to send welcome email: {str(e)}")
        return False
