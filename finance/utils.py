from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import base64
import os

secret_key = os.getenv("AES_TOKEN")

def encrypt_amount(amount: str, key = secret_key):
    key_bytes = base64.urlsafe_b64decode(key)
    aesgcm = AESGCM(key_bytes)
    nonce = os.urandom(12)
    ciphertext = aesgcm.encrypt(nonce, str(amount).encode(), None)
    return base64.urlsafe_b64encode(nonce + ciphertext).decode()


def decrypt_amount(encrypted_amount: str, key: bytes = secret_key):
    try:
        key_bytes = base64.urlsafe_b64decode(key)
        aesgcm = AESGCM(key_bytes)
        data = base64.urlsafe_b64decode(encrypted_amount)
        nonce, ciphertext = data[:12], data[12:]
        amount_string = aesgcm.decrypt(nonce, ciphertext, None)
        return amount_string.decode()
    except Exception:
        return None
   
  
 