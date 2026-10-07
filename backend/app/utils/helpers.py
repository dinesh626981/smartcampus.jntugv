import os
import re
import random
import string
from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

def is_valid_email(email):
    """Checks if email format is valid."""
    if not email:
        return False
    # Simple email regex
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return bool(re.match(pattern, email))

def is_allowed_file(filename):
    """Validates file extension for image uploads."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def generate_random_password(length=8):
    """Generates a random temporary password containing letters and digits."""
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for i in range(length))

def save_uploaded_image(file, upload_folder):
    """
    Validates and saves the uploaded image to the upload folder.
    Returns the secure file name if successful, else None.
    """
    if not file or file.filename == '':
        return None
        
    if is_allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # Add random suffix to filename to prevent collisions
        name_part, ext_part = filename.rsplit('.', 1)
        rand_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
        unique_filename = f"{name_part}_{rand_suffix}.{ext_part}"
        
        # Save file
        file.save(os.path.join(upload_folder, unique_filename))
        return unique_filename
    return None
