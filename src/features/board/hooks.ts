import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import fallbackThumbnail from "@/app/assets/main.jpg";
import { createBoardPostWithImages, fetchBoardPostById, fetchBoardPosts } from "./api";
import type { BoardPost, BoardPostFilters, CreateBoardPostInput } from "./types";

export const boardQueryKey = (filters?: BoardPostFilters) => ["board-posts", filters ?? {}] as const;

export function useBoardPosts(filters?: BoardPostFilters) {
  return useQuery({
    queryKey: boardQueryKey(filters),
    queryFn: () => fetchBoardPosts({ offset: 0, limit: 20, filters }),
  });
}

export function useBoardPost(id: string) {
  return useQuery({
    queryKey: ["board-post", id],
    queryFn: () => fetchBoardPostById(id),
    enabled: Boolean(id),
  });
}

export function useCreateBoardPost(filters?: BoardPostFilters) {
  const queryClient = useQueryClient();
  const key = boardQueryKey(filters);

  return useMutation({
    mutationFn: (input: CreateBoardPostInput) => createBoardPostWithImages(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<BoardPost[]>(key) ?? [];
      const optimisticPost: BoardPost = {
        id: `optimistic-${Date.now()}`,
        type: input.type,
        title: input.title,
        body: input.body,
        locationTag: input.locationTag ?? null,
        status: "open",
        createdAt: new Date().toISOString(),
        authorId: "me",
        authorDisplayName: null,
        thumbnailUrl: fallbackThumbnail,
        images: [],
      };
      queryClient.setQueryData<BoardPost[]>(key, [optimisticPost, ...previous]);
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
    },
    onSuccess: (created, _variables, context) => {
      const previous = context?.previous ?? [];
      queryClient.setQueryData<BoardPost[]>(key, [created, ...previous]);
    },
  });
}
