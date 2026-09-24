# Ecclesix

Ecclesix is a multi-tenant church management system (ChMS) for churches, headquarters, branches, pastors, administrators, and ministry teams. It centralizes church operations while keeping each organization’s data isolated by PostgreSQL schema.

This repository contains the tenant-facing Django application. The companion [Ecclesix Core control plane](https://github.com/JohnnyAsh-U/Ecclesix-core/blob/main/README.md) manages platform administration, tenant lifecycle, billing, plans, migrations, backups, audit logs, and storage reporting.

## What Ecclesix provides

Ecclesix supports the day-to-day operation of a church or church network:

- Member registration, profiles, roles, relationships, search, filtering, activation, and deactivation.
- Church, branch, city, and church-type management.
- Departments, department heads, and department membership.
- Events, event types, attendance, service reports, and attendance statistics.
- Finance accounts, categories, income, expenses, approvals, transfers, budgets, reports, and transaction logs.
- Dashboards with church and member activity summaries.
- Administrative roles and fine-grained permissions.
- OTP/TOTP authentication, email verification, password recovery, refresh tokens, and logout.
- Communication announcements, campaigns, provider configuration, delivery retries, statistics, and webhooks.
- Devices and mobile attendance synchronization.
- Multimedia uploads, completion, listing, download, sharing, and event media.
- Tenant branding, billing plans, payment history, storage quotas, domains, and platform announcements.
- Internal APIs consumed by Ecclesix Core for tenant administration and platform operations.

The documented product feature catalog is also available in [Features_EN.md](Features_EN.md) and [Features_FR.md](Features_FR.md).

## Architecture

```text
Browser 
          |
          v
Django REST API (this repository)
          |
          +--> django-tenants PostgreSQL database
          |       public schema: tenants, plans, domains, quotas
          |       tenant schemas: members, churches, events, finance, ...
          |
          +--> Redis cache and Dramatiq broker
          +--> S3-compatible object storage
          +--> Email provider / console email in development
          +--> Background jobs and tenant-aware cron commands

Ecclesix Core (separate repository)
          |
          +--> authenticated /api/v1/internal/* calls to this service
          +--> tenant lifecycle, billing, plans, migrations, storage
          +--> backup scheduling and control-plane administration
```

### Service responsibilities

| Service | Responsibility | Local project |
| --- | --- | --- |
| Ecclesix | Tenant-facing church operations and REST API | This repository |
| Ecclesix Core | Platform control plane and administration | `Ecclesix-core` |
| PostgreSQL | Public schema plus one schema per tenant | External service |
| Redis | Cache and Dramatiq broker | External service |
| S3-compatible storage | Media and object storage | MinIO, AWS S3, or compatible provider |
| Email provider | Verification, recovery, welcome, and application email | Console backend locally; Resend/SMTP-style configuration in production |

## Multi-tenancy model

The project uses `django-tenants` with PostgreSQL schema isolation:

- `tenants.Tenant` is the tenant model.
- `tenants.TenantDomain` maps hostnames to tenants.
- The public schema stores tenant records, domains, billing plans, payment history, storage quotas, and public announcements.
- Tenant schemas store operational data such as members, churches, departments, events, finance, attendance, communication, devices, and media.
- `Tenant.auto_create_schema = True`, so creating a tenant creates its PostgreSQL schema.
- Requests are resolved to a tenant through the configured domain.
- Tenant-aware management commands can target one domain or all active domains.

A tenant created through the internal API receives a schema, primary domain, storage quota, optional initial billing record, tenant superuser, and welcome email attempt. The control plane then registers the tenant for backup management.

## Repository layout

```text
.
├── manage.py                 # Django management entry point
├── backend/
│   ├── settings.py           # Django, tenancy, database, storage, email, jobs
│   ├── urls.py               # Root API and documentation routes
│   ├── middleware.py         # Tenant routing, internal API, and request logging
│   └── wsgi.py               # WSGI entry point
├── tenants/                 # Tenant, domain, billing, quota, and announcement models
├── auth_custom/              # Login, registration, email verification, OTP, recovery
├── members/                  # Member and relationship management
├── church/                   # Churches, cities, and church types
├── admin_custom/             # Admin settings, roles, permissions, logs, database tools
├── dashboard/                # Dashboard aggregation endpoints
├── department/               # Department and membership management
├── event/                    # Events, event types, attendance, service reports
├── finance/                  # Accounts, transactions, budgets, reports, audit history
├── communication/            # Announcements, campaigns, providers, webhooks
├── attendance/               # Attendance workflows and mobile synchronization
├── device/                   # Device registration and checks
├── multimedia/               # Uploads, media files, downloads, and sharing
├── internal/                 # Authenticated control-plane endpoints
├── seeders/                  # Tenant-aware seed commands and scheduled jobs
├── frontend/                 # Django-served frontend assets, if built here
├── templates/                # Django templates
├── media/                    # Development media directory
├── staticfiles/              # Collected static files
├── requirements.txt          # Python dependencies
├── .env.example              # Environment template
├── Features_EN.md            # English feature catalog
└── Features_FR.md            # French feature catalog
```

## Prerequisites

Install or provision:

- Python 3.11 or newer is recommended.
- PostgreSQL with the `psycopg` driver and permission to create schemas.
- Redis for caching and Dramatiq.
- Node.js/npm only when building or changing the frontend in `frontend/`.
- An S3-compatible object store for media in production or when testing uploads.
- An email provider for production verification, recovery, and welcome messages.
- Ecclesix Core if platform administration, tenant provisioning, billing, migrations, or scheduled backups are required.

PostgreSQL is not optional for a normal multi-tenant installation. SQLite does not provide the schema behavior required by `django-tenants`.

## Local setup

From this repository:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env` before starting the server. At minimum, configure a Django secret key, PostgreSQL connection, allowed hosts, CORS origins, and Redis URL.

Run Django checks and migrations:

```bash
python manage.py check
python manage.py makemigrations
python manage.py migrate_schemas --shared
python manage.py migrate_schemas
```

`migrate_schemas --shared` applies shared/public-schema migrations. `migrate_schemas` applies tenant application migrations to tenant schemas. Review generated migrations before committing them; normally development work should use existing migrations unless models have intentionally changed.

Start the development server:

```bash
python manage.py runserver 127.0.0.1:8000
```

The API is available at `http://127.0.0.1:8000`.

Useful development URLs:

- API schema: `http://127.0.0.1:8000/api/schema/`
- Swagger UI: `http://127.0.0.1:8000/api/schema/swagger-ui/`
- ReDoc: `http://127.0.0.1:8000/api/schema/redoc/`
- Django admin: `http://127.0.0.1:8000/admin/`

The Django settings enable debug mode only when `DJANGO_ENV=development`. Media files are served by Django during development when `DEBUG` is enabled.

## First-time local setup and tenant onboarding

For a complete local Ecclesix installation, run all application services before provisioning a tenant:

1. Start PostgreSQL and Redis.
2. Start the Ecclesix Django backend from this repository.
3. Start the Ecclesix tenant frontend, if it is maintained or served separately from Django.
4. Start the Ecclesix Core backend.
5. Start the Ecclesix Core frontend.

The Core backend must be running before using the Core frontend to create packages or tenants. The Core service communicates with this Django application through the authenticated `/api/v1/internal/*` endpoints.

### Recommended local ports and domain

Use `localhost` as the tenant domain during local development. The domain configured for a tenant must point to the host and port where the tenant frontend is running. For example, if the tenant frontend is served at `http://localhost:5173`, create the tenant with a domain such as:

```text
localhost
```

or, when multiple local tenants are needed, use a local hostname that resolves to the frontend host, such as `tenant1.localhost`. Do not point the tenant domain only at the Django API port if the browser application is served by a separate frontend dev server. The domain must resolve to the frontend entry point used by the tenant.

### Required provisioning order

Complete these steps in Ecclesix Core before attempting to log in to the tenant application:

1. Open the Ecclesix Core frontend.
2. Go to the **Billing** page and create at least one package/plan.
3. Go to the **Clients** or **Tenants** page and create the first tenant/client.
4. Select the package created in the previous step.
5. Enter the tenant domain. For local development, start with `localhost` and make sure it matches the frontend URL/host being used.
6. Enter the tenant administrator's email address. Tenant creation creates the tenant schema and administrator account, then attempts to send a welcome email containing the initial password.

In local development, email delivery normally uses Django's console email backend. The welcome email and generated password are therefore printed in the Django terminal rather than delivered to an external mailbox. Keep the Django terminal open and copy the credentials from that output.

### First tenant login

After the tenant has been created:

1. Open the tenant frontend URL, for example `http://localhost:<frontend-port>`.
2. Enter the email address used when the tenant was created.
3. Enter the generated password shown in the Django console.
4. Complete email verification using the verification code printed in the Django console.
5. Complete the TOTP setup when prompted. Scan the displayed QR code with an authenticator application and enter the generated code.
6. Sign in again if the application requests it.

The exact frontend port depends on the tenant frontend configuration. The important requirement is that the browser host matches the tenant domain registered in Core. A tenant created for `localhost` should be opened through the local frontend URL using the `localhost` host, not an unrelated IP address.

### Initialize the tenant's first church

After the administrator has successfully logged in, initialize the tenant data in this order:

1. Open **Settings**.
2. Create the first **City**.
3. Create the first **Church Type**.
4. Create the first **Church**, assigning the city and church type.
5. Go to the Currently logged in superadmin profile and update his profile especially the **Church**

The tenant is now ready for normal setup, including members, departments, events, attendance, and finance configuration. Creating the city, church type, and first church first prevents later forms from having no valid organization data to select.

### Integrated startup checklist

Before troubleshooting tenant login, verify that all of these are running and configured consistently:

- PostgreSQL is reachable and allows schema creation.
- Redis is reachable.
- Ecclesix Django is running and has completed migrations.
- The tenant frontend is running on the host/port used as the tenant domain.
- Ecclesix Core backend is running and its `DJANGO_BASE_URL` points to the Django backend.
- Ecclesix Core frontend is running and its `VITE_API_URL` points to the Core backend.
- Core and Django use matching `INTERNAL_API_SECRET_ADMIN` and `INTERNAL_API_SECRET_MOD` values.
- The tenant domain entered in Core matches the host used in the browser.
- The Django console is visible for the generated password and verification code.

## Environment variables

The exact settings are defined in `backend/settings.py` and the starter values are in `.env.example`.

### Application and security

| Variable | Purpose |
| --- | --- |
| `DJANGO_ENV` | Set to `development` for debug mode and console email |
| `SECRET_KEY` | Django signing and cryptographic key |
| `ALLOWED_HOSTS` | Comma-separated allowed hostnames |
| `CORS_ALLOWED_ORIGINS` | Comma-separated browser origins |
| `CSRF_TRUSTED_ORIGINS` | Comma-separated trusted origins |
| `URL` | Frontend/base URL used by application flows |
| `ACCESS_TOKEN`, `REFRESH_TOKEN`, `AES_TOKEN`, `ENCRYPTION_KEY`, `TEMP_TOKEN`, `EMAIL_TOKEN` | Application token/encryption values used by auth flows; set strong values where consumed |

### Database and cache

| Variable | Purpose |
| --- | --- |
| `DB_ENGINE` | Legacy/template database engine value |
| `DB_NAME` | PostgreSQL database name |
| `DB_USER` | PostgreSQL user |
| `DB_PASSWORD` | PostgreSQL password |
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port |
| `DB_CONN_MAX_AGE` | Persistent connection lifetime; defaults to `60` |
| `DB_SSLMODE` | PostgreSQL SSL mode; defaults to `prefer` |
| `REDIS_URL` | Redis cache and Dramatiq broker URL |

The database engine is set in code to `django_tenants.postgresql_backend`. Configure PostgreSQL values even if `.env.example` contains a legacy `DB_ENGINE` field.

### Email

| Variable | Purpose |
| --- | --- |
| `SUPPORT_EMAIL` | Support address |
| `EMAIL_HOST` | SMTP host when applicable |
| `EMAIL_PORT` | Email port |
| `EMAIL_USER` | Email username |
| `EMAIL_PASSWORD` | Email password |
| `RESEND_API_KEY` | Resend API key for production Anymail delivery |

With `DJANGO_ENV=development`, the configured email backend writes messages to the console. Outside development, the project uses Anymail's Resend backend.

### Object storage

| Variable | Purpose |
| --- | --- |
| `AWS_ACCESS_KEY_ID` | S3 access key |
| `AWS_SECRET_ACCESS_KEY` | S3 secret key |
| `AWS_STORAGE_BUCKET_NAME` | Media bucket |
| `AWS_S3_REGION_NAME` | S3 region |
| `AWS_S3_ENDPOINT_URL` | S3-compatible endpoint, such as MinIO |
| `AWS_S3_FILE_OVERWRITE` | Whether uploaded files may overwrite existing objects |
| `AWS_DEFAULT_ACL` | Object ACL policy |
| `AWS_QUERYSTRING_AUTH` | Whether generated URLs use query-string authentication |

### Internal control-plane authentication

| Variable | Purpose |
| --- | --- |
| `INTERNAL_API_SECRET_ADMIN` | Shared admin secret with Ecclesix Core |
| `INTERNAL_API_SECRET_MOD` | Shared moderator secret with Ecclesix Core |

The values used by Ecclesix Core's `INTERNAL_API_SECRET_ADMIN` and `INTERNAL_API_SECRET_MOD` must match the corresponding Django-side values exactly.

### Logging

| Variable | Purpose |
| --- | --- |
| `LOG_LEVEL` | Root log level |
| `LOG_TO_FILE` | Enables timed rotating file logging |
| `LOG_DIR` | Log directory |
| `LOG_FILE_NAME` | Log filename |

## API namespaces

The root URL configuration exposes these namespaces under `/api/v1`:

| Prefix | Responsibility | Examples |
| --- | --- | --- |
| `/auth` | Registration, login, email verification, OTP, refresh, recovery, logout | `/connexion`, `/verify-otp`, `/refresh` |
| `/membre` | Members, profiles, roles, relationships | `/liste`, `/<id>`, `/<id>/events` |
| `/eglise` | Churches, cities, church types, logos | `/ville`, `/type`, `/<id>` |
| `/admin` | Admin logs, settings, roles, permissions, database tools | `/logs`, `/roles`, `/permissions` |
| `/dashboard` | Dashboard aggregates | root dashboard endpoint |
| `/departement` | Departments and members | root, `/<id>/ajouter` |
| `/evenement` | Events, event types, event attendance, reports | root, `/<id>/attendance`, `/<id>/report` |
| `/finance` | Accounts, categories, rules, transactions, budgets, reports | `/transactions`, `/budgets`, `/rapports` |
| `/communication` | Announcements, campaigns, providers, webhooks | `/campaigns`, `/send`, `/webhooks/provider` |
| `/attendance` | Attendance, bulk marking, statistics, mobile sync | `/mobile-sync`, `/mark-present/<event_id>` |
| `/device` | Device registration and verification | `/check/<identifier>` |
| `/tenant` | Tenant billing, branding, plans, public announcements | `/billing`, `/branding`, `/plans` |
| `/multimedia` | Upload and media lifecycle | `/create`, `/<id>/download`, `/<id>/share` |
| `/internal` | Ecclesix Core integration | `/tenants`, `/billings`, `/plans`, `/storage`, migrations |

Some paths intentionally use French names because they are part of the existing public API contract. Preserve them when adding clients or changing routes.

## Authentication and permissions

The REST framework uses a custom JWT authentication class and custom permission class by default. Authentication flows include:

- Admin/member registration.
- Email verification.
- Login and mobile login.
- Authenticator OTP setup and verification.
- Access-token refresh.
- Password recovery and reset.
- Logout.

The product model distinguishes super administrators, administrators, and regular members. Super administrators can manage the platform and permissions across churches; administrators are generally scoped to their assigned church; members do not access the administration API unless promoted. The effective permission set is enforced by the application’s custom permission classes and view logic.

When integrating with Ecclesix Core, internal requests use role-specific shared secrets rather than end-user JWTs. `backend.middleware.InternalAPIMiddleware` protects the Django internal surface, while `internal.permission` contains the admin/mod permission classes used by internal views.

## Control-plane integration

Ecclesix Core calls Django at its internal API paths. The expected Django-side routes include:

```text
/api/v1/internal/tenants
/api/v1/internal/tenants/<tenant_id>
/api/v1/internal/tenants/<tenant_id>/activate
/api/v1/internal/tenants/<tenant_id>/deactivate
/api/v1/internal/tenants/<tenant_id>/domains
/api/v1/internal/tenants/<tenant_id>/storage
/api/v1/internal/tenants/migrations
/api/v1/internal/tenants/<tenant_id>/migrate
/api/v1/internal/tenants/<tenant_id>/migration-state
/api/v1/internal/billings/recent
/api/v1/internal/billings/filter
/api/v1/internal/billings/stats
/api/v1/internal/billings/create
/api/v1/internal/billings/change-plan
/api/v1/internal/plans
/api/v1/internal/plans/<plan_id>
/api/v1/internal/storage
/api/v1/internal/storage/stats
```

Recommended local startup order for the integrated platform:

1. Start PostgreSQL and Redis.
2. Start Django and confirm its API/schema endpoint responds.
3. Start Ecclesix Core with `DJANGO_BASE_URL` pointing at Django.
4. Start the Core frontend with `VITE_API_URL` pointing at Core.
5. Create or activate tenants through Core, then verify the tenant domain and schema.

## Background jobs and scheduled work

The project has two background mechanisms:

### Dramatiq

Dramatiq uses Redis as its broker and is configured in `DRAMATIQ_BROKER`. Worker startup is typically:

```bash
dramatiq <module.with.actors>
```

Use the actor modules present in the application when starting workers; inspect actor declarations before choosing the module path for a deployment. Django database connections are managed through the configured Dramatiq middleware.


## Seed data and management commands

The seed command utilities can run a command for one domain or all active tenant domains:

```bash
python manage.py <command> --domain tenant.example.com
python manage.py <command> --all-domains
python manage.py <command> --all-domains --include-public
```

The `seeders` app contains tenant-aware commands for development data. Available commands should be listed with:

```bash
python manage.py help
python manage.py help | grep -E "seed|member|church|job|tenant"
```

The repository includes seed commands for churches, members, and scheduled finance/member jobs. Seed in a disposable development database only; the member seeder creates large volumes of data.

Typical lifecycle commands:

```bash
python manage.py check
python manage.py showmigrations
python manage.py migrate_schemas --shared
python manage.py migrate_schemas
python manage.py collectstatic --noinput
python manage.py test
```

## Frontend and static files

The Django settings expect built frontend assets under `frontend/dist/assets` and `frontend/dist`. When the frontend package is changed:

```bash
cd frontend
npm install
npm run build
```

Then from the Django project root:

```bash
python manage.py collectstatic --noinput
```

The root URL configuration currently exposes the API and documentation routes. The catch-all React view is commented out, so a separate frontend dev server or deployment configuration may be required for browser navigation outside Django-served assets.

## Production deployment

A production deployment should provide:

- PostgreSQL configured for schema creation and tenant migrations.
- Redis with durable enough behavior for cache and Dramatiq requirements.
- A production WSGI server, for example:

```bash
gunicorn backend.wsgi:application --bind 0.0.0.0:8000 --workers 3
```

- A separately managed Dramatiq worker process.
- Installed cron entries if scheduled jobs are enabled.
- S3-compatible media storage and private object settings.
- Real email delivery credentials.
- Strong, non-default secrets and restricted `ALLOWED_HOSTS`/CORS/CSRF settings.
- A reverse proxy for TLS, static files, media access policy, and request limits.
- Ecclesix Core configured with matching internal API secrets and the Django base URL.

Do not use `DEBUG=True`, placeholder secrets, sample database passwords, wildcard hosts, or development console email in production.

## Testing and contribution workflow

Run Django checks and tests before submitting a change:

```bash
python manage.py check
python manage.py test
```

For changes affecting a tenant model or schema:

1. Update the model and serializers/views as needed.
2. Generate and review migrations.
3. Apply shared and tenant migrations in a disposable database.
4. Test with at least two tenant domains to confirm isolation.
5. Verify public-schema behavior separately from tenant-schema behavior.
6. Update API documentation and both service READMEs when the Core contract changes.

For changes affecting Core integration, test the complete request path: Core authentication, role-specific internal header, Django internal permission, tenant context, database mutation, and Core response handling.

## Current implementation notes


- The main database backend is `django_tenants.postgresql_backend`; a SQLite-only setup is not a supported full-stack configuration.
- Several API paths use French names and leading slash patterns in app URL files. Treat the current route names as compatibility-sensitive.
- Tenant creation performs several side effects: schema creation, domain creation, storage quota creation, optional billing creation, tenant superuser creation, and welcome email delivery.
- S3 media storage, email delivery, Redis workers, and cron jobs are external runtime dependencies rather than self-contained Django features.
- The React catch-all route in `backend/urls.py` is currently commented out, so serving the frontend may require a separate web server or additional deployment configuration.
- The repository contains app-level tests, but full integration testing requires PostgreSQL schemas, tenant domains, Redis, and the configured external services.

## Related documentation

- [English feature catalog](Features_EN.md)
- [French feature catalog](Features_FR.md)
- [Ecclesix Core control-plane README](https://github.com/JohnnyAsh-U/Ecclesix-core/README.md)
