from django.db import models
from auth_custom.models import User
from django.contrib.auth.models import UserManager
from django.contrib.auth.hashers import make_password



class UserManagerCustom(UserManager):
    def _create_user(self, email, password, **extra_fields):
        """
        Create and save a user with the given username, email, and password.
        """
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        
        #added this condition for purpose of testing when creating user(members) with this function
        user.password = make_password(password) if password !='None' else password
        user.save(using=self._db)
        return user

    def create_user(self, email=None, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        extra_fields.setdefault("is_admin", False)
        extra_fields.setdefault("gender", 'H')
        extra_fields.setdefault("marital_status", 'C')
        extra_fields.setdefault("category", 'Adulte')
        extra_fields.setdefault("status", 'Ministre')
        extra_fields.setdefault("first_name", "user")
        extra_fields.setdefault("last_name", "user")
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email=None, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_admin", True)
        extra_fields.setdefault("gender", 'H')
        extra_fields.setdefault("marital_status", 'M')
        extra_fields.setdefault("category", 'Adulte')
        extra_fields.setdefault("status", 'Ministre')
        extra_fields.setdefault("first_name", "SuperAdmin")
        extra_fields.setdefault("last_name", "Superadmin")
        

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self._create_user(email, password, **extra_fields)
    
    


class Members(User):
    gender = models.CharField(
        max_length=20, choices=[("H", "Homme"), ("F", "Femme")], null=False, blank=False
    )
    birthdate = models.DateField(null=True, blank=True)
    phone = models.CharField(max_length=15, null=True)
    profession_type = models.CharField(
        max_length=20,
        choices=[
            ("Travailleur", "Travailleur"),
            ("Entrepreneur", "Entrepreneur"),
            ("Eleve/Etudiant", "Eleve/Etudiant"),
            ("Autres", "Autres"),
        ],
        blank=False,
        null=False,
        default="Autres"
    )
    profession = models.CharField(max_length=100, null=True)
    address = models.CharField(max_length=256, null=True)
    baptism_date = models.DateField(null=True, blank=True)
    marital_status = models.CharField(
        max_length=10, choices=[("M", "Marie"), ("C", "Celibataire"), ("V", "Veuf")]
    )
    category = models.CharField(
        max_length=20,
        choices=[("Ecodim", "Ecodim"), ("Jeunesse", "Jeunesse"), ("Adulte", "Adulte")],
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ("Ministre", "Ministre"),
            ("Ouvrier", "Ouvrier"),
            ("Membre", "Membre"),
            ("Visiteur", "Visiteur"),
        ],
    )
    eglise_id = models.IntegerField( null=True, blank=True)
    
    objects = UserManagerCustom()
    
    class Meta :
        verbose_name = "members"
        verbose_name_plural = "members"
        db_table = "members"