import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { ExpoImageCard } from '../components/expo-image-card';
import { NaiveCard } from '../components/naive-card';
import { generateItems } from '../data/generate-items';
import { useDisplayImageWidth } from '../hooks/use-display-image-width';
import { usePagedItems } from '../hooks/use-paged-items';
import { elapsedMs, startTimer } from '../utils/render-timer';

// How many items to render; start small and increase to watch the app degrade
const COUNTS = [50, 200, 1000, 5000];

type ImageMode = 'full' | 'display';
type Renderer = 'rn-image' | 'expo-image';
type ListKind = 'flatlist' | 'flashlist';
type DataMode = 'all' | 'paged';

export function NaiveListScreen() {
  const [count, setCount] = useState(50);
  const items = generateItems(count);

  // Section 3: which image size to request
  const [imageMode, setImageMode] = useState<ImageMode>('display');
  const displayWidth = useDisplayImageWidth();
  // 'full' = request the source size (sections 1–2 behavior); 'display' = request what the card needs
  const imageWidth = imageMode === 'full' ? Number.POSITIVE_INFINITY : displayWidth;

  // Section 4: which image component draws the cards
  const [renderer, setRenderer] = useState<Renderer>('expo-image');
  const Card = renderer === 'expo-image' ? ExpoImageCard : NaiveCard;

  // Section 5: which list component (mount/unmount vs recycling)
  const [listKind, setListKind] = useState<ListKind>('flashlist');

  // Section 6: everything at once (generated) vs page by page from a fake API
  const [dataMode, setDataMode] = useState<DataMode>('paged');
  const paged = usePagedItems(imageWidth);
  const listItems = dataMode === 'paged' ? paged.items : items;
  const onEndReached = dataMode === 'paged' ? paged.loadMore : undefined;
  const footer =
    dataMode === 'paged' && paged.isLoading ? <ActivityIndicator className="my-6" /> : null;

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

        {/* Image component: compare React Native's <Image> with expo-image */}
        <View className="flex-row flex-wrap gap-2">
          {(['rn-image', 'expo-image'] as const).map((value) => (
            <Button
              key={value}
              size="sm"
              variant={value === renderer ? 'default' : 'outline'}
              onPress={() => setRenderer(value)}
            >
              <ButtonText>{value === 'expo-image' ? 'expo-image' : 'RN Image'}</ButtonText>
            </Button>
          ))}
        </View>

        {/* List component: compare FlatList (mount/unmount) with FlashList (recycling) */}
        <View className="flex-row flex-wrap gap-2">
          {(['flatlist', 'flashlist'] as const).map((value) => (
            <Button
              key={value}
              size="sm"
              variant={value === listKind ? 'default' : 'outline'}
              onPress={() => setListKind(value)}
            >
              <ButtonText>{value === 'flashlist' ? 'FlashList' : 'FlatList'}</ButtonText>
            </Button>
          ))}
        </View>

        {/* Data: everything at once (count buttons) vs page by page from a fake API */}
        <View className="flex-row flex-wrap gap-2">
          {(['all', 'paged'] as const).map((value) => (
            <Button
              key={value}
              size="sm"
              variant={value === dataMode ? 'default' : 'outline'}
              onPress={() => setDataMode(value)}
            >
              <ButtonText>
                {value === 'paged' ? `Paged (${paged.items.length} loaded)` : 'All at once'}
              </ButtonText>
            </Button>
          ))}
        </View>

        <Text className="text-xs text-muted-foreground">
          {dataMode === 'paged' ? `paged, ${paged.items.length} loaded` : `${count} items`} ·{' '}
          {listKind === 'flashlist' ? 'FlashList' : 'FlatList'} · images:{' '}
          {imageMode === 'full' ? 'full size' : `display size (${displayWidth}px)`} ·{' '}
          {renderer === 'expo-image' ? 'expo-image' : 'RN Image'} · last render:{' '}
          {lastRenderMs === null ? 'tap a count to measure' : `${lastRenderMs} ms`}
        </Text>
      </View>

      {listKind === 'flashlist' ? (
        // Section 5: FlashList RECYCLES cards: off-screen cards are reused for new items.
        // getItemType keeps one recycling pool per image shape, so a tall card is reused for a tall card.
        <FlashList
          data={listItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Card item={item} imageWidth={imageWidth} />}
          getItemType={(item) => item.image.shape}
          ItemSeparatorComponent={Separator}
          contentContainerStyle={{ padding: 16 }}
          onEndReached={onEndReached} // paged mode: load the next page near the end
          onEndReachedThreshold={0.5} // "near" = within half a screen of the end
          ListFooterComponent={footer} // spinner while the next page loads
        />
      ) : (
        // Section 2: FlatList with DEFAULT settings. Only the cards near the screen are mounted;
        // off-screen cards are unmounted. No tuning.
        <FlatList
          data={listItems}
          keyExtractor={(item) => item.id} // stable, unique key per card
          renderItem={({ item }) => <Card item={item} imageWidth={imageWidth} />}
          ItemSeparatorComponent={Separator} // the 16 px gap between cards
          contentContainerClassName="p-4"
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={footer}
        />
      )}
    </View>
  );
}

// Space between cards (FlatList's way to add gaps; `gap` on the container isn't reliable here)
function Separator() {
  return <View className="h-4" />;
}
