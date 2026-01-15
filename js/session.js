// js/session.js
import { APP } from "./config.js";
import { auth, onAuth, signOut as fbSignOut } from "./firebaseClient.js";

const TOKEN_KEY = "advmus_idToken";

let _authReadyPromise = null;

export function storeToken(idToken) {
  localStorage.setItem(TOKEN_KEY, idToken);
}

export function readToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function waitForAuthReady() {
  if (_authReadyPromise) return _authReadyPromise;

  _authReadyPromise = new Promise((resolve) => {
    const unsub = onAuth((user) => {
      unsub();
      resolve(user || null);
    });
  });

  return _authReadyPromise;
}

export async function requireUserOrRedirect() {
  const user = await waitForAuthReady();
  if (!user) {
    clearToken();
    window.location.href = APP.PATHS.LOGIN;
    throw new Error("Not authenticated (redirected).");
  }
  return user;
}

export async function getFreshIdTokenOrRedirect() {
  const user = await requireUserOrRedirect();
  const idToken = await user.getIdToken(); // Firebase refresca si hace falta
  storeToken(idToken);
  return idToken;
}

export async function logout() {
  clearToken();
  await fbSignOut();
  window.location.href = APP.PATHS.LOGIN;
}
