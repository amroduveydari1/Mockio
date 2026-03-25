"use client";

import { useEffect, useState, useCallback } from "react";

const STEPS = [
  { text: "Analyzing your logo...", duration: 3400 },
  { text: "Selecting visual system...", duration: 3000 },
  { text: "Composing brand presentation...", duration: 3200 },
  { text: "Finalizing...", duration: 2800 },
];

interface BrandSetLoaderProps {
  /** Optional logo URL to display during loading */
  logoUrl?: string;
}

export function BrandSetLoader({ logoUrl }: BrandSetLoaderProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(false);
  const [entered, setEntered] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);

  // Entrance fade
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Step progression with per-step timing
  useEffect(() => {
    setFadeIn(true);
    const duration = STEPS[stepIndex]?.duration ?? 3000;

    const fadeOutTimer = setTimeout(() => {
      if (stepIndex < STEPS.length - 1) setFadeIn(false);
    }, duration - 500);

    const nextTimer = setTimeout(() => {
      if (stepIndex < STEPS.length - 1) {
        setStepIndex((prev) => prev + 1);
      }
    }, duration);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(nextTimer);
    };
  }, [stepIndex]);

  const onLogoLoad = useCallback(() => setLogoLoaded(true), []);

  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-zinc-950 transition-opacity duration-700 ${
        entered ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Ambient radial glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 60%)",
            animation: "pulse-subtle 8s ease-in-out infinite",
          }}
        />
      </div>

      {/* Orbiting dots accent */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-32 h-32 rounded-full border border-zinc-800/30"
          style={{
            animation: entered ? "spin-slow 20s linear infinite" : "none",
          }}
        >
          <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-zinc-600" />
        </div>
      </div>

      <div className="relative flex flex-col items-center gap-14">
        {/* Logo preview or Mockio mark */}
        <div
          className="transition-all duration-1000 ease-out"
          style={{
            opacity: entered ? 1 : 0,
            transform: entered ? "translateY(0) scale(1)" : "translateY(12px) scale(0.95)",
            animation: entered ? "float 10s ease-in-out 1.5s infinite" : "none",
          }}
        >
          {logoUrl ? (
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800/60 flex items-center justify-center p-2.5 overflow-hidden">
              <img
                src={logoUrl}
                alt=""
                onLoad={onLogoLoad}
                className={`max-w-full max-h-full object-contain transition-opacity duration-700 ${
                  logoLoaded ? "opacity-100" : "opacity-0"
                }`}
              />
            </div>
          ) : (
            <div className="w-14 h-14 bg-white rounded-[16px] flex items-center justify-center">
              <span className="text-zinc-900 font-semibold text-[17px]">M</span>
            </div>
          )}
        </div>

        {/* Step text with crossfade */}
        <div className="h-8 flex flex-col items-center justify-center gap-1.5">
          <span
            className="text-[13px] tracking-[0.06em] text-zinc-500 transition-all duration-600 ease-out font-light"
            style={{
              opacity: fadeIn ? 1 : 0,
              transform: fadeIn ? "translateY(0)" : "translateY(8px)",
            }}
          >
            {STEPS[stepIndex].text}
          </span>
          <span
            className="text-[10px] tracking-[0.15em] uppercase text-zinc-700 transition-all duration-500"
            style={{ opacity: fadeIn ? 1 : 0 }}
          >
            Step {stepIndex + 1} of {STEPS.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-48 h-[2px] bg-zinc-800/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-zinc-500 to-zinc-400 rounded-full"
              style={{
                width: `${progress}%`,
                transition: `width ${STEPS[stepIndex]?.duration ?? 3000}ms cubic-bezier(0.4, 0, 0.2, 1)`,
              }}
            />
          </div>
          <span className="text-[10px] text-zinc-700 tabular-nums">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Keyframes injected via style tag for spin-slow */}
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
