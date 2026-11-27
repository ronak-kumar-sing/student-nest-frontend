import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth";
import { env } from "@/lib/env";

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let emulatorConnected = false;

export function getFirebaseApp(): FirebaseApp {
  if (typeof window === "undefined") {
    throw new Error("Firebase app cannot be initialized on the server");
  }
  if (!firebaseApp) {
    if (getApps().length > 0) {
      firebaseApp = getApp();
    } else {
      firebaseApp = initializeApp({
        apiKey: env.firebaseApiKey,
        projectId: env.firebaseProjectId,
        authDomain: `${env.firebaseProjectId}.firebaseapp.com`,
      });
    }
  }
  return firebaseApp;
}

export function getFirebaseAuth(): Auth {
  if (typeof window === "undefined") {
    throw new Error("Firebase Auth cannot be accessed on the server");
  }
  if (!firebaseAuth) {
    const app = getFirebaseApp();
    firebaseAuth = getAuth(app);
    if (env.firebaseAuthEmulatorHost && !emulatorConnected) {
      connectAuthEmulator(firebaseAuth, `http://${env.firebaseAuthEmulatorHost}`, {
        disableWarnings: true,
      });
      emulatorConnected = true;
    }
  }
  return firebaseAuth;
}
