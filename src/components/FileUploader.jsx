import React, { useCallback, useState } from "react";
import { Upload, File as FileIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const FileUploader = ({ onFileSelect, selectedFile, maxSize }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        const file = files[0];
        if (file.size <= maxSize) {
          onFileSelect(file);
        } else {
          alert(`File size exceeds ${formatBytes(maxSize)} limit`);
        }
      }
    },
    [maxSize, onFileSelect]
  );

  const handleFileInput = useCallback(
    (e) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.size <= maxSize) {
          onFileSelect(file);
        } else {
          alert(`File size exceeds ${formatBytes(maxSize)} limit`);
        }
      }
    },
    [maxSize, onFileSelect]
  );

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
    );
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <label
          htmlFor="file-upload"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-all",
            isDragging
              ? "border-primary bg-primary/10 glow-primary"
              : "border-border hover:border-primary/50 bg-card hover:bg-card/80"
          )}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload
              className={cn(
                "w-12 h-12 mb-4 transition-colors",
                isDragging ? "text-primary" : "text-muted-foreground"
              )}
            />
            <p className="mb-2 text-sm">
              <span className="font-semibold">Click to upload</span> or drag
              and drop
            </p>
            <p className="text-xs text-muted-foreground">
              Max file size: {formatBytes(maxSize)}
            </p>
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileInput}
          />
        </label>
      ) : (
        <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
          <div className="flex items-center gap-3">
            <FileIcon className="w-8 h-8 text-primary" />
            <div>
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatBytes(selectedFile.size)}
              </p>
            </div>
          </div>
          <button
            onClick={() => onFileSelect(null)}
            className="p-2 hover:bg-secondary rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
