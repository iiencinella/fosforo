---
"portal": patch
---

Fix deployment 404: revert vercel.json build overrides (the Build Output API was being copied as flat static files) and set the canonical `site` to the production domain `https://www.fosforo.com.ar` (the previous value `fosforo.org` belongs to an unrelated site).
