import { describe, expect, it } from 'vitest'

import { printSvgPagesToPdf, svgPagesToPdf } from '../src'

const svg = '<svg width="10" height="20" xmlns="http://www.w3.org/2000/svg"></svg>'

describe('svgPagesToPdf', () => {
  it('rejects missing and invalid pages before browser rasterization', async () => {
    await expect(svgPagesToPdf([])).rejects.toThrow(/At least one SVG page/)
    await expect(svgPagesToPdf([''])).rejects.toThrow(/page 1 is empty/)
    await expect(svgPagesToPdf([null as unknown as string])).rejects.toThrow(/must be a string/)
  })

  it('validates export options before browser rasterization', async () => {
    await expect(svgPagesToPdf([svg], { scale: 0 })).rejects.toThrow(/finite positive/)
    await expect(svgPagesToPdf([svg], { quality: 2 })).rejects.toThrow(/from 0 to 1/)
    await expect(svgPagesToPdf([svg], { background: '' })).rejects.toThrow(/non-empty CSS color/)
  })
})

describe('printSvgPagesToPdf', () => {
  it('rejects missing and invalid pages before opening the print frame', async () => {
    await expect(printSvgPagesToPdf([])).rejects.toThrow(/At least one SVG page/)
    await expect(printSvgPagesToPdf([''])).rejects.toThrow(/page 1 is empty/)
    await expect(printSvgPagesToPdf([null as unknown as string])).rejects.toThrow(
      /must be a string/,
    )
  })

  it('validates print options before opening the print frame', async () => {
    await expect(printSvgPagesToPdf([svg], { title: 123 as unknown as string })).rejects.toThrow(
      /title must be a string/,
    )
    await expect(printSvgPagesToPdf([svg], { printDelay: -1 })).rejects.toThrow(
      /finite non-negative/,
    )
  })

  it('can be imported in Node and reports the missing browser print APIs on use', async () => {
    await expect(printSvgPagesToPdf([svg])).rejects.toThrow(/browser environment/)
  })
})
