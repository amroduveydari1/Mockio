"use client";

import type { EditorLogoArea, FitMode, AlignX, AlignY } from "@/lib/template-editor-utils";
import { FIT_OPTIONS, ALIGN_X_OPTIONS, ALIGN_Y_OPTIONS } from "@/lib/template-editor-utils";
import { Input, Button } from "@/components/ui";

interface EditorControlsProps {
  logoArea: EditorLogoArea;
  onChange: (area: EditorLogoArea) => void;
  onSave: () => void;
  onReset: () => void;
  saving: boolean;
}

export default function EditorControls({
  logoArea,
  onChange,
  onSave,
  onReset,
  saving,
}: EditorControlsProps) {
  const setField = <K extends keyof EditorLogoArea>(key: K, value: EditorLogoArea[K]) => {
    onChange({ ...logoArea, [key]: value });
  };

  const numField = (label: string, key: keyof EditorLogoArea, min = 0, max = 10000, step = 1) => (
    <div>
      <label className="block text-[13px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
        {label}
      </label>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={logoArea[key] as number}
        onChange={(e) => setField(key, Number(e.target.value))}
        className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10 transition-all"
      />
    </div>
  );

  const selectField = (
    label: string,
    key: keyof EditorLogoArea,
    options: string[]
  ) => (
    <div>
      <label className="block text-[13px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
        {label}
      </label>
      <select
        value={logoArea[key] as string}
        onChange={(e) => setField(key, e.target.value as any)}
        className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10 transition-all"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Position */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
          Position (px)
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {numField("X", "x")}
          {numField("Y", "y")}
          {numField("Width", "width", 10)}
          {numField("Height", "height", 10)}
        </div>
      </div>

      {/* Fitting */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
          Fitting & Alignment
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {selectField("Fit", "fit", FIT_OPTIONS)}
          {numField("Padding", "padding", 0, 200)}
          {selectField("Align X", "alignX", ALIGN_X_OPTIONS)}
          {selectField("Align Y", "alignY", ALIGN_Y_OPTIONS)}
        </div>
      </div>

      {/* Effects */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
          Effects
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {numField("Rotation", "rotation", -360, 360)}
          {numField("Opacity", "opacity", 0, 1, 0.05)}
        </div>
      </div>

      {/* JSON Preview */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
          JSON Preview
        </h3>
        <pre className="text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 overflow-auto max-h-48 text-zinc-600 dark:text-zinc-400">
          {JSON.stringify({ mode: "manual", logoArea }, null, 2)}
        </pre>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button onClick={onSave} disabled={saving} className="flex-1">
          {saving ? "Saving..." : "Save to Supabase"}
        </Button>
        <Button variant="outline" onClick={onReset}>
          Reset
        </Button>
      </div>
    </div>
  );
}
