const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_FILE_BYTES = 8 * 1024 * 1024;
const MAX_IMAGE_UPLOAD_BYTES = 1_500_000;
const MAX_IMAGE_DIMENSION = 1920;

export type ImageValidationResult =
  | { success: true }
  | { success: false; message: string };

export function validateEditorImageFile(file: File): ImageValidationResult {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return { success: false, message: "Only jpg, png, and webp images are allowed." };
  }

  if (file.size > MAX_IMAGE_FILE_BYTES) {
    return { success: false, message: "Image must be 8MB or smaller." };
  }

  return { success: true };
}

function getScaledDimensions(width: number, height: number) {
  const largestSide = Math.max(width, height);
  if (largestSide <= MAX_IMAGE_DIMENSION) {
    return { width, height };
  }
  const ratio = MAX_IMAGE_DIMENSION / largestSide;
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

function loadImageFromFile(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image."));
    };
    image.src = objectUrl;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to process image."));
          return;
        }
        resolve(blob);
      },
      "image/webp",
      quality,
    );
  });
}

function toWebpFileName(fileName: string) {
  const withoutExt = fileName.replace(/\.[^.]+$/, "");
  return `${withoutExt || "board-image"}.webp`;
}

export async function optimizeEditorImage(file: File) {
  const image = await loadImageFromFile(file);
  const { width, height } = getScaledDimensions(image.width, image.height);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Failed to process image.");

  context.drawImage(image, 0, 0, width, height);

  let quality = 0.85;
  let blob = await canvasToBlob(canvas, quality);

  while (blob.size > MAX_IMAGE_UPLOAD_BYTES && quality > 0.45) {
    quality -= 0.1;
    blob = await canvasToBlob(canvas, quality);
  }

  if (blob.size > MAX_IMAGE_UPLOAD_BYTES) {
    throw new Error("Image is too large after compression. Please choose a smaller image.");
  }

  return new File([blob], toWebpFileName(file.name), { type: "image/webp" });
}

export function extractImageUrlsFromHtml(html: string) {
  const matches = html.matchAll(/<img[^>]*\ssrc=["']([^"']+)["'][^>]*>/gi);
  const urls = Array.from(matches, (match) => match[1]).filter(Boolean);
  return Array.from(new Set(urls));
}

