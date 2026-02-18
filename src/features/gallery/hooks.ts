import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createGalleryItem, fetchGalleryItems } from "./api";
import type { CreateGalleryItemInput } from "./types";

export function useGalleryItems() {
  return useQuery({
    queryKey: ["gallery-items"],
    queryFn: () => fetchGalleryItems(),
  });
}

export function useCreateGalleryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGalleryItemInput) => createGalleryItem(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["gallery-items"] });
    },
  });
}
