from rest_framework.test import APISimpleTestCase
from ..utils import encrypt_amount, decrypt_amount
import os


class TestEncryption(APISimpleTestCase):

    def setUp(self):
        return super().setUp()

    def test_encryption(self):
        text_to_encrypt = "5000.00"
        encrypted = encrypt_amount(text_to_encrypt)
        
        decrypted = decrypt_amount(encrypted)
        self.assertEqual(str(text_to_encrypt), decrypted)
        
    def test_encryption_fail(self):
        text_to_encrypt = "12500.00"
        encrypted = encrypt_amount(text_to_encrypt)
        
        decrypted = decrypt_amount(encrypted[:-1])
        self.assertEqual(decrypted, None)
        
    def test_encryption_fail(self):
        text_to_encrypt = "69000"
        encrypted = encrypt_amount(text_to_encrypt)
        
        decrypted = decrypt_amount(encrypted, key=os.urandom(32))
        self.assertEqual(decrypted, None)
        