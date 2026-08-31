# Open Fanqie PDF Export

Browser print PDF export for SVG pages produced by Open Fanqie. The package opens the browser print flow so Open Fanqie's path-based notation remains vector and text font handling stays with the browser PDF backend.

## Installation

```bash
pnpm add @openfanqie/export-pdf
```

## Usage

```ts
import { printSvgPagesToPdf } from '@openfanqie/export-pdf'

await printSvgPagesToPdf(svgPages, {
  title: 'score-name',
})
```

`printSvgPagesToPdf` renders the SVG pages into an isolated print frame and calls the browser print dialog. This keeps Open Fanqie's path-based notation glyphs as vectors and lets the browser handle text fonts while producing the PDF. Browsers do not expose their "Save as PDF" result to page scripts, so this API resolves after opening the print flow and does not return a `Blob`.

The print page size is derived from the SVG dimensions. Open Fanqie's A4/A5 presets map to their exact physical paper sizes; other SVG dimensions use the standard 96 CSS px/in to 72 PDF pt/in conversion.
