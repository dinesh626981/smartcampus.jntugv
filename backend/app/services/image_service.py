import os
import io
import time
import logging
from urllib.parse import urlparse
from datetime import datetime
from PIL import Image, ImageOps
import requests
import cloudinary
import cloudinary.uploader
import cloudinary.api
from flask import current_app

logger = logging.getLogger(__name__)

# In-memory usage cache (60 seconds TTL)
_USAGE_CACHE = {
    'data': None,
    'timestamp': 0
}

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

def get_cloudinary_config():
    """
    Retrieves Cloudinary configuration from current_app or environment.
    """
    cloud_name = os.environ.get('CLOUDINARY_CLOUD_NAME') or (current_app.config.get('CLOUDINARY_CLOUD_NAME') if current_app else '')
    api_key = os.environ.get('CLOUDINARY_API_KEY') or (current_app.config.get('CLOUDINARY_API_KEY') if current_app else '')
    api_secret = os.environ.get('CLOUDINARY_API_SECRET') or (current_app.config.get('CLOUDINARY_API_SECRET') if current_app else '')
    return {
        'cloud_name': cloud_name.strip() if cloud_name else '',
        'api_key': api_key.strip() if api_key else '',
        'api_secret': api_secret.strip() if api_secret else ''
    }

def is_cloudinary_configured():
    """Checks if Cloudinary credentials are fully provided."""
    cfg = get_cloudinary_config()
    return bool(cfg['cloud_name'] and cfg['api_key'] and cfg['api_secret'])

def init_cloudinary():
    """Initializes cloudinary library with configured credentials."""
    cfg = get_cloudinary_config()
    if cfg['cloud_name'] and cfg['api_key'] and cfg['api_secret']:
        cloudinary.config(
            cloud_name=cfg['cloud_name'],
            api_key=cfg['api_key'],
            api_secret=cfg['api_secret'],
            secure=True
        )
        return True
    return False

def optimize_image_bytes(file_storage):
    """
    Processes uploaded complaint image with Pillow:
    1. EXIF auto-orientation transpose
    2. Convert to RGB (handling RGBA/transparency safely)
    3. Thumbnail to max 1600x1600 using high-quality Lanczos resampling
    4. Save to BytesIO as JPEG with quality=80 and optimization enabled.
    Returns (BytesIO, byte_size).
    """
    file_storage.seek(0)
    image = Image.open(file_storage)

    # 1. EXIF auto-rotation
    try:
        image = ImageOps.exif_transpose(image)
    except Exception as e:
        logger.warning(f"EXIF transpose skipped: {e}")

    # 2. Ensure RGB mode
    if image.mode in ('RGBA', 'LA', 'P'):
        background = Image.new('RGB', image.size, (255, 255, 255))
        if image.mode == 'P':
            image = image.convert('RGBA')
        background.paste(image, mask=image.split()[-1] if 'A' in image.mode else None)
        image = background
    elif image.mode != 'RGB':
        image = image.convert('RGB')

    # 3. Downscale if greater than 1600x1600
    max_dimension = (1600, 1600)
    image.thumbnail(max_dimension, Image.Resampling.LANCZOS)

    # 4. Save to BytesIO as optimized JPEG
    buffer = io.BytesIO()
    image.save(buffer, format='JPEG', quality=80, optimize=True)
    buffer.seek(0, io.SEEK_END)
    size_bytes = buffer.tell()
    buffer.seek(0)

    return buffer, size_bytes

def upload_image(file_storage, folder='complaints/before'):
    """
    Optimizes and uploads a complaint image (before photo or completion proof)
    to Cloudinary.

    Returns dict:
    {
        'url': str,
        'public_id': str,
        'bytes': int,
        'filename': None
    }
    """
    if not file_storage or not file_storage.filename:
        return None

    buffer, size_bytes = optimize_image_bytes(file_storage)

    if not init_cloudinary():
        raise RuntimeError("Cloudinary is not configured. Cannot upload image.")

    upload_result = cloudinary.uploader.upload(
        buffer,
        folder=folder,
        resource_type='image'
    )
    invalidate_usage_cache()
    secure_url = upload_result.get('secure_url') or upload_result.get('url')
    return {
        'url': secure_url,
        'secure_url': secure_url,
        'public_id': upload_result.get('public_id'),
        'bytes': upload_result.get('bytes', size_bytes),
        'filename': None
    }

# ==============================================================================
# PROFILE PHOTO PIPELINE (Protected Asset Class)
# ==============================================================================

def upload_profile_photo(file_storage_or_bytes, user_id):
    """
    Optimizes and uploads an institutional user profile photo to Cloudinary:
    - Validates size limit (max 2 MB after client compression)
    - Applies EXIF orientation transpose and strips EXIF (privacy protection)
    - Converts mode to RGB (safe transparency composite over white)
    - Center-crops to a 1:1 square
    - Resizes to exact 400x400 via high-quality Lanczos resampling
    - Compresses to JPEG quality 85 (target 30-80 KB)
    - Stores under Cloudinary folder 'profiles', fixed public_id 'user_{user_id}'
      with overwrite=True, invalidate=True, tags=['protected', 'profile'].
    """
    if hasattr(file_storage_or_bytes, 'seek'):
        file_storage_or_bytes.seek(0)
        raw_stream = file_storage_or_bytes
    else:
        raw_stream = io.BytesIO(file_storage_or_bytes)

    # 1. Open with Pillow
    try:
        image = Image.open(raw_stream)
    except Exception as e:
        raise ValueError(f"Invalid image file format: {str(e)}")

    # 2. EXIF transpose and orientation correction
    try:
        image = ImageOps.exif_transpose(image)
    except Exception as e:
        logger.warning(f"Profile photo EXIF transpose skipped: {e}")

    # 3. Mode normalization to RGB (strip transparency with clean white backdrop)
    if image.mode in ('RGBA', 'LA', 'P'):
        background = Image.new('RGB', image.size, (255, 255, 255))
        if image.mode == 'P':
            image = image.convert('RGBA')
        background.paste(image, mask=image.split()[-1] if 'A' in image.mode else None)
        image = background
    elif image.mode != 'RGB':
        image = image.convert('RGB')

    # 4. Center-crop to 1:1 square
    width, height = image.size
    min_dimension = min(width, height)
    left = (width - min_dimension) // 2
    top = (height - min_dimension) // 2
    image = image.crop((left, top, left + min_dimension, top + min_dimension))

    # 5. Resize to 400x400 square avatar
    image = image.resize((400, 400), Image.Resampling.LANCZOS)

    # 6. Save fresh JPEG buffer without EXIF (privacy-first GPS strip)
    buffer = io.BytesIO()
    image.save(buffer, format='JPEG', quality=85, optimize=True)
    buffer.seek(0, io.SEEK_END)
    size_bytes = buffer.tell()
    buffer.seek(0)

    public_id_str = f"user_{user_id}"
    full_public_id = f"profiles/{public_id_str}"

    if not init_cloudinary():
        raise RuntimeError("Cloudinary is not configured. Cannot upload profile photo.")

    res = cloudinary.uploader.upload(
        buffer,
        folder='profiles',
        public_id=public_id_str,
        overwrite=True,
        invalidate=True,
        resource_type='image',
        tags=['protected', 'profile']
    )
    invalidate_usage_cache()
    return {
        'url': res.get('secure_url'),
        'public_id': res.get('public_id') or full_public_id,
        'bytes': res.get('bytes', size_bytes)
    }

def delete_profile_photo(public_id):
    """
    Deletes a user's own profile photo from Cloudinary.
    Allowed ONLY if public_id starts with 'profiles/'.
    Otherwise raises ValueError to prevent tampering with other asset classes.
    """
    if not public_id:
        return False

    public_id_str = str(public_id).strip()
    if not public_id_str.startswith('profiles/'):
        raise ValueError(f"Security violation: delete_profile_photo refuses to delete non-profile asset '{public_id}'!")

    if not init_cloudinary():
        return False

    try:
        res = cloudinary.uploader.destroy(public_id_str, invalidate=True)
        invalidate_usage_cache()
        return res.get('result') in ('ok', 'not found')
    except Exception as e:
        logger.warning(f"Cloudinary destroy profile photo failed for {public_id_str}: {e}")
        return False

def import_google_photo(user, picture_url):
    """
    Imports Google account picture into Cloudinary profile photo on first sign-in:
    - Verifies host is 'lh3.googleusercontent.com' and scheme is 'https'
    - Upgrades resolution to 400px by rewriting '=s96-c' to '=s400-c'
    - 5-second timeout, 2MB size cap
    - Streams and uploads through upload_profile_photo
    - Sets user fields and commits to database.
    - Fails gracefully without breaking login.
    """
    from app.core.database import db

    if not picture_url:
        return False

    try:
        parsed = urlparse(picture_url)
        if parsed.scheme != 'https' or parsed.netloc != 'lh3.googleusercontent.com':
            logger.warning(f"Rejected non-Google photo import URL: {picture_url}")
            return False

        # Request 400px square photo from Google CDN
        fetch_url = picture_url
        if '=s96-c' in fetch_url:
            fetch_url = fetch_url.replace('=s96-c', '=s400-c')
        elif '=s' in fetch_url:
            import re
            fetch_url = re.sub(r'=s\d+-c', '=s400-c', fetch_url)

        # Download with strict size and time bounds
        resp = requests.get(fetch_url, timeout=5.0, stream=True)
        if resp.status_code != 200:
            logger.warning(f"Google photo download returned status {resp.status_code}")
            user.profile_photo_url = picture_url
            user.profile_photo_source = 'google_pending'
            db.session.commit()
            return False

        # Read up to 2MB safely
        MAX_BYTES = 2 * 1024 * 1024
        downloaded = bytearray()
        for chunk in resp.iter_content(chunk_size=16384):
            downloaded.extend(chunk)
            if len(downloaded) > MAX_BYTES:
                logger.warning("Google photo exceeds 2MB limit. Rejecting.")
                user.profile_photo_url = picture_url
                user.profile_photo_source = 'google_pending'
                db.session.commit()
                return False

        # Process and store on Cloudinary
        result = upload_profile_photo(io.BytesIO(downloaded), user.id)
        user.profile_photo_url = result['url']
        user.profile_photo_public_id = result['public_id']
        user.profile_photo_bytes = result['bytes']
        user.profile_photo_updated_at = datetime.utcnow()
        user.profile_photo_source = 'google_imported'
        db.session.commit()
        logger.info(f"Successfully imported Google photo for user #{user.id}")
        return True
    except Exception as e:
        logger.warning(f"Failed to import Google photo for user #{user.id}: {e}")
        try:
            user.profile_photo_url = picture_url
            user.profile_photo_source = 'google_pending'
            db.session.commit()
        except Exception:
            db.session.rollback()
        return False

# ==============================================================================
# HARD GUARDS & DELETION ALLOW-LISTS
# ==============================================================================

def delete_image(public_id):
    """
    Deletes an individual complaint image from Cloudinary by public_id.
    
    CRITICAL SECURITY GUARD:
    - Explicit allow-list: ONLY accepts assets under 'complaints/'.
    - Refuses any asset starting with 'profiles/' and logs a security warning.
    - Suppresses exceptions so workflow is non-blocking.
    """
    if not public_id:
        return False

    public_id_str = str(public_id).strip()

    if public_id_str.startswith('profiles/'):
        logger.warning(
            f"CRITICAL SECURITY GUARD: Refused attempt to delete protected profile photo '{public_id_str}' via delete_image!"
        )
        return False

    if not public_id_str.startswith('complaints/'):
        logger.warning(
            f"SECURITY GUARD: delete_image only permits 'complaints/' assets. Refused non-complaint asset '{public_id_str}'."
        )
        return False

    if not init_cloudinary():
        return False

    try:
        result = cloudinary.uploader.destroy(public_id_str, invalidate=True)
        invalidate_usage_cache()
        return result.get('result') == 'ok'
    except Exception as e:
        logger.warning(f"Failed to delete Cloudinary asset {public_id_str}: {e}")
        return False

def delete_images_batch(public_ids):
    """
    Deletes a list of complaint images from Cloudinary in batches of up to 100.
    
    CRITICAL ARCHITECTURAL CONSTRAINTS:
    - Never call delete_resources_by_prefix, delete_all_resources, or tag-based
      bulk deletion anywhere in this system.
    - Admin cleanup must strictly use an explicit allow-list of IDs starting with 'complaints/'.
    - Any asset ID starting with 'profiles/' is unconditionally dropped and logged.
    """
    if not public_ids:
        return []

    if not init_cloudinary():
        return []

    deleted_ids = []
    batch_size = 100

    for i in range(0, len(public_ids), batch_size):
        chunk = public_ids[i:i + batch_size]
        safe_chunk = []

        for pid in chunk:
            if not pid:
                continue
            pid_str = str(pid).strip()
            if pid_str.startswith('profiles/'):
                logger.warning(
                    f"CRITICAL SECURITY GUARD: Dropped protected profile asset '{pid_str}' from cleanup batch deletion!"
                )
                continue
            if pid_str.startswith('complaints/'):
                safe_chunk.append(pid_str)
            else:
                logger.warning(
                    f"SECURITY GUARD: Dropped non-complaint asset '{pid_str}' from cleanup batch deletion!"
                )

        if not safe_chunk:
            continue

        try:
            res = cloudinary.api.delete_resources(safe_chunk)
            deleted_map = res.get('deleted', {}) if isinstance(res, dict) else {}
            for pid, status in deleted_map.items():
                if status in ('deleted', 'not_found'):
                    deleted_ids.append(pid)
        except Exception as e:
            logger.error(f"Cloudinary batch deletion error on chunk {safe_chunk}: {e}")

    invalidate_usage_cache()
    return deleted_ids

def invalidate_usage_cache():
    """Resets the usage cache."""
    _USAGE_CACHE['data'] = None
    _USAGE_CACHE['timestamp'] = 0

def get_storage_usage():
    """
    Retrieves storage and credit usage statistics from Cloudinary with 60s in-memory caching.
    Returns normalized metrics and warning thresholds.
    """
    now = time.time()
    if _USAGE_CACHE['data'] and (now - _USAGE_CACHE['timestamp'] < 60):
        return _USAGE_CACHE['data']

    cfg = get_cloudinary_config()
    is_configured = init_cloudinary()

    if not is_configured:
        result = {
            'storage_used_bytes': 0,
            'storage_used_mb': 0.0,
            'credits_used': 0.0,
            'credits_limit': 25.0,
            'percent_used': 0.0,
            'level': 'ok',
            'cached_at': datetime.utcnow().isoformat(),
            'cloud_name': 'Not Configured',
            'is_mock': True
        }
        _USAGE_CACHE['data'] = result
        _USAGE_CACHE['timestamp'] = now
        return result

    try:
        usage = cloudinary.api.usage()
        storage_info = usage.get('storage', {})
        credits_info = usage.get('credits', {})

        storage_bytes = storage_info.get('usage', 0)
        credits_used = float(credits_info.get('usage', 0))
        credits_limit = float(credits_info.get('limit', 25.0))
        credits_percent = float(credits_info.get('used_percent', 0.0))

        if credits_limit > 0 and credits_percent == 0.0:
            credits_percent = (credits_used / credits_limit) * 100

        percent_used = round(credits_percent, 1)
        level = 'ok'
        if percent_used >= 90:
            level = 'critical'
        elif percent_used >= 70:
            level = 'warning'

        result = {
            'storage_used_bytes': storage_bytes,
            'storage_used_mb': round(storage_bytes / (1024 * 1024), 2),
            'credits_used': round(credits_used, 2),
            'credits_limit': round(credits_limit, 2),
            'percent_used': percent_used,
            'level': level,
            'cached_at': datetime.utcnow().isoformat(),
            'cloud_name': cfg['cloud_name'],
            'is_mock': False
        }
        _USAGE_CACHE['data'] = result
        _USAGE_CACHE['timestamp'] = now
        return result
    except Exception as e:
        logger.error(f"Error fetching Cloudinary usage: {e}")
        fallback = {
            'storage_used_bytes': 0,
            'storage_used_mb': 0.0,
            'credits_used': 0.0,
            'credits_limit': 25.0,
            'percent_used': 0.0,
            'level': 'ok',
            'cached_at': datetime.utcnow().isoformat(),
            'cloud_name': cfg['cloud_name'],
            'error': str(e),
            'is_mock': True
        }
        return fallback
