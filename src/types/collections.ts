export interface CollectionItem {
  id: string
  name: string
  price: number
  galleryImages: { filePath: string }[] | null
}

export interface GalleryItem {
  id: string;
  filePath: string;
  file: File | null;
  isNew: boolean;
}