import { createRandom } from './random';

// The image shapes in the list: different aspect ratios on purpose
const SHAPES = [
  { name: 'landscape', ratio: 16 / 9 },
  { name: 'portrait', ratio: 3 / 4 },
  { name: 'square', ratio: 1 },
  { name: 'tall', ratio: 9 / 16 },
  { name: 'panorama', ratio: 3 / 1 },
] as const;

// One background color per shape, so the different sizes are easy to tell apart
const SHAPE_COLORS = {
  landscape: '3c87f7',
  portrait: 'f97316',
  square: '22c55e',
  tall: 'a855f7',
  panorama: 'ef4444',
} as const;

const CATEGORIES = ['Travel', 'Food', 'Nature', 'City', 'People', 'Tech'] as const;
const WORDS =
  'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua'.split(
    ' ',
  );

export type LabItem = {
  id: string;
  title: string;
  description: string; // 1–4 sentences, so cards also differ in text height
  category: string;
  image: {
    url: string;
    width: number; // real pixel size of the downloaded image
    height: number;
    shape: (typeof SHAPES)[number]['name'];
  };
};

// Builds `count` items. Same seed → same items every time.
export function generateItems(count: number, seed = 42): LabItem[] {
  const random = createRandom(seed);

  const sentence = () => {
    const words = Array.from({ length: random.int(6, 14) }, () => random.pick(WORDS));
    const text = words.join(' ');
    return text.charAt(0).toUpperCase() + text.slice(1) + '.';
  };

  return Array.from({ length: count }, (_, index) => {
    const shape = random.pick(SHAPES);
    // FULL resolution on purpose: much bigger than a phone shows (the naive mistake)
    const width = random.int(1200, 2400);
    const height = Math.round(width / shape.ratio);

    return {
      id: `item-${index}`,
      title: `${random.pick(CATEGORIES)} photo #${index + 1}`,
      description: Array.from({ length: random.int(1, 4) }, sentence).join(' '),
      category: random.pick(CATEGORIES),
      image: {
        // placehold.co returns a PNG at exactly width × height, with its size written on it.
        // The file is small, but the phone still decodes it to a full width × height bitmap.
        url: `https://placehold.co/${width}x${height}/${SHAPE_COLORS[shape.name]}/ffffff/png?text=${width}x${height}`,
        width,
        height,
        shape: shape.name,
      },
    };
  });
}
