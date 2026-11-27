export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  firebaseAuthEmulatorHost: process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST || "",
  firebaseProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "student-nest-dev",
  firebaseApiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "any-non-empty-string-for-emulator",
};
