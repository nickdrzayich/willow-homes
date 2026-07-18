"use client";

import { useRef, useState, type DragEvent } from "react";
import { UploadCloud, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export function FileDropInput({
  name,
  accept,
  defaultFileName,
}: {
  name: string;
  accept?: string;
  defaultFileName?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      onDragOver={(e: DragEvent) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e: DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file && inputRef.current) {
          inputRef.current.files = e.dataTransfer.files;
          setFileName(file.name);
        }
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors",
        dragActive ? "border-primary bg-primary/5" : "border-input hover:bg-accent/40"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={accept}
        className="hidden"
        onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
      />
      {fileName ? (
        <>
          <FileText className="h-5 w-5 text-primary" />
          <p className="text-sm font-medium">{fileName}</p>
          <p className="text-xs text-muted-foreground">Click or drop to replace</p>
        </>
      ) : (
        <>
          <UploadCloud className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm">
            <span className="font-medium text-primary">Click to upload</span> or drag and drop
          </p>
          {defaultFileName && (
            <p className="text-xs text-muted-foreground">Currently: {defaultFileName}</p>
          )}
        </>
      )}
    </div>
  );
}
