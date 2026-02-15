import type { BoardStatus } from "./types";

export function formatBoardStatus(status: BoardStatus) {
  return status === "answered" ? "Answered" : "Open";
}

