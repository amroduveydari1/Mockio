"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Loader2,
  Upload as UploadIcon,
  Layers,
  Wand2,
  Download,
  Eye,
  X,
  Check,
  Sparkles,
} from "lucide-react";
import { Button, Card, CardContent, Input, Badge } from "@/components/ui";
import { FileUpload } from "@/components";
import { cn } from "@/lib/utils";
import {
  uploadLogo,
  getMockupTemplates,
  getMockupCategories,
  generateMockup,
} from "@/lib/actions/mockups";

/* ─── Types ───────────────────────────────────────────────── */

interface Category {
  id: string;
  name: string;
  templateCount: number;
}

interface Template {
  id: string;
  name: string;
  preview_url: string | null;
  asset_url: string;
  is_premium: boolean;
}

interface GeneratedResult {
  id: string;
  templateId: string;
  templateName: string;
  resultUrl: string;
  thumbnailUrl: string | null;
}

/* ─── Step indicator labels ───────────────────────────────── */

const STEPS = [
  { num: 1, label: "Upload Logo", icon: UploadIcon },
  { num: 2, label: "Choose Templates", icon: Layers },
  { num: 3, label: "Generate & Download", icon: Wand2 },
];

/* ─── Page component ──────────────────────────────────────── */

export default function UploadPage() {
  const router = useRouter();

  // --- Wizard state ---
  const [step, setStep] = useState(1);

  // Step 1 — Logo
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoName, setLogoName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedLogoId, setUploadedLogoId] = useState<string | null>(null);

  // Step 2 — Category + template selection
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<Set<string>>(new Set());

  // Step 3 — Generation + results
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState({ current: 0, total: 0 });
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [results, setResults] = useState<GeneratedResult[]>([]);
  const [viewingResult, setViewingResult] = useState<GeneratedResult | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  /* ─── Data fetching ─────────────────────────────────────── */

  useEffect(() => {
    if (step !== 2) return;
    (async () => {
      setIsLoadingCategories(true);
      try {
        const res = await getMockupCategories();
        if (res.error) return;
        const mapped = (res.categories || []).map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          templateCount: cat.mockup_templates?.[0]?.count || 0,
        }));
        setCategories(mapped);
      } finally {
        setIsLoadingCategories(false);
      }
    })();
  }, [step]);

  useEffect(() => {
    if (!selectedCategory) return;
    (async () => {
      setIsLoadingTemplates(true);
      setTemplates([]);
      setSelectedTemplateIds(new Set());
      try {
        const res = await getMockupTemplates(selectedCategory);
        if (!res.error && res.templates) {
          setTemplates(
            res.templates.map((t: any) => ({
              id: t.id,
              name: t.name,
              preview_url: t.preview_url,
              asset_url: t.asset_url,
              is_premium: t.is_premium,
            }))
          );
        }
      } finally {
        setIsLoadingTemplates(false);
      }
    })();
  }, [selectedCategory]);

  // Close lightbox on Escape
  useEffect(() => {
    if (!viewingResult) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setViewingResult(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [viewingResult]);

  /* ─── Handlers ──────────────────────────────────────────── */

  const handleFileSelect = (file: File) => {
    setLogoFile(file);
    setUploadError(null);
    setLogoName(file.name.replace(/\.[^/.]+$/, ""));
  };

  const handleFileClear = () => {
    setLogoFile(null);
    setLogoName("");
    setUploadError(null);
    setUploadedLogoId(null);
  };

  const handleUploadAndContinue = async () => {
    if (!logoFile) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", logoFile);
      formData.append("name", logoName || logoFile.name);
      const result = await uploadLogo(formData);
      if (result.error) {
        setUploadError(result.error);
        return;
      }
      if (result.success && result.logo) {
        setUploadedLogoId(result.logo.id);
        setStep(2);
      }
    } catch {
      setUploadError("An unexpected error occurred. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const toggleTemplate = (id: string) => {
    setSelectedTemplateIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllTemplates = () => {
    if (selectedTemplateIds.size === templates.length) {
      setSelectedTemplateIds(new Set());
    } else {
      setSelectedTemplateIds(new Set(templates.map((t) => t.id)));
    }
  };

  const handleGenerate = async () => {
    if (!uploadedLogoId || selectedTemplateIds.size === 0) return;
    setIsGenerating(true);
    setGenerateError(null);
    setResults([]);
    const ids = Array.from(selectedTemplateIds);
    setGeneratingProgress({ current: 0, total: ids.length });
    setStep(3);

    const newResults: GeneratedResult[] = [];
    for (let i = 0; i < ids.length; i++) {
      setGeneratingProgress({ current: i + 1, total: ids.length });
      const tpl = templates.find((t) => t.id === ids[i]);
      try {
        const res = await generateMockup(
          uploadedLogoId,
          ids[i],
          `${logoName} – ${tpl?.name || "Mockup"}`
        );
        if (res.error) {
          setGenerateError(res.error);
          break;
        }
        if (res.mockup) {
          const m = res.mockup as any;
          newResults.push({
            id: m.id,
            templateId: ids[i],
            templateName: tpl?.name || "Mockup",
            resultUrl: m.result_url,
            thumbnailUrl: m.thumbnail_url,
          });
          setResults([...newResults]);
        }
      } catch (err: any) {
        setGenerateError(err.message || "Generation failed");
        break;
      }
    }
    setIsGenerating(false);
  };

  const handleDownload = useCallback(async (result: GeneratedResult) => {
    setDownloadingId(result.id);
    try {
      const res = await fetch(result.resultUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${result.templateName}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(result.resultUrl, "_blank");
    }
    setDownloadingId(null);
  }, []);

  const handleDownloadAll = async () => {
    for (const r of results) {
      await handleDownload(r);
    }
  };

  /* ─── Render ────────────────────────────────────────────── */

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
          Create Mockups
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Upload your logo, pick templates, and generate professional mockups in seconds.
        </p>
      </div>

      {/* ── Step Indicator ─────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-10">
        {STEPS.map((s, idx) => {
          const isActive = step === s.num;
          const isDone = step > s.num;
          const Icon = s.icon;
          return (
            <div key={s.num} className="flex items-center gap-2 flex-1">
              {idx > 0 && (
                <div
                  className={cn(
                    "flex-1 h-[2px] rounded-full transition-colors",
                    isDone ? "bg-zinc-900 dark:bg-white" : "bg-zinc-200 dark:bg-zinc-800"
                  )}
                />
              )}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                    isActive
                      ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg shadow-zinc-900/20 dark:shadow-white/20"
                      : isDone
                        ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                  )}
                >
                  {isDone ? <Check size={16} /> : <Icon size={16} />}
                </div>
                <span
                  className={cn(
                    "text-sm font-medium hidden sm:block",
                    isActive || isDone ? "text-zinc-900 dark:text-white" : "text-zinc-400"
                  )}
                >
                  {s.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Step 1 – Upload Logo ───────────────────────────── */}
      {step === 1 && (
        <div className="space-y-6">
          <Card variant="bordered">
            <CardContent className="p-8">
              <FileUpload
                onFileSelect={handleFileSelect}
                onClear={handleFileClear}
                disabled={isUploading}
              />

              {logoFile && (
                <div className="mt-6 space-y-4">
                  <Input
                    label="Logo Name"
                    placeholder="Enter a name for your logo"
                    value={logoName}
                    onChange={(e) => setLogoName(e.target.value)}
                    disabled={isUploading}
                  />

                  {uploadError && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                      <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleUploadAndContinue} disabled={!logoFile || isUploading}>
              {isUploading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  Upload & Continue
                  <ArrowRight size={18} />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 2 – Choose Category & Templates ───────────── */}
      {step === 2 && (
        <div className="space-y-8">
          {/* Success badge */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle size={18} className="text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
              <span className="font-medium">{logoName}</span> uploaded — now choose your templates.
            </p>
          </div>

          {/* Category picker */}
          <div>
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-3">
              Category
            </h2>
            {isLoadingCategories ? (
              <div className="flex items-center gap-2 text-zinc-400 py-4">
                <Loader2 size={18} className="animate-spin" /> Loading categories…
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const isDisabled = cat.templateCount === 0;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => !isDisabled && setSelectedCategory(cat.id)}
                      disabled={isDisabled}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium border transition-all",
                        isDisabled
                          ? "opacity-40 cursor-not-allowed border-zinc-200 dark:border-zinc-800"
                          : isSelected
                            ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-sm"
                            : "border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-900 dark:hover:border-white"
                      )}
                    >
                      {cat.name}
                      <span className="ml-1.5 opacity-60">{cat.templateCount}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Template grid */}
          {selectedCategory && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  Templates
                </h2>
                {templates.length > 0 && (
                  <button
                    onClick={selectAllTemplates}
                    className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                    {selectedTemplateIds.size === templates.length ? "Deselect all" : "Select all"}
                  </button>
                )}
              </div>

              {isLoadingTemplates ? (
                <div className="flex items-center gap-2 text-zinc-400 py-4">
                  <Loader2 size={18} className="animate-spin" /> Loading templates…
                </div>
              ) : templates.length === 0 ? (
                <p className="text-sm text-zinc-500 py-4">No templates in this category yet.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {templates.map((tpl) => {
                    const isSelected = selectedTemplateIds.has(tpl.id);
                    return (
                      <button
                        key={tpl.id}
                        onClick={() => toggleTemplate(tpl.id)}
                        className={cn(
                          "relative group rounded-xl overflow-hidden border-2 transition-all",
                          isSelected
                            ? "border-zinc-900 dark:border-white ring-2 ring-zinc-900/20 dark:ring-white/20"
                            : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
                        )}
                      >
                        <div className="aspect-[4/3] bg-zinc-100 dark:bg-zinc-800 relative">
                          {tpl.preview_url ? (
                            <img
                              src={tpl.preview_url}
                              alt={tpl.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-300 dark:text-zinc-600">
                              <Layers size={24} />
                            </div>
                          )}
                          {/* Selection checkmark */}
                          <div
                            className={cn(
                              "absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all",
                              isSelected
                                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 scale-100"
                                : "bg-white/80 dark:bg-zinc-900/80 text-transparent scale-90 group-hover:scale-100"
                            )}
                          >
                            <Check size={14} />
                          </div>
                          {tpl.is_premium && (
                            <Badge className="absolute top-2 left-2" variant="secondary">
                              Pro
                            </Badge>
                          )}
                        </div>
                        <div className="px-3 py-2 text-left">
                          <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">{tpl.name}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft size={16} /> Back
            </Button>
            <Button onClick={handleGenerate} disabled={selectedTemplateIds.size === 0}>
              <Sparkles size={16} />
              Generate {selectedTemplateIds.size > 0 ? `${selectedTemplateIds.size} Mockup${selectedTemplateIds.size > 1 ? "s" : ""}` : "Mockups"}
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 3 – Results ───────────────────────────────── */}
      {step === 3 && (
        <div className="space-y-8">
          {/* Progress / Status */}
          {isGenerating && (
            <Card variant="bordered">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="relative w-10 h-10">
                    <Loader2 size={40} className="animate-spin text-zinc-300 dark:text-zinc-700 absolute inset-0" />
                    <Wand2 size={18} className="absolute inset-0 m-auto text-zinc-600 dark:text-zinc-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                      Generating mockup {generatingProgress.current} of {generatingProgress.total}…
                    </p>
                    <div className="mt-2 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-zinc-900 dark:bg-white rounded-full transition-all duration-500"
                        style={{ width: `${(generatingProgress.current / generatingProgress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {generateError && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-sm">
              {generateError}
            </div>
          )}

          {/* Results grid */}
          {results.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  {isGenerating ? "Generated so far" : `${results.length} Mockup${results.length > 1 ? "s" : ""} Ready`}
                </h2>
                {!isGenerating && results.length > 1 && (
                  <Button variant="outline" size="sm" onClick={handleDownloadAll}>
                    <Download size={14} />
                    Download All
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((r) => (
                  <Card key={r.id} variant="bordered" className="overflow-hidden group">
                    <div
                      className="relative aspect-[4/3] bg-zinc-100 dark:bg-zinc-800 cursor-pointer"
                      onClick={() => setViewingResult(r)}
                    >
                      <img
                        src={r.thumbnailUrl || r.resultUrl}
                        alt={r.templateName}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Eye size={22} className="text-white" />
                      </div>
                    </div>
                    <div className="p-3 flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">{r.templateName}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(r)}
                        disabled={downloadingId === r.id}
                      >
                        {downloadingId === r.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Download size={14} />
                        )}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Done actions */}
          {!isGenerating && results.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <Button variant="outline" onClick={() => { setStep(2); setResults([]); }}>
                <ArrowLeft size={16} /> Generate More
              </Button>
              <Button onClick={() => router.push("/generated")}>
                View All My Mockups <ArrowRight size={16} />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── Lightbox ───────────────────────────────────────── */}
      {viewingResult && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setViewingResult(null)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setViewingResult(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <img
              src={viewingResult.resultUrl}
              alt={viewingResult.templateName}
              className="w-full h-full object-contain rounded-xl max-h-[85vh]"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent rounded-b-xl">
              <p className="text-white font-medium">{viewingResult.templateName}</p>
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  className="bg-white text-zinc-900 hover:bg-zinc-100"
                  onClick={() => handleDownload(viewingResult)}
                  disabled={downloadingId === viewingResult.id}
                >
                  {downloadingId === viewingResult.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Download size={14} />
                  )}
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
