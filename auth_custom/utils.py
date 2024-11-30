import datetime, os, random, hashlib, jwt

access_token_secret = os.getenv("ACCESS_TOKEN")
temp_token_secret = os.getenv("TEMP_TOKEN")
refresh_token_secret = os.getenv("REFRESH_TOKEN")

def generate_random_hash():
    """
    Generate random number and hashed number
    """    
    random_num = str(random.randint(100000, 999999))
    hashed_num = hashlib.sha256(random_num.encode())
    hashed_hex = hashed_num.hexdigest()
    return random_num, hashed_hex


def compare_hash(value, hashed):
    hashed_value = hashlib.sha256(str(value).encode())
    hashed_hex = hashed_value.hexdigest()
    return hashed_hex == hashed


def jwtEncode(payload, age, secret):
    """
    Jwt encoding with secret
    """
    payload["exp"] = datetime.datetime.now() + datetime.timedelta(minutes=age)
    token = jwt.encode(payload, key=secret, algorithm="HS256")
    return token


def jwtDecode(token, secret):
    try:
        res = jwt.decode(token, secret, algorithms=['HS256'])
        return res
    except:
        return None
    
    
def getRefreshToken(request):
    return request.COOKIES.get('refreshToken', None)


def generate_tokens(payload):
    access = jwtEncode(payload, age=10, secret=access_token_secret)
    refresh = jwtEncode(payload, age=360, secret=refresh_token_secret)
    return access, refresh