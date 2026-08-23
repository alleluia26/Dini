import "server-only";

import { del, put } from "@vercel/blob";

import type {
  StorageProvider,
  StoredAsset,
  UploadImageInput,
} from "@/lib/storage/types";
import { validateImageFile } from "@/lib/validation/image";

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
