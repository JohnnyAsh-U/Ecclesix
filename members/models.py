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

        # added this condition for purpose of testing when creating user(members) with this function
        user.password = make_password(password) if password != "None" else password
        user.save(using=self._db)
        return user

    def create_user(self, email=None, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        extra_fields.setdefault("is_admin", False)
        extra_fields.setdefault("gender", "H")
        extra_fields.setdefault("marital_status", "C")
        extra_fields.setdefault("category", "Adulte")
        extra_fields.setdefault("status", "Ministre")
        extra_fields.setdefault("first_name", "user")
        extra_fields.setdefault("last_name", "user")
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email=None, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_admin", True)
        extra_fields.setdefault("gender", "H")
        extra_fields.setdefault("marital_status", "M")
        extra_fields.setdefault("category", "Adulte")
        extra_fields.setdefault("status", "Ministre")
        extra_fields.setdefault("first_name", "SuperAdmin")
        extra_fields.setdefault("last_name", "Superadmin")

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self._create_user(email, password, **extra_fields)


class Member(User):
    gender = models.CharField(
        max_length=20, choices=[("H", "Homme"), ("F", "Femme")], null=False, blank=False
    )
    birthdate = models.DateField(null=True, blank=True)
    phone = models.CharField(max_length=15, null=True, blank=True)
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
        default="Autres",
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

    city = models.ForeignKey(
        "church.City",
        on_delete=models.SET_NULL,
        related_name="city_member",
        related_query_name="city",
        null=True,
    )
    church = models.ForeignKey(
        "church.Church",
        on_delete=models.SET_NULL,
        related_name="church_member",
        related_query_name="church",
        null=True,
    )
    role = models.ForeignKey(
        "admin_custom.Role",
        verbose_name="role",
        related_name="role_member",
        related_query_name="role",
        on_delete=models.SET_NULL,
        null=True,
    )

    followed_up_by = models.ForeignKey(
        "self",
        verbose_name="followed_up_by",
        related_name="members_followed_up",
        # related_query_name="role",
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    relations = models.ManyToManyField(
        "self",
        through="Relationship",
        through_fields=("from_member", "to_member"),
        symmetrical=False,
        related_name="related_to",
        db_constraint=True,
    )

    objects = UserManagerCustom()

    class Meta:
        verbose_name = "member"
        verbose_name_plural = "members"
        unique_together = ["email", "first_name", "last_name"]
        default_permissions = ()
        permissions = [
            ("ajouter_membre", "Ajouter Membre"),
            ("modifier_membre", "Modifier Membre"),
            ("voir_membre", "Voir Membre"),
            ("voir_touts_membres", "Voir Touts Les Membres"),
        ]

    def __str__(self):
        return self.get_full_name()
    
    def belongs_to_church(self, church_id):
        return True if self.church_id == church_id else False
    



class Relationship(models.Model):

    from_member = models.ForeignKey(
        Member, related_name="from_member_relations", on_delete=models.CASCADE
    )
    to_member = models.ForeignKey(
        Member, related_name="to_member_relations", on_delete=models.CASCADE
    )
    relationship = models.CharField(
        max_length=20,
        choices=[
            ("Marriage", "Marriage"),
            ("Enfant", "Enfant"),
            ("Parent", "Parent"),
            ("Frere/Soeur", "Frere/Soeur"),
            ("Autres", "Autres"),
        ],
    )

    class Meta:
        verbose_name = "Relationship"
        verbose_name_plural = "Relationships"
        default_permissions = ()
        unique_together = ["from_member", "to_member"]
