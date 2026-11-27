import { ApiError } from "./errors";

export interface RequestOptions {
  query?: Record<string, string | number | boolean | string[] | undefined | null>;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  auth?: "optional" | "required" | "none";
}

export interface ApiClientConfig {
  baseUrl: string;
  getToken?: () => Promise<string | null> | string | null;
  fetchImpl?: typeof fetch;
}

function buildQueryString(
  query?: Record<string, string | number | boolean | string[] | undefined | null>
): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(query)) {
    if (val === undefined || val === null || val === "") {
      continue;
    }
    if (Array.isArray(val)) {
      const filtered = val.filter(
        (item) => item !== undefined && item !== null && item !== ""
      );
      if (filtered.length > 0) {
        params.append(key, filtered.join(","));
      }
    } else {
      params.append(key, String(val));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function createApiClient({
  baseUrl,
  getToken,
  fetchImpl = globalThis.fetch,
}: ApiClientConfig) {
  return {
    async request<T>(method: string, path: string, opts: RequestOptions = {}): Promise<T> {
      const { query, body, headers = {}, signal, auth = "optional" } = opts;
      const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
      const cleanPath = path.startsWith("/") ? path : `/${path}`;
      const url = `${cleanBaseUrl}/v1${cleanPath}${buildQueryString(query)}`;

      const reqHeaders: Record<string, string> = {
        Accept: "application/json",
        ...headers,
      };

      if (auth !== "none" && getToken) {
        const token = await getToken();
        if (token) {
          reqHeaders["Authorization"] = `Bearer ${token}`;
        } else if (auth === "required") {
          throw new ApiError(401, "UNAUTHENTICATED", "Authentication required");
        }
      } else if (auth === "required") {
        throw new ApiError(401, "UNAUTHENTICATED", "Authentication required");
      }

      let reqBody: string | undefined = undefined;
      if (body !== undefined && body !== null) {
        reqHeaders["Content-Type"] = "application/json";
        reqBody = JSON.stringify(body);
      }

      let response: Response;
      try {
        response = await fetchImpl(url, {
          method,
          headers: reqHeaders,
          body: reqBody,
          signal,
        });
      } catch (err: unknown) {
        if (err && typeof err === "object" && "name" in err && err.name === "AbortError") {
          throw err;
        }
        throw new ApiError(
          0,
          "NETWORK_ERROR",
          "Could not reach Student Nest. Check your connection and try again."
        );
      }

      if (response.status === 204) {
        return undefined as T;
      }

      const text = await response.text();
      let data: unknown = null;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          // Response body is not valid JSON
        }
      }

      if (!response.ok) {
        const errObj =
          data && typeof data === "object"
            ? (data as {
                error?: { code?: unknown; message?: unknown; details?: unknown };
                requestId?: unknown;
              })
            : null;

        if (errObj?.error && typeof errObj.error.code === "string") {
          throw new ApiError(
            response.status,
            errObj.error.code,
            typeof errObj.error.message === "string"
              ? errObj.error.message
              : response.statusText || "Request failed",
            errObj.error.details,
            typeof errObj.requestId === "string" ? errObj.requestId : undefined
          );
        }
        throw new ApiError(
          response.status,
          `HTTP_${response.status}`,
          response.statusText || "Request failed"
        );
      }

      return data as T;
    },
  };
}
