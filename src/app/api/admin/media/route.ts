import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { revalidateMenuManagement } from "@/lib/admin/revalidation";
import { prisma } from "@/lib/db/client";
import { vercelBlobStorage } from "@/lib/storage/vercel-blob";

export const runtime = "nodejs";

export async function POST(request: Request) {
  await requireAdmin();

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { message: "Choose an image file to upload." },
      { status: 400 },
    );
  }

  try {
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
    const stored = await vercelBlobStorage.uploadImage({
      file,
      pathname: `dini-hotel/${Date.now()}-${safeName}`,
    });

    try {
      const asset = await prisma.mediaAsset.create({
        data: {
          provider: "vercel-blob",
          storageKey: stored.pathname,
          publicUrl: stored.url,
          mimeType: stored.contentType,
          byteSize: stored.byteSize,
        },
        select: { id: true, publicUrl: true },
      });

      revalidateMenuManagement();
      return NextResponse.json(asset, { status: 201 });
    } catch (error) {
      await vercelBlobStorage.deleteAsset(stored.pathname).catch(() => undefined);
      throw error;
    }
  } catch (error) {
    void error;
    return NextResponse.json(
      { message: "Image upload failed. Check the image and try again." },
      { status: 400 },
    );
  }
}
