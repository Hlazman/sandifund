const GRAPHQL_URL = process.env.EXPO_PUBLIC_GRAPHQL_URL || "https://api.sandifund.com/graphql";
const API_BASE = GRAPHQL_URL.replace(/\/graphql$/, "");

async function doFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    ...options,
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : {}; } catch { json = { error: { message: text || "Invalid JSON" } }; }

  if (!res.ok) {
    const msg = json?.error?.message || json?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return json;
}

export async function forgotPassword(email) {
  return doFetch("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword({ code, password, passwordConfirmation }) {
  return doFetch("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ code, password, passwordConfirmation }),
  });
}

export async function confirmEmail(confirmation) {
  return doFetch(`/api/auth/email-confirmation?confirmation=${encodeURIComponent(confirmation)}`);
}
