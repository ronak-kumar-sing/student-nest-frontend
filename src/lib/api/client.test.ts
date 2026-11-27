import { describe, it, expect, vi } from "vitest";
import { createApiClient } from "./client";
import { ApiError } from "./errors";

describe("api client", () => {
  it("sends Authorization: Bearer <token> when getToken returns a token, and omits it when null", async () => {
    const fetchImpl = vi.fn().mockImplementation(async () =>
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const clientWithToken = createApiClient({
      baseUrl: "http://localhost:3000",
      getToken: async () => "valid-id-token-xyz",
      fetchImpl,
    });

    await clientWithToken.request("GET", "/test-endpoint");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const headersWithToken = fetchImpl.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headersWithToken["Authorization"]).toBe("Bearer valid-id-token-xyz");

    const clientWithoutToken = createApiClient({
      baseUrl: "http://localhost:3000",
      getToken: async () => null,
      fetchImpl,
    });

    await clientWithoutToken.request("GET", "/test-endpoint-2");
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    const headersWithoutToken = fetchImpl.mock.calls[1][1]?.headers as Record<string, string>;
    expect(headersWithoutToken["Authorization"]).toBeUndefined();
  });

  it('auth: "required" without a token throws ApiError UNAUTHENTICATED and does not call fetch', async () => {
    const fetchImpl = vi.fn();
    const client = createApiClient({
      baseUrl: "http://localhost:3000",
      getToken: async () => null,
      fetchImpl,
    });

    await expect(
      client.request("POST", "/bookings", { auth: "required" })
    ).rejects.toThrow(ApiError);

    try {
      await client.request("POST", "/bookings", { auth: "required" });
    } catch (e: unknown) {
      expect(e).toBeInstanceOf(ApiError);
      const err = e as ApiError;
      expect(err.status).toBe(401);
      expect(err.code).toBe("UNAUTHENTICATED");
    }

    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("parses the error envelope into ApiError (status, code, message, requestId, details)", async () => {
    const errorEnvelope = {
      error: {
        code: "PHONE_REQUIRED",
        message: "A verified phone is required to apply for a room",
        details: [{ field: "phone", issue: "missing" }],
      },
      requestId: "req_test_89123",
    };

    const fetchImpl = vi.fn().mockImplementation(async () =>
      new Response(JSON.stringify(errorEnvelope), {
        status: 403,
        statusText: "Forbidden",
        headers: { "Content-Type": "application/json" },
      })
    );

    const client = createApiClient({
      baseUrl: "http://localhost:3000",
      fetchImpl,
    });

    try {
      await client.request("POST", "/bookings");
      expect.unreachable();
    } catch (e: unknown) {
      expect(e).toBeInstanceOf(ApiError);
      const err = e as ApiError;
      expect(err.status).toBe(403);
      expect(err.code).toBe("PHONE_REQUIRED");
      expect(err.message).toBe("A verified phone is required to apply for a room");
      expect(err.requestId).toBe("req_test_89123");
      expect(err.details).toEqual([{ field: "phone", issue: "missing" }]);
    }
  });

  it("network error (fetch rejects with TypeError) becomes ApiError status 0 code NETWORK_ERROR", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));

    const client = createApiClient({
      baseUrl: "http://localhost:3000",
      fetchImpl,
    });

    try {
      await client.request("GET", "/health");
      expect.unreachable();
    } catch (e: unknown) {
      expect(e).toBeInstanceOf(ApiError);
      const err = e as ApiError;
      expect(err.status).toBe(0);
      expect(err.code).toBe("NETWORK_ERROR");
      expect(err.message).toContain("Could not reach Student Nest");
    }
  });

  it("array query params are comma-joined and empty values skipped", async () => {
    const fetchImpl = vi.fn().mockImplementation(async () =>
      new Response(JSON.stringify({ items: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const client = createApiClient({
      baseUrl: "http://localhost:3000",
      fetchImpl,
    });

    await client.request("GET", "/search/rooms", {
      query: {
        city: "indore",
        roomType: ["pg", "1rk", "1bhk"],
        emptyStr: "",
        nullField: null,
        undefinedField: undefined,
        amenities: ["wifi", "ac"],
      },
    });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const calledUrl: string = fetchImpl.mock.calls[0][0];

    expect(calledUrl).toContain("city=indore");
    expect(calledUrl).toContain("roomType=pg%2C1rk%2C1bhk");
    expect(calledUrl).toContain("amenities=wifi%2Cac");
    expect(calledUrl).not.toContain("emptyStr");
    expect(calledUrl).not.toContain("nullField");
    expect(calledUrl).not.toContain("undefinedField");
  });
});
