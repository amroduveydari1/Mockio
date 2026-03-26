"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Upload, CheckCircle, AlertCircle, Loader2, ImagePlus, ArrowLeft } from "lucide-react";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { uploadTemplate, getCategories } from "@/lib/actions/template-upload";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function NewTemplatePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    templateId?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const res = await getCategories();
      setCategories(res.categories);
      setIsLoadingCategories(false);
    }
    load();
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setResult(null);
    if (selected) {
      setPreview(URL.createObjectURL(selected));
    } else {
      setPreview(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !name.trim() || !categoryId) return;

    setIsUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("categoryId", categoryId);
    formData.append("file", file);
    formData.append("isPremium", isPremium.toString());

    const res = await uploadTemplate(formData);

    if (res.success) {
      setResult({
        success: true,
        message: `Template "${name}" uploaded successfully.`,
        templateId: res.templateId,
      });
      setName("");
      setCategoryId("");
      setIsPremium(false);
      setFile(null);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else {
      setResult({ success: false, message: res.error ?? "Upload failed." });
    }

    setIsUploading(false);
  }

  return (
    <div className="p-6 lg:p-10 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Link href="/admin/templates" className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Upload Template
          </h1>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 ml-8">
          Add a new mockup template to the library.
        </p>
      </div>

      <Card variant="bordered" padding="lg">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Template Name"
              placeholder="e.g. Business Card Dark"
              value={name}
              onChange={(e) => { setName(e.target.value); setResult(null); }}
              required
            />

            <div>
              <label className="block text-[13px] font-medium text-zinc-700 dark:text-zinc-300 mb-2">Category</label>
              {isLoadingCategories ? (
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading categories…
                </div>
              ) : (
                <select
                  value={categoryId}
                  onChange={(e) => { setCategoryId(e.target.value); setResult(null); }}
                  required
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-100 focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
                >
                  <option value="">Select a category…</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-[13px] font-medium text-zinc-700 dark:text-zinc-300 mb-2">Template Image</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 bg-zinc-50 dark:bg-zinc-900/50 p-8 cursor-pointer transition-colors"
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="max-h-48 rounded-lg object-contain" />
                ) : (
                  <>
                    <ImagePlus className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mb-3" />
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Click to select an image</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">JPG, PNG, WebP, or AVIF — max 50 MB</p>
                  </>
                )}
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={handleFileChange} className="hidden" />
              </div>
              {file && (
                <p className="text-xs text-zinc-400 mt-2">{file.name} — {(file.size / 1024 / 1024).toFixed(2)} MB</p>
              )}
            </div>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <button
                type="button"
                role="switch"
                aria-checked={isPremium}
                onClick={() => setIsPremium(!isPremium)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${isPremium ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-200 dark:bg-zinc-700"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-zinc-900 transition-transform duration-200 ${isPremium ? "translate-x-6" : "translate-x-1"}`} />
              </button>
              <span className="text-sm text-zinc-700 dark:text-zinc-300">Premium template</span>
            </label>

            {result && (
              <div className={`flex items-start gap-3 rounded-xl p-4 text-sm ${result.success ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400" : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400"}`}>
                {result.success ? <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
                <div>
                  <p>{result.message}</p>
                  {result.templateId && <p className="text-xs opacity-70 mt-1">ID: {result.templateId}</p>}
                </div>
              </div>
            )}

            <Button type="submit" size="lg" disabled={isUploading || !file || !name.trim() || !categoryId} className="w-full">
              {isUploading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
              ) : (
                <><Upload className="w-4 h-4" /> Upload Template</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
