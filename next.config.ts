import type { NextConfig } from "next";

/**
 * BACKEND_URL is server-only (never NEXT_PUBLIC_*). It must be the deployed Django
 * origin with no trailing slash, e.g. https://api.yourdomain.com
 */
function resolveBackendUrl(): string {
  const url = process.env.BACKEND_URL?.replace(/\/$/, "");

  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    throw new Error(
      "BACKEND_URL must be an absolute URL (http:// or https://), not a relative path."
    );
  }

  if (process.env.VERCEL === "1" && (!url || url.includes("localhost"))) {
    throw new Error(
      "BACKEND_URL must be set to your production Django URL on Vercel."
    );
  }

  return url || "http://localhost:8000";
}

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  async redirects() {
    return [
      { source: "/signup", destination: "/sign-up", permanent: false },
      { source: "/login", destination: "/sign-in", permanent: false },
    ];
  },
  async rewrites() {
    const backendUrl = resolveBackendUrl();
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
