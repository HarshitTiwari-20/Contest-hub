"use client";

import { getApiUrl } from "./api";

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { userId?: string | null } = {}
): Promise<T> {
  const { userId, headers, body, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    ...(userId ? { "X-User-Id": userId } : {}),
    ...(headers as Record<string, string> | undefined),
  };

  // Only set JSON content-type when a body is sent — empty body +
  // application/json breaks Fastify body parsing (invite/sync POSTs).
  if (body !== undefined && body !== null) {
    finalHeaders["Content-Type"] =
      finalHeaders["Content-Type"] ?? "application/json";
  }

  const res = await fetch(getApiUrl(path), {
    ...rest,
    body,
    headers: finalHeaders,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      (data as { error?: string }).error ||
      (Array.isArray((data as { issues?: { message: string }[] }).issues)
        ? (data as { issues: { message: string }[] }).issues
            .map((i) => i.message)
            .join(", ")
        : null) ||
      res.statusText ||
      "Request failed";
    throw new ApiError(msg, res.status, data);
  }
  return data as T;
}
