"use client";

import { useState } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { apiUpload } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  subdir: "equipments" | "invoices" | "refuelings" | "maintenance";
  label?: string;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  subdir,
  label = "Foto",
  className,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const { url } = await apiUpload("/api/upload", file, subdir);
      onChange(url);
    } catch (e: any) {
      alert(e.message || "Erro no upload");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      {value ? (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border bg-muted">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          htmlFor={`upload-${subdir}`}
          className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors"
        >
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 text-emerald-600 animate-spin mb-2" />
              <p className="text-sm text-muted-foreground">Enviando...</p>
            </>
          ) : (
            <>
              <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Toque para adicionar uma foto
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Opcional · JPG/PNG
              </p>
            </>
          )}
          <input
            id={`upload-${subdir}`}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </label>
      )}
    </div>
  );
}
