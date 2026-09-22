"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function useApiQuery<T>(key: string[], url: string | null) {
  return useQuery({
    queryKey: key,
    queryFn: () => fetchJson<T>(url!),
    enabled: Boolean(url),
  });
}

export function usePrefetch() {
  const qc = useQueryClient();
  return useCallback(
    (key: string[], url: string) => {
      void qc.prefetchQuery({
        queryKey: key,
        queryFn: () => fetchJson(url),
      });
    },
    [qc],
  );
}

export async function apiMutate<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return body as T;
}
