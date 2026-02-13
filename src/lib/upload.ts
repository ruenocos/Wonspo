import { put, del } from "@vercel/blob";
import sharp from "sharp";
import { nanoid } from "nanoid";

export async function saveFile(
  buffer: Buffer,
  originalName: string
): Promise<{ filePath: string; thumbnailPath: string | null; width: number; height: number }> {
  const ext = originalName.split(".").pop()?.toLowerCase() || "bin";
  const id = nanoid(12);
  const filename = `${id}.${ext}`;

  const imageExts = ["jpg", "jpeg", "png", "gif", "webp"];
  const isImage = imageExts.includes(ext);

  // Upload original file to Vercel Blob
  const blob = await put(`uploads/${filename}`, buffer, {
    access: "public",
    contentType: isImage ? `image/${ext === "jpg" ? "jpeg" : ext}` : undefined,
  });

  if (isImage) {
    const metadata = await sharp(buffer).metadata();
    const origWidth = metadata.width || 300;
    const origHeight = metadata.height || 200;

    // Generate and upload thumbnail
    const thumbBuffer = await sharp(buffer)
      .resize(600, 600, { fit: "inside", withoutEnlargement: true })
      .toBuffer();

    const thumbBlob = await put(`uploads/${id}_thumb.${ext}`, thumbBuffer, {
      access: "public",
      contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
    });

    return {
      filePath: blob.url,
      thumbnailPath: thumbBlob.url,
      width: Math.min(origWidth, 300),
      height: Math.min(origWidth, 300) * (origHeight / origWidth),
    };
  }

  return { filePath: blob.url, thumbnailPath: null, width: 250, height: 80 };
}

export async function deleteFile(fileUrl: string) {
  try {
    if (fileUrl.includes("blob.vercel-storage")) {
      await del(fileUrl);
    }
  } catch {
    // File may already be deleted
  }
}
