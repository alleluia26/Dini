"use client";

import { useState } from "react";

type MediaUploadProps = {
  label: string;
  name: string;
  onUploaded: (asset: { id: string; publicUrl: string }) => void;
  value?: string | null;
};

export function MediaUpload({ label, name, onUploaded, value }: MediaUploadProps) {
  const [message, setMessage] = useState<string>();
  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    setUploading(true);
    setMessage(undefined);

    try {
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

  return (
    <div>
      <label
        className="mb-2 block text-sm font-bold text-[var(--color-ink)]"
        htmlFor={name}
      >
        {label}
      </label>
      <input
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="block w-full text-sm text-[var(--color-muted)] file:mr-4 file:min-h-11 file:rounded-[var(--radius-control)] file:border-0 file:bg-[var(--color-brand-blue-soft)] file:px-4 file:font-bold file:text-[var(--color-brand-blue)]"
        disabled={uploading}
        id={name}
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file) void upload(file);
        }}
        type="file"
      />
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
