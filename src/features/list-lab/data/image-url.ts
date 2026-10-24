import type { LabImage } from './generate-items';

// Builds the URL for an image at a requested width (never larger than the source).
// Returns the actual size too, so the card can show what was loaded.
// placehold.co returns a PNG at exactly width × height, with its size written on it; the file is
// small, but the phone still decodes it to a full width × height bitmap.
export function imageSource(image: LabImage, requestedWidth: number) {
  const width = Math.min(requestedWidth, image.width); // a server can't add pixels the source doesn't have
  const height = Math.round((width * image.height) / image.width); // same aspect ratio
  return {
    uri: `https://placehold.co/${width}x${height}/${image.color}/ffffff/png?text=${width}x${height}`,
    width,
    height,
  };
}
