import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { env } from '@/shared/config/env';

// A small corner badge so testers always know which flavor they're using. Hidden in prod.
export function FlavorBadge() {
  if (!env.flavorLabel) return null;
  return (
    <View
      pointerEvents="none"
      className="absolute bottom-6 right-4 rounded-full bg-destructive px-3 py-1"
    >
      <Text className="text-xs font-bold text-white">{env.flavorLabel}</Text>
    </View>
  );
}
