export type GalleryItem = {
  id: string;
  imageUrl: string;
  caption: string | null;
  locationTag: string | null;
  createdAt: string;
};

export type CreateGalleryItemInput = {
  imageFile: File;
  caption?: string;
  locationTag?: string;
};
