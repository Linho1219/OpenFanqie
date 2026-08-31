import { render, renderSvgPages, type RenderOptions, type SvgRenderOptions } from '@openfanqie/core'
import type { JpegExportOptions } from '@openfanqie/export-jpg'
import type { PdfExportOptions, VectorPdfPrintOptions } from '@openfanqie/export-pdf'

type LegacyRenderer = (dsl: string, options?: RenderOptions) => string
interface LegacyExporter {
  renderPages: (dsl: string, options?: SvgRenderOptions) => string[]
  exportJpegs: (pages: readonly string[], options?: JpegExportOptions) => Promise<Blob[]>
  exportPdf: (pages: readonly string[], options?: PdfExportOptions) => Promise<Blob>
  printPdf: (pages: readonly string[], options?: VectorPdfPrintOptions) => Promise<void>
}

declare global {
  interface Window {
    resolveOpenFanqieRenderer: (renderer: LegacyRenderer) => void
    resolveOpenFanqieExporter: (exporter: LegacyExporter) => void
  }
}

const decodeLegacyNewlines = (value: string): string => value.replaceAll('&hh&', '\n')

const normalizeOptions = (options: SvgRenderOptions): SvgRenderOptions => ({
  ...options,
  customCode:
    typeof options.customCode === 'string'
      ? decodeLegacyNewlines(options.customCode)
      : options.customCode,
})

const renderLegacyRequest: LegacyRenderer = (dsl, options = {}) =>
  render(decodeLegacyNewlines(dsl), options)

window.resolveOpenFanqieRenderer(renderLegacyRequest)
window.resolveOpenFanqieExporter({
  renderPages: (dsl, options = {}) =>
    renderSvgPages(decodeLegacyNewlines(dsl), normalizeOptions(options)),
  exportJpegs: async (pages, options = {}) => {
    const { svgPagesToJpegs } = await import('@openfanqie/export-jpg')
    return svgPagesToJpegs(pages, options)
  },
  exportPdf: async (pages, options = {}) => {
    const { svgPagesToPdf } = await import('@openfanqie/export-pdf')
    return svgPagesToPdf(pages, options)
  },
  printPdf: async (pages, options = {}) => {
    const { printSvgPagesToPdf } = await import('@openfanqie/export-pdf')
    return printSvgPagesToPdf(pages, options)
  },
})
