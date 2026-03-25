"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, Trash2, Search, Grid, List, Loader2, Eye, X } from "lucide-react";
import { Button, Input, Card } from "@/components/ui";
import { cn } from "@/lib/utils";
import { getUserMockups, deleteMockup } from "@/lib/actions/mockups";

interface MockupRow {
  id: string;
  name: string;
  result_url: string;
  thumbnail_url: string | null;
  created_at: string;
  logos: { name: string } | null;
  mockup_templates: { name: string } | null;
}

export default function GeneratedMockupsPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [mockups, setMockups] = useState<MockupRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingMockup, setViewingMockup] = useState<MockupRow | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = useCallback(async (mockup: MockupRow) => {
    setDownloadingId(mockup.id);
    try {
      const res = await fetch(mockup.result_url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${mockup.name || "mockup"}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(mockup.result_url, "_blank");
    }
    setDownloadingId(null);
  }, []);

  const fetchMockups = useCallback(async () => {
    setLoading(true);
    const res = await getUserMockups();
    if (res.error) {
      setError(res.error);
    } else {
      setMockups((res.mockups ?? []) as MockupRow[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMockups();
  }, [fetchMockups]);

  // Close lightbox on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setViewingMockup(null);
    };
    if (viewingMockup) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [viewingMockup]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const res = await deleteMockup(id);
    if (res.error) {
      alert(res.error);
    } else {
      setMockups((prev) => prev.filter((m) => m.id !== id));
    }
    setDeletingId(null);
  };

  const filtered = mockups.filter((m) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.name?.toLowerCase().includes(q) ||
      m.logos?.name?.toLowerCase().includes(q) ||
      m.mockup_templates?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          My Mockups
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          View and download your generated mockups
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="relative w-full sm:w-80">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <Input
            placeholder="Search mockups..."
            className="pl-11"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500 mr-2">View:</span>
          <button
            onClick={() => setView("grid")}
            className={cn(
              "p-2 rounded-lg transition-colors",
              view === "grid"
                ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            )}
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "p-2 rounded-lg transition-colors",
              view === "list"
                ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            )}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-neutral-400" size={32} />
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mb-4">
            <Grid size={28} className="text-neutral-400 dark:text-neutral-500" />
          </div>
          <h3 className="font-medium text-neutral-900 dark:text-white mb-2">
            No mockups found
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            {searchQuery
              ? "Try a different search term"
              : "Generate your first mockup to see it here"}
          </p>
          {!searchQuery && (
            <Link href="/upload">
              <Button>Generate a Mockup</Button>
            </Link>
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      {viewingMockup && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setViewingMockup(null)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setViewingMockup(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <img
              src={viewingMockup.result_url}
              alt={viewingMockup.name}
              className="w-full h-full object-contain rounded-xl max-h-[85vh]"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent rounded-b-xl">
              <p className="text-white font-medium">{viewingMockup.name}</p>
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  className="bg-white text-neutral-900 hover:bg-neutral-100"
                  onClick={() => handleDownload(viewingMockup)}
                  disabled={downloadingId === viewingMockup.id}
                >
                  {downloadingId === viewingMockup.id ? (
                    <Loader2 size={14} className="mr-1 animate-spin" />
                  ) : (
                    <Download size={14} className="mr-1" />
                  )}
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid View */}
      {!loading && filtered.length > 0 && view === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((mockup) => (
            <Card key={mockup.id} className="overflow-hidden group">
              <div
                className="relative aspect-[4/3] bg-neutral-100 dark:bg-neutral-800 cursor-pointer"
                onClick={() => setViewingMockup(mockup)}
              >
                <img
                  src={mockup.thumbnail_url || mockup.result_url}
                  alt={mockup.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Eye size={24} className="text-white" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-neutral-900 dark:text-white truncate">
                  {mockup.name}
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  {new Date(mockup.created_at).toLocaleDateString()}
                  {mockup.mockup_templates?.name && ` · ${mockup.mockup_templates.name}`}
                </p>
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewingMockup(mockup)}
                  >
                    <Eye size={14} className="mr-1" /> View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(mockup)}
                    disabled={downloadingId === mockup.id}
                  >
                    {downloadingId === mockup.id ? (
                      <Loader2 size={14} className="mr-1 animate-spin" />
                    ) : (
                      <Download size={14} className="mr-1" />
                    )}
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(mockup.id)}
                    disabled={deletingId === mockup.id}
                  >
                    {deletingId === mockup.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* List View */}
      {!loading && filtered.length > 0 && view === "list" && (
        <div className="space-y-3">
          {filtered.map((mockup) => (
            <Card key={mockup.id} className="flex items-center gap-4 p-4">
              <div className="w-20 h-14 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
                <img
                  src={mockup.thumbnail_url || mockup.result_url}
                  alt={mockup.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-neutral-900 dark:text-white truncate">
                  {mockup.name}
                </h3>
                <p className="text-xs text-neutral-500">
                  {new Date(mockup.created_at).toLocaleDateString()}
                  {mockup.mockup_templates?.name && ` · ${mockup.mockup_templates.name}`}
                  {mockup.logos?.name && ` · ${mockup.logos.name}`}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingMockup(mockup)}
                >
                  <Eye size={14} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(mockup)}
                  disabled={downloadingId === mockup.id}
                >
                  {downloadingId === mockup.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Download size={14} />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(mockup.id)}
                  disabled={deletingId === mockup.id}
                >
                  {deletingId === mockup.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
