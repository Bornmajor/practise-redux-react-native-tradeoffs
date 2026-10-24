import { View } from 'react-native';
import { Image } from 'expo-image';
import type { LabItem } from '../data/generate-items';
import { imageSource } from '../data/image-url';
import { CardDetails } from './card-details';

type Props = {
  item: LabItem;
  imageWidth: number; // physical pixels to request (Infinity = full size)
};

// The same card with expo-image: caching, placeholder color, fade-in, automatic downscaling
export function ExpoImageCard({ item, imageWidth }: Props) {
  const source = imageSource(item.image, imageWidth);

  return (
    <View className="overflow-hidden rounded-xl border border-border bg-card">
      <Image
        source={{ uri: source.uri, width: source.width, height: source.height }}
        style={{
          width: '100%',
          aspectRatio: item.image.width / item.image.height,
          backgroundColor: `#${item.image.color}55`, // dominant-color placeholder (semi-transparent)
        }}
        contentFit="cover"
        cachePolicy="memory-disk" // keep decoded images in memory AND files on disk
        transition={150} // fade in over 150 ms instead of popping in
        recyclingKey={item.id} // resets cleanly if the view is reused for another item (FlashList)
      />
      <CardDetails item={item} loadedWidth={source.width} loadedHeight={source.height} />
    </View>
  );
}
