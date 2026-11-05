// Cria diretório de uploads se não existir e salva arquivos.
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function ensureUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch {
    // ignore
  }
}

export async function saveUpload(
  file: File,
  subdir: "equipments" | "invoices" | "refuelings" | "maintenance" = "refuelings"
): Promise<string | null> {
  if (!file) return null;
  await ensureUploadDir();

  // Limite de 10MB
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Arquivo muito grande (max 10MB)");
  }

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (!allowed.includes(file.type)) {
    throw new Error("Formato não suportado. Use JPG, PNG ou WEBP.");
  }

  const ext = file.name.split(".").pop() || "jpg";
  const filename = `${subdir}/${randomUUID()}.${ext}`;
  const fullDir = path.join(UPLOAD_DIR, subdir);
  await fs.mkdir(fullDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return `/uploads/${filename}`;
}
