import { Image, View } from 'react-native';
import { Text } from '@/components/ui/text';
import type { LabItem } from '../data/generate-items';

// The NAIVE card: React Native's basic <Image> loading the full-resolution file.
// The aspect ratio comes from the data, so the card reserves the right height before the image loads.
export function NaiveCard({ item }: { item: LabItem }) {
  return (
    <View className="overflow-hidden rounded-xl border border-border bg-card">
      <Image
        source={{ uri: item.image.url }}
        style={{ width: '100%', aspectRatio: item.image.width / item.image.height }}
        resizeMode="cover"
      />
      <View className="gap-1 p-3">
        <Text className="text-base font-semibold text-foreground">{item.title}</Text>
        <Text className="text-xs text-muted-foreground">
          {item.category} · {item.image.shape} · {item.image.width}×{item.image.height}px
        </Text>
        <Text className="text-sm text-foreground">{item.description}</Text>
      </View>
    </View>
  );
}
