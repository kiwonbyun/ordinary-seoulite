import { useQuery } from "@tanstack/react-query";
import { fetchGalleryItems } from "./api";

export function useGalleryItems() {
  return useQuery({
    queryKey: ["gallery-items"],
    queryFn: () => fetchGalleryItems(),
  });
}
