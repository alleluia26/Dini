export type StoredAsset = {
  byteSize: number;
  contentType: string;
  pathname: string;
  url: string;
};

export type UploadImageInput = {
  file: File;
  pathname: string;
};

export interface StorageProvider {
  uploadImage(input: UploadImageInput): Promise<StoredAsset>;
  deleteAsset(pathname: string): Promise<void>;
}

// A Vercel Blob adapter will implement this interface in Phase 5.
