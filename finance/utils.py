from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import base64
import os

secret_key = os.getenv("AES_TOKEN")

def encrypt_amount(amount: str, key = secret_key):
    key_bytes = base64.urlsafe_b64decode(key)
    aesgcm = AESGCM(key_bytes)
    nonce = os.urandom(12)
    ciphertext = aesgcm.encrypt(nonce, str(amount).encode(), None)
    nonce = base64.urlsafe_b64encode(nonce).decode()
    ciphertext = base64.urlsafe_b64encode(ciphertext).decode()
    return f"{nonce}:{ciphertext}"


def decrypt_amount(encrypted_amount: str, key = secret_key):
    try:
        key_bytes = base64.urlsafe_b64decode(key)
        aesgcm = AESGCM(key_bytes)
        nonce, ciphertext = encrypted_amount.split(':')
        nonce = base64.urlsafe_b64decode(nonce)
        ciphertext = base64.urlsafe_b64decode(ciphertext)
        amount_string = aesgcm.decrypt(nonce, ciphertext, None)
        return amount_string.decode()
    except BaseException as m:
        return None
   
  
 