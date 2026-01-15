// js/api.js
import { APP } from "./config.js";
import { getFreshIdTokenOrRedirect } from "./session.js";

function addTenant(headers) {
  if (APP.TENANT_ID) headers.set("X-Tenant-Id", APP.TENANT_ID);
}

async function apiFetch(path, options = {}) {
  const idToken = await getFreshIdTokenOrRedirect();

  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${idToken}`);
  addTenant(headers);

  const res = await fetch(`${APP.API_BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const reqId = res.headers.get("X-Request-Id") || "-";
    const body = await res.text().catch(() => "");
    const err = new Error(`API ${res.status} ${res.statusText}`);
    err.requestId = reqId;
    err.body = body;
    throw err;
  }

  return res;
}

// --- Invoices ---
export async function uploadInvoice(file) {
  const fd = new FormData();
  fd.append("file", file);

  const res = await apiFetch("/v1/invoices/upload", { method: "POST", body: fd });

  const text = await res.text();
  try { return JSON.parse(text); } catch { return { ok: true, raw: text }; }
}

export async function listInvoices() {
  const res = await apiFetch("/v1/invoices/", { method: "GET" });
  return res.json(); // {count, items}
}

export async function getInvoice(id) {
  const res = await apiFetch(`/v1/invoices/${encodeURIComponent(id)}`, { method: "GET" });
  return res.json();
}

export async function patchInvoice(id, payload) {
  const res = await apiFetch(`/v1/invoices/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function downloadInvoicePdf(id) {
  const res = await apiFetch(`/v1/invoices/${encodeURIComponent(id)}/download`, { method: "GET" });
  return res.blob();
}
