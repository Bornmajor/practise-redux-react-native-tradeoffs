# Long lists: notes

Practice branch: `feature/long-list-lab`. Each section changes ONE thing and measures the effect
on the same generated data (seed 42), on the same phone (Infinix X6528, 4 GB RAM).

## Rules to remember

### Images: request only the size you display

> **When fetching images, request only the size you'll display.** If the server can resize, ask
> for that exact size: multiply the space the image takes on screen (in dp) by the phone's pixel
> density, round up (e.g. to the next 100 px), and send it as a URL parameter such as
> `?w=1000`. The phone then downloads, decodes and stores only the pixels it shows. **If the
> server can't resize, downscale while decoding** to save memory: use an image library like
> `expo-image` (its `allowDownscaling` is on by default), or `resizeMethod="resize"` on React
> Native's `Image` on Android. The full file is still downloaded, but it's decoded straight to the
> view's size, so it takes only the memory the screen needs. **Never rely on simply displaying a
> big image small:** it looks the same, but the phone still decodes and holds every pixel, at
> width × height × 4 bytes each (e.g. ~41 MB for a 2400×4267 image).

See sections 3 and 4 for the measurements behind this rule.

## Section 1: the naive baseline

**Setup:** `ScrollView` + `.map()`, React Native `<Image>`, full-resolution images
(1,200–2,400 px wide, 5 aspect ratios), cards of different heights.

**Code:** `src/features/list-lab/` (data generator, `NaiveCard`, `NaiveListScreen`).
Open it from the Subscriptions screen → **Lab**.

**Data:** generated in the app from a fixed seed, so every run has the same items. Images come
from [placehold.co](https://placehold.co)
(`https://placehold.co/{width}x{height}/{color}/ffffff/png?text={width}x{height}`): a solid-color
PNG at exactly the requested size, with the size written on it and one color per shape. The
phone needs internet.

[Lorem Picsum](https://picsum.photos) (real photos) was tried first, but its image server
answered `503 Service Unavailable` for anything wider than ~600 px, so every full-size image
failed. React Native's `<Image>` shows nothing when a download fails, so the cards were blank.

**Small file, big memory:** these PNGs are only ~30 KB to download, but memory depends on
**pixel dimensions, not file size**. To draw one, the phone decodes it into a width × height × 4
byte bitmap, so a 1600×2133 placeholder costs ~13.6 MB, the same as a photo of that size.

### Why it hurts

- **No virtualization:** every card is mounted at once, including thousands off screen.
- **Full-resolution images:** a bitmap's memory is width × height × 4 bytes, so a
  1600×2133 image uses ~13.6 MB even when shown ~360 px wide.
- **Slow first render:** the JS thread builds the whole list before anything appears.

### Different image sizes

Card height depends on the image. Options:

1. Wait for the image, then resize the card: layout jumps.
2. **Know the size in advance** (width/height in the data) and use `aspectRatio`: no jumps. ✅
3. Force one shape (crop): simplest, but loses content.

This section uses option 2 for layout, so the costs measured here are mounting and image memory.

### How to measure

| Metric | How |
|---|---|
| Render time | number shown on screen ("last render") |
| FPS | Developer menu → Perf Monitor, while scrolling fast (target: ~60) |
| Frames dropped | Perf Monitor → "N dropped so far": frames that missed their ~16 ms slot |
| Stutters | Perf Monitor → "N stutters (4+) so far": times 4 or more frames in a row were missed (a visible freeze) |
| Tap response | time from tapping a count button until the screen reacts |
| Total memory | `adb shell dumpsys meminfo <package>` → TOTAL PSS |
| JS heap | DevTools → Memory → heap snapshot |

Perf Monitor's counters add up from when it was opened, so reset them between runs by closing
and reopening Perf Monitor (or reloading the app).

`<package>` is the installed app: `com.bornmajor.basicreactnativeapp` for the current development
build, or `com.bornmajor.basicreactnativeapp.dev` after rebuilding with `npm run android:dev`.

Measure in the **same order** each time: open the screen, pick a count, wait, read the
render time, scroll to the bottom fast while watching FPS, then read memory.

Large counts may freeze the screen for a long time or make Android close the app for using too
much memory. Measure from small to large, so the numbers are captured before it fails.

### Results

Measured on the Infinix X6528 (development build, dev mode), with placehold.co images.

| Items | FPS while scrolling | Frames dropped | Stutters (4+) | Tap response | TOTAL PSS | Notes |
|---|---|---|---|---|---|---|
| 50 | ~10 | 724 | | | | already laggy scrolling at 50 items |
| 200 | | | | | | |
| 1000 | ~10 | 1,744 | 315 | | | laggy scroll, frequent freezes |
| 5000 | — | — | — | **> 30 s**, sometimes never | | taps feel ignored; unclear whether the screen updates at all |

**Summary:** with every card mounted and every image at full size, the app runs at **~10 FPS**
(target ~60) from just 50 items. Dropped frames grow with the item count (724 at 50 → 1,744 at
1000), with 315 multi-frame freezes at 1000. At 5000 the app is effectively unusable: the
JS thread is busy creating thousands of cards, so taps wait more than 30 seconds, or never
register at all.

Not yet recorded: render times and memory (TOTAL PSS). Later sections add them as each
optimization is measured.

## Section 2: a simple FlatList (default settings)

**Change from section 1:** `ScrollView` + `.map()` → `FlatList`. Same cards, images and data,
so the only difference is virtualization.

### What FlatList does by default

- `initialNumToRender: 10`: only ~10 cards are created when the list opens.
- `windowSize: 21`: cards within ~10 screens above and below stay mounted; the rest are
  unmounted, which lets their images be released.
- `maxToRenderPerBatch: 10`: new cards are added in batches of 10 while scrolling.

### Expected effect

- Render time and tap response stay roughly the same for 50 or 5000 items.
- Much lower memory: only mounted cards hold image bitmaps.
- Still visible: stutter while full-size images decode, blank areas on very fast scrolls,
  and images reloading when scrolling back.

### Results

Measured on the Infinix X6528 (development build, dev mode), same images as section 1.

| Items | FPS while scrolling | Frames dropped | Stutters (4+) | Tap response | TOTAL PSS | Notes |
|---|---|---|---|---|---|---|
| 50 | **~60** | 1,028 | 1 | | | |
| 200 | ~60 | 1,295 | 1 | | | |
| 1000 | ~60 | 1,550 | | | | |
| 5000 | ~60 | 2,826 | | much faster than section 1, but not instant | | |

The frame counters were read one after another without resetting Perf Monitor, so they are
**cumulative**: each run added about +267 (→ 200), +255 (→ 1000) and +1,276 (→ 5000) dropped
frames. Reset Perf Monitor between runs in later sections to get per-run numbers.

**Blank areas:** when scrolling fast, cards never appeared empty: titles and text were always
there. Only the **images** were blank until they finished loading and decoding.

**Summary:** virtualization alone took scrolling from **~10 to ~60 FPS**, and 5000 items went
from unusable (taps > 30 s) to responsive. What remains is the **images**: each card still
downloads and decodes a full-size image (up to 2400×4267 px for a ~360 px wide card), so images
show up late during fast scrolls and still cost frames. That is the next section's target.

## Section 3: request images at display size

**Change from section 2:** each card requests its image at the size it is **displayed**, instead
of the full-size source. A switch on the screen (**Full size / Display size**) compares both on
the same list. The card still uses React Native's basic `<Image>`.

**Code:** `data/image-url.ts` builds the URL for a requested width; `hooks/use-display-image-width.ts`
computes that width; the card shows `source W×H → loaded W×H`.

### Why size matters, even in a FlatList

To draw an image, the phone decodes it into a bitmap of **width × height × 4 bytes**. The file
size doesn't matter; the pixel dimensions do.

| Image | Bitmap memory |
|---|---|
| 2400 × 4267 (largest "tall" source) | ~41 MB |
| 1000 × 1778 (same shape, sized for the card) | ~7.1 MB (−83%) |

Decoding 41 MB of pixels also takes far longer than 7 MB, which is why images appeared late
during fast scrolls in section 2.

### What "display size" means

Layouts use **density-independent pixels (dp)**, but screens have more **physical pixels**:

```
physical pixels = dp × PixelRatio.get()
```

The card is the screen width minus 32 dp of padding. On a ~393 dp wide screen with a pixel ratio
around 2.75, that's ~990 physical pixels, so a ~1000 px image is already pixel-perfect. Anything
larger is wasted memory and decoding.

**Rounding up to buckets:** the width is rounded **up** to the next 100 px, so different screens and
rotations reuse the same URL (better cache hits) and the image is never blurry.

### When the server can't resize

placehold.co, Pexels, Unsplash and image CDNs (Cloudinary, imgix, Cloudflare Images) all resize on
request. When a server can't, the app has to downscale on the phone: React Native's `<Image>` on
Android has `resizeMethod="resize"`, and `expo-image` downsamples automatically. Downscaling on the
device still downloads the big file, so server resizing is better when available.

### Expected effect

- **Memory (TOTAL PSS): much lower in Display size.** The main number to watch.
- Images appear sooner during fast scrolls; fewer dropped frames.
- Download size: no visible difference with placehold.co (small PNGs either way); with real
  photos, display-size downloads would also be ~5–10× smaller.

### Results (fill in; reset Perf Monitor between runs)

Measure TOTAL PSS after scrolling ~100 cards in each mode.

| Items | Images | FPS while scrolling | Frames dropped | Stutters (4+) | Images blank on fast scroll? | TOTAL PSS |
|---|---|---|---|---|---|---|
| 1000 | Full size | | | | | |
| 1000 | Display size | | | | | |
| 5000 | Full size | | | | | |
| 5000 | Display size | ~60 | 1,286 | 1 | **no**: no empty or partly drawn images | |

**Result:** with display-size images, fast scrolling through 5000 items showed **no blank or
partly drawn images** (in section 2, images stayed blank during fast scrolls), with 1 stutter.

### Why images now keep up with fast scrolling

The list was already fast at mounting cards (section 2). What changed is the work **per image**,
which happens every time a card scrolls into view:

| Step | Full size (2400×4267) | Display size (1000×1778) |
|---|---|---|
| Pixels to decode | ~10.2 million | ~1.8 million (**~5.8× fewer**) |
| Bitmap memory | ~41 MB | ~7.1 MB |
| Upload to the GPU to draw | large texture; taller than the 4096 px limit many phone GPUs have, so it may need extra downscaling | small texture |
| Fits in the image memory cache | few images at a time; older ones are evicted and must be decoded again | many more stay cached, so scrolling back reuses them |

1. **Decoding is ~6× less work per image.** Image decoding runs on background threads, and each one
   now finishes before the card reaches the middle of the screen, so it's ready when you see it.
2. **Less memory pressure.** Smaller bitmaps leave room in the image cache and cause less garbage
   collection, which otherwise interrupts the app and drops frames.
3. **Faster drawing.** Smaller textures are quicker to send to the GPU, which happens on the
   rendering side, the part that must keep up with 60 FPS.

The download itself barely changed here (placehold.co PNGs are small at any size); with real
photos it would also be ~5–10× smaller, so images would arrive even sooner.

## Section 4: expo-image

**Change from section 3:** a third switch, **RN Image / expo-image**, draws the same cards with
`expo-image`. Same list, items and image sizes, so all four combinations can be compared:
{RN Image, expo-image} × {Full size, Display size}.

**Code:** `components/expo-image-card.tsx`; both cards share `components/card-details.tsx`.
The development build already includes expo-image (it came with the template), so no rebuild.

### Three ways to make a big image small

Think of ordering a poster for a small frame:

| Strategy | Poster analogy | Download | Decode / memory |
|---|---|---|---|
| 1. Scale on screen | order a huge poster, fold it | full size | full size |
| 2. Downscale while decoding | order a huge poster, cut it down on arrival | full size | small |
| 3. Resize on the server | order the right size | small | small |

Sections 1–2 used strategy 1; section 3 switched to strategy 3 (request the display size);
expo-image adds strategy 2 automatically as a safety net (`allowDownscaling`, on by default).

**Rule:** ask for the size you show (3); use downscaling (2) as a backup when the server
can't resize; scaling on screen alone (1) is the slowest.

### What expo-image adds

| Feature | Prop | Effect |
|---|---|---|
| Memory + disk cache | `cachePolicy="memory-disk"` (default `'disk'`) | decoded images reused instantly; files survive restarts |
| Automatic downscaling | `allowDownscaling` (default `true`) | big files decoded at the view's size |
| Placeholder | here: a semi-transparent shape color as background | never blank while loading |
| Transition | `transition={150}` | fades in instead of popping |
| Recycling support | `recyclingKey` | resets the view when a recycled row shows another item (FlashList) |
| Prefetch | `Image.prefetch(urls)` | load images before their cards appear |

**Placeholder strategies:** dominant color (free; used here), blurhash/thumbhash (a short string
the server computes, decoded to a blurry preview), or a tiny thumbnail loaded first.

### Expected effect

- While loading: colored placeholder, then a fade-in (RN Image: empty space).
- Scrolling back up: images instant from the memory cache.
- **Full size + expo-image:** much lighter than Full size + RN Image thanks to downscaling at
  decode, but the full file is still downloaded.

### Results (fill in; reset Perf Monitor between runs)

Scroll down ~100 cards fast, then back up to the top.

| Items | Images | Component | Frames dropped | Stutters (4+) | Blank while loading? | Scrolling back: images instant? | TOTAL PSS |
|---|---|---|---|---|---|---|---|
| 5000 | Full size | RN Image | | | | | |
| 5000 | Full size | expo-image | | | | | |
| 5000 | Display size | RN Image | | | | | |
| 5000 | Display size | expo-image | | | | | |
