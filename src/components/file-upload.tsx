"use client";

import { useCallback, useState } from "react";
import { Upload, X, Image as ImageIcon, FileCheck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onClear?: () => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  disabled?: boolean;
}

const ALLOWED_TYPES = ["image/png", "image/svg+xml"];
const MAX_FILE_SIZE_MB = 5;

export function FileUpload({
  onFileSelect,
  onClear,
  accept = "image/png,image/svg+xml",
  maxSize = MAX_FILE_SIZE_MB,
  className,
  disabled = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFile = useCallback(
    (file: File) => {
      setError(null);

      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Invalid file type. Please upload a PNG or SVG file only.");
        return;
      }

      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File size must be less than ${maxSize}MB. Your file is ${formatFileSize(file.size)}.`);
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      setFileName(file.name);
      setFileSize(file.size);
      setFileType(file.type);
      onFileSelect(file);
    },
    [maxSize, onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile, disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const clearSelection = () => {
    setPreview(null);
    setFileName(null);
    setFileSize(null);
    setFileType(null);
    setError(null);
    onClear?.();
  };

  return (
    <div className={cn("w-full", className)}>
      {preview ? (
        <div className="relative rounded-2xl border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 p-6">
          <button
            onClick={clearSelection}
            disabled={disabled}
            className="absolute top-4 right-4 p-1.5 bg-white dark:bg-neutral-800 rounded-full shadow-md hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
          >
            <X size={16} className="text-neutral-600 dark:text-neutral-400" />
          </button>
          <div className="flex items-center gap-5">
            <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-white dark:bg-neutral-800 flex items-center justify-center border border-neutral-200 dark:border-neutral-700 shadow-sm">
              <Image
                src={preview}
                alt="Logo preview"
                fill
                className="object-contain p-3"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <FileCheck size={18} className="text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  Ready to upload
                </span>
              </div>
              <p className="text-base font-medium text-neutral-900 dark:text-white truncate max-w-[200px]">
                {fileName}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                  {fileType === "image/svg+xml" ? "SVG" : "PNG"}
                </span>
                <span className="text-xs text-neutral-500">
                  {fileSize && formatFileSize(fileSize)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "relative rounded-2xl border-2 border-dashed p-12 text-center transition-all",
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
            isDragging
              ? "border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-900"
              : "border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600",
            error && "border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-950/20"
          )}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleInputChange}
            disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <div className="flex flex-col items-center gap-4">
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors",
              error
                ? "bg-red-100 dark:bg-red-900/30"
                : "bg-neutral-100 dark:bg-neutral-800"
            )}>
              {error ? (
                <AlertCircle size={28} className="text-red-500" />
              ) : isDragging ? (
                <ImageIcon size={28} className="text-neutral-600 dark:text-neutral-400" />
              ) : (
                <Upload size={28} className="text-neutral-600 dark:text-neutral-400" />
              )}
            </div>
            <div>
              <p className={cn(
                "text-base font-medium",
                error ? "text-red-600 dark:text-red-400" : "text-neutral-900 dark:text-white"
              )}>
                {error ? "Upload failed" : isDragging ? "Drop your logo here" : "Upload your logo"}
              </p>
              <p className="text-sm text-neutral-500 mt-1">
                PNG or SVG only, up to {maxSize}MB
              </p>
            </div>
          </div>
        </div>
      )}
      {error && (
        <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
