# ai_deepfake_detector

- `frontend/` — **VERA**, a Next.js media-forensics workspace (see [frontend/README.md](frontend/README.md)). Runs standalone with a clearly-labelled simulated engine.
- `backend/` — FastAPI service (image classifier + explainability).
- `docs/detection-api.md` — the contract for connecting a real ML backend to the frontend.
- `frontend-legacy-vite/` — the previous Vite scaffold, kept for reference; safe to delete.

```bash
cd frontend && npm install && npm run dev
```
