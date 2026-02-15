import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchDmMessages, sendDmMessage } from "./api";
import type { DmMessage } from "./types";

export const dmQueryKey = (userId: string | null | undefined) => ["dm-thread", userId ?? "guest"] as const;

export function useDmThread(userId: string | null | undefined) {
  return useQuery({
    queryKey: dmQueryKey(userId),
    queryFn: () => fetchDmMessages(userId as string),
    enabled: Boolean(userId),
  });
}

export function useSendDmMessage(userId: string | null | undefined) {
  const queryClient = useQueryClient();
  const key = dmQueryKey(userId);

  return useMutation({
    mutationFn: (body: string) => sendDmMessage(userId as string, body),
    onMutate: async (body) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<DmMessage[]>(key) ?? [];
      const optimistic: DmMessage = {
        id: `optimistic-${Date.now()}`,
        threadId: "pending",
        senderId: userId ?? "me",
        body,
        createdAt: new Date().toISOString(),
      };
      queryClient.setQueryData<DmMessage[]>(key, [...previous, optimistic]);
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
    },
    onSuccess: (created, _variables, context) => {
      const previous = context?.previous ?? [];
      queryClient.setQueryData<DmMessage[]>(key, [...previous, created]);
    },
  });
}
