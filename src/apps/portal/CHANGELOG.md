# portal

## 1.0.3

### Patch Changes

- a8760fd: Fix deployment 404: revert vercel.json build overrides (the Build Output API was being copied as flat static files) and set the canonical `site` to the production domain `https://www.fosforo.com.ar` (the previous value `fosforo.org` belongs to an unrelated site).
- b9f55b2: Build the shared UI package before compiling the portal so Vercel can resolve its workspace exports from a clean checkout.
- c6697ef: Performance: optimize card and cover images through `astro:assets` (WebP at 800/1600px instead of full-size ~1.8MB PNGs, cutting ~12MB from the home payload), replace the non-composited `box-shadow` glow animation on `.app-card`/`.card` with a composited `opacity` pulse on pseudo-elements, and hydrate the site header with `client:idle` instead of `client:load` to unblock the initial render. Adds `sharp` as a direct dependency so Astro can process images in the build.

## 1.0.2

### Patch Changes

- 0e92e92: Prevent Vitest files from being treated as Astro API routes during the portal build.

## 1.0.1

### Patch Changes

- Updated dependencies [1434aae]
  - @repo/ui@0.1.0
