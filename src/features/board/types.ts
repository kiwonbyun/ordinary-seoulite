export type BoardPostType = "question" | "review" | "tip";
export type BoardStatus = "open" | "answered";

export type BoardPostImage = {
  id: string;
  imageUrl: string;
  position: number;
};

export type BoardPost = {
  id: string;
  type: BoardPostType;
  title: string;
  body: string;
  locationTag: string | null;
  status: BoardStatus;
  createdAt: string;
  authorId: string;
  authorDisplayName: string | null;
  thumbnailUrl: string;
  images: BoardPostImage[];
};

export type CreateBoardPostInput = {
  type: BoardPostType;
  title: string;
  body: string;
  locationTag?: string;
  images?: File[];
};

export type BoardPostFilters = {
  search?: string;
  type?: BoardPostType | "all";
};
