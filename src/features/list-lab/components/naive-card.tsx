import { Image, View } from 'react-native';
import type { LabItem } from '../data/generate-items';
import { imageSource } from '../data/image-url';
import { CardDetails } from './card-details';

type Props = {
  item: LabItem;
  imageWidth: number; // physical pixels to request (Infinity = full size)
};

// React Native's basic <Image>: no placeholder (empty space while loading).
// The aspect ratio comes from the data, so the card reserves the right height before the image loads.
export function NaiveCard({ item, imageWidth }: Props) {
  const source = imageSource(item.image, imageWidth);

  return (
    <View className="overflow-hidden rounded-xl border border-border bg-card">
      <Image
        source={{ uri: source.uri }}
        style={{ width: '100%', aspectRatio: item.image.width / item.image.height }}
        resizeMode="cover"
      />
      <CardDetails item={item} loadedWidth={source.width} loadedHeight={source.height} />
    </View>
  );
}
