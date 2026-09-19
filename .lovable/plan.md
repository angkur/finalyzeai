# Homepage SEO Copy and Sitemap Sync

## Goal
Improve the homepage’s topical depth for visitors and search crawlers, then ensure the existing sitemap covers all public benchmark, report, calculator, and guide pages.

## Changes
- Add a substantial, readable homepage section describing FinalyzeAI’s financial analysis, forecasting, benchmarking, fraud detection, document analysis, and free finance resources.
- Organize the copy with clear headings and internal links to AI Predict, Fin Predict, startup benchmarks, calculators, blog guides, glossary, FAQ, and user guide.
- Keep the copy useful to people rather than hiding or keyword-stuffing crawler-only text.
- Audit the current public routes and calculator/blog data, then update the existing static sitemap without changing its current mechanism.
- Add any missing indexable benchmark, report, and guide URLs; exclude private, account, admin, shared-result, and authentication pages.
- Remove only sitemap `lastmod` values that are not backed by a page-specific update date; preserve trustworthy page-specific dates.

## Verification
- Confirm all sitemap URLs match live public routes and the `finalyzeai.com` domain.
- Check the homepage text and links at desktop and mobile sizes.
- Confirm the preview builds without errors.

## Technical details
- Build the homepage copy as a focused React section using the existing semantic design tokens and link components.
- Keep `public/sitemap.xml` as the current hand-maintained sitemap; no generator or plugin migration.
