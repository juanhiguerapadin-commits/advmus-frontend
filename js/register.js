// js/register.js
import { APP } from "./config.js";
import { signUp } from "./firebaseClient.js";
import { storeToken } from "./session.js";

const form = document.getElementById("registerForm");
const emailEl = document.getElementById("email");
const passEl = document.getElementById("password");
const pass2El = document.getElementById("password2");
const errBox = document.getElementById("registerError");
const btn = document.getElementById("registerBtn");

function setBusy(busy) {
  if (btn) btn.disabled = busy;
}

function setError(msg) {
  if (!errBox) return;
  errBox.textContent = msg || "";
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  setError("");

  const email = (emailEl?.value || "").trim();
  const password = passEl?.value || "";
  const password2 = pass2El?.value || "";

  if (!email || !password) {
    setError("Completá email y contraseña.");
    return;
  }
  if (password.length < 6) {
    setError("La contraseña debe tener al menos 6 caracteres.");
    return;
  }
  if (password !== password2) {
    setError("Las contraseñas no coinciden.");
    return;
  }

  setBusy(true);
  try {
    const { idToken } = await signUp(email, password);
    storeToken(idToken);
    window.location.href = APP.PATHS.DASH;
  } catch (err) {
    setError("Registro falló: " + (err?.message || String(err)));
  } finally {
    setBusy(false);
  }
});
