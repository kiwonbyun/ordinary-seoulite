export type BoardPost = {
  id: string;
  title: string;
  body: string;
  locationTag?: string | null;
  status: "open" | "answered";
};

export function formatBoardStatus(status: BoardPost["status"]) {
  return status === "answered" ? "Answered" : "Open";
}
