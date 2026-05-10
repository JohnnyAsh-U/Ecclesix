from django.core.mail import EmailMultiAlternatives, get_connection
from admin_custom.constant import CHURCH_NAME_KEY, EMAIL_SMTP_HOST_KEY, EMAIL_SMTP_PASSWORD_KEY, EMAIL_SMTP_PORT_KEY, EMAIL_SMTP_PROTOCOL_KEY, EMAIL_SMTP_USERNAME_KEY
from admin_custom.services import load_app_configs_to_cache
from members.models import Member


class CommunicationService:
    @staticmethod
    def get_recipients(user, member_ids):
        qs = Member.objects.filter(pk__in=member_ids)

        # Restrict to user's church unless superadmin or with all-church communication permission.
        if not user.is_superuser and not user.has_perm_custom("envoyer_toutes_communications"):
            qs = qs.filter(church_id=user.church_id)

        return list(qs)

    @staticmethod
    def send_email(subject, message, recipients, request):
        emails = [m.email for m in recipients if m.email]
        if not emails:
            return {
                "success": 0,
                "failed": len(recipients),
                "reason": "No valid email recipients",
            }
            
        configs = load_app_configs_to_cache(force=True)
        
        # Church name from request tenant or fallback to config
        church_name = getattr(request.tenant, "name", None) 
      
        email_config = {
            "smtp_host": configs.get(EMAIL_SMTP_HOST_KEY, ""),
            "smtp_port": configs.get(EMAIL_SMTP_PORT_KEY, "587"),
            "smtp_username": configs.get(EMAIL_SMTP_USERNAME_KEY, ""),
            "smtp_password": configs.get(EMAIL_SMTP_PASSWORD_KEY, ""),
            "smtp_protocol": configs.get(EMAIL_SMTP_PROTOCOL_KEY, "SSL"),
        }
        
        # Basic sanity check for configuration
        if not email_config["smtp_host"]:
            return {
                "success": 0,
                "failed": len(recipients),
                "reason": "SMTP pas configuré: hôte manquant",
            }

        connection = get_connection(
            host=email_config["smtp_host"],
            port=int(email_config["smtp_port"]),
            username=email_config["smtp_username"],
            password=email_config["smtp_password"],
            use_tls=email_config["smtp_protocol"].upper() == "TLS",
            use_ssl=email_config["smtp_protocol"].upper() == "SSL",
            fail_silently=False,
        )
        # Test opening the connection before attempting to send
        try:
            connection.open()
        except Exception as e:
            return {
                "success": 0,
                "failed": len(recipients),
                "reason": f"Échec de la connexion SMTP : {e}",
            }

        try:
            msg = EmailMultiAlternatives(
                subject,
                message,
                f"{church_name or configs.get(CHURCH_NAME_KEY, 'Ecclesix')} <{email_config['smtp_username']}>",
                [],
                bcc=emails,
                connection=connection,
            )
            msg.send(fail_silently=False)

            return {
                "success": len(emails),
                "failed": max(0, len(recipients) - len(emails)),
                "reason": "",
            }
        finally:
            try:
                connection.close()
            except Exception:
                pass



    @staticmethod
    def send_sms(message, recipients):
        # Placeholder implementation until an SMS provider is configured.
        phones = [m.phone for m in recipients if m.phone]
        if not phones:
            return {
                "success": 0,
                "failed": len(recipients),
                "reason": "No valid phone recipients",
            }

        return {
            "success": len(phones),
            "failed": max(0, len(recipients) - len(phones)),
            "reason": "SMS provider not configured; recipients validated only",
        }
