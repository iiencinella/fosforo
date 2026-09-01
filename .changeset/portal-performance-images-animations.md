---
"portal": patch
---

Performance: optimize card and cover images through `astro:assets` (WebP at 800/1600px instead of full-size ~1.8MB PNGs, cutting ~12MB from the home payload), replace the non-composited `box-shadow` glow animation on `.app-card`/`.card` with a composited `opacity` pulse on pseudo-elements, and hydrate the site header with `client:idle` instead of `client:load` to unblock the initial render. Adds `sharp` as a direct dependency so Astro can process images in the build.
