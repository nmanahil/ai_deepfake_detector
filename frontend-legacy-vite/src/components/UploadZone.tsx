import { useCallback, useEffect, useRef, useState } from "react";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export default function UploadZone({ onFileSelected, disabled = false }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [typeError, setTypeError] = useState<string | null>(null);

  // Clean up the object URL when the preview changes or the component unmounts
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        setTypeError(`"${file.name}" is not an image. Please upload a JPEG, PNG, or WebP file.`);
        return;
      }
      setTypeError(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(file));
      onFileSelected(file);
    },
    [onFileSelected, preview],
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset so the same file can be re-selected after a clear
    e.target.value = "";
  };

  const zoneClass = [
    "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed",
    "transition-colors cursor-pointer select-none",
    disabled
      ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
      : isDragging
        ? "border-indigo-500 bg-indigo-50"
        : "border-gray-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/40",
    preview ? "p-3" : "p-10",
  ].join(" ");

  return (
    <div className="w-full space-y-2">
      <div
        role="button"
        aria-label="Upload image"
        tabIndex={disabled ? -1 : 0}
        className={zoneClass}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && !disabled && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={disabled ? undefined : onDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={onInputChange}
          disabled={disabled}
        />

        {preview ? (
          <img
            src={preview}
            alt="Selected preview"
            className="max-h-64 w-auto rounded-lg object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-center pointer-events-none">
            <UploadIcon />
            <p className="text-sm font-medium text-gray-700">
              Drag &amp; drop an image here, or{" "}
              <span className="text-indigo-600 underline underline-offset-2">browse</span>
            </p>
            <p className="text-xs text-gray-400">JPEG, PNG, WebP, GIF — max 10 MB</p>
          </div>
        )}
      </div>

      {typeError && (
        <p role="alert" className="text-sm text-red-600">
          {typeError}
        </p>
      )}

      {preview && !disabled && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-xs text-indigo-600 hover:underline"
        >
          Choose a different image
        </button>
      )}
    </div>
  );
}

function UploadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-10 w-10 text-gray-300"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
      />
    </svg>
  );
}
