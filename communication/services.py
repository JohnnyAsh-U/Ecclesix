from django.core.mail import EmailMultiAlternatives
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
    def send_email(subject, message, recipients):
        emails = [m.email for m in recipients if m.email]
        if not emails:
            return {
                "success": 0,
                "failed": len(recipients),
                "reason": "No valid email recipients",
            }

        msg = EmailMultiAlternatives(
            subject,
            message,
            "Church Management System <info@chms.site>",
            [],
            bcc=emails,
        )
        msg.send(fail_silently=False)

        return {
            "success": len(emails),
            "failed": max(0, len(recipients) - len(emails)),
            "reason": "",
        }

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
