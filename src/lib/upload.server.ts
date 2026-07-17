import { mkdirSync, unlinkSync, existsSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, extname, basename } from "node:path";
import { getUploadsRoot } from "./db.server";

export const UPLOAD_CATEGORIES = [
  "logo",
  "gojo-shop",
  "founders",
  "partners",
  "og",
  "general",
  "capabilities",
] as const;

export type UploadCategory = (typeof UPLOAD_CATEGORIES)[number];

const ALLOWED_TYPES: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
  "image/x-icon": ".ico",
  "image/vnd.microsoft.icon": ".ico",
};

const MAX_BYTES = 5 * 1024 * 1024;

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "image";
}

export async function saveUpload(
  file: File,
  category: UploadCategory,
  prefix?: string,
): Promise<{ path: string; absolutePath: string }> {
  if (!(category in Object.fromEntries(UPLOAD_CATEGORIES.map((c) => [c, true])))) {
    throw new Error("Invalid upload category");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("File too large (max 5 MB)");
  }
  const ext = ALLOWED_TYPES[file.type] ?? extname(file.name).toLowerCase();
  if (!Object.values(ALLOWED_TYPES).includes(ext) && ![".ico"].includes(ext)) {
    throw new Error("Unsupported file type. Use PNG, JPEG, WebP, SVG, or ICO.");
  }

  const root = getUploadsRoot();
  const dir = join(root, category);
  mkdirSync(dir, { recursive: true });

  const base = slugify(prefix ? `${prefix}-${file.name}` : file.name);
  const filename = `${base}-${Date.now()}${ext}`;
  const absolutePath = join(dir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  writeFileSync(absolutePath, buffer);

  return {
    path: `/uploads/${category}/${filename}`,
    absolutePath,
  };
}

export function deleteUploadByPublicPath(publicPath: string | null | undefined) {
  if (!publicPath || !publicPath.startsWith("/uploads/")) return;
  const relative = publicPath.replace(/^\/uploads\//, "");
  const absolute = join(getUploadsRoot(), relative);
  if (existsSync(absolute)) {
    try {
      unlinkSync(absolute);
    } catch {
      // ignore
    }
  }
}

export function listMediaLibrary() {
  const root = getUploadsRoot();
  const files: {
    category: string;
    filename: string;
    path: string;
    size: number;
    mtime: string;
  }[] = [];

  for (const category of UPLOAD_CATEGORIES) {
    const dir = join(root, category);
    if (!existsSync(dir)) continue;
    for (const filename of readdirSync(dir)) {
      if (filename.startsWith(".")) continue;
      const absolute = join(dir, filename);
      const st = statSync(absolute);
      if (!st.isFile()) continue;
      files.push({
        category,
        filename,
        path: `/uploads/${category}/${filename}`,
        size: st.size,
        mtime: st.mtime.toISOString(),
      });
    }
  }

  return files.sort((a, b) => b.mtime.localeCompare(a.mtime));
}

export function isSafeUploadPath(publicPath: string) {
  if (!publicPath.startsWith("/uploads/")) return false;
  if (publicPath.includes("..")) return false;
  const name = basename(publicPath);
  return Boolean(name) && name !== "." && name !== "..";
}
