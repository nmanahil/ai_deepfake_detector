# VERA — Media Forensics (frontend)

Next.js 15 · TypeScript · Tailwind CSS · Framer Motion · Lucide.

## Run

```bash
cd frontend
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
npm run typecheck && npm run lint
```

No backend is required. By default a **simulated** detection engine runs in the browser.

## Routes

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/overview` | Dashboard: totals, verdict mix, trends, media-type breakdown, recent analyses |
| `/analyze` | Detection workspace: evidence intake → live 8-stage pipeline → assessment |
| `/evidence` | Full-width Evidence Explorer for any archived case (`?id=`) |
| `/history`, `/history/[id]` | Archive and per-case forensic workspace |
| `/report/[id]` | Printable forensic report (Save as PDF / JSON export) |
| `/technology` | Interactive explanation of each pipeline stage |

## Architecture

```
src/
  app/                 routes (App Router); (app)/ group shares the sidebar shell
  components/          ui/ primitives · analyze/ · evidence/ · dashboard/ · landing/ · technology/ · report/
  services/detection/  DetectionProvider interface + mock/ and http/ implementations
  services/archive/    IndexedDB persistence, external store, sample-archive generator
  lib/forensics/       real noise-residual, ELA and FFT computation
  types/               Media, Analysis, DetectionResult, Evidence, FrameAnalysis, Heatmap, ModelMetadata
```

### Connecting a real ML backend

Set `NEXT_PUBLIC_DETECTION_PROVIDER=http` and `NEXT_PUBLIC_API_BASE_URL`. The contract is in
[`docs/detection-api.md`](../docs/detection-api.md). No component changes are needed.

### What is and isn't real in demo mode

| | |
|---|---|
| **Real** | Hashing, media probing, video frame extraction, noise residual, error-level analysis, FFT spectrum |
| **Simulated** | Verdict, confidence, signal scores, face regions, heatmap, evidence findings |

The verdict is a deterministic function of the file's SHA-256 — it does **not** analyse the media. Every simulated
surface is labelled. On `/analyze`, **Demo controls** force a specific outcome (or a failure) for presentations.
Use **Load sample archive** on empty states to populate the dashboard with simulated records.

## Accessibility

Skip link, visible focus states, `aria-live` status regions, keyboard-operable timeline / frame strip / segmented controls,
`1`–`5` shortcuts for navigation, chart data tables for screen readers, and full `prefers-reduced-motion` support.
