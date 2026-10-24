import { PixelRatio, useWindowDimensions } from 'react-native';

// How many PHYSICAL pixels wide the card's image is on this screen,
// rounded up to the next 100 so screens and rotations share the same image URLs.
export function useDisplayImageWidth(horizontalPadding = 32) {
  const { width } = useWindowDimensions(); // screen width in dp; updates on rotation
  const physicalPixels = (width - horizontalPadding) * PixelRatio.get(); // dp → real pixels
  return Math.ceil(physicalPixels / 100) * 100;
}
