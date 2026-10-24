import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import type { LabItem } from '../data/generate-items';

type Props = {
  item: LabItem;
  loadedWidth: number;
  loadedHeight: number;
};

// Title, sizes and description: identical in both card versions, so comparisons stay fair
export function CardDetails({ item, loadedWidth, loadedHeight }: Props) {
  return (
    <View className="gap-1 p-3">
      <Text className="text-base font-semibold text-foreground">{item.title}</Text>
      <Text className="text-xs text-muted-foreground">
        {item.category} · {item.image.shape} · source {item.image.width}×{item.image.height} →
        loaded {loadedWidth}×{loadedHeight}
      </Text>
      <Text className="text-sm text-foreground">{item.description}</Text>
    </View>
  );
}
