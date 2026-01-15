// js/login.js
import { APP } from "./config.js";
import { signIn, onAuth } from "./firebaseClient.js";
import { storeToken } from "./session.js";

const form = document.getElementById("loginForm");
const emailEl = document.getElementById("email");
const passEl = document.getElementById("password");
const errBox = document.getElementById("loginError");
const btn = document.getElementById("loginBtn");

function setBusy(busy) {
  if (btn) btn.disabled = busy;
}

function setError(msg) {
  if (!errBox) return;
  errBox.textContent = msg || "";
}

onAuth(async (user) => {
  if (!user) return;
  const token = await user.getIdToken().catch(() => null);
  if (token) {
    storeToken(token);
    window.location.href = APP.PATHS.DASH;
  }
});

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  setError("");

  const email = (emailEl?.value || "").trim();
  const password = passEl?.value || "";

  if (!email || !password) {
    setError("Completá email y contraseña.");
    return;
  }

  setBusy(true);
  try {
    const { idToken } = await signIn(email, password);
    storeToken(idToken);
    window.location.href = APP.PATHS.DASH;
  } catch (err) {
    setError("Login falló: " + (err?.message || String(err)));
  } finally {
    setBusy(false);
  }
});

