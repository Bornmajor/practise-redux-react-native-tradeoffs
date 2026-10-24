import { generateItems, type LabItem } from './generate-items';

// Pretend server: 5000 items, served 50 at a time with network-like delay.
// Generated once, on first use, so every page comes from the same data set.
const TOTAL_ITEMS = 5000;
let allItems: LabItem[] | null = null;

export const PAGE_SIZE = 50;

export type Page = {
  items: LabItem[];
  hasMore: boolean; // false on the last page
};

// GET /items?page=N, simulated
export function fetchPage(page: number): Promise<Page> {
  allItems ??= generateItems(TOTAL_ITEMS);
  const start = page * PAGE_SIZE;
  const items = allItems.slice(start, start + PAGE_SIZE);

  return new Promise((resolve) => {
    setTimeout(() => resolve({ items, hasMore: start + PAGE_SIZE < TOTAL_ITEMS }), 600);
  });
}
