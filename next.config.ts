import type { NextConfig } from "next";

/**
 * BACKEND_URL is server-only (never NEXT_PUBLIC_*). It must be the deployed Django
 * origin with no trailing slash.
 *
 * Production on Vercel with an HTTP-only AWS VM (Nginx on host port 8080):
 *   BACKEND_URL=http://<AWS_ELASTIC_IP>:8080
 *   ALLOW_INSECURE_BACKEND=true
 *
 * Browser calls stay on HTTPS (same-origin /api/v1 and /media); Next.js rewrites
 * proxy server-side to BACKEND_URL. Prefer HTTPS once TLS is on the VM / ALB.
 */
function resolveBackendUrl(): string {
  const url = process.env.BACKEND_URL?.replace(/\/$/, "");
  const isVercel = process.env.VERCEL === "1";
  const allowInsecure =
    process.env.ALLOW_INSECURE_BACKEND === "true" ||
    process.env.ALLOW_INSECURE_BACKEND === "1";

  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    throw new Error(
      "BACKEND_URL must be an absolute URL (http:// or https://), not a relative path."
    );
  }

  if (isVercel && (!url || url.includes("localhost"))) {
    throw new Error(
      "BACKEND_URL must be set to your production Django URL on Vercel " +
        "(e.g. http://<AWS_ELASTIC_IP>:8080 or https://api.example.com)."
    );
  }

  if (isVercel && url?.startsWith("http://") && !allowInsecure) {
    throw new Error(
      "BACKEND_URL uses HTTP. Set ALLOW_INSECURE_BACKEND=true to acknowledge " +
        "that the Vercel → AWS hop is unencrypted (interim AWS VM setup), " +
        "or use an HTTPS backend URL."
    );
  }

  const isProd = process.env.NODE_ENV === "production";
  if (isProd && !url) {
    throw new Error(
      "BACKEND_URL must be set in production (absolute http:// or https:// origin)."
    );
  }

  // Local development fallback only — never used in production/Vercel builds
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
      {
        source: "/media/:path*",
        destination: `${backendUrl}/media/:path*`,
      },
    ];
  },
};

export default nextConfig;
