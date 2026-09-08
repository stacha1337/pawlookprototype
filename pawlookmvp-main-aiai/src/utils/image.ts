/**
 * Real image preprocessing helpers used before sending a photo to the
 * AI backend. Unlike the old mock, nothing here alters what the dog
 * looks like — it only resizes/re-encodes so uploads are fast and
 * cheap to send to the image model.
 */

export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024; // 12MB raw file limit (pre-resize)
const MAX_DIMENSION = 1280; // long edge, px — plenty for a groomer-style preview

/**
 * Rough byte size of a base64 data URL (without needing to decode it).
 */
export function estimateDataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1] ?? '';
  return Math.floor((base64.length * 3) / 4);
}

/**
 * Downscales a data-URL image so its longest edge is at most
 * MAX_DIMENSION, re-encoding as JPEG. This is genuine preprocessing
 * (smaller/faster upload, lower model cost) — it does not change the
 * dog's appearance.
 */
export function resizeImageDataUrl(dataUrl: string, maxDimension = MAX_DIMENSION): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas nie jest dostępny w tej przeglądarce.'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = () => reject(new Error('Nie udało się przetworzyć zdjęcia.'));
    img.src = dataUrl;
  });
}
