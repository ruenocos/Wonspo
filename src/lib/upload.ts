import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { nanoid } from "nanoid";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export async function saveFile(
  buffer: Buffer,
  originalName: string
): Promise<{ filePath: string; thumbnailPath: string | null; width: number; height: number }> {
  await ensureUploadDir();

  const ext = path.extname(originalName).toLowerCase();
  const id = nanoid(12);
  const filename = `${id}${ext}`;
  const filePath = path.join(UPLOAD_DIR, filename);

  await fs.writeFile(filePath, buffer);

  const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
  if (imageExts.includes(ext) && ext !== ".svg") {
    const metadata = await sharp(buffer).metadata();
    const width = metadata.width || 300;
    const height = metadata.height || 200;

    const thumbFilename = `${id}_thumb${ext}`;
    const thumbPath = path.join(UPLOAD_DIR, thumbFilename);

    await sharp(buffer)
      .resize(600, 600, { fit: "inside", withoutEnlargement: true })
      .toFile(thumbPath);

    return {
      filePath: `/uploads/${filename}`,
      thumbnailPath: `/uploads/${thumbFilename}`,
      width: Math.min(width, 300),
      height: Math.min(width, 300) * (height / width),
    };
  }

  return { filePath: `/uploads/${filename}`, thumbnailPath: null, width: 250, height: 80 };
}

export async function deleteFile(filePath: string) {
  const fullPath = path.join(process.cwd(), "public", filePath);
  try {
    await fs.unlink(fullPath);
  } catch {
    // File may already be deleted
  }
}
