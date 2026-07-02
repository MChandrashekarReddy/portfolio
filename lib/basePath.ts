// next/image doesn't auto-prefix `src` with basePath when images are unoptimized
// (required for static export), so asset paths route through this helper instead.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function withBasePath(path: string) {
  return `${basePath}${path}`;
}
