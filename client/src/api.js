const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  articles: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/articles${qs ? `?${qs}` : ""}`);
  },
  article: (id) => request(`/articles/${id}`),
  categories: () => request("/categories"),
  trending: () => request("/trending"),
  settings: () => request("/settings"),

  login: (username, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  logout: (token) =>
    request("/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }),

  adminArticles: (token) =>
    request("/admin/articles", { headers: { Authorization: `Bearer ${token}` } }),
  adminCreateArticle: (token, data) =>
    request("/admin/articles", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),
  adminUpdateArticle: (token, id, data) =>
    request(`/admin/articles/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),
  adminDeleteArticle: (token, id) =>
    request(`/admin/articles/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),
  adminCreateCategory: (token, data) =>
    request("/admin/categories", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),
  adminDeleteCategory: (token, id) =>
    request(`/admin/categories/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),
  adminSetTrending: (token, ids) =>
    request("/admin/trending", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ids }),
    }),
};
