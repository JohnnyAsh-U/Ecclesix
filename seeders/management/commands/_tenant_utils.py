from django.core.management.base import CommandError
from django_tenants.utils import get_public_schema_name, schema_context

from tenants.models import TenantDomain


class TenantDomainCommandMixin:
    def add_tenant_arguments(self, parser):
        group = parser.add_mutually_exclusive_group()
        group.add_argument(
            "--domain",
            help="Run the command for a specific active tenant domain.",
        )
        group.add_argument(
            "--all-domains",
            action="store_true",
            help="Run the command for all active tenant domains.",
        )
        parser.add_argument(
            "--include-public",
            action="store_true",
            help="Also include the public schema when using --all-domains.",
        )

    def get_target_schemas(self, options):
        domain = (options.get("domain") or "").strip().lower().rstrip(".")
        all_domains = options.get("all_domains", False)
        include_public = options.get("include_public", False)

        if domain:
            tenant_domain = (
                TenantDomain.objects.select_related("tenant")
                .filter(domain=domain, is_active=True)
                .first()
            )
            if tenant_domain is None or tenant_domain.tenant is None:
                raise CommandError(f"No active tenant found for domain '{domain}'.")

            if hasattr(tenant_domain.tenant, "is_active") and not tenant_domain.tenant.is_active:
                raise CommandError(f"The tenant for domain '{domain}' is inactive.")

            return [(tenant_domain.tenant.schema_name, tenant_domain.domain)]

        if not all_domains:
            return []

        queryset = TenantDomain.objects.select_related("tenant").filter(is_active=True)
        if not include_public:
            queryset = queryset.exclude(tenant__schema_name=get_public_schema_name())

        targets = []
        seen = set()
        for tenant_domain in queryset.order_by("domain"):
            tenant = getattr(tenant_domain, "tenant", None)
            if tenant is None:
                continue
            if hasattr(tenant, "is_active") and not tenant.is_active:
                continue
            if tenant.schema_name in seen:
                continue
            targets.append((tenant.schema_name, tenant_domain.domain))
            seen.add(tenant.schema_name)

        if not targets:
            raise CommandError("No tenant domains found to process.")

        return targets

    def run_for_domains(self, options, callback):
        targets = self.get_target_schemas(options)
        if not targets:
            return callback()

        for schema_name, domain in targets:
            self.stdout.write(f"Running for domain {domain} on schema {schema_name}")
            with schema_context(schema_name):
                callback()
            self.stdout.write(self.style.SUCCESS(f"Completed for domain {domain}"))
