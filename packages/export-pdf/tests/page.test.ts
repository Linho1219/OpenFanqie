import { describe, expect, it } from 'vitest'

import { pdfPageSize, readSvgDimensions } from '../src/page'

describe('readSvgDimensions', () => {
  it('reads unitless and pixel dimensions', () => {
    expect(readSvgDimensions('<svg width="1000" height="1415"></svg>')).toEqual({
      width: 1000,
      height: 1415,
    })
    expect(readSvgDimensions("<svg height='240px' width='320px'></svg>")).toEqual({
      width: 320,
      height: 240,
    })
  })

  it('uses the viewBox for relative or omitted dimensions', () => {
    expect(
      readSvgDimensions('<svg width="100%" height="100%" viewBox="0 0 840 1193"></svg>'),
    ).toEqual({ width: 840, height: 1193 })
    expect(readSvgDimensions('<svg viewBox="-10,-20,200,100"></svg>')).toEqual({
      width: 200,
      height: 100,
    })
  })

  it('rejects invalid or indeterminate dimensions with clear errors', () => {
    expect(() => readSvgDimensions('not svg')).toThrow(/<svg> root element/)
    expect(() => readSvgDimensions('<svg width="100%" height="100%"></svg>')).toThrow(
      /width and height or a valid viewBox/,
    )
    expect(() => readSvgDimensions('<svg viewBox="0 0 0 100"></svg>')).toThrow(/must be positive/)
  })
})

describe('pdfPageSize', () => {
  it('maps Open Fanqie presets to physical A-series paper sizes', () => {
    const a4 = pdfPageSize({ width: 1000, height: 1415 })
    const a5Landscape = pdfPageSize({ width: 1193, height: 840 })

    expect(a4[0]).toBeCloseTo(595.276, 3)
    expect(a4[1]).toBeCloseTo(841.89, 2)
    expect(a5Landscape[0]).toBeCloseTo(595.276, 3)
    expect(a5Landscape[1]).toBeCloseTo(419.528, 3)
  })

  it('converts arbitrary CSS pixels to PDF points and preserves orientation', () => {
    expect(pdfPageSize({ width: 96, height: 192 })).toEqual([72, 144])
    expect(pdfPageSize({ width: 192, height: 96 })).toEqual([144, 72])
  })

  it.each([
    { width: 0, height: 100 },
    { width: -1, height: 100 },
    { width: 100, height: Number.NaN },
    { width: Number.POSITIVE_INFINITY, height: 100 },
  ])('rejects invalid dimensions: $width x $height', (dimensions) => {
    expect(() => pdfPageSize(dimensions)).toThrow(RangeError)
  })
})
