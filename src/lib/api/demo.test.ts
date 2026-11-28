import { describe, it, expect, vi } from "vitest";
import { createApiClient } from "./client";
import { ApiError } from "./errors";
import { createDemoApi } from "./demo";

describe("demo api", () => {
  it("getDemoConfig calls GET /auth/demo with no Authorization header and returns parsed body", async () => {
    const mockConfig = {
      enabled: true,
      personas: ["student", "owner"] as const,
    };

    const fetchImpl = vi.fn().mockImplementation(async () =>
      new Response(JSON.stringify(mockConfig), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const client = createApiClient({
      baseUrl: "http://localhost:3000",
      getToken: async () => "should-not-be-sent",
      fetchImpl,
    });

    const demoApi = createDemoApi(client);
    const result = await demoApi.getDemoConfig();

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [calledUrl, requestInit] = fetchImpl.mock.calls[0];

    expect(calledUrl).toBe("http://localhost:3000/v1/auth/demo");
    expect(requestInit?.method).toBe("GET");
    const headers = requestInit?.headers as Record<string, string>;
    expect(headers["Authorization"]).toBeUndefined();
    expect(result).toEqual(mockConfig);
  });

  it('demoSignIn("owner") calls POST /auth/demo/sign-in with JSON body and no Authorization header', async () => {
    const mockResponse = {
      customToken: "custom-token-owner",
      persona: "owner" as const,
      uid: "demo-owner-123",
    };

    const fetchImpl = vi.fn().mockImplementation(async () =>
      new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const client = createApiClient({
      baseUrl: "http://localhost:3000",
      getToken: async () => "should-not-be-sent",
      fetchImpl,
    });

    const demoApi = createDemoApi(client);
    const result = await demoApi.demoSignIn("owner");

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [calledUrl, requestInit] = fetchImpl.mock.calls[0];

    expect(calledUrl).toBe("http://localhost:3000/v1/auth/demo/sign-in");
    expect(requestInit?.method).toBe("POST");
    expect(requestInit?.body).toBe(JSON.stringify({ persona: "owner" }));
    const headers = requestInit?.headers as Record<string, string>;
    expect(headers["Content-Type"]).toBe("application/json");
    expect(headers["Authorization"]).toBeUndefined();
    expect(result).toEqual(mockResponse);
  });

  it("rejects with ApiError of status 404 when demo mode is off", async () => {
    const errorBody = {
      error: {
        code: "NOT_FOUND",
        message: "Demo mode is disabled",
      },
      requestId: "r1",
    };

    const fetchImpl = vi.fn().mockImplementation(async () =>
      new Response(JSON.stringify(errorBody), {
        status: 404,
        statusText: "Not Found",
        headers: { "Content-Type": "application/json" },
      })
    );

    const client = createApiClient({
      baseUrl: "http://localhost:3000",
      getToken: async () => "should-not-be-sent",
      fetchImpl,
    });

    const demoApi = createDemoApi(client);

    await expect(demoApi.demoSignIn("student")).rejects.toThrow(ApiError);

    try {
      await demoApi.demoSignIn("student");
      expect.unreachable();
    } catch (e: unknown) {
      expect(e).toBeInstanceOf(ApiError);
      const err = e as ApiError;
      expect(err.status).toBe(404);
      expect(err.code).toBe("NOT_FOUND");
      expect(err.message).toBe("Demo mode is disabled");
      expect(err.requestId).toBe("r1");
    }
  });
});
