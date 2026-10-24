import { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { NaiveCard } from '../components/naive-card';
import { generateItems } from '../data/generate-items';
import { useDisplayImageWidth } from '../hooks/use-display-image-width';
import { elapsedMs, startTimer } from '../utils/render-timer';

// How many items to render; start small and increase to watch the app degrade
const COUNTS = [50, 200, 1000, 5000];

type ImageMode = 'full' | 'display';

export function NaiveListScreen() {
  const [count, setCount] = useState(50);
  const items = generateItems(count);

  // Section 3: which image size to request
  const [imageMode, setImageMode] = useState<ImageMode>('display');
  const displayWidth = useDisplayImageWidth();
  // 'full' = request the source size (sections 1–2 behavior); 'display' = request what the card needs
  const imageWidth = imageMode === 'full' ? Number.POSITIVE_INFINITY : displayWidth;

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

        {/* Image size: compare full-size vs display-size images on the same list */}
        <View className="flex-row flex-wrap gap-2">
          {(['full', 'display'] as const).map((mode) => (
            <Button
              key={mode}
              size="sm"
              variant={mode === imageMode ? 'default' : 'outline'}
              onPress={() => setImageMode(mode)}
            >
              <ButtonText>
                {mode === 'full' ? 'Full size' : `Display size (${displayWidth}px)`}
              </ButtonText>
            </Button>
          ))}
        </View>

        <Text className="text-xs text-muted-foreground">
          {count} items · FlatList (default settings) · images:{' '}
          {imageMode === 'full' ? 'full size' : `display size (${displayWidth}px)`} · last render:{' '}
          {lastRenderMs === null ? 'tap a count to measure' : `${lastRenderMs} ms`}
        </Text>
      </View>

      {/* Section 2: FlatList with DEFAULT settings. Only the cards near the screen are mounted;
          off-screen cards are unmounted. No tuning yet. */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id} // stable, unique key per card
        renderItem={({ item }) => <NaiveCard item={item} imageWidth={imageWidth} />}
        ItemSeparatorComponent={Separator} // the 16 px gap between cards
        contentContainerClassName="p-4"
      />
    </View>
  );
}

// Space between cards (FlatList's way to add gaps; `gap` on the container isn't reliable here)
function Separator() {
  return <View className="h-4" />;
}
