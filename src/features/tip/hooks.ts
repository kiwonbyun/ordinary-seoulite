import { useMutation } from "@tanstack/react-query";
import { createTip } from "./api";
import type { TipInput } from "./types";

export function useCreateTip() {
  return useMutation({
    mutationFn: (input: TipInput) => createTip(input),
  });
}
