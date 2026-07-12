export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
        Deepfake Detector
      </h1>
      <p className="text-lg text-gray-500 max-w-md">
        Upload an image to find out whether it's AI-generated or real. Powered by a
        Vision Transformer with attention-based explainability.
      </p>
      <p className="mt-6 text-sm text-gray-400">
        Upload &amp; Results and History views coming in the next milestone.
      </p>
    </div>
  );
}
