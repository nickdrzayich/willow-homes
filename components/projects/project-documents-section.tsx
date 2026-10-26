"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { FileText, Loader2, UploadCloud, X } from "lucide-react";
import { addProjectDocument, deleteProjectDocument } from "@/lib/actions/project-documents";
import { createClient } from "@/lib/supabase/client";
import { sanitizeFileName } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ProjectDocumentCategory } from "@/lib/types";

const BUCKET = "project-documents";

export interface ProjectDocument {
  id: string;
  file_name: string;
  storage_path: string;
  url: string | null;
}

export function ProjectDocumentsSection({
  projectId,
  category,
  label,
  documents,
}: {
  projectId: string;
  category: ProjectDocumentCategory;
  label: string;
  documents: ProjectDocument[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function addFiles(list: FileList | null) {
    if (!list?.length) return;
    setUploading(true);
    let succeeded = 0;

    for (const file of Array.from(list)) {
      try {
        const path = `${projectId}/${category}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
        const { error: uploadError } = await createClient().storage.from(BUCKET).upload(path, file);
        if (uploadError) throw new Error(uploadError.message);

        await addProjectDocument(projectId, category, path, file.name);
        succeeded += 1;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : `Could not upload ${file.name}`);
      }
    }

    setUploading(false);
    if (succeeded > 0) toast.success(succeeded === 1 ? "File uploaded" : `${succeeded} files uploaded`);
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">{label}</p>
      {documents.length > 0 && (
        <ul className="flex flex-col gap-1">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm">
              {doc.url ? (
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-w-0 items-center gap-2 text-primary hover:underline"
                >
                  <FileText className="h-4 w-4 shrink-0" />
                  <span className="truncate">{doc.file_name}</span>
                </a>
              ) : (
                <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4 shrink-0" />
                  <span className="truncate">{doc.file_name}</span>
                </span>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={async () => {
                  try {
                    await deleteProjectDocument(projectId, doc.id, doc.storage_path);
                    toast.success("File removed");
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Could not remove file");
                  }
                }}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
          {uploading ? "Uploading..." : "Add PDFs"}
        </Button>
      </div>
    </div>
  );
}
