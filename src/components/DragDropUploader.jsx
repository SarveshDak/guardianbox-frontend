import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileIcon } from "lucide-react";

export default function DragDropUploader({ onFileSelect, selectedFile, maxSize }) {

  const onDrop = useCallback((acceptedFiles) => {
    if (!acceptedFiles?.length) return;

    const file = acceptedFiles[0];

    if (file.size > maxSize) {
      alert(`File too large! Max allowed size: ${(maxSize / 1024 / 1024).toFixed(0)} MB`);
      return;
    }

    onFileSelect(file);
  }, [onFileSelect, maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-6 cursor-pointer transition
        ${isDragActive ? "border-blue-500 bg-blue-500/10" : "border-gray-500/40 bg-card/50 backdrop-blur-sm"}
      `}
    >
      <input {...getInputProps()} />

      {selectedFile ? (
        <div className="flex items-center gap-3">
          <FileIcon className="w-6 h-6 text-primary" />
          <div>
            <p className="font-semibold">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <UploadCloud className="w-10 h-10 mx-auto mb-3 text-primary" />

          <p className="text-sm text-muted-foreground">
            {isDragActive ? "Drop your file here..." : "Drag & drop your file here"}
          </p>

          <p className="text-xs text-muted-foreground mt-1">
            or click to browse
          </p>
        </div>
      )}
    </div>
  );
}
