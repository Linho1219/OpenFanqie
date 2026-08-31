export interface PageDimensions {
  width: number
  height: number
}

export type PdfPageSize = [width: number, height: number]

const CSS_PIXELS_PER_INCH = 96
const PDF_POINTS_PER_INCH = 72
const MILLIMETERS_PER_INCH = 25.4
const ABSOLUTE_UNIT_FACTORS: Readonly<Record<string, number>> = {
  '': 1,
  px: 1,
  in: CSS_PIXELS_PER_INCH,
  cm: CSS_PIXELS_PER_INCH / 2.54,
  mm: CSS_PIXELS_PER_INCH / MILLIMETERS_PER_INCH,
  q: CSS_PIXELS_PER_INCH / 101.6,
  pt: CSS_PIXELS_PER_INCH / PDF_POINTS_PER_INCH,
  pc: 16,
}
const RELATIVE_UNITS = new Set(['%', 'em', 'rem', 'ex', 'ch', 'vw', 'vh', 'vmin', 'vmax'])
const SVG_LENGTH_PATTERN = /^([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)\s*([a-z%]*)$/i

const points = (millimeters: number): number =>
  (millimeters * PDF_POINTS_PER_INCH) / MILLIMETERS_PER_INCH

const OPEN_FANQIE_PAGE_SIZES: ReadonlyArray<{
  svg: PdfPageSize
  pdf: PdfPageSize
}> = [
  { svg: [1000, 1415], pdf: [points(210), points(297)] },
  { svg: [840, 1193], pdf: [points(148), points(210)] },
  { svg: [1415, 1000], pdf: [points(297), points(210)] },
  { svg: [1193, 840], pdf: [points(210), points(148)] },
]

function readRootAttributes(svg: string): Map<string, string> {
  const root = /<svg\b[^>]*>/i.exec(svg)?.[0]
  if (root === undefined) {
    throw new Error('Expected a complete SVG document with an <svg> root element')
  }

  const attributes = new Map<string, string>()
  const pattern = /([A-Za-z_:][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g
  for (const match of root.matchAll(pattern)) {
    const name = match[1]
    const value = match[2] ?? match[3] ?? match[4]
    if (name !== undefined && value !== undefined) {
      attributes.set(name.toLowerCase(), value.trim())
    }
  }
  return attributes
}

function readAbsoluteLength(value: string | undefined, attribute: string): number | undefined {
  if (value === undefined || value === '' || value.toLowerCase() === 'auto') {
    return undefined
  }

  const match = SVG_LENGTH_PATTERN.exec(value)
  if (match === null) {
    throw new Error(`Invalid SVG ${attribute} value: ${JSON.stringify(value)}`)
  }

  const numberText = match[1]
  const unit = (match[2] ?? '').toLowerCase()
  if (numberText === undefined) {
    throw new Error(`Invalid SVG ${attribute} value: ${JSON.stringify(value)}`)
  }
  if (RELATIVE_UNITS.has(unit)) {
    return undefined
  }

  const factor = ABSOLUTE_UNIT_FACTORS[unit]
  if (factor === undefined) {
    throw new Error(`Unsupported SVG ${attribute} unit: ${JSON.stringify(unit)}`)
  }

  const length = Number(numberText) * factor
  if (!Number.isFinite(length) || length <= 0) {
    throw new Error(`SVG ${attribute} must resolve to a positive finite length`)
  }
  return length
}

function readViewBox(value: string | undefined): PageDimensions | undefined {
  if (value === undefined || value === '') {
    return undefined
  }

  const parts = value.trim().split(/[\s,]+/)
  if (parts.length !== 4) {
    throw new Error(`Invalid SVG viewBox value: ${JSON.stringify(value)}`)
  }

  const numbers = parts.map(Number)
  const width = numbers[2]
  const height = numbers[3]
  if (
    numbers.some((number) => !Number.isFinite(number)) ||
    width === undefined ||
    height === undefined
  ) {
    throw new Error(`Invalid SVG viewBox value: ${JSON.stringify(value)}`)
  }
  if (width <= 0 || height <= 0) {
    throw new Error('SVG viewBox width and height must be positive')
  }
  return { width, height }
}

export function readSvgDimensions(svg: string): PageDimensions {
  if (typeof svg !== 'string') {
    throw new TypeError('SVG source must be a string')
  }
  if (svg.trim() === '') {
    throw new Error('SVG source cannot be empty')
  }

  const attributes = readRootAttributes(svg)
  const width = readAbsoluteLength(attributes.get('width'), 'width')
  const height = readAbsoluteLength(attributes.get('height'), 'height')

  if (width !== undefined && height !== undefined) {
    return { width, height }
  }

  const viewBox = readViewBox(attributes.get('viewbox'))
  if (viewBox !== undefined) {
    if (width !== undefined) {
      return { width, height: (width * viewBox.height) / viewBox.width }
    }
    if (height !== undefined) {
      return { width: (height * viewBox.width) / viewBox.height, height }
    }
    return viewBox
  }

  throw new Error('SVG must define positive width and height or a valid viewBox')
}

export function pdfPageSize(dimensions: PageDimensions): PdfPageSize {
  const { width, height } = dimensions
  if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) {
    throw new RangeError('SVG page dimensions must be finite positive numbers.')
  }

  const preset = OPEN_FANQIE_PAGE_SIZES.find(({ svg }) => svg[0] === width && svg[1] === height)
  if (preset !== undefined) return [...preset.pdf]

  const pointsPerPixel = PDF_POINTS_PER_INCH / CSS_PIXELS_PER_INCH
  return [width * pointsPerPixel, height * pointsPerPixel]
}
