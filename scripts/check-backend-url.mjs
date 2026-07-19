/**
 * Lightweight validation of BACKEND_URL / ALLOW_INSECURE_BACKEND rules
 * (mirrors next.config.ts resolveBackendUrl).
 */
function resolveBackendUrl(env) {
  const url = env.BACKEND_URL?.replace(/\/$/, "");
  const isVercel = env.VERCEL === "1";
  const allowInsecure =
    env.ALLOW_INSECURE_BACKEND === "true" || env.ALLOW_INSECURE_BACKEND === "1";

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

  return url || "http://localhost:8000";
}

function expectThrow(env, substring) {
  try {
    resolveBackendUrl(env);
    throw new Error(`Expected throw for ${JSON.stringify(env)}`);
  } catch (err) {
    if (!String(err.message).includes(substring)) {
      throw new Error(
        `Expected message containing ${JSON.stringify(substring)}, got: ${err.message}`
      );
    }
  }
}

// Local default
console.assert(
  resolveBackendUrl({}) === "http://localhost:8000",
  "local default"
);

// Vercel requires BACKEND_URL
expectThrow({ VERCEL: "1" }, "production Django URL");

// Vercel HTTP without opt-in fails
expectThrow(
  { VERCEL: "1", BACKEND_URL: "http://1.2.3.4" },
  "ALLOW_INSECURE_BACKEND"
);

// Vercel HTTP with opt-in succeeds
console.assert(
  resolveBackendUrl({
    VERCEL: "1",
    BACKEND_URL: "http://1.2.3.4",
    ALLOW_INSECURE_BACKEND: "true",
  }) === "http://1.2.3.4",
  "insecure opt-in"
);

// HTTPS production succeeds without opt-in
console.assert(
  resolveBackendUrl({
    VERCEL: "1",
    BACKEND_URL: "https://api.example.com/",
  }) === "https://api.example.com",
  "https strip slash"
);

console.log("check-backend-url: all assertions passed");
