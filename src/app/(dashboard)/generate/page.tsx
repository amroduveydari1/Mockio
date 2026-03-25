"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui";
import { getUserLogos, generateBrandSet } from "@/lib/actions/mockups";
import { BrandSetLoader } from "@/components/brand-set-loader";

interface Logo {
  id: string;
  name: string;
  file_url: string;
}

export default function GenerateBrandSetPage() {
  const router = useRouter();
  const [logos, setLogos] = useState<Logo[]>([]);
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLogos() {
      const result = await getUserLogos();
      if (result.logos) {
        setLogos(result.logos);
        if (result.logos.length === 1) {
          setSelectedLogo(result.logos[0].id);
        }
      }
      setLoading(false);
    }
    fetchLogos();
  }, []);

  async function handleGenerate() {
    if (!selectedLogo) return;
    setError(null);
    setGenerating(true);

    const result = await generateBrandSet(selectedLogo);

    if (result.error) {
      setError(result.error);
      setGenerating(false);
      return;
    }

    if (result.brand_set_id) {
      router.push(`/brand-set?id=${result.brand_set_id}`);
    } else {
      setError("Generation completed but no results were returned.");
      setGenerating(false);
    }
  }

  if (generating) {
    const selectedLogoData = logos.find((l) => l.id === selectedLogo);
    return <BrandSetLoader logoUrl={selectedLogoData?.file_url} />;
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-12">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} />
            Back
          </Button>
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Title */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs tracking-wide text-zinc-600 dark:text-zinc-400 mb-6">
            <Sparkles size={12} />
            Brand Set™
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight mb-3">
            Generate Brand Set
          </h1>
          <p className="text-zinc-500 text-base max-w-md mx-auto">
            Select your logo and we&apos;ll create a complete brand presentation
            across packaging, business cards, screens, and signage.
          </p>
        </div>

        {/* Logo selection */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-white rounded-full animate-spin" />
          </div>
        ) : logos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-500 mb-4">
              No logos uploaded yet. Upload a logo first.
            </p>
            <Link href="/upload">
              <Button variant="primary">Upload Logo</Button>
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-zinc-500 mb-4">Select a logo</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              {logos.map((logo) => (
                <button
                  key={logo.id}
                  onClick={() => setSelectedLogo(logo.id)}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                    selectedLogo === logo.id
                      ? "border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-800/50"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  {selectedLogo === logo.id && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-zinc-900 dark:bg-white rounded-full flex items-center justify-center">
                      <Check
                        size={12}
                        className="text-white dark:text-zinc-900"
                      />
                    </div>
                  )}
                  <div className="aspect-square rounded-lg bg-white dark:bg-zinc-900 flex items-center justify-center p-3 mb-2">
                    <img
                      src={logo.file_url}
                      alt={logo.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
                    {logo.name}
                  </p>
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            {/* Generate button */}
            <div className="text-center">
              <Button
                variant="primary"
                size="lg"
                onClick={handleGenerate}
                disabled={!selectedLogo || generating}
                className="px-8"
              >
                <Sparkles size={16} />
                Generate Brand Set
              </Button>
              <p className="text-xs text-zinc-400 mt-3">
                Generates 3–5 mockups across different categories
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
