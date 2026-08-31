import { pdfPageSize, readSvgDimensions } from './page'

const DEFAULT_PRINT_DELAY = 50
const PRINT_CLEANUP_DELAY = 60_000

export interface VectorPdfPrintOptions {
  /** Browser print document title. */
  title?: string
  /** Delay after layout and font loading before calling print(). @default 50 */
  printDelay?: number
}

interface PrintPageLayout {
  className: string
  pageName: string
  width: number
  height: number
}

function requirePages(pages: readonly string[]): void {
  if (!Array.isArray(pages)) throw new TypeError('SVG pages must be an array.')
  if (pages.length === 0) throw new RangeError('At least one SVG page is required.')
  pages.forEach((page, index) => {
    if (typeof page !== 'string') throw new TypeError(`SVG page ${index + 1} must be a string.`)
    if (page.trim() === '') throw new RangeError(`SVG page ${index + 1} is empty.`)
  })
}

function nonNegativeFinite(value: number, name: string): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be a finite non-negative number.`)
  }
  return value
}

function cssNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(5)))
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function normalizePrintOptions(options: VectorPdfPrintOptions): Required<VectorPdfPrintOptions> {
  const title = options.title ?? 'Open Fanqie PDF'
  const printDelay = nonNegativeFinite(options.printDelay ?? DEFAULT_PRINT_DELAY, 'printDelay')

  if (typeof title !== 'string') {
    throw new TypeError('title must be a string.')
  }

  return { title, printDelay }
}

function printPageLayout(svg: string, index: number): PrintPageLayout {
  const dimensions = readSvgDimensions(svg)
  const [width, height] = pdfPageSize(dimensions)
  return {
    className: `open-fanqie-print-page-${index + 1}`,
    pageName: `open-fanqie-page-${index + 1}`,
    width,
    height,
  }
}

function buildPrintCss(layouts: readonly PrintPageLayout[]): string {
  const firstLayout = layouts[0]
  const defaultPageRule =
    firstLayout === undefined
      ? ''
      : `@page { size: ${cssNumber(firstLayout.width)}pt ${cssNumber(firstLayout.height)}pt; margin: 0; }`
  const pageRules = layouts
    .map(
      ({ pageName, width, height }) =>
        `@page ${pageName} { size: ${cssNumber(width)}pt ${cssNumber(height)}pt; margin: 0; }`,
    )
    .join('\n')
  const pageStyles = layouts
    .map(
      ({ className, pageName, width, height }) =>
        `.${className} { page: ${pageName}; width: ${cssNumber(width)}pt; height: ${cssNumber(height)}pt; }`,
    )
    .join('\n')

  return /* css */ `${defaultPageRule}
${pageRules}
html,
body {
  margin: 0;
  padding: 0;
  background: #ffffff;
}
body {
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.open-fanqie-print-page {
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: #ffffff;
  break-after: page;
  page-break-after: always;
}
.open-fanqie-print-page:last-child {
  break-after: auto;
  page-break-after: auto;
}
.open-fanqie-print-page > svg {
  display: block;
  width: 100%;
  height: 100%;
}
@media screen {
  body {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: #e5e5e5;
  }
  .open-fanqie-print-page {
    box-shadow: 0 0 0 1px #cccccc;
  }
}
${pageStyles}`
}

function requirePrintDocument(): Document {
  if (typeof document === 'undefined' || document.body === null) {
    throw new Error('Vector PDF export requires a browser environment with DOM print APIs.')
  }
  return document
}

function writePrintDocument(
  printDocument: Document,
  pages: readonly string[],
  layouts: readonly PrintPageLayout[],
  title: string,
): void {
  const escapedTitle = escapeHtml(title)

  printDocument.open()
  printDocument.write(
    `<!doctype html><html><head><meta charset="utf-8"><title>${escapedTitle}</title></head><body></body></html>`,
  )
  printDocument.close()

  const style = printDocument.createElement('style')
  style.textContent = buildPrintCss(layouts)
  printDocument.head.append(style)

  pages.forEach((page, index) => {
    const layout = layouts[index]
    if (layout === undefined) {
      throw new Error(`Missing print layout for SVG page ${index + 1}.`)
    }

    const wrapper = printDocument.createElement('section')
    wrapper.className = `open-fanqie-print-page ${layout.className}`
    wrapper.innerHTML = page.replace(/^\s*<\?xml\b[^>]*>\s*/i, '')

    const svg = wrapper.firstElementChild
    if (svg === null || svg.tagName.toLowerCase() !== 'svg') {
      throw new Error(`SVG page ${index + 1} must contain an <svg> root element.`)
    }
    const svgRoot = svg as SVGSVGElement
    svgRoot.style.width = '100%'
    svgRoot.style.height = '100%'

    printDocument.body.append(wrapper)
  })
}

function waitForAnimationFrames(printWindow: Window): Promise<void> {
  return new Promise((resolve) => {
    const requestFrame = printWindow.requestAnimationFrame?.bind(printWindow)
    if (requestFrame === undefined) {
      printWindow.setTimeout(resolve, 0)
      return
    }
    requestFrame(() => requestFrame(() => resolve()))
  })
}

async function waitForPrintAssets(
  printDocument: Document,
  printWindow: Window,
  printDelay: number,
): Promise<void> {
  await printDocument.fonts?.ready
  await waitForAnimationFrames(printWindow)
  if (printDelay > 0) {
    await new Promise((resolve) => printWindow.setTimeout(resolve, printDelay))
  }
}

function schedulePrintCleanup(iframe: HTMLIFrameElement, printWindow: Window): void {
  let cleaned = false
  const cleanup = (): void => {
    if (cleaned) return
    cleaned = true
    iframe.remove()
  }

  printWindow.addEventListener('afterprint', cleanup, { once: true })
  window.setTimeout(cleanup, PRINT_CLEANUP_DELAY)
}

/**
 * Opens the browser print flow for SVG pages.
 *
 * Browser printing preserves Open Fanqie's SVG paths as vectors and delegates text font embedding
 * to the browser's PDF backend. This does not return a PDF Blob because browsers do not expose
 * their "Save as PDF" output to page scripts.
 */
export async function printSvgPagesToPdf(
  pages: readonly string[],
  options: VectorPdfPrintOptions = {},
): Promise<void> {
  requirePages(pages)
  const layouts = pages.map((page, index) => printPageLayout(page, index))
  const { title, printDelay } = normalizePrintOptions(options)
  const hostDocument = requirePrintDocument()
  const iframe = hostDocument.createElement('iframe')

  iframe.title = title
  iframe.setAttribute('aria-hidden', 'true')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  iframe.style.visibility = 'hidden'
  hostDocument.body.append(iframe)

  const printDocument = iframe.contentDocument
  const printWindow = iframe.contentWindow
  if (printDocument === null || printWindow === null) {
    iframe.remove()
    throw new Error('Browser failed to create a print frame.')
  }

  try {
    writePrintDocument(printDocument, pages, layouts, title)
    await waitForPrintAssets(printDocument, printWindow, printDelay)
    if (typeof printWindow.print !== 'function') {
      throw new Error('Vector PDF export requires window.print support.')
    }
    schedulePrintCleanup(iframe, printWindow)
    printWindow.focus()
    printWindow.print()
  } catch (error) {
    iframe.remove()
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to open the vector PDF print flow.', { cause: error })
  }
}
