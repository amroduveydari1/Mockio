"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Share2,
  Maximize2,
  Minimize2,
  ChevronDown,
  Archive,
  Check,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

interface BrandSetMockup {
  id: string;
  name: string;
  result_url: string;
  thumbnail_url: string | null;
  metadata: {
    brand_set_id?: string;
    category_slug?: string;
    brandType?: string;
    logoAspect?: string;
    logoColorType?: string;
    complexity?: string;
    templateScore?: number;
    generatedAt?: string;
  } | null;
  mockup_templates: { name: string }[] | null;
}

const CATEGORY_LABELS: Record<
  string,
  { title: string; subtitle: string; description: string }
> = {
  packaging: {
    title: "Packaging",
    subtitle: "01",
    description: "Your brand on physical products — tangible and memorable.",
  },
  "business-card": {
    title: "Business Card",
    subtitle: "02",
    description: "First impressions that leave a lasting mark.",
  },
  "digital-screen": {
    title: "Digital Screen",
    subtitle: "03",
    description: "Your identity in the digital world — crisp and modern.",
  },
  signage: {
    title: "Signage",
    subtitle: "04",
    description: "Bold presence in physical spaces.",
  },
};

export default function BrandSetPage() {
  const searchParams = useSearchParams();
  const brandSetId = searchParams.get("id");
  const [mockups, setMockups] = useState<BrandSetMockup[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [presentMode, setPresentMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    if (!brandSetId) return;

    async function fetchBrandSet() {
      const supabase = createClient();
      const { data } = await supabase
        .from("generated_mockups")
        .select(
          "id, name, result_url, thumbnail_url, metadata, mockup_templates(name)"
        )
        .contains("metadata", { brand_set_id: brandSetId })
        .order("created_at", { ascending: true });

      setMockups((data as unknown as BrandSetMockup[]) || []);
      setLoading(false);
    }

    fetchBrandSet();
  }, [brandSetId]);

  // Intersection Observer for scroll reveal
  useEffect(() => {
    if (loading || mockups.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("brand-reveal-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -60px 0px" }
    );

    sectionRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading, mockups]);

  // Escape key exits present mode
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && presentMode) setPresentMode(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [presentMode]);

  const handleDownload = useCallback(
    async (mockup: BrandSetMockup) => {
      setDownloadingId(mockup.id);
      try {
        const resp = await fetch(mockup.result_url);
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${mockup.name.replace(/\s+/g, "-").toLowerCase()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch {
        // silent
      }
      setDownloadingId(null);
    },
    []
  );

  async function handleDownloadZip() {
    if (!brandSetId || mockups.length === 0) return;
    setDownloadingZip(true);
    try {
      const resp = await fetch(`/api/brand-set/download?id=${encodeURIComponent(brandSetId)}`);
      if (!resp.ok) throw new Error("Download failed");
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `brand-set-${brandSetId.slice(-8)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: download individually
      for (const mockup of mockups) {
        await handleDownload(mockup);
        await new Promise((r) => setTimeout(r, 400));
      }
    }
    setDownloadingZip(false);
  }

  async function handleShareLink() {
    // Build shareable link to the public viewer
    const shareUrl = `${window.location.origin}/view/brand-set/${brandSetId}`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (!brandSetId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-zinc-500 mb-4">No Brand Set ID specified.</p>
          <Link href="/dashboard">
            <Button variant="secondary">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-5">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <span className="text-zinc-900 font-semibold text-sm">M</span>
          </div>
          <p className="text-[13px] text-zinc-500 tracking-wide">
            Loading brand set...
          </p>
        </div>
      </div>
    );
  }

  if (mockups.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-zinc-500 mb-4">Brand set not found.</p>
          <Link href="/dashboard">
            <Button variant="secondary">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const hero = mockups[0];
  const rest = mockups.slice(1);
  const brandMeta = hero.metadata;

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        presentMode ? "bg-zinc-950" : "bg-zinc-950"
      }`}
    >
      {/* Top bar — hidden in present mode */}
      <div
        className={`sticky top-0 z-40 transition-all duration-500 ${
          presentMode
            ? "opacity-0 pointer-events-none -translate-y-4"
            : "opacity-100"
        } bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/40`}
      >
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
              <ArrowLeft size={15} />
              Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShareLink}
              className="text-zinc-500 hover:text-white"
            >
              {copied ? <Check size={14} /> : <Share2 size={14} />}
              {copied ? "Copied!" : "Share"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownloadZip}
              disabled={downloadingZip}
              className="text-zinc-500 hover:text-white"
            >
              <Archive size={14} />
              {downloadingZip ? "Preparing..." : "Download ZIP"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(`/view/brand-set/${brandSetId}`, '_blank')}
              className="text-zinc-500 hover:text-white"
            >
              <ExternalLink size={14} />
              Client View
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPresentMode(!presentMode)}
              className="text-zinc-500 hover:text-white"
            >
              {presentMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              {presentMode ? "Exit" : "Present"}
            </Button>
          </div>
        </div>
      </div>

      {/* Present mode exit button */}
      {presentMode && (
        <button
          onClick={() => setPresentMode(false)}
          className="fixed top-6 right-6 z-50 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all duration-200"
        >
          <Minimize2 size={16} />
        </button>
      )}

      {/* Hero section */}
      <section
        className={`max-w-5xl mx-auto px-6 transition-all duration-500 ${
          presentMode ? "pt-24 pb-20" : "pt-16 pb-14"
        }`}
      >
        <div className="text-center mb-20 animate-fade-in">
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 mb-6">
            Brand Set™
          </p>
          <h1 className="text-4xl md:text-[3.5rem] font-bold tracking-tight text-white mb-4 leading-[1.08]">
            Your Brand, Visualized
          </h1>
          <p className="text-[15px] max-w-lg mx-auto leading-relaxed text-zinc-500">
            A complete brand presentation generated from your identity.
          </p>

          {/* Brand intelligence badge */}
          {brandMeta?.brandType && (
            <div className="mt-8 inline-flex items-center gap-3 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800/60">
              <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                {brandMeta.brandType} · {brandMeta.logoAspect} · {brandMeta.logoColorType}
              </span>
            </div>
          )}

          {/* Scroll indicator */}
          <div className="mt-16 animate-float">
            <ChevronDown size={20} className="mx-auto text-zinc-700" />
          </div>
        </div>

        {/* Hero mockup */}
        <div
          ref={(el) => {
            if (el) sectionRefs.current.set("hero", el);
          }}
          className="brand-reveal"
        >
          <div className="relative group">
            <div className="overflow-hidden rounded-2xl shadow-2xl shadow-black/40 transition-shadow duration-500 hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)]">
              <img
                src={hero.result_url}
                alt={hero.name}
                className="w-full h-auto transition-transform duration-700 group-hover:scale-[1.015]"
                loading="eager"
              />
            </div>
            <div className={`mt-8 flex items-center justify-between transition-opacity duration-300 ${
              presentMode ? "opacity-0" : "opacity-100"
            }`}>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500 mb-1.5">
                  {getCategoryLabel(hero).subtitle} — {getCategoryLabel(hero).title}
                </p>
                <p className="text-[13px] text-zinc-600">
                  {hero.mockup_templates?.[0]?.name}
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDownload(hero)}
                disabled={downloadingId === hero.id}
                className="text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700"
              >
                <Download size={13} />
                {downloadingId === hero.id ? "Saving..." : "Download"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="h-px bg-zinc-800/40" />
      </div>

      {/* Scroll-reveal sections */}
      {rest.map((mockup, i) => {
        const label = getCategoryLabel(mockup);
        const isEven = i % 2 === 0;

        return (
          <section
            key={mockup.id}
            ref={(el) => {
              if (el) sectionRefs.current.set(mockup.id, el);
            }}
            className="brand-reveal max-w-5xl mx-auto px-6 py-24"
          >
            <div
              className={`flex flex-col ${
                isEven ? "md:flex-row" : "md:flex-row-reverse"
              } gap-16 items-center`}
            >
              {/* Image */}
              <div className="flex-[1.2] w-full group">
                <div className="overflow-hidden rounded-2xl shadow-xl shadow-black/30 transition-all duration-500 hover:shadow-2xl hover:shadow-black/40">
                  <img
                    src={mockup.result_url}
                    alt={mockup.name}
                    className="w-full h-auto transition-transform duration-700 group-hover:scale-[1.015]"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Text */}
              <div className="flex-1 w-full flex flex-col justify-center">
                <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 mb-3 font-medium">
                  {label.subtitle} — {label.title}
                </p>
                <h2 className="text-2xl md:text-[1.75rem] font-semibold tracking-tight text-white mb-4 leading-snug">
                  {label.description}
                </h2>
                <p className="text-[13px] text-zinc-600 mb-8">
                  {mockup.mockup_templates?.[0]?.name}
                </p>
                <div className={`transition-opacity duration-300 ${
                  presentMode ? "opacity-0" : "opacity-100"
                }`}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDownload(mockup)}
                    disabled={downloadingId === mockup.id}
                    className="text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700"
                  >
                    <Download size={13} />
                    {downloadingId === mockup.id ? "Saving..." : "Download"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Section divider */}
            {i < rest.length - 1 && (
              <div className="mt-24">
                <div className="h-px bg-zinc-800/30" />
              </div>
            )}
          </section>
        );
      })}

      {/* Footer */}
      <section className={`max-w-5xl mx-auto px-6 py-24 text-center transition-opacity duration-300 ${
        presentMode ? "opacity-0" : "opacity-100"
      }`}>
        <div>
          <div className="h-px mb-16 bg-zinc-800/40" />
          <p className="text-zinc-600 text-[13px] mb-3">
            {mockups.length} mockups · Brand Set™
          </p>
          {brandMeta?.generatedAt && (
            <p className="text-zinc-700 text-[11px] mb-8">
              Generated {new Date(brandMeta.generatedAt).toLocaleDateString("en-US", {
                month: "long", day: "numeric", year: "numeric"
              })}
            </p>
          )}
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="secondary"
              onClick={handleDownloadZip}
              disabled={downloadingZip}
              className="text-zinc-400 border-zinc-800 hover:text-white"
            >
              <Archive size={15} />
              {downloadingZip ? "Preparing ZIP..." : "Download All (ZIP)"}
            </Button>
            <Link href="/generate">
              <Button variant="primary">Generate Another</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function getCategoryLabel(mockup: BrandSetMockup) {
  const slug = mockup.metadata?.category_slug || "";
  return (
    CATEGORY_LABELS[slug] || {
      title: mockup.name.replace("Brand Set – ", ""),
      subtitle: "—",
      description: "Part of your brand story.",
    }
  );
}
