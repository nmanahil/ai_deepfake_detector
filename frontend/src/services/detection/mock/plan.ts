import { SIGNALS } from "@/lib/constants";
import { verdictFromScore } from "@/lib/verdict";
import { clamp, pct } from "@/lib/utils";
import { gauss, mulberry32, range, hashString, type Rand } from "@/lib/rng";
import type { DetectionResult, Media, ModelMetadata, SignalKey, SignalScore, Verdict } from "@/types";
import { LIMITATIONS } from "@/lib/constants";

/**
 * The mock "detector".
 *
 * IMPORTANT: this does not inspect the media to reach a verdict. The outcome is
 * a deterministic function of the file's SHA-256 so the same file always yields
 * the same demo result. Every surface that shows it is labelled as simulated.
 */

export interface Plan {
  seed: number;
  verdict: Verdict;
  score: number;
  confidence: number;
  signals: Record<SignalKey, number>;
}

const WEIGHTS: Record<SignalKey, number> = { facial: 0.28, temporal: 0.2, texture: 0.22, frequency: 0.18, compression: 0.12 };

export function planOutcome(sha256: string, kind: Media["kind"], force?: Verdict): Plan {
  const seed = hashString(sha256);
  const r = mulberry32(seed);
  const roll = r();
  const verdict: Verdict = force ?? (roll < 0.4 ? "authentic" : roll < 0.66 ? "suspicious" : "manipulated");

  let score: number;
  let confidence: number;
  if (verdict === "authentic") {
    score = range(r, 0.06, 0.3);
    confidence = clamp(0.985 - score * 0.55 + gauss(r, 0, 0.008), 0.8, 0.975);
  } else if (verdict === "suspicious") {
    score = range(r, 0.41, 0.64);
    confidence = range(r, 0.62, 0.86);
  } else {
    score = range(r, 0.72, 0.96);
    confidence = clamp(0.62 + score * 0.36 + gauss(r, 0, 0.012), 0.86, 0.985);
  }

  const signals = {} as Record<SignalKey, number>;
  (Object.keys(WEIGHTS) as SignalKey[]).forEach((k) => {
    signals[k] = clamp(score + gauss(r, 0, 0.085) + (k === "texture" || k === "frequency" ? 0.04 : 0), 0.03, 0.97);
  });
  if (kind !== "video") signals.temporal = 0;
  return { seed, verdict, score, confidence, signals };
}

export function buildSignals(plan: Plan, kind: Media["kind"]): SignalScore[] {
  const keys = (Object.keys(WEIGHTS) as SignalKey[]).filter((k) => k !== "compression");
  const list: SignalKey[] = [...keys, "compression"];
  const applicable = list.filter((k) => k !== "temporal" || kind === "video");
  const total = applicable.reduce((s, k) => s + WEIGHTS[k], 0);
  return list.map((k) => ({
    key: k,
    label: SIGNALS[k].label,
    description: SIGNALS[k].description,
    score: applicable.includes(k) ? plan.signals[k] : 0,
    weight: applicable.includes(k) ? WEIGHTS[k] / total : 0,
    applicable: applicable.includes(k),
  }));
}

export function modelMetadata(plan: Plan): ModelMetadata {
  const r = mulberry32(plan.seed ^ 0x51ed);
  return {
    name: "VERA Demo Engine",
    version: "v0.4.2",
    family: "Simulated — no trained weights",
    framework: "TypeScript · in-browser",
    inputResolution: "adaptive",
    ensemble: [
      "Reference architecture (planned): ViT-B/16 face-manipulation classifier",
      "Reference architecture (planned): Xception artifact detector",
      "Reference architecture (planned): FFT-CNN frequency branch",
      "Reference architecture (planned): temporal transformer",
    ],
    node: "EU-CENTRAL",
    latencyMs: Math.round(range(r, 96, 212)),
    simulated: true,
  };
}

function topSignals(signals: SignalScore[], n = 2) {
  return [...signals].filter((s) => s.applicable).sort((a, b) => b.score - a.score).slice(0, n);
}

export function buildNarrative(plan: Plan, signals: SignalScore[]): Pick<DetectionResult, "headline" | "explanation"> {
  const top = topSignals(signals);
  const topText = top.map((s) => `${s.label.toLowerCase()} (${pct(s.score, 0)})`).join(" and ");
  if (plan.verdict === "authentic") {
    return {
      headline: "Low evidence of manipulation",
      explanation: [
        "The system did not find regions whose visual characteristics differ meaningfully from the surrounding facial texture. The signals it measured were largely consistent with natural camera capture.",
        "Minor observations, such as ordinary compression residue, were recorded but did not materially change the assessment. A low score is not proof of authenticity.",
      ],
    };
  }
  if (plan.verdict === "suspicious") {
    return {
      headline: "Suspicious media — review recommended",
      explanation: [
        "The system detected a small number of regions whose visual characteristics differ from the surrounding facial texture. These signals raised the manipulation score, but not enough for a confident determination.",
        `The strongest contributors were ${topText}. Benign processes — recompression, beauty filters, resizing — can produce similar patterns, so this result is best treated as a prompt for closer human review.`,
      ],
    };
  }
  return {
    headline: "Likely synthetic or manipulated",
    explanation: [
      "The system detected several regions whose visual characteristics differ from the surrounding facial texture. These signals contributed to the elevated manipulation score.",
      `Multiple independent signals pointed in the same direction, led by ${topText}. Agreement between signals raises the model’s confidence, but it does not amount to proof — verify against the original source where possible.`,
    ],
  };
}

export function assembleResult(plan: Plan, kind: Media["kind"]): DetectionResult {
  const signals = buildSignals(plan, kind);
  const fused = signals.reduce((s, x) => s + x.score * x.weight, 0);
  const score = clamp((fused + plan.score) / 2, 0.02, 0.99);
  // Keep the verdict stable relative to the plan; the fused score is displayed but never crosses bands.
  const bounded = verdictFromScore(score) === plan.verdict ? score : plan.score;
  return {
    verdict: plan.verdict,
    manipulationScore: bounded,
    confidence: plan.confidence,
    ...buildNarrative(plan, signals),
    signals,
    limitations: LIMITATIONS,
    model: modelMetadata(plan),
    simulated: true,
  };
}

export const planRand = (plan: Plan, salt: number): Rand => mulberry32(plan.seed ^ salt);
