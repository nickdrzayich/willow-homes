"use client";

import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { FileText, Loader2, UploadCloud, X } from "lucide-react";
import { isPdfFileName } from "@/lib/utils";
import { isHeicFile, convertHeicToJpeg } from "@/lib/heic";

export function ImageDropInput({
  files,
  onChange,
}: {
  files: File[];
  onChange: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [converting, setConverting] = useState(false);
  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  async function addFiles(list: FileList | null) {
    if (!list?.length) return;
    const incoming = Array.from(list);
    const hasHeic = incoming.some(isHeicFile);

    if (!hasHeic) {
      onChange([...files, ...incoming]);
      return;
    }

    setConverting(true);
    const converted = await Promise.all(
      incoming.map((file) => (isHeicFile(file) ? convertHeicToJpeg(file).catch(() => file) : file))
    );
    setConverting(false);
    onChange([...files, ...converted]);
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e: DragEvent) => e.preventDefault()}
        onDrop={(e: DragEvent) => {
          e.preventDefault();
          addFiles(e.dataTransfer.files);
        }}
        className="flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border-2 border-dashed border-input px-4 py-6 text-center transition-colors hover:bg-accent/40"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        {converting ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <UploadCloud className="h-5 w-5 text-muted-foreground" />
        )}
        <p className="text-sm">
          {converting ? (
            "Converting HEIC photo..."
          ) : (
            <>
              <span className="font-medium text-primary">Click to add photos or PDFs</span> or drag and drop
            </>
          )}
        </p>
      </div>
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((file, i) => (
            <div key={i} className="group relative h-16 w-16 overflow-hidden rounded-md border">
              {isPdfFileName(file.name) ? (
                <div className="flex h-full w-full flex-col items-center justify-center gap-0.5 bg-muted p-1">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span className="w-full truncate text-center text-[9px] text-muted-foreground">
                    {file.name}
                  </span>
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previews[i]} alt={file.name} className="h-full w-full object-cover" />
              )}
              <button
                type="button"
                onClick={() => onChange(files.filter((_, fi) => fi !== i))}
                className="absolute top-0.5 right-0.5 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
