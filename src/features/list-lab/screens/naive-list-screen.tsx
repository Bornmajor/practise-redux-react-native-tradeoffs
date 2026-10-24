import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { NaiveCard } from '../components/naive-card';
import { generateItems } from '../data/generate-items';
import { elapsedMs, startTimer } from '../utils/render-timer';

// How many items to render; start small and increase to watch the app degrade
const COUNTS = [50, 200, 1000, 5000];

export function NaiveListScreen() {
  const [count, setCount] = useState(50);
  const items = generateItems(count);

  // Render timer: time from tapping a count until the next frame after the list is on screen
  const [lastRenderMs, setLastRenderMs] = useState<number | null>(null);

  const selectCount = (value: number) => {
    startTimer(); // event handler: the right place for side effects
    setCount(value);
  };

  useEffect(() => {
    // Runs after React has committed the new list; the frame callback runs once it's drawn
    const frame = requestAnimationFrame(() => setLastRenderMs(elapsedMs()));
    return () => cancelAnimationFrame(frame);
  }, [count]);

  return (
    <View className="flex-1 bg-background">
      {/* Controls: pick the item count; shows the last render time */}
      <View className="gap-2 border-b border-border p-3">
        <View className="flex-row flex-wrap gap-2">
          {COUNTS.map((value) => (
            <Button
              key={value}
              size="sm"
              variant={value === count ? 'default' : 'outline'}
              onPress={() => selectCount(value)}
            >
              <ButtonText>{value}</ButtonText>
            </Button>
          ))}
        </View>
        <Text className="text-xs text-muted-foreground">
          {count} items, ALL rendered at once (ScrollView) · last render:{' '}
          {lastRenderMs === null ? 'tap a count to measure' : `${lastRenderMs} ms`}
        </Text>
      </View>

      {/* NAIVE: every item is created now, including thousands far off screen */}
      <ScrollView contentContainerClassName="gap-4 p-4">
        {items.map((item) => (
          <NaiveCard key={item.id} item={item} />
        ))}
      </ScrollView>
    </View>
  );
}
