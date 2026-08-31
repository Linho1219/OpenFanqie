# Open Fanqie PDF Export

Browser-side PDF export helpers for SVG pages produced by Open Fanqie. The preferred PDF path opens the browser print flow so the SVG notation remains vector. A raster `Blob` path is also available for workflows that need a programmatic PDF file.

## Installation

```bash
pnpm add @openfanqie/export-pdf
```

## Usage

### Vector print flow

```ts
import { printSvgPagesToPdf } from '@openfanqie/export-pdf'

await printSvgPagesToPdf(svgPages, {
  title: 'score-name',
})
```

`printSvgPagesToPdf` renders the SVG pages into an isolated print frame and calls the browser print dialog. This keeps Open Fanqie's path-based notation glyphs as vectors and lets the browser handle text fonts while producing the PDF. Browsers do not expose their "Save as PDF" result to page scripts, so this API resolves after opening the print flow and does not return a `Blob`.

The print page size is derived from the SVG dimensions. Open Fanqie's A4/A5 presets map to their exact physical paper sizes; other SVG dimensions use the standard 96 CSS px/in to 72 PDF pt/in conversion.

### Raster Blob flow

```ts
import { svgPagesToPdf } from '@openfanqie/export-pdf'

const pdf = await svgPagesToPdf(svgPages, {
  scale: 2,
  quality: 0.92,
  background: '#ffffff',
})

const url = URL.createObjectURL(pdf)
```

The function returns an `application/pdf` `Blob`. Download handling is intentionally left to the application. Revoke object URLs after use.

`scale` controls raster resolution without changing the PDF page size. Larger values improve print clarity but consume more memory. Text is rasterized, so the resulting PDF does not require the viewer to have the score's fonts installed.

At least one non-empty SVG page is required. Invalid SVG dimensions, rasterization failures, and PDF encoding failures reject the returned promise.
