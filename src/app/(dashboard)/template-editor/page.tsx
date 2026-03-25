"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Button, Card } from "@/components/ui";
import { ChevronLeft, Copy, Check, AlertTriangle } from "lucide-react";
import EditorControls from "@/components/template-editor/editor-controls";
import {
  getTemplatesForEditor,
  saveTemplateData,
} from "@/lib/actions/templates";
import {
  logoAreaFromTemplateData,
  getDefaultLogoArea,
  generateTemplateSQL,
} from "@/lib/template-editor-utils";
import type { EditorLogoArea, TemplateDataPayload } from "@/lib/template-editor-utils";

// react-konva uses window — must be loaded client-side only
const EditorCanvas = dynamic(
  () => import("@/components/template-editor/editor-canvas"),
  { ssr: false }
);

interface TemplateRow {
  id: string;
  name: string;
  preview_url: string | null;
  asset_url: string | null;
  template_data: any;
  mockup_categories: { name: string }[] | null;
}

export default function TemplateEditorPage() {
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [selected, setSelected] = useState<TemplateRow | null>(null);
  const [logoArea, setLogoArea] = useState<EditorLogoArea | null>(null);
  const [initialArea, setInitialArea] = useState<EditorLogoArea | null>(null);
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [fallbackSQL, setFallbackSQL] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch templates on mount
  useEffect(() => {
    getTemplatesForEditor().then((res) => {
      if (res.templates) setTemplates(res.templates as TemplateRow[]);
      setLoading(false);
    });
  }, []);

  // When a template is selected, load its image to get dimensions
  const handleSelect = useCallback((t: TemplateRow) => {
    const url = t.asset_url || t.preview_url;
    if (!url) return;

    setSelected(t);
    setImgSize(null);
    setLogoArea(null);

    // Load image to get natural dimensions
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      setImgSize({ w, h });
      const area = logoAreaFromTemplateData(t.template_data, w, h);
      setLogoArea(area);
      setInitialArea({ ...area });
    };
    img.src = url;
  }, []);

  // Save handler with SQL fallback
  const handleSave = useCallback(async () => {
    if (!selected || !logoArea) return;
    setSaving(true);
    setFallbackSQL(null);
    setCopied(false);

    const payload: TemplateDataPayload = {
      mode: "manual",
      logoArea,
    };

    const res = await saveTemplateData(selected.id, payload);
    setSaving(false);

    if (res.error) {
      // Generate fallback SQL so user can paste it manually
      const sql = generateTemplateSQL(selected.id, payload);
      setFallbackSQL(sql);
      setToast({ type: "error", message: res.error });
    } else {
      setToast({ type: "success", message: "Template saved successfully" });
      setFallbackSQL(null);
      setInitialArea({ ...logoArea });
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === selected.id ? { ...t, template_data: payload } : t
        )
      );
    }

    setTimeout(() => setToast(null), 5000);
  }, [selected, logoArea]);

  // Copy SQL to clipboard
  const handleCopySQL = useCallback(async () => {
    if (!fallbackSQL) return;
    await navigator.clipboard.writeText(fallbackSQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [fallbackSQL]);

  // Reset handler
  const handleReset = useCallback(() => {
    if (initialArea) setLogoArea({ ...initialArea });
  }, [initialArea]);

  const imageUrl = selected?.asset_url || selected?.preview_url || "";

  // ── Template list view ──
  if (!selected) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Template Editor
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
            Select a template to configure its logo placement area
          </p>
        </div>

        {loading && (
          <p className="text-sm text-zinc-400">Loading templates...</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSelect(t)}
              className="text-left group"
            >
              <Card className="overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all">
                <div className="aspect-[4/3] bg-zinc-100 dark:bg-zinc-800 relative">
                  {(t.asset_url || t.preview_url) && (
                    <img
                      src={t.asset_url || t.preview_url || ""}
                      alt={t.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {t.template_data?.logoArea && (
                    <span className="absolute top-2 right-2 text-[10px] font-medium bg-green-500 text-white px-1.5 py-0.5 rounded">
                      Configured
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                    {t.name}
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {t.mockup_categories?.[0]?.name || "Uncategorized"}
                  </p>
                </div>
              </Card>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Editor view ──
  return (
    <div className="p-6 lg:p-8">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg transition-all ${
            toast.type === "error"
              ? "bg-red-500 text-white"
              : "bg-green-500 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => {
            setSelected(null);
            setLogoArea(null);
            setImgSize(null);
            setFallbackSQL(null);
          }}
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <ChevronLeft size={20} className="text-zinc-500" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
            {selected.name}
          </h1>
          <p className="text-xs text-zinc-400">
            {imgSize ? `${imgSize.w} × ${imgSize.h} px` : "Loading..."}
          </p>
        </div>
      </div>

      {/* SQL Fallback Panel */}
      {fallbackSQL && (
        <div className="mb-6 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 p-4">
          <div className="flex items-start gap-2 mb-3">
            <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                Save failed — use this SQL instead
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                Template ID: <code className="font-mono">{selected.id}</code>
              </p>
            </div>
          </div>
          <div className="relative">
            <textarea
              readOnly
              value={fallbackSQL}
              rows={18}
              className="w-full font-mono text-xs bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-zinc-800 dark:text-zinc-200 resize-none focus:outline-none"
            />
            <button
              onClick={handleCopySQL}
              className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              {copied ? (
                <>
                  <Check size={12} /> Copied
                </>
              ) : (
                <>
                  <Copy size={12} /> Copy
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Two-column layout */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Left: Canvas */}
        <div className="flex-1 min-w-0">
          {imgSize && logoArea ? (
            <EditorCanvas
              imageUrl={imageUrl}
              logoArea={logoArea}
              onChange={setLogoArea}
              containerWidth={Math.min(720, typeof window !== "undefined" ? window.innerWidth - 440 : 720)}
              containerHeight={540}
            />
          ) : (
            <div className="w-full h-[540px] bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center">
              <p className="text-sm text-zinc-400">Loading image...</p>
            </div>
          )}
          <p className="text-xs text-zinc-400 mt-2">
            Drag the blue rectangle to reposition. Use handles to resize. Click and drag on empty space to draw a new area.
          </p>
        </div>

        {/* Right: Controls */}
        <div className="w-full xl:w-80 flex-shrink-0">
          {logoArea && (
            <EditorControls
              logoArea={logoArea}
              onChange={setLogoArea}
              onSave={handleSave}
              onReset={handleReset}
              saving={saving}
            />
          )}
        </div>
      </div>
    </div>
  );
}
