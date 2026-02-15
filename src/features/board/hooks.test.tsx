import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useCreateBoardPost, boardQueryKey } from "./hooks";
import * as api from "./api";
import type { BoardPost } from "./types";

describe("useCreateBoardPost", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rolls back optimistic cache when mutation fails", async () => {
    vi.spyOn(api, "createBoardPost").mockRejectedValueOnce(new Error("insert failed"));

    const filters = { type: "all" as const };
    const key = boardQueryKey(filters);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    const existing: BoardPost[] = [
      {
        id: "1",
        type: "question",
        title: "old",
        body: "x".repeat(30),
        locationTag: null,
        status: "open",
        createdAt: "2026-02-15T00:00:00.000Z",
        authorId: "u1",
      },
    ];
    queryClient.setQueryData(key, existing);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useCreateBoardPost(filters), { wrapper });

    result.current.mutate({
      type: "tip",
      title: "Great sunset spot near Hangang",
      body: "x".repeat(40),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(queryClient.getQueryData(key)).toEqual(existing);
  });
});
