# Long lists: notes

Practice branch: `feature/long-list-lab`. Each section changes ONE thing and measures the effect
on the same generated data (seed 42), on the same phone (Infinix X6528, 4 GB RAM).

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
| 5000 | Display size | | | | | |
