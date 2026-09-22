import { HttpDetectionProvider } from "./http/provider";
import { MockDetectionProvider } from "./mock/provider";
import type { DetectionProvider } from "./provider";

export type { DetectionProvider } from "./provider";
export { DetectionError } from "./provider";

function createProvider(): DetectionProvider {
  if (process.env.NEXT_PUBLIC_DETECTION_PROVIDER === "http") {
    return new HttpDetectionProvider(process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000");
  }
  return new MockDetectionProvider();
}

/** The single detection engine instance the UI talks to. */
export const detection: DetectionProvider = createProvider();
