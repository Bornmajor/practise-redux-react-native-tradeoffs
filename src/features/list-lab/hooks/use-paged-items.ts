import { useCallback, useEffect, useRef, useState } from 'react';
import { Image } from 'expo-image';
import { fetchPage } from '../data/fake-api';
import type { LabItem } from '../data/generate-items';
import { imageSource } from '../data/image-url';

const PREFETCH_PER_PAGE = 10; // warm the cache for the first images of each new page

// Loads items page by page. Call loadMore() when the user nears the end of the list.
// In a real app this would be an RTK Query infinite query (or TanStack's useInfiniteQuery).
export function usePagedItems(imageWidth: number) {
  const [items, setItems] = useState<LabItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Guard in a ref: it must be up to date immediately, not on the next render,
  // because onEndReached can fire several times in a row
  const loading = useRef(false);
  const nextPage = useRef(0);

  const loadMore = useCallback(async () => {
    if (loading.current || !hasMore) return; // already loading, or nothing left
    loading.current = true;
    setIsLoading(true);

    const page = await fetchPage(nextPage.current);
    nextPage.current += 1;

    setItems((current) => [...current, ...page.items]);
    setHasMore(page.hasMore);
    setIsLoading(false);
    loading.current = false;

    // Prefetch: start downloading the first images of this page now,
    // so they're in the cache before their cards scroll into view
    const urls = page.items
      .slice(0, PREFETCH_PER_PAGE)
      .map((item) => imageSource(item.image, imageWidth).uri);
    void Image.prefetch(urls, 'memory-disk');
  }, [hasMore, imageWidth]);

  // First page when the screen opens
  useEffect(() => {
    void loadMore();
    // only on mount: later pages come from onEndReached
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { items, isLoading, hasMore, loadMore };
}
