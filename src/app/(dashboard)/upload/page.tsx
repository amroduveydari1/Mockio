"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { FileUpload } from "@/components";
import { uploadLogo, getMockupTemplates, generateMockup } from "@/lib/actions/mockups";

// Mock categories for template selection
const categories = [
  { id: "business-cards", name: "Business Cards", count: 24 },
  { id: "signage", name: "Signage", count: 18 },
  { id: "apparel", name: "Apparel", count: 32 },
  { id: "packaging", name: "Packaging", count: 16 },
  { id: "digital", name: "Digital Screens", count: 28 },
  { id: "stationery", name: "Stationery", count: 20 },
];

export default function UploadPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoName, setLogoName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedLogoId, setUploadedLogoId] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setLogoFile(file);
    setUploadError(null);
    // Use file name without extension as default logo name
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    setLogoName(nameWithoutExt);
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
        setIsUploading(false);
        return;
      }

      if (result.success && result.logo) {
        setUploadedLogoId(result.logo.id);
        setStep(2);
      }
    } catch (error) {
      setUploadError("An unexpected error occurred. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleNextStep = async () => {
    if (step === 2 && selectedCategory && uploadedLogoId) {
      // Fetch first template for the selected category
      const result = await getMockupTemplates(selectedCategory);
      if (result.templates && result.templates.length > 0) {
        const template = result.templates[0];
        // Generate mockup
        await generateMockup(uploadedLogoId, template.id, logoName || "My Mockup");
        // Redirect to dashboard or mockups page
        router.push("/dashboard");
      } else {
        // No template found for this category
        alert("No template found for this category. Please contact support.");
      }
    }
  };

  const handlePreviousStep = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          {step === 1 ? "Upload Your Logo" : "Choose a Category"}
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          {step === 1
            ? "Upload a PNG or SVG logo to start creating mockups"
            : "Select a mockup category to continue"}
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 1
                ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500"
            }`}
          >
            {step > 1 ? <CheckCircle size={18} /> : "1"}
          </div>
          <span
            className={`text-sm ${
              step >= 1
                ? "text-neutral-900 dark:text-white font-medium"
                : "text-neutral-500"
            }`}
          >
            Upload Logo
          </span>
        </div>
        <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 2
                ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500"
            }`}
          >
            2
          </div>
          <span
            className={`text-sm ${
              step >= 2
                ? "text-neutral-900 dark:text-white font-medium"
                : "text-neutral-500"
            }`}
          >
            Choose Category
          </span>
        </div>
        <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-neutral-200 dark:bg-neutral-800 text-neutral-500">
            3
          </div>
          <span className="text-sm text-neutral-500">Select Template</span>
        </div>
      </div>

      {/* Step Content */}
      {step === 1 && (
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
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {uploadError}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-6">
          {/* Success message */}
          <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-3">
            <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-400">
                Logo uploaded successfully!
              </p>
              <p className="text-xs text-green-600 dark:text-green-500">
                {logoName} is ready to use
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-6 rounded-2xl border text-left transition-all ${
                  selectedCategory === category.id
                    ? "border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-900"
                    : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                  <span className="text-lg font-bold text-neutral-900 dark:text-white">
                    {category.name.charAt(0)}
                  </span>
                </div>
                <h3 className="font-semibold text-neutral-900 dark:text-white">
                  {category.name}
                </h3>
                <p className="text-sm text-neutral-500 mt-1">
                  {category.count} templates
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8">
        {step > 1 ? (
          <Button variant="outline" onClick={handlePreviousStep}>
            <ArrowLeft size={18} />
            Back
          </Button>
        ) : (
          <div />
        )}

        {step === 1 ? (
          <Button
            onClick={handleUploadAndContinue}
            disabled={!logoFile || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                Upload & Continue
                <ArrowRight size={18} />
              </>
            )}
          </Button>
        ) : (
          <Button onClick={handleNextStep} disabled={!selectedCategory}>
            Generate Mockup
            <ArrowRight size={18} />
          </Button>
        )}
      </div>
    </div>
  );
}
