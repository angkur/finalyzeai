## Why the Lovable favicon is still showing

Two reasons:

1. **`public/favicon.ico` still exists** and is the old Lovable default. Browsers automatically request `/favicon.ico` at the site root regardless of what's in `<link rel="icon">`, and that file wins.
2. **Browser/Google cache** — favicons are cached aggressively (often for days or weeks). Even after fixing the file, you'll see the old one until cache is cleared.

## Fix

### 1. Delete the old favicon.ico
Remove `public/favicon.ico` so only your FinalyzeAI `favicon.png` is served.

### 2. Add an explicit `.ico` fallback pointing to the PNG (optional but safer)
Some crawlers strictly request `.ico`. We'll keep the PNG as the source of truth and add proper sizes.

### 3. Add cache-busting query string in `index.html`
Change favicon links to `/favicon.png?v=2` so browsers re-fetch.

### 4. Update `index.html` favicon block
```html
<link rel="icon" type="image/png" sizes="32x32" href="/favicon.png?v=2" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon.png?v=2" />
<link rel="apple-touch-icon" href="/favicon.png?v=2" />
<link rel="shortcut icon" href="/favicon.png?v=2" />
```

## Files changed
- delete `public/favicon.ico`
- edit `index.html` (favicon links with `?v=2`)

## After deploying
- **Hard refresh** the preview/site: Ctrl+Shift+R (or clear cache)
- For Google Search results: Google re-crawls favicons on its own schedule (days–weeks). You can request re-indexing in Google Search Console to speed it up.
- The browser tab and bookmarks will update once the cache is cleared.
