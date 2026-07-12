import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from app.core.config import Settings, get_settings
from app.core.exceptions import InvalidImageError, ModelInferenceError
from app.schemas.prediction import PredictResponse
from app.services.prediction_service import PredictionService, get_prediction_service

logger = logging.getLogger(__name__)

router = APIRouter()

_ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


@router.post("/predict", response_model=PredictResponse, status_code=status.HTTP_200_OK)
async def predict(
    file: UploadFile = File(...),
    settings: Settings = Depends(get_settings),
    service: PredictionService = Depends(get_prediction_service),
) -> PredictResponse:
    if file.content_type not in _ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unsupported file type '{file.content_type}'. Must be an image.",
        )

    data = await file.read()

    max_bytes = settings.max_upload_size_mb * 1024 * 1024
    if len(data) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds the {settings.max_upload_size_mb} MB limit.",
        )

    try:
        return service.predict(data)
    except InvalidImageError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=exc.message,
        ) from exc
    except ModelInferenceError as exc:
        logger.exception("Inference failure on uploaded file")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during analysis. Please try again.",
        ) from exc
    except Exception as exc:
        logger.exception("Unexpected error in /predict")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred.",
        ) from exc
