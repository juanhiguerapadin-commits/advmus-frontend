// js/interfaz.js
import { APP } from "./config.js";
import { requireUserOrRedirect, logout } from "./session.js";
import {
  uploadInvoice,
  listInvoices,
  getInvoice,
  patchInvoice,
  downloadInvoicePdf,
} from "./api.js";

const userBadge = document.getElementById("userBadge");
const tenantBadge = document.getElementById("tenantBadge");
const reportIssueLink = document.getElementById("reportIssueLink");
const errorBox = document.getElementById("errorBox");

const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const uploadStatus = document.getElementById("uploadStatus");

const refreshBtn = document.getElementById("refreshBtn");
const tbody = document.getElementById("invoicesTbody");

const detailCard = document.getElementById("detailCard");
const detailId = document.getElementById("detailId");
const detailStatus = document.getElementById("detailStatus");
const downloadBtn = document.getElementById("downloadBtn");

const metaVendor = document.getElementById("metaVendor");
const metaDate = document.getElementById("metaDate");
const metaTotal = document.getElementById("metaTotal");
const saveMetaBtn = document.getElementById("saveMetaBtn");

const logoutBtn = document.getElementById("logoutBtn");

let selectedInvoiceId = null;

function clearError() {
  if (errorBox) errorBox.textContent = "";
}

function showError(err) {
  const reqId = err?.requestId || "-";
  const body = err?.body ? `\n\n${err.body}` : "";
  if (errorBox) {
    errorBox.textContent =
      `❌ Error: ${err?.message || err}\nX-Request-Id: ${reqId}${body}`;
  }
}

function setUploadState(state) {
  if (uploadStatus) uploadStatus.textContent = state;
}

function safeText(x) {
  return (x === null || x === undefined) ? "" : String(x);
}

// Tolerante a nombres (hasta que fijemos contrato exacto)
function invoiceId(inv) {
  return inv?.id || inv?.invoice_id || inv?._id || "-";
}
function invoiceName(inv) {
  return inv?.original_filename || inv?.filename || inv?.file_name || inv?.name || "-";
}
function invoiceStatus(inv) {
  return inv?.status || inv?.state || inv?.workflow_status || "unknown";
}

function renderRows(items) {
  if (!tbody) return;
  tbody.innerHTML = "";

  for (const inv of items || []) {
    const id = invoiceId(inv);

    const tr = document.createElement("tr");

    const tdId = document.createElement("td");
    tdId.textContent = safeText(id);

    const tdName = document.createElement("td");
    tdName.textContent = safeText(invoiceName(inv));

    const tdStatus = document.createElement("td");
    tdStatus.textContent = safeText(invoiceStatus(inv));

    const tdActions = document.createElement("td");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "Ver";
    btn.addEventListener("click", () => openDetail(id));
    tdActions.appendChild(btn);

    tr.appendChild(tdId);
    tr.appendChild(tdName);
    tr.appendChild(tdStatus);
    tr.appendChild(tdActions);

    tbody.appendChild(tr);
  }
}

async function refreshList() {
  clearError();
  const data = await listInvoices(); // {count, items}
  renderRows(data?.items || []);
}

async function openDetail(id) {
  clearError();
  selectedInvoiceId = id;

  const inv = await getInvoice(id);
  detailCard.style.display = "block";
  detailId.textContent = safeText(id);
  detailStatus.textContent = safeText(invoiceStatus(inv));

  const meta = inv?.metadata || inv?.meta || {};
  metaVendor.value = meta.vendor || meta.proveedor || "";
  metaTotal.value = meta.total ?? meta.monto ?? "";
  metaDate.value = meta.date || meta.fecha || "";
}

async function onUpload() {
  clearError();
  const file = fileInput?.files?.[0];
  if (!file) {
    showError(new Error("Seleccioná un PDF primero."));
    return;
  }

  setUploadState("uploading");
  uploadBtn.disabled = true;

  try {
    await uploadInvoice(file);
    setUploadState("uploaded");
    await refreshList();
  } catch (err) {
    setUploadState("failed");
    showError(err);
  } finally {
    uploadBtn.disabled = false;
  }
}

async function onDownload() {
  clearError();
  if (!selectedInvoiceId) return;

  try {
    const blob = await downloadInvoicePdf(selectedInvoiceId);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${selectedInvoiceId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    showError(err);
  }
}

async function onSaveMeta() {
  clearError();
  if (!selectedInvoiceId) return;

  const payload = {
    metadata: {
      vendor: metaVendor.value.trim(),
      date: metaDate.value,
      total: metaTotal.value ? Number(metaTotal.value) : null,
    },
  };

  try {
    const updated = await patchInvoice(selectedInvoiceId, payload);
    detailStatus.textContent = safeText(invoiceStatus(updated));
    await refreshList();
  } catch (err) {
    showError(err);
  }
}

async function init() {
  const user = await requireUserOrRedirect();

  if (userBadge) userBadge.textContent = user.email || user.uid;
  if (tenantBadge) tenantBadge.textContent = APP.TENANT_ID || "tenant:auto";
  if (reportIssueLink) reportIssueLink.href = APP.REPORT_ISSUE_URL;

  setUploadState("idle");
  await refreshList();
}

uploadBtn?.addEventListener("click", () => onUpload().catch(showError));
refreshBtn?.addEventListener("click", () => refreshList().catch(showError));
downloadBtn?.addEventListener("click", () => onDownload().catch(showError));
saveMetaBtn?.addEventListener("click", () => onSaveMeta().catch(showError));
logoutBtn?.addEventListener("click", () => logout().catch(showError));

init().catch(showError);
