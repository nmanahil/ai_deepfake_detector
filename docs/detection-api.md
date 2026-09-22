# Detection API contract

The frontend talks to detection through one interface, `DetectionProvider`
(`frontend/src/services/detection/provider.ts`). Two implementations exist:

| Provider | Selected by | Notes |
|---|---|---|
| `MockDetectionProvider` | `NEXT_PUBLIC_DETECTION_PROVIDER=mock` (default) | In-browser. Verdicts are **simulated**; frame extraction and the noise / ELA / FFT layers are real pixel computations. |
| `HttpDetectionProvider` | `NEXT_PUBLIC_DETECTION_PROVIDER=http` | Talks to a FastAPI service implementing the endpoints below. **Contract-first: not yet exercised against a live backend.** |

The wire format is the TypeScript types in `frontend/src/types/` — mirror them as Pydantic models.

## Endpoints

| Method | Path | Body / Response |
|---|---|---|
| `POST` | `/v1/analyses` | multipart `file` → `202 { "id": string }` |
| `GET` | `/v1/analyses/{id}/status` | → `AnalysisStatus` (poll every ~150 ms) |
| `GET` | `/v1/analyses/{id}/result` | → `Analysis`; `409` while not completed |
| `DELETE` | `/v1/analyses/{id}` | → `204` (cancel) |

Errors return `{ "detail": string }`. Use `404` for unknown ids, `409` for not-ready, `413`/`422` for size/format rejections.

## Key types

- `AnalysisStatus` — `state` (`queued | running | completed | failed`), `stage` (one of 8 `StageId`s), `stageProgress` / `progress` (0–1), live `telemetry`, `log`, optional `error`.
- `Analysis` — `media`, `result: DetectionResult`, `evidence[]`, `frames[]`, `layers[]`, `heatmap`, `preview`, `log`.
- `DetectionResult` — `verdict` (`authentic | suspicious | manipulated`), `manipulationScore` (0–1), `confidence` (0–1), `signals[]`, `explanation[]`, `limitations[]`, `model: ModelMetadata`, `simulated`.
- Image fields (`preview`, `layers[].dataUrl`, `frames[].thumbnail`, `heatmapUrl`) are data URLs today; a backend may return URLs instead — the UI only needs them usable as `<img src>`.
- Regions are normalised `0–1` rectangles relative to the frame.

## Responsible-output rules the backend must respect

- Never emit a definitive "fake" label; the vocabulary is `authentic | suspicious | manipulated` with a confidence.
- Set `result.simulated = true` and `model.simulated = true` for any non-trained / demo output. The UI labels those results prominently.
- Include `limitations` and per-signal `weight`s so reports remain interpretable.

## Suggested backend stack

FastAPI · PyTorch (ViT / Xception face-manipulation classifiers, FFT-CNN, temporal transformer) · OpenCV (face detection, ELA, noise residual) · FFmpeg (frame extraction, container probing). Long-running work should go through a job queue; `status` reflects the current stage.

> Note: the existing `backend/` service exposes an image-only `POST /predict`. It would need an adapter (or a new `/v1/analyses` router) to satisfy this contract.
