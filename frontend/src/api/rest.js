const GRAPHQL = process.env.REACT_APP_GRAPHQL_URL || "";
export const STRAPI_REST_BASE = GRAPHQL.replace(/\/graphql\/?$/, "");

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      data?.error?.message ||
      data?.message ||
      `HTTP ${res.status}`
    );
  }
  return data;
}

export async function post(path, body) {
  const res = await fetch(`${STRAPI_REST_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  return handle(res);
}

export async function get(path) {
  const res = await fetch(`${STRAPI_REST_BASE}${path}`);
  return handle(res);
}
