from admin_custom.models import Log

def auth_logger(admin, resource, ip) :
    detail = {
        "resource" : resource,
        "id": admin.id,
        "lib": f"{admin.first_name} {admin.last_name}",
        "ip": ip
    }
    
    Log.objects.create(
        admin_id = admin.id,
        log_type = "AUTH",
        detail = detail
    )
