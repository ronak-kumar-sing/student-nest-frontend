import { signInWithCustomToken } from "firebase/auth";
import { sendEmailOtp, verifyEmailOtp, signup } from "@/lib/api";
import { getFirebaseAuth } from "@/lib/firebase";

export async function sendCode(email: string) {
  return await sendEmailOtp(email);
}

export async function verifyCode(
  email: string,
  code: string
): Promise<{ isNewUser: boolean }> {
  const result = await verifyEmailOtp(email, code);
  const auth = getFirebaseAuth();
  await signInWithCustomToken(auth, result.customToken);
  return { isNewUser: result.isNewUser };
}

export async function completeSignup({
  role,
  displayName,
}: {
  role: "student" | "owner";
  displayName: string;
}) {
  const result = await signup({
    role,
    displayName,
    acceptedTermsVersion: "2026-01",
  });
  const auth = getFirebaseAuth();
  if (auth.currentUser) {
    await auth.currentUser.getIdToken(true);
  }
  return result;
}
