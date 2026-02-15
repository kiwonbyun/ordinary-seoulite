import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as api from "./api";
import { dmQueryKey, useSendDmMessage } from "./hooks";
import type { DmMessage } from "./types";

describe("useSendDmMessage", () => {
  afterEach(() => vi.restoreAllMocks());

  it("rolls back optimistic cache when send fails", async () => {
    vi.spyOn(api, "sendDmMessage").mockRejectedValueOnce(new Error("send failed"));

    const key = dmQueryKey("u1");
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    const existing: DmMessage[] = [
      { id: "m1", threadId: "t1", senderId: "u1", body: "old", createdAt: "2026-02-15T00:00:00.000Z" },
    ];
    queryClient.setQueryData(key, existing);

    const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    const { result } = renderHook(() => useSendDmMessage("u1"), { wrapper });

    result.current.mutate("new message");

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(queryClient.getQueryData(key)).toEqual(existing);
  });
});
