/**
 * DEPRECATED: Client-side mockup generator.
 * Mockup rendering is now handled server-side by src/lib/mockup-renderer.ts
 * using sharp. This file is kept only for the downloadMockup helper.
 */

/**
 * Download a generated mockup from a URL or data URL.
 */
export function downloadMockup(url: string, filename: string): void {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
