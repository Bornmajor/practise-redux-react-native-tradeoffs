import { Image, View } from 'react-native';
import { Text } from '@/components/ui/text';
import type { LabItem } from '../data/generate-items';
import { imageSource } from '../data/image-url';

type Props = {
  item: LabItem;
  imageWidth: number; // physical pixels to request (Infinity = full size)
};

// Still React Native's basic <Image>; only the requested image SIZE changes in section 3.
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
      <View className="gap-1 p-3">
        <Text className="text-base font-semibold text-foreground">{item.title}</Text>
        <Text className="text-xs text-muted-foreground">
          {item.category} · {item.image.shape} · source {item.image.width}×{item.image.height} →
          loaded {source.width}×{source.height}
        </Text>
        <Text className="text-sm text-foreground">{item.description}</Text>
      </View>
    </View>
  );
}
