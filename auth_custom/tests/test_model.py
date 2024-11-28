from django.test import TestCase, Client
from members.models import Members

class TestModel(TestCase):
    
    def setUp(self):
        self.user = Members.objects.create_superuser(
            email="johnashimedua@chms.com",
            password= "1234",
            first_name = "John",
            last_name = "Ashimedua"
        )
        
    def test_if_superadmin(self):
        self.assertEqual(self.user.is_staff, True)
        self.assertEqual(self.user.is_admin, True)
        self.assertEqual(self.user.is_superuser, True)
        
    def test_to_get_username(self):
        self.assertEqual(self.user.get_full_name(), "John Ashimedua")

        
        