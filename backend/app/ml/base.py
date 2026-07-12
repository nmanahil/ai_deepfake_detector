from abc import ABC, abstractmethod
from app.schemas.prediction import PredictionResult


class MediaAnalyzer(ABC):
    @abstractmethod
    def analyze(self, media: bytes, include_explanation: bool = True) -> PredictionResult:
        """Run inference on raw media bytes and return a prediction."""
        ...
