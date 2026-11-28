import { signInWithCustomToken } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { demoSignIn, type DemoPersona } from "@/lib/api/demo";

export function demoDestination(persona: DemoPersona): "/rooms" | "/owner/listings" {
  return persona === "owner" ? "/owner/listings" : "/rooms";
}

export async function signInAsDemo(
  persona: DemoPersona
): Promise<{ persona: DemoPersona; destination: "/rooms" | "/owner/listings" }> {
  const result = await demoSignIn(persona);
  const auth = getFirebaseAuth();
  const userCredential = await signInWithCustomToken(auth, result.customToken);
  await userCredential.user.getIdToken(true);
  const destination = demoDestination(result.persona);
  return { persona: result.persona, destination };
}
