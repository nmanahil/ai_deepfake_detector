import type { EvidenceKind, LayerId, MediaConstraints, PipelineStage, SignalKey, Verdict } from "@/types";

export const BRAND = {
  name: "VERA",
  tagline: "MEDIA FORENSICS",
  modelVersion: "v0.4.2",
  node: "EU-CENTRAL",
} as const;

export const NAV = [
  { href: "/overview", label: "Overview", key: "O" },
  { href: "/analyze", label: "Analyze", key: "A" },
  { href: "/evidence", label: "Evidence", key: "E" },
  { href: "/history", label: "History", key: "H" },
  { href: "/technology", label: "Technology", key: "T" },
] as const;

export const CONSTRAINTS: MediaConstraints = {
  maxBytes: 200 * 1024 * 1024,
  imageTypes: ["image/jpeg", "image/png", "image/webp"],
  videoTypes: ["video/mp4", "video/webm", "video/quicktime"],
  audioTypes: ["audio/mpeg", "audio/wav", "audio/x-wav", "audio/mp4", "audio/ogg", "audio/flac"],
};

export const PIPELINE: PipelineStage[] = [
  { id: "ingestion", index: 0, code: "01", label: "Media Ingestion", short: "INGEST", blurb: "Hash, probe container, normalise colour space." },
  { id: "extraction", index: 1, code: "02", label: "Frame Extraction", short: "EXTRACT", blurb: "Sample representative frames across the timeline." },
  { id: "localization", index: 2, code: "03", label: "Face Localization", short: "LOCALIZE", blurb: "Detect and align facial regions of interest." },
  { id: "artifacts", index: 3, code: "04", label: "Artifact Analysis", short: "ARTIFACTS", blurb: "Inspect texture, boundary and compression residue." },
  { id: "temporal", index: 4, code: "05", label: "Temporal Consistency", short: "TEMPORAL", blurb: "Track identity and motion coherence across frames." },
  { id: "frequency", index: 5, code: "06", label: "Frequency Analysis", short: "FREQUENCY", blurb: "Search the spectrum for generator fingerprints." },
  { id: "inference", index: 6, code: "07", label: "Model Inference", short: "INFERENCE", blurb: "Run the ensemble and calibrate its output." },
  { id: "synthesis", index: 7, code: "08", label: "Evidence Synthesis", short: "SYNTHESIS", blurb: "Fuse signals into an interpretable assessment." },
];

export const VERDICTS: Record<
  Verdict,
  { label: string; subtitle: string; short: string; text: string; bg: string; border: string; rgb: string; hex: string }
> = {
  authentic: {
    label: "AUTHENTIC",
    subtitle: "LOW EVIDENCE OF MANIPULATION",
    short: "LOW EVIDENCE",
    text: "text-signal",
    bg: "bg-signal",
    border: "border-signal",
    rgb: "var(--signal)",
    hex: "#3ddc97",
  },
  suspicious: {
    label: "SUSPICIOUS",
    subtitle: "SUSPICIOUS MEDIA",
    short: "SUSPICIOUS",
    text: "text-amber",
    bg: "bg-amber",
    border: "border-amber",
    rgb: "var(--amber)",
    hex: "#ffb020",
  },
  manipulated: {
    label: "MANIPULATED",
    subtitle: "LIKELY SYNTHETIC / MANIPULATED",
    short: "LIKELY MANIPULATED",
    text: "text-alert",
    bg: "bg-alert",
    border: "border-alert",
    rgb: "var(--alert)",
    hex: "#ff4d5e",
  },
};

export const EVIDENCE_KINDS: Record<EvidenceKind, { label: string; layer: LayerId }> = {
  temporal_inconsistency: { label: "TEMPORAL INCONSISTENCY", layer: "regions" },
  facial_boundary_artifact: { label: "FACIAL BOUNDARY ARTIFACT", layer: "heatmap" },
  unnatural_texture: { label: "UNNATURAL TEXTURE", layer: "noise" },
  compression_anomaly: { label: "COMPRESSION ANOMALY", layer: "compression" },
  synthetic_frequency_signature: { label: "SYNTHETIC FREQUENCY SIGNATURE", layer: "frequency" },
};

export const SIGNALS: Record<SignalKey, { label: string; description: string }> = {
  facial: {
    label: "FACIAL CONSISTENCY",
    description: "Whether facial geometry, lighting and boundaries agree with one another.",
  },
  temporal: {
    label: "TEMPORAL CONSISTENCY",
    description: "Whether identity, motion and texture stay coherent from frame to frame.",
  },
  texture: {
    label: "TEXTURE ANALYSIS",
    description: "Whether skin and surface micro-texture matches natural camera capture.",
  },
  frequency: {
    label: "FREQUENCY ANALYSIS",
    description: "Whether the image spectrum contains periodic patterns typical of generators.",
  },
  compression: {
    label: "COMPRESSION FORENSICS",
    description: "Whether compression history is uniform across the whole frame.",
  },
};

export const LAYER_META: Record<LayerId, { label: string; short: string }> = {
  original: { label: "Original", short: "ORIG" },
  faces: { label: "Face detection", short: "FACE" },
  regions: { label: "Suspicious regions", short: "REGION" },
  heatmap: { label: "Heatmap overlay", short: "HEAT" },
  frequency: { label: "Frequency domain", short: "FFT" },
  compression: { label: "Compression (ELA)", short: "ELA" },
  noise: { label: "Noise residual", short: "NOISE" },
};

export const DISCLAIMER =
  "Confidence represents the model’s assessment based on the available forensic signals. It is not a guarantee of authenticity.";

export const LIMITATIONS = [
  "Detection is probabilistic. False positives (authentic media flagged) and false negatives (manipulated media missed) both occur.",
  "Heavy compression, re-encoding, filters and low resolution can mimic or mask manipulation signals.",
  "New generation techniques may fall outside what the model was trained to recognise.",
  "Results are one input to a human review process and should not be treated as conclusive proof.",
];

export const DEMO_NOTICE =
  "Simulated result — produced by the demo engine, not a trained detection model.";
