import "server-only";

import { del, put } from "@vercel/blob";

import type {
  StorageProvider,
  StoredAsset,
  UploadImageInput,
} from "@/lib/storage/types";

export const maxImageSizeBytes = 5 * 1024 * 1024;

const supportedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

function matchesImageSignature(contentType: string, bytes: Uint8Array) {
  if (contentType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (contentType === "image/png") {
    return bytes
      .slice(0, 8)
      .every((byte, index) => byte === [137, 80, 78, 71, 13, 10, 26, 10][index]);
  }

  if (contentType === "image/webp") {
    return (
      new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
      new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP"
    );
  }

  if (contentType === "image/avif") {
    return (
      new TextDecoder().decode(bytes.slice(4, 12)).includes("ftyp") &&
      new TextDecoder().decode(bytes.slice(8, 24)).includes("avif")
    );
  }

  return false;
}

export async function validateImageFile(file: File) {
  if (!supportedImageTypes.has(file.type)) {
    throw new Error("Upload a JPEG, PNG, WebP, or AVIF image.");
  }

  if (file.size < 1 || file.size > maxImageSizeBytes) {
    throw new Error("Images must be no larger than 5 MB.");
  }

  const signature = new Uint8Array(await file.slice(0, 32).arrayBuffer());

  if (!matchesImageSignature(file.type, signature)) {
    throw new Error("The uploaded file is not a valid image of the declared type.");
  }
}

class VercelBlobStorageProvider implements StorageProvider {
  async uploadImage({ file, pathname }: UploadImageInput): Promise<StoredAsset> {
    await validateImageFile(file);

    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    });

    return {
      byteSize: file.size,
      contentType: file.type,
      pathname: blob.pathname,
      url: blob.url,
    };
  }

  async deleteAsset(pathname: string) {
    await del(pathname);
  }
}

export const vercelBlobStorage = new VercelBlobStorageProvider();
