from django.db import models
from authentication.models import User
from django.contrib.auth.models import UserManager
from django.contrib.auth.hashers import make_password



class UserManagerCustom(UserManager):
    def _create_user(self, email, password, **extra_fields):
        """
        Create and save a user with the given username, email, and password.
        """
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.password = make_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email=None, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        extra_fields.setdefault("is_admin", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email=None, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_admin", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self._create_user(email, password, **extra_fields)
    
    


class Members(User):
    gender = models.CharField(
        max_length=20, choices=[("M", "Male"), ("F", "Female")], null=False, blank=False
    )
    birthdate = models.DateField(null=True, blank=True)
    phone = models.CharField(max_length=15)
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
    )
    profession = models.CharField(max_length=100)
    address = models.CharField(max_length=256)
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
    
    objects = UserManagerCustom()
    
    class Meta :
        verbose_name = "members"
        verbose_name_plural = "members"