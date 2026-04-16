from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError
from django_tenants.utils import get_public_schema_name, get_tenant_model, schema_context


class Command(BaseCommand):
    help = "Run a management command for all active tenant schemas."

    def add_arguments(self, parser):
        parser.add_argument("command_name", help="The management command to execute for each tenant")
        parser.add_argument("command_args", nargs="*", help="Optional positional arguments for the command")
        parser.add_argument("--include-inactive", action="store_true", help="Include inactive tenants")
        parser.add_argument("--include-public", action="store_true", help="Also run in the public schema")

    def handle(self, *args, **options):
        command_name = options["command_name"]
        command_args = options["command_args"]

        if command_name == "run_command_for_all_tenants":
            raise CommandError("Refusing to recursively invoke run_command_for_all_tenants.")

        TenantModel = get_tenant_model()
        queryset = TenantModel.objects.all()

        if hasattr(TenantModel, "is_active") and not options["include_inactive"]:
            queryset = queryset.filter(is_active=True)

        if not options["include_public"]:
            queryset = queryset.exclude(schema_name=get_public_schema_name())

        tenants = list(queryset.order_by("schema_name"))
        if not tenants:
            raise CommandError("No tenant schemas found to process.")

        failures = []
        for tenant in tenants:
            try:
                self.stdout.write(f"Running {command_name} for tenant schema {tenant.schema_name}")
                with schema_context(tenant.schema_name):
                    call_command(command_name, *command_args, verbosity=options.get("verbosity", 1))
                self.stdout.write(self.style.SUCCESS(f"Completed {command_name} for {tenant.schema_name}"))
            except Exception as exc:
                failures.append(f"{tenant.schema_name}: {exc}")
                self.stderr.write(self.style.ERROR(f"Failed {command_name} for {tenant.schema_name}: {exc}"))

        if failures:
            raise CommandError("; ".join(failures))

        self.stdout.write(self.style.SUCCESS(f"Completed {command_name} for {len(tenants)} tenant schema(s)."))
