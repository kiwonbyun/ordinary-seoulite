export type BoardPostType = "question" | "review" | "tip";
export type BoardStatus = "open" | "answered";

export type BoardPost = {
  id: string;
  type: BoardPostType;
  title: string;
  body: string;
  locationTag: string | null;
  status: BoardStatus;
  createdAt: string;
  authorId: string;
};

export type CreateBoardPostInput = {
  type: BoardPostType;
  title: string;
  body: string;
  locationTag?: string;
};

export type BoardPostFilters = {
  search?: string;
  type?: BoardPostType | "all";
};
