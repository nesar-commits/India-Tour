const BASE = import.meta.env.VITE_API_URL || "";

async function get(path, params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  ).toString();
  const res = await fetch(`${BASE}/api${path}${query ? `?${query}` : ""}`);
  if (!res.ok) {
    throw new Error(res.status === 404 ? "Not found" : `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  stats: () => get("/stats"),
  states: (params) => get("/states", params),
  state: (id) => get(`/states/${id}`),
  places: (params) => get("/places", params),
};
