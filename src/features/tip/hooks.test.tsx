import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import * as api from "./api";
import { useCreateTip } from "./hooks";

describe("useCreateTip", () => {
  it("exposes success state after mutation", async () => {
    vi.spyOn(api, "createTip").mockResolvedValueOnce({
      id: "tip1",
      userId: "u1",
      targetType: "dm",
      targetId: "t1",
      amount: 5,
      currency: "USD",
      status: "pending",
    });

    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    const { result } = renderHook(() => useCreateTip(), { wrapper });

    result.current.mutate({ userId: "u1", targetType: "dm", targetId: "t1", amount: 5, currency: "USD" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
