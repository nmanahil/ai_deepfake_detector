import io
from PIL import Image
from app.core.exceptions import InvalidImageError


def decode_image(data: bytes) -> Image.Image:
    """Decode raw bytes into a PIL Image, raising InvalidImageError on failure."""
    try:
        img = Image.open(io.BytesIO(data))
        img.verify()  # catches truncated / corrupt files
    except Exception as exc:
        raise InvalidImageError(f"Could not decode image: {exc}") from exc

    # Re-open after verify() — PIL requires it after calling verify()
    try:
        img = Image.open(io.BytesIO(data)).convert("RGB")
    except Exception as exc:
        raise InvalidImageError(f"Could not convert image to RGB: {exc}") from exc

    return img
