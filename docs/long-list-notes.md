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
| FPS | Developer menu → Perf Monitor, while scrolling fast |
| Total memory | `adb shell dumpsys meminfo <package>` → TOTAL PSS |
| JS heap | DevTools → Memory → heap snapshot |

`<package>` is the installed app: `com.bornmajor.basicreactnativeapp` for the current development
build, or `com.bornmajor.basicreactnativeapp.dev` after rebuilding with `npm run android:dev`.

Measure in the **same order** each time: open the screen, pick a count, wait, read the
render time, scroll to the bottom fast while watching FPS, then read memory.

Large counts may freeze the screen for a long time or make Android close the app for using too
much memory. Measure from small to large, so the numbers are captured before it fails.

### Results (fill in)

| Items | Render time | UI FPS while scrolling | JS FPS | TOTAL PSS | Notes |
|---|---|---|---|---|---|
| 50 | | | | | |
| 200 | | | | | |
| 1000 | | | | | |
| 5000 | | | | | |
