export const maxImageSizeBytes = 200 * 1024;

export const supportedImageAccept =
  ".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif";

const mimeTypesByExtension = {
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
} as const;

type SupportedImageMimeType =
  (typeof mimeTypesByExtension)[keyof typeof mimeTypesByExtension];

const imageSignatures: Record<SupportedImageMimeType, number[]> = {
  "image/gif": [71, 73, 70, 56],
  "image/jpeg": [255, 216, 255],
  "image/png": [137, 80, 78, 71, 13, 10, 26, 10],
  "image/webp": [82, 73, 70, 70],
};

export class ImageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageValidationError";
  }
}

function getExtension(name: string) {
  const dotIndex = name.lastIndexOf(".");
  return dotIndex === -1 ? "" : name.slice(dotIndex).toLowerCase();
}

function isSupportedImageMimeType(type: string): type is SupportedImageMimeType {
  return Object.values(mimeTypesByExtension).includes(type as SupportedImageMimeType);
}

function matchesImageSignature(contentType: SupportedImageMimeType, bytes: Uint8Array) {
  const signature = imageSignatures[contentType];

  if (!signature.every((byte, index) => bytes[index] === byte)) {
    return false;
  }

  if (contentType === "image/gif") {
    return (bytes[4] === 55 || bytes[4] === 57) && bytes[5] === 97;
  }

  if (contentType === "image/webp") {
    return (
      new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP" && bytes.length >= 12
    );
  }

  return true;
}

export async function validateImageFile(file: File) {
  const extension = getExtension(file.name);
  const expectedMimeType =
    mimeTypesByExtension[extension as keyof typeof mimeTypesByExtension];

  if (
    !expectedMimeType ||
    !isSupportedImageMimeType(file.type) ||
    file.type !== expectedMimeType
  ) {
    throw new ImageValidationError(
      "Unsupported image format. Upload a JPG, JPEG, PNG, WebP, or GIF image.",
    );
  }

  if (file.size > maxImageSizeBytes) {
    throw new ImageValidationError(
      "Image is larger than 200 KB. Choose an image up to 200 KB.",
    );
  }

  if (file.size < 1) {
    throw new ImageValidationError("Choose a valid image file to upload.");
  }

  const signature = new Uint8Array(await file.slice(0, 12).arrayBuffer());

  if (!matchesImageSignature(file.type, signature)) {
    throw new ImageValidationError("Choose a valid image file to upload.");
  }
}
