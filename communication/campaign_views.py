"""
Campaign DRF APIViews.
No provider logic here - all delegated to service layer and factories.
"""
from rest_framework.views import APIView
from rest_framework.generics import DestroyAPIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django_tenants.utils import get_tenant
import logging

from communication.models import Campaign, CampaignRecipient, ProviderConfig
from communication.serializers import (
    CampaignCreateSerializer,
    CampaignListSerializer,
    CampaignDetailSerializer,
    CampaignRecipientSerializer,
    ProviderConfigSerializer,
    ProviderConfigCreateSerializer,
)
from communication.campaign_service import CampaignService
from communication.factories import ChannelFactory, ProviderFactory
from communication.tasks import process_campaign, retry_failed_campaign_recipients
from admin_custom.models import Log

logger = logging.getLogger(__name__)


class CampaignListCreateAPIView(APIView):
    """
    List all campaigns or create a new campaign.
    GET /api/communications/campaigns/ - List campaigns with optional filtering
    POST /api/communications/campaigns/ - Create new campaign
    """
    perms = {
        "OPTIONS": ["superadmin"],
        "POST": ["envoyer_communication", "envoyer_toutes_communications"],
        "GET": ["envoyer_communication", "envoyer_toutes_communications"],
    }
    
    def get(self, request):
        """
        List campaigns with optional filtering.
        
        Query params:
        - status: 'draft', 'queued', 'processing', 'completed', 'failed', 'paused'
        - channel: 'email', 'whatsapp'
        - provider: provider name
        """
        try:
            campaigns = Campaign.objects.all().order_by("-created_at")
            
            # Filter by status if provided
            status_param = request.query_params.get('status')
            if status_param:
                campaigns = campaigns.filter(status=status_param)
            
            # Filter by channel if provided
            channel_param = request.query_params.get('channel')
            if channel_param:
                campaigns = campaigns.filter(channel=channel_param)
            
            # Filter by provider if provided
            provider_param = request.query_params.get('provider')
            if provider_param:
                campaigns = campaigns.filter(provider=provider_param)
            
            serializer = CampaignListSerializer(campaigns, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        except Exception as e:
            logger.exception(f"Failed to list campaigns: {e}")
            return Response(
                {"detail": "Failed to list campaigns"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        """
        Create a new campaign.
        
        POST /api/communications/campaigns/
        {
            "channel": "email",
            "provider": "resend",
            "name": "Sunday Reminder",
            "subject": "Sunday Service",
            "body": "Service starts at 8AM",
            "member_ids": [1, 2, 3],
            "scheduled_at": "2024-05-15T10:00:00Z"
        }
        """
        serializer = CampaignCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            campaign = CampaignService.create_campaign(
                channel=serializer.validated_data["channel"],
                provider=serializer.validated_data["provider"],
                name=serializer.validated_data["name"],
                subject=serializer.validated_data.get("subject"),
                body=serializer.validated_data["body"],
                member_ids=serializer.validated_data["member_ids"],
                scheduled_at=serializer.validated_data.get("scheduled_at"),
                created_by=request.user,
            )

            # Log creation
            Log.objects.create(
                admin_id=request.user.id,
                log_type="INSERT",
                detail={
                    "resource": "Campaign",
                    "id": campaign.id,
                    "lib": f"{campaign.name} ({campaign.total_recipients} recipients)",
                },
            )

            response_serializer = CampaignDetailSerializer(campaign)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        except ValueError as e:
            logger.warning(f"Campaign creation validation failed: {e}")
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.exception(f"Campaign creation failed: {e}")
            return Response(
                {"detail": "Failed to create campaign"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CampaignDetailAPIView(APIView):
    """
    Retrieve, update, or delete a campaign.
    GET /api/communications/campaigns/{id}/
    PATCH /api/communications/campaigns/{id}/
    DELETE /api/communications/campaigns/{id}/
    """
    permission_classes = [IsAuthenticated]

    def get_campaign(self, campaign_id):
        """Get campaign or return 404."""
        return get_object_or_404(Campaign, id=campaign_id)

    def get(self, request, campaign_id):
        """Get campaign details with recipients."""
        try:
            campaign = self.get_campaign(campaign_id)
            serializer = CampaignDetailSerializer(campaign)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception(f"Failed to retrieve campaign {campaign_id}: {e}")
            return Response(
                {"detail": "Failed to retrieve campaign"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def patch(self, request, campaign_id):
        """Update campaign (only certain fields)."""
        try:
            campaign = self.get_campaign(campaign_id)
            
            # Only allow updating certain fields
            allowed_fields = {'name', 'status', 'scheduled_at'}
            data = {k: v for k, v in request.data.items() if k in allowed_fields}
            
            if 'name' in data:
                campaign.name = data['name']
            if 'status' in data:
                campaign.status = data['status']
            if 'scheduled_at' in data:
                campaign.scheduled_at = data['scheduled_at']
            
            campaign.save()
            
            serializer = CampaignDetailSerializer(campaign)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        except Exception as e:
            logger.exception(f"Failed to update campaign {campaign_id}: {e}")
            return Response(
                {"detail": "Failed to update campaign"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request, campaign_id):
        """Delete campaign."""
        try:
            campaign = self.get_campaign(campaign_id)
            campaign_name = campaign.name
            campaign.delete()
            
            # Log deletion
            Log.objects.create(
                admin_id=request.user.id,
                log_type="DELETE",
                detail={
                    "resource": "Campaign",
                    "id": campaign_id,
                    "lib": campaign_name,
                },
            )
            
            return Response(
                {"message": "Campaign deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )
        
        except Exception as e:
            logger.exception(f"Failed to delete campaign {campaign_id}: {e}")
            return Response(
                {"detail": "Failed to delete campaign"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CampaignSendAPIView(APIView):
    """
    Send campaign immediately.
    POST /api/communications/campaigns/{id}/send/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, campaign_id):
        """Queue campaign for sending."""
        try:
            campaign = get_object_or_404(Campaign, id=campaign_id)

            if campaign.status not in ["draft", "queued"]:
                return Response(
                    {"detail": f"Cannot send campaign with status '{campaign.status}'"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            campaign.status = "processing"
            campaign.started_at = timezone.now()
            campaign.save(update_fields=["status", "started_at"])

            # Queue recipients for async sending via Dramatiq
            tenant = get_tenant()
            schema_name = tenant.schema_name if tenant else 'public'
            process_campaign.send(campaign.id, schema_name)
            
            logger.info(f"Queued campaign {campaign.id} for sending in schema {schema_name}")
            
            return Response({
                "id": campaign.id,
                "status": "processing",
                "message": "Campaign queued for sending"
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception(f"Failed to send campaign {campaign_id}: {e}")
            return Response(
                {"detail": "Failed to queue campaign"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CampaignRetryFailedAPIView(APIView):
    """
    Retry failed recipients for a campaign.
    POST /api/communications/campaigns/{id}/retry_failed/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, campaign_id):
        """Queue retry task for failed recipients."""
        try:
            campaign = get_object_or_404(Campaign, id=campaign_id)

            # Queue retry task for async processing
            tenant = get_tenant()
            schema_name = tenant.schema_name if tenant else 'public'
            max_retries = request.data.get("max_retries", 3)
            
            retry_failed_campaign_recipients.send(campaign.id, schema_name, max_retries)
            
            logger.info(f"Queued retry for campaign {campaign.id} in schema {schema_name}")
            
            return Response({
                "campaign_id": campaign.id,
                "message": f"Queued retry for failed recipients (max {max_retries} attempts)"
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception(f"Failed to retry campaign {campaign_id}: {e}")
            return Response(
                {"detail": "Failed to retry failed recipients"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CampaignStatsAPIView(APIView):
    """
    Get campaign statistics.
    GET /api/communications/campaigns/{id}/statistics/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, campaign_id):
        """Get campaign delivery statistics."""
        try:
            campaign = get_object_or_404(Campaign, id=campaign_id)
            stats = CampaignService.get_campaign_stats(campaign)
            return Response(stats, status=status.HTTP_200_OK)
        
        except Exception as e:
            logger.exception(f"Failed to get campaign stats {campaign_id}: {e}")
            return Response(
                {"detail": "Failed to get campaign statistics"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProviderConfigListCreateAPIView(APIView):
    """
    List all provider configs or create a new one.
    GET /api/communications/provider-configs/
    POST /api/communications/provider-configs/
    """
    perms = {
        "OPTIONS": ["superadmin"],
        "POST": ["superadmin"],
        "GET": ["superadmin"],
    }

    def get(self, request):
        """List provider configurations with optional filtering."""
        try:
            configs = ProviderConfig.objects.all()
            
            # Filter by channel if provided
            channel_param = request.query_params.get('channel')
            if channel_param:
                configs = configs.filter(channel=channel_param)
            
            # Filter by provider if provided
            provider_param = request.query_params.get('provider')
            if provider_param:
                configs = configs.filter(provider=provider_param)
            
            # Filter by is_active if provided
            is_active_param = request.query_params.get('is_active')
            if is_active_param:
                is_active = is_active_param.lower() in ['true', '1', 'yes']
                configs = configs.filter(is_active=is_active)
            
            serializer = ProviderConfigSerializer(configs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        except Exception as e:
            logger.exception(f"Failed to list provider configs: {e}")
            print(e)
            return Response(
                {"detail": "Failed to list provider configurations"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        """Create provider configuration with connection test."""
        serializer = ProviderConfigCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            name = serializer.validated_data["name"]
            channel = serializer.validated_data["channel"]
            provider = serializer.validated_data["provider"]
            credentials = serializer.validated_data["credentials"]

            # Get or create config
            config, created = ProviderConfig.objects.get_or_create(
                channel=channel,
                provider=provider,
                name=name,
                defaults={"is_active": True}
            )

            # Update credentials and mark as verified
            config.credentials = credentials
            config.is_verified = True
            config.last_tested_at = timezone.now()
            config.test_error = ""
            config.save()

            # Log creation/update
            Log.objects.create(
                admin_id=request.user.id,
                log_type="INSERT" if created else "UPDATE",
                detail={
                    "resource": "ProviderConfig",
                    "id": config.id,
                    "lib": f"{config.get_channel_display()} - {config.get_provider_display()}",
                },
            )

            response_serializer = ProviderConfigSerializer(config)
            return Response(
                response_serializer.data,
                status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
            )

        except ValueError as e:
            logger.warning(f"Provider config validation failed: {e}")
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.exception(f"Provider config creation failed: {e}")
            return Response(
                {"detail": "Failed to configure provider"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProviderConfigDeleteAPIView(DestroyAPIView):
    """
    DELETE /api/communications/provider-configs/{id}/
    """
    perms = {
        "OPTIONS": ["superadmin"],
        "DELETE": ["superadmin"],
    }

    def get_config(self, id):
        """Get provider config or return 404."""
        return get_object_or_404(ProviderConfig, id=id)


    def delete(self, request, id):
        """Delete provider configuration."""
        try:
            config = self.get_config(id)
            config_name = f"{config.get_channel_display()} - {config.get_provider_display()}"
            config.delete()
            
            # Log deletion
            Log.objects.create(
                admin_id=request.user.id,
                log_type="DELETE",
                detail={
                    "resource": "ProviderConfig",
                    "id": id,
                    "lib": config_name,
                },
            )
            
            return Response(
                {"message": "Provider configuration deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )
        
        except Exception as e:
            logger.exception(f"Failed to delete provider config {id}: {e}")
            return Response(
                {"detail": "Failed to delete provider configuration"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class WebhookView(APIView):
    """
    Handle provider webhooks for delivery status updates.
    POST /api/communications/webhooks/provider/
    """
    permission_classes = []  # Webhooks should use provider signatures instead

    def post(self, request):
        """Handle incoming webhook from provider."""
        provider = request.query_params.get('provider')
        
        if not provider:
            return Response(
                {"detail": "Provider not specified"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Get provider instance (webhooks should be signed by provider)
            provider_config = ProviderConfig.objects.filter(
                provider=provider,
                is_active=True
            ).first()

            if not provider_config:
                logger.warning(f"Webhook received for unconfigured provider: {provider}")
                return Response({"ok": True}, status=status.HTTP_200_OK)

            # Let provider handle webhook
            provider_instance = ProviderFactory.create(provider, provider_config.credentials)
            provider_instance.handle_webhook(request.data)

            logger.info(f"Processed webhook from {provider}")
            return Response({"ok": True}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception(f"Webhook processing failed: {e}")
            return Response(
                {"detail": "Webhook processing failed"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
