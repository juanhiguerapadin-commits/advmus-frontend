// js/firebaseClient.js
import { APP } from "./config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const app = initializeApp(APP.FIREBASE_CONFIG);
export const auth = getAuth(app);

export function onAuth(cb) {
  return onAuthStateChanged(auth, cb);
}

export async function signIn(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await cred.user.getIdToken();
  return { user: cred.user, idToken };
}

export async function signUp(email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const idToken = await cred.user.getIdToken();
  return { user: cred.user, idToken };
}

export async function signOut() {
  await fbSignOut(auth);
}

