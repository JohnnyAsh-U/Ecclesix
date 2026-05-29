import magic
from PIL import Image
# import pyclamd

# cd = pyclamd.ClamdUnixSocket()
# cd = pyclamd.init_unix_socket(
# "/run/clamd.scan/clamd.sock"
# )

# print(cd.ping())

ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "application/pdf", 
    "audio/mpeg", 
    "audio/wav", 
    "audio/mp3",
    "video/mp4"
}

MAX_IMAGE_PIXELS = 50_000_000

def validate_mime_type(path):
    mime = magic.from_file(path, mime=True)
    if mime not in ALLOWED_MIME_TYPES:
        raise ValueError("Invalid mime type")
    return mime


def validate_image_dimentsions(path):
    img = Image.open(path)
    total_pixels = img.width * img.height
    
    if total_pixels > MAX_IMAGE_PIXELS:
        raise ValueError("Image dimensions too large")
    
    
def sanitize_image(source_path, output_path):
    img = Image.open(source_path)
    data = list(img.getdata())
    clean = Image.new(img.mode, img.size)
    clean.putdata(data)
    clean.save(output_path)
    
    
def scan_file(path):
    pass
    # result = cd.scan_file(path)
    # if result:
        # raise ValueError(str(result))