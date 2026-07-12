import io
import pytest
from PIL import Image
from app.ml.preprocessing import decode_image
from app.core.exceptions import InvalidImageError


def _make_png_bytes(width: int = 10, height: int = 10) -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", (width, height), color=(123, 45, 67)).save(buf, format="PNG")
    return buf.getvalue()


def test_decode_valid_image_returns_rgb_image() -> None:
    img = decode_image(_make_png_bytes())
    assert img.mode == "RGB"


def test_decode_corrupt_bytes_raises_invalid_image_error() -> None:
    with pytest.raises(InvalidImageError):
        decode_image(b"not-an-image")


def test_decode_empty_bytes_raises_invalid_image_error() -> None:
    with pytest.raises(InvalidImageError):
        decode_image(b"")
