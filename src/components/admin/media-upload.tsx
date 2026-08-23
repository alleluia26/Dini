"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";

import { supportedImageAccept, validateImageFile } from "@/lib/validation/image";

type MediaUploadProps = {
  label: string;
  name: string;
  onUploaded: (asset: { id: string; publicUrl: string }) => void;
  value?: string | null;
};

export function MediaUpload({ label, name, onUploaded, value }: MediaUploadProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraCaptureSupported, setCameraCaptureSupported] = useState(false);
  const [message, setMessage] = useState<string>();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCameraCaptureSupported(
        typeof navigator.mediaDevices?.getUserMedia === "function",
      );
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  async function upload(file: File) {
    setUploading(true);
    setMessage(undefined);

    try {
      await validateImageFile(file);

      const formData = new FormData();
      formData.set("file", file);
      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as {
        id?: string;
        message?: string;
        publicUrl?: string;
      };

      if (!response.ok || !data.id || !data.publicUrl) {
        throw new Error(data.message ?? "Image upload failed.");
      }

      onUploaded({ id: data.id, publicUrl: data.publicUrl });
      setMessage("Image uploaded. Save this form to attach it.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function handleFileSelection(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (file) void upload(file);
    event.currentTarget.value = "";
  }

  return (
    <div>
      <label
        className="mb-2 block text-sm font-bold text-[var(--color-ink)]"
        htmlFor={name}
      >
        {label}
      </label>
      <input
        accept={supportedImageAccept}
        aria-describedby={`${name}-upload-hint`}
        className="sr-only"
        disabled={uploading}
        id={name}
        onChange={handleFileSelection}
        ref={fileInputRef}
        type="file"
      />
      <input
        accept={supportedImageAccept}
        aria-describedby={`${name}-upload-hint`}
        capture="environment"
        className="sr-only"
        disabled={uploading}
        id={`${name}-camera`}
        onChange={handleFileSelection}
        ref={cameraInputRef}
        type="file"
      />
      <div className="flex flex-wrap gap-3">
        <button
          className="min-h-11 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm font-bold text-[var(--color-ink)] transition hover:border-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue)] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          Choose File
        </button>
        {cameraCaptureSupported ? (
          <button
            className="min-h-11 rounded-[var(--radius-control)] bg-[var(--color-brand-blue)] px-4 text-sm font-bold text-white transition hover:bg-[var(--color-brand-blue-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={uploading}
            onClick={() => cameraInputRef.current?.click()}
            type="button"
          >
            Take Photo
          </button>
        ) : null}
      </div>
      <p
        className="mt-2 text-xs font-semibold text-[var(--color-muted)]"
        id={`${name}-upload-hint`}
      >
        JPG, JPEG, PNG, WebP, or GIF up to 200 KB. Choose File opens your device picker;
        Take Photo uses the camera when supported.
      </p>
      {value ? (
        <p className="mt-2 text-xs font-semibold text-[var(--color-success)]">
          An image is selected.
        </p>
      ) : null}
      {message ? (
        <p className="mt-2 text-sm font-medium text-[var(--color-muted)]">{message}</p>
      ) : null}
    </div>
  );
}
