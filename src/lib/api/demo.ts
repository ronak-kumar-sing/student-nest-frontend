// HAND-WRITTEN TYPES: GET /v1/auth/demo and POST /v1/auth/demo/sign-in are not in docs/api/openapi.json yet. Replace these with components["schemas"][...] after running npm run gen:api on the regenerated contract.

import type { ApiClient } from "./client";
import { api } from "./index";

export type DemoPersona = "student" | "owner";

export interface DemoConfig {
  enabled: boolean;
  personas: DemoPersona[];
}

export interface DemoSignInResponse {
  customToken: string;
  persona: DemoPersona;
  uid: string;
}

export function createDemoApi(client: ApiClient) {
  return {
    getDemoConfig: () =>
      client.request<DemoConfig>("GET", "/auth/demo", { auth: "none" }),
    demoSignIn: (persona: DemoPersona) =>
      client.request<DemoSignInResponse>("POST", "/auth/demo/sign-in", {
        body: { persona },
        auth: "none",
      }),
  };
}

export const { getDemoConfig, demoSignIn } = createDemoApi(api);
