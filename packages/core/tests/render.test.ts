import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

import { render, renderSvgPages } from '../src'

const compatibilityScore = readFileSync(new URL('./fixtures/test.jps', import.meta.url), 'utf8')

function decodeXmlAttribute(value: string): string {
  return value
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&')
}

function uses(svg: string, line: number): Array<{ x: number; code: string }> {
  const expression = new RegExp(
    `<use x="([^"]+)"[^>]+notepos="0_${line}_[^"]+"[^>]+code="([^"]+)"[^>]*>`,
    'g',
  )
  return [...svg.matchAll(expression)].map((match) => ({
    x: Number(match[1]),
    code: decodeXmlAttribute(match[2] ?? ''),
  }))
}

function elementCount(svg: string, name: 'use' | 'text' | 'line' | 'path'): number {
  const body = svg.replace(/<defs>[\s\S]*?<\/defs>/, '')
  return body.match(new RegExp(`<${name}\\b`, 'g'))?.length ?? 0
}

interface GraceUse {
  x: number
  y: number
  href: string
}

interface GraceLine {
  x1: number
  y1: number
  x2: number
  y2: number
}

function graceDefinition(svg: string, id: string): string {
  const body = svg.match(new RegExp(`<g id="${id}">([\\s\\S]*?)<\\/g>`))?.[1]
  if (body === undefined) throw new Error(`Missing grace-note definition '${id}'.`)
  return body
}

function graceUses(body: string): GraceUse[] {
  return [...body.matchAll(/<use x="([^"]+)" y="([^"]+)" xlink:href="#([^"]+)"/g)].map((match) => ({
    x: Number(match[1]),
    y: Number(match[2]),
    href: match[3] ?? '',
  }))
}

function graceLines(body: string): GraceLine[] {
  return [...body.matchAll(/<line x1="([^"]+)" y1="([^"]+)" x2="([^"]+)" y2="([^"]+)"/g)]
    .map((match) => ({
      x1: Number(match[1]),
      y1: Number(match[2]),
      x2: Number(match[3]),
      y2: Number(match[4]),
    }))
    .sort((left, right) => left.y1 - right.y1 || left.x1 - right.x1)
}

function graceReferences(svg: string): Array<GraceUse & { id: string }> {
  const body = svg.replace(/<defs>[\s\S]*?<\/defs>/, '')
  return [...body.matchAll(/<use x="([^"]+)" y="([^"]+)" xlink:href="#((?:qy|hy)[^"]+)"/g)].map(
    (match) => ({
      x: Number(match[1]),
      y: Number(match[2]),
      href: match[3] ?? '',
      id: match[3] ?? '',
    }),
  )
}

describe('render', () => {
  it('renders standalone SVG pages without the legacy response protocol', () => {
    const diagnostics: string[] = []
    const pages = renderSvgPages(`Q: 1 |\n[fenye]\nQ: 2 |`, {
      customCode: '<text id="first">甲</text>[fenye]<text id="second">乙</text>',
      onDiagnostics: (items) => diagnostics.push(...items.map(({ code }) => code)),
    })

    expect(pages).toHaveLength(2)
    expect(pages.every((page) => page.startsWith('<svg') && page.endsWith('</svg>'))).toBe(true)
    expect(pages.every((page) => page.includes('xmlns:xlink="http://www.w3.org/1999/xlink"'))).toBe(
      true,
    )
    expect(pages.join('')).not.toContain('[fenye]')
    expect(pages.join('')).not.toContain('noRedraw')
    expect(pages[0]).toContain('<text id="first">甲</text>')
    expect(pages[1]).toContain('<text id="second">乙</text>')
    expect(diagnostics).toEqual([])
    expect(renderSvgPages('')).toEqual([])
    expect(render('Q: 1 |')).not.toMatch(/^<svg[^>]+xmlns:xlink/)
  })

  it('escapes DSL commands in standalone SVG code attributes', () => {
    const [page] = renderSvgPages(`Q: 1&zkh |/&sbf`)

    expect(page).toContain('code="1&amp;zkh"')
    expect(page).toContain('code="|n&amp;sbf"')
    expect(page).not.toMatch(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[\da-f]+;)/i)
  })

  it('matches legacy empty input and nonstandard page selection', () => {
    expect(render('')).toBe('')
    expect(render(' ')).toMatch(/^<svg/)
    expect(render(`Q: 1\n[fenye]\nQ: 2`, { pageNum: -2 })).toBe('noRedraw[fenye]noRedraw[fenye]')
  })

  it('falls back from inherited page names and tolerates missing legacy glyphs', () => {
    for (const page of ['toString', 'constructor', '__proto__']) {
      expect(render('Q: 1 |', { pageConfig: JSON.stringify({ page }) })).toMatch(
        /^<svg width="1000" height="1415"/,
      )
    }

    expect(render('Q: 1 |', { pageConfig: JSON.stringify({ shuzi_font: 'z' }) })).toContain(
      'xlink:href="#shuzi_z_1"',
    )
    expect(render('Q: 1&constructor |')).not.toContain('[object Object]')
    expect(render('Q: 1 |&constructor')).not.toContain('[object Object]')
  })

  it('renders the full compatibility score without diagnostics', () => {
    const diagnostics: string[] = []
    const output = render(compatibilityScore, {
      onDiagnostics: (items) => diagnostics.push(...items.map(({ code }) => code)),
    })
    const pages = output.split('[fenye]').filter(Boolean)

    expect(diagnostics).toEqual([])
    expect(pages).toHaveLength(3)
    expect(pages[0]).toContain('>时　忆</text>')
    expect(pages[0]).toContain('<g id="changyinfu1"')
    expect(pages[2]).toContain('<g id="yanchang"')
    expect(pages[1]).not.toContain('>时　忆</text>')
    expect(
      pages.map((page) => [
        elementCount(page, 'use'),
        elementCount(page, 'text'),
        elementCount(page, 'line'),
        elementCount(page, 'path'),
      ]),
    ).toEqual([
      [391, 141, 68, 11],
      [692, 359, 203, 10],
      [603, 276, 141, 20],
    ])
    expect(pages[0]).toContain('x="141" y="266" xlink:href="#shuzi_b_0"')
    expect(pages[1]).toContain('x="103" y="130" xlink:href="#shuzi_b_6"')
    expect(pages[2]).toContain('x="103" y="130" xlink:href="#shuzi_b_0"')
  })

  it('matches legacy page-setting interactions', () => {
    const svg = render(
      `
B: 标题
Z: 甲
Z: 乙
J: 80
Q1: (y1/ 2/ 3/) |
C1: 一二三
Q2: 1 |
C2: 一

Q1: 1 |
C1: 一
Q2: 1 |
C2: 一
`,
      {
        pageConfig: {
          biaoti_size: 24,
          geci_font: 'KaiTi',
          body_margin_top: 27,
          height_shengbu: 27,
          lianyinxian_type: 2,
        },
      },
    )

    expect(svg).toContain('font-size="19" font-family="KaiTi">甲</text>')
    expect(svg).toContain('font-size="19" font-family="KaiTi">乙</text>')
    expect(svg).toContain('xlink:href="#lianyinxian_zuo"')
    expect(svg).not.toContain('<g id="lianyin_shuzi_3"')
    expect(svg).not.toContain('<path d="M ')
  })

  it('bottom-aligns the last four author lines with the mode and tempo block', () => {
    const source = `
B: 时间都去哪了
B: 电视剧《老牛家的战争》主题曲
Z: 第一行
Z: 第二行
Z: 第三行
Z: 第四行
Z: 第五行
D: F
P: 4/4
J: 80
Q: 1 |
`
    const authors = (svg: string) =>
      [...svg.matchAll(/<text\b[^>]*\by="([^"]+)"[^>]*>(第[一二三四五]行)<\/text>/g)].map(
        (match) => ({ text: match[2], y: Number(match[1]) }),
      )

    expect(authors(render(source))).toEqual([
      { text: '第五行', y: 226 },
      { text: '第四行', y: 205 },
      { text: '第三行', y: 184 },
      { text: '第二行', y: 163 },
    ])
    expect(authors(render(source.replace('J: 80\n', '')))).toEqual([
      { text: '第五行', y: 196 },
      { text: '第四行', y: 175 },
      { text: '第三行', y: 154 },
      { text: '第二行', y: 133 },
    ])
  })

  it('renders all meters from the final P header and one tempo of each kind', () => {
    const svg = render(`
B: 标题
P: 4/4
P: 3/4 (2/4 1/4)
J: 80
J: 120
J: 欢快地
J: 抒情地
Q: 1 |
`)

    expect(svg.match(/xlink:href="#paihao_xian"/g)).toHaveLength(3)
    expect(svg).toContain('<g id="paihao_kuohu_zuo"')
    expect(svg).toContain('<g id="paihao_kuohu_you"')
    expect(svg).toContain('xlink:href="#paihao_kuohu_zuo"')
    expect(svg).toContain('xlink:href="#paihao_kuohu_you"')
    expect(svg).toContain('data-jiepai="80"')
    expect(svg).not.toContain('data-jiepai="120"')
    expect(svg).toContain('>欢快地</text>')
    expect(svg).not.toContain('>抒情地</text>')
  })

  it.each([
    ['#C', 'bianyinfu_sheng', 'c'],
    ['$B', 'bianyinfu_jiang', 'b'],
    ['C#', 'bianyinfu_sheng', 'c'],
    ['B$', 'bianyinfu_jiang', 'b'],
  ])('renders accidental mode %s with legacy placement', (mode, accidental, letter) => {
    const svg = render(`B: 标题\nD: ${mode}\nP: 4/4\nQ: 1 |`)

    expect(svg).toContain(`x="125" y="176" xlink:href="#${accidental}"`)
    expect(svg).toContain(
      `x="125" y="176" xlink:href="#diaohao_zimu_${letter}" code="${mode}" data-diaohao="true"`,
    )
    expect(svg).toContain('x="135" y="176" xlink:href="#paihao_xian"')
  })

  it('does not render metadata header fields without a B line', () => {
    const svg = render(`D: C\nP: 4/4\nJ: 80\nZ: 作者\nQ: 1 |`)

    expect(svg).not.toContain('xlink:href="#diaohao_fu"')
    expect(svg).not.toContain('xlink:href="#paihao_xian"')
    expect(svg).not.toContain('xlink:href="#jiepaifu"')
    expect(svg).not.toContain('>作者</text>')
    expect(svg).toContain('x="83" y="130" xlink:href="#shuzi_b_1"')
  })

  it('keeps barline annotations in code without displaying ordinary text', () => {
    const svg = render(`Q: 1 |"p:2 / 4" 2 |"备注" 3 |`)

    expect(svg).toContain('code="|&apos;p:2/4&apos;"')
    expect(svg).toContain('code="|&apos;备注&apos;"')
    expect(svg).not.toContain('>备注</text>')
  })

  it('renders consecutive note annotations as one interlinear label', () => {
    const svg = render(`Q: 1"吉他solo""转E调" 2 |`)

    expect(svg).toContain(
      'x="77" y="106" dy="4.026" fill="#303030" font-size="12" font-family="Microsoft YaHei" xml:space="preserve">吉他solo转E调</text>',
    )
    expect(svg).not.toContain('>转E调</text>')
  })

  it('renders annotations on sustains and inline accompaniment notes', () => {
    const sustain = render(`Q: 6 -"转F调" |`)
    expect(sustain).toContain(
      'x="114.5" y="106" dy="4.026" fill="#303030" font-size="12" font-family="Microsoft YaHei" xml:space="preserve">转F调</text>',
    )

    const accompaniment = render(`Q: 1 {bz 2/"键盘"} 3 |`)
    expect(accompaniment).toContain(
      'x="114.5" y="106" dy="6.026" fill="#303030" font-size="12" font-family="Microsoft YaHei" xml:space="preserve">键盘</text>',
    )

    const terminalAccompaniment = render(`Q: 1 {bz 0 0 6/ 2/ 2// 3// 5/"键盘"} 6 |`)
    expect(terminalAccompaniment).toContain('>键盘</text>')
  })

  it('matches the observed legacy spacing constants', () => {
    const svg = render(`
Q: 1 2 3 4 |
Q: 1/ 2/ 3/ 4/ |
Q: 1// 2// 3// 4// |
`)

    expect(uses(svg, 1)).toEqual([
      { x: 83, code: '1' },
      { x: 120.5, code: '2' },
      { x: 158, code: '3' },
      { x: 195.5, code: '4' },
      { x: 230.5, code: '|' },
    ])
    expect(uses(svg, 2)).toEqual([
      { x: 83, code: '1/' },
      { x: 108, code: '2/' },
      { x: 145.5, code: '3/' },
      { x: 170.5, code: '4/' },
      { x: 205.5, code: '|' },
    ])
    expect(uses(svg, 3)).toEqual([
      { x: 83, code: '1//' },
      { x: 108, code: '2//' },
      { x: 133, code: '3//' },
      { x: 158, code: '4//' },
      { x: 193, code: '|' },
    ])
  })

  it('keeps hidden placeholder notes in the positioned SVG stream', () => {
    const svg = render(`Q: 8 1 |`)

    expect(svg).toContain('<g id="shuzi_null"')
    expect(svg).toContain(
      'x="83" y="130" xlink:href="#shuzi_null" time="0" audio="" notepos="0_1_1" code="8"',
    )
  })

  it('numbers grace-note definitions by page-local source order', () => {
    const svg = render(`Q: 1[1/] 2[2/] 3[h3/] |\n[fenye]\nQ: 1[1/] |`)
    const pages = svg.split('[fenye]').filter(Boolean)

    expect(pages[0]).toContain('<g id="qy0_0"')
    expect(pages[0]).toContain('<g id="qy1_0"')
    expect(pages[0]).toContain('<g id="hy2_0"')
    expect(pages[1]).toContain('<g id="qy0_1"')
  })

  it('uses grace-sized pitch modifiers and lifts the curve above double beams', () => {
    const svg = render(`Q1: 1[2'/3,/] 1[3#,] 1[h2$']`)
    const beforeDouble = graceDefinition(svg, 'qy0_0')
    const beforeAccidental = graceDefinition(svg, 'qy1_0')
    const afterAccidental = graceDefinition(svg, 'hy2_0')

    expect(graceLines(beforeDouble)).toEqual([
      { x1: -3.5, y1: -10.5, x2: 10.5, y2: -10.5 },
      { x1: -3.5, y1: -8.5, x2: 10.5, y2: -8.5 },
    ])
    expect(graceUses(beforeDouble)).toEqual(
      expect.arrayContaining([
        { x: 0, y: -17, href: 'yiyin_shuzi_2' },
        { x: 0, y: -18, href: 'yiyin_yingao_gao' },
        { x: 7, y: -17, href: 'yiyin_shuzi_3' },
        { x: 7, y: -10, href: 'yiyin_yingao_di' },
        { x: 3, y: -11, href: 'yiyinxian_qian' },
      ]),
    )
    expect(graceUses(beforeDouble)).toHaveLength(5)

    expect(graceLines(beforeAccidental)).toEqual([{ x1: 1.5, y1: -10.5, x2: 8.5, y2: -10.5 }])
    expect(graceUses(beforeAccidental)).toEqual(
      expect.arrayContaining([
        { x: 5, y: -17, href: 'yiyin_shuzi_3' },
        { x: 5, y: -19, href: 'yiyin_bianyinfu_sheng' },
        { x: 5, y: -12, href: 'yiyin_yingao_di' },
        { x: 4.5, y: -13, href: 'yiyinxian_qian' },
      ]),
    )
    expect(graceUses(beforeAccidental)).toHaveLength(4)

    expect(graceLines(afterAccidental)).toEqual([{ x1: 1.5, y1: -10.5, x2: 8.5, y2: -10.5 }])
    expect(graceUses(afterAccidental)).toEqual(
      expect.arrayContaining([
        { x: 5, y: -17, href: 'yiyin_shuzi_2' },
        { x: 5, y: -19, href: 'yiyin_bianyinfu_jiang' },
        { x: 5, y: -18, href: 'yiyin_yingao_gao' },
        { x: 4.5, y: -17, href: 'yiyinxian_hou' },
      ]),
    )
    expect(graceUses(afterAccidental)).toHaveLength(4)

    expect(uses(svg, 1)).toEqual([
      { x: 97, code: '1' },
      { x: 146.5, code: '1' },
      { x: 184, code: '1' },
      { x: 231, code: '|w' },
    ])
    expect(graceReferences(svg)).toEqual([
      { x: 78, y: 130, href: 'qy0_0', id: 'qy0_0' },
      { x: 129.5, y: 130, href: 'qy1_0', id: 'qy1_0' },
      { x: 199, y: 130, href: 'hy2_0', id: 'hy2_0' },
    ])
  })

  it('segments mixed grace durations, caps beams at three, and renders a natural sign', () => {
    const svg = render(`Q: 1[2= 3/ 4// 5///] |`)
    const grace = graceDefinition(svg, 'qy0_0')

    expect(graceLines(grace)).toEqual([
      { x1: 1.5, y1: -10.5, x2: 29.5, y2: -10.5 },
      { x1: 8.5, y1: -8.5, x2: 29.5, y2: -8.5 },
      { x1: 15.5, y1: -6.5, x2: 29.5, y2: -6.5 },
    ])
    expect(graceUses(grace)).toEqual(
      expect.arrayContaining([
        { x: 5, y: -17, href: 'yiyin_shuzi_2' },
        { x: 5, y: -19, href: 'yiyin_bianyinfu_huanyuan' },
        { x: 12, y: -17, href: 'yiyin_shuzi_3' },
        { x: 19, y: -17, href: 'yiyin_shuzi_4' },
        { x: 26, y: -17, href: 'yiyin_shuzi_5' },
      ]),
    )
    expect(graceLines(grace)).toHaveLength(3)
  })

  it('moves a grace curve below the deepest beam and lower octave in the group', () => {
    const svg = render(`Q: 1[2, 3//] |`)
    const grace = graceDefinition(svg, 'qy0_0')

    expect(graceUses(grace)).toEqual(
      expect.arrayContaining([
        { x: 0, y: -12, href: 'yiyin_yingao_di' },
        { x: 3, y: -9, href: 'yiyinxian_qian' },
      ]),
    )
  })

  it('splits non-contiguous higher grace beams into separate runs', () => {
    const svg = render(`Q: 1[2// 3 4//] |`)

    expect(graceLines(graceDefinition(svg, 'qy0_0'))).toEqual([
      { x1: -3.5, y1: -10.5, x2: 17.5, y2: -10.5 },
      { x1: -3.5, y1: -8.5, x2: 3.5, y2: -8.5 },
      { x1: 10.5, y1: -8.5, x2: 17.5, y2: -8.5 },
      { x1: -3.5, y1: -6.5, x2: 3.5, y2: -6.5 },
      { x1: 10.5, y1: -6.5, x2: 17.5, y2: -6.5 },
    ])
  })

  it('aligns other voices around an after-grace reservation', () => {
    const svg = render(`Q1: 1[h2] 2 |\nQ2: 3 4 |`)

    expect(uses(svg, 1)).toEqual([
      { x: 103, code: '1' },
      { x: 147.5, code: '2' },
      { x: 182.5, code: '|' },
    ])
    expect(uses(svg, 2)).toEqual([
      { x: 103, code: '3' },
      { x: 147.5, code: '4' },
      { x: 182.5, code: '|' },
    ])
  })

  it('aligns voices at beat starts without distributing notes within a beat', () => {
    const svg = render(`
Q1: 1// 2// 3// 4// |
Q2: 1/ 2/ |
`)

    expect(uses(svg, 1)).toEqual([
      { x: 103, code: '1//' },
      { x: 128, code: '2//' },
      { x: 153, code: '3//' },
      { x: 178, code: '4//' },
      { x: 213, code: '|' },
    ])
    expect(uses(svg, 2)).toEqual([
      { x: 103, code: '1/' },
      { x: 128, code: '2/' },
      { x: 213, code: '|' },
    ])
  })

  it('keeps later columns aligned when one voice has a dotted note', () => {
    const svg = render(`
Q1: 1. 2/ 3 4 |
Q2: 5 6 7 0 |
`)

    expect(uses(svg, 1)).toEqual([
      { x: 103, code: '1.' },
      { x: 153, code: '2/' },
      { x: 190.5, code: '3' },
      { x: 228, code: '4' },
      { x: 263, code: '|' },
    ])
    expect(uses(svg, 2)).toEqual([
      { x: 103, code: '5' },
      { x: 153, code: '6' },
      { x: 190.5, code: '7' },
      { x: 228, code: '0' },
      { x: 263, code: '|' },
    ])
  })

  it('groups underlines by quarter-note time without treating rests as boundaries', () => {
    const withRests = render(`Q: 3/ 4// 4// 0/ 5// 4// 0/ 3/ 2/ 1/ |`)
    const withNotes = render(`Q: 3/ 4// 4// 6/ 5// 4// 7/ 3/ 2/ 1/ |`)
    const beams = (svg: string): string[] =>
      [...svg.matchAll(/<line x1="([^"]+)"[^>]+x2="([^"]+)"[^>]+data-type="jianshixian"/g)].map(
        (match) => `${match[1]}:${match[2]}`,
      )

    expect(beams(withRests)).toEqual(beams(withNotes))
    expect(beams(withRests)).toEqual([
      '77:139',
      '102:139',
      '164.5:226.5',
      '189.5:226.5',
      '252:289',
      '314.5:351.5',
    ])
  })

  it('moves the voice-brace column to the first sbf boundary', () => {
    const svg = render(`
Q1: 1 2 |&sbf 3 4 |
Q2: 8 8 |* 5 6 |
`)

    expect(uses(svg, 1)).toEqual([
      { x: 83, code: '1' },
      { x: 120.5, code: '2' },
      { x: 210.5, code: '3' },
      { x: 248, code: '4' },
      { x: 155.5, code: '|&sbf' },
      { x: 283, code: '|' },
    ])
    expect(svg).toContain('x="210.5" y="130" xlink:href="#shengbufu_shang"')
    expect(svg).toContain('x1="185" y1="123.5"')
    expect(svg).toContain('x="155.5" y="208" xlink:href="#xiaojiexian_weibu"')
    expect(svg).toContain('code="|w"')
  })

  it('keeps the sbf voice-brace column uncompressed in a fitted line', () => {
    const svg = render(`
Q1: 4. 4/ 5 6 | (5 4/ 3/) 2 - | 7, 7,/ 6,/ (5, 6,) | 1 - - - |&sbf 1' - 6 - | 4. 5/ 6 - |
Q2: 8 8 8 8 |* 8 8 8 8 |* 8 8 8 8 |* 8 8 8 8 |* 0 1 4 - | 6 - - 4/ 3/ |
`)
    const upper = uses(svg, 1)
    const sbfBar = upper.find(({ code }) => code === '|&sbf')
    const braceX = Number(svg.match(/<use x="([^"]+)"[^>]+xlink:href="#shengbufu_shang"/)?.[1])

    expect(sbfBar?.x).toBeCloseTo(616.12658227848, 10)
    expect(braceX).toBeCloseTo(660.75949367089, 10)
    expect(braceX - (sbfBar?.x ?? Number.NaN)).toBeCloseTo(44.63291139241, 10)
    expect(upper.at(-1)).toEqual({ x: 923, code: '|' })
  })

  it('anchors a moved voice brace to an accidental-shifted first note', () => {
    const svg = render(`
Q1: 1 |&sbf 2# |
Q2: 8 |* 3 |
`)

    expect(svg).toContain('x="178" y="130" xlink:href="#shuzi_b_2"')
    expect(svg).toContain('x="178" y="130" xlink:href="#shengbufu_shang"')
  })

  it('renders lyric braces as zero-width SVG controls', () => {
    const svg = render(`Q: 1 2 |\nC: {甲乙}`)

    expect(svg).toContain('<g id="ci_dakuohu_zuo"')
    expect(svg).toContain('<g id="ci_dakuohu_you"')
    expect(svg).toContain('xlink:href="#ci_dakuohu_zuo" transform="translate(68,182)scale(1,4.2)"')
    expect(svg).toContain(
      'xlink:href="#ci_dakuohu_you" transform="translate(135.5,182)scale(1,4.2)"',
    )
    expect(svg).not.toContain('>}</text>')
  })

  it('keeps voices aligned after a barred repeat end', () => {
    const svg = render(`
Q1: 1 - - - | 2 - - - | 3 - - - | {dsb 4 - - - |} 5 - - - |
Q2: 6 - - - | 7 - - - :|| 1' - - - | 2 - - - |
`)
    const upper = uses(svg, 1)
    const lower = uses(svg, 2)
    const upperLead = upper.find(({ code }) => code === '3')
    const lowerLead = lower.find(({ code }) => code === "1'")

    expect(upperLead).toBeDefined()
    expect(lowerLead).toBeDefined()
    expect(upperLead?.x).toBe(lowerLead?.x)
    expect(lower.filter(({ code }) => code === '|yj')).toHaveLength(1)
  })

  it('uses reduced spacing throughout quarter-note tuplets', () => {
    const svg = render(`Q: (y1 2 3) 4 |`)

    expect(uses(svg, 1)).toEqual([
      { x: 83, code: '1(ys' },
      { x: 108, code: '2' },
      { x: 133, code: '3)' },
      { x: 170.5, code: '4' },
      { x: 205.5, code: '|' },
    ])
  })

  it('scales notes and sustains consistently inside tuplets', () => {
    const svg = render(`Q: (y1 - 2) |`)

    expect(svg.match(/time="0\.67"/g)).toHaveLength(3)
    expect(svg).toContain('xlink:href="#lianyin_shuzi_3"')
  })

  it('preserves the legacy dangling caption reference for large tuplets', () => {
    const svg = render(`Q: (y1 - 2 3 4 5 6 7 1 2) |`)

    expect(svg).toContain('xlink:href="#lianyin_shuzi_10"')
    expect(svg).not.toContain('<g id="lianyin_shuzi_10"')
  })

  it('stacks genuinely overlapping slurs while sharing touching endpoints', () => {
    const nested = render(`Q: ((1 2) 3) |`)
    const coincident = render(`Q: ((1 2)) |`)
    const chained = render(`Q: (1 (1) 1) |`)

    expect(nested).toContain('M 84,114 C')
    expect(nested).toContain('M 84,106 C')
    expect(coincident).toContain('M 84,114 C')
    expect(coincident).toContain('M 84,109 C')
    expect(chained.match(/M \d+(?:\.\d+)?,114 C/g)).toHaveLength(4)
    expect(chained).not.toContain(',106 C')
  })

  it('lifts slurs for every additional high octave dot', () => {
    const svg = render(`Q: (1 2) (1' 2') (1'' 2'') (1''' 2''') (1'''' 2'''')`)
    const tops = [...svg.matchAll(/<path d="M [^,]+,([^ ]+) C/g)].map((match) => Number(match[1]))

    expect(tops).toEqual([114, 109, 101, 93, 85])
  })

  it('spaces ordinary high octave dots at the legacy eight-pixel pitch', () => {
    const svg = render(`Q: 1'''' 2,,,`)
    const highDots = [...svg.matchAll(/<use x="83" y="([^"]+)" xlink:href="#yingao_gao"/g)].map(
      (match) => Number(match[1]),
    )
    const lowDots = [...svg.matchAll(/<use x="120.5" y="([^"]+)" xlink:href="#yingao_di"/g)].map(
      (match) => Number(match[1]),
    )

    expect(highDots).toEqual([130, 122, 114, 106])
    expect(lowDots).toEqual([131, 137, 143])
  })

  it('matches legacy dynamics, hairpins, and volta positioning', () => {
    const svg = render(`
Q: 1&f 2 |
Q: 1>&mf 2 3! |
Q: 1> 2 3!&p |
Q: 1>+ 2 3! |
Q: 1>++ 2 3! |
Q: |/[+"1." 1 2 |]
`)

    expect(svg).toContain('x="83" y="127" xlink:href="#lidu_f"')
    expect(svg).toContain('x="58" y="210" xlink:href="#lidu_mf"')
    expect(svg).toContain('x="178" y="300" xlink:href="#lidu_p"')
    expect(svg).toContain('x1="76" y1="185" x2="165" y2="190"')
    expect(svg).toContain('x1="76" y1="195" x2="165" y2="190"')
    expect(svg).toContain('x1="76" y1="360" x2="165" y2="365"')
    expect(svg).toContain('x1="76" y1="445" x2="165" y2="450"')
    expect(svg).toContain('x1="77" y1="550" x2="77" y2="540"')
    expect(svg).toContain('x1="77" y1="540" x2="153.5" y2="540"')
    expect(svg).toContain('x1="153.5" y1="550" x2="153.5" y2="540"')
    expect(svg).toContain(
      'x="80" y="550" dy="4.026" fill="#303030" font-size="12" font-family="Microsoft YaHei" xml:space="preserve">1.</text>',
    )
  })

  it('renders lyric punctuation separately using legacy width estimates', () => {
    const svg = render(`Q: 1 2 |\nC: 你，ABC,`, {
      pageConfig: { geci_size: 16 },
    })

    expect(svg).toContain(
      'x="75" y="168" dy="5.368" fill="#101010" font-size="16" font-family="Microsoft YaHei" cipos="0_1_1">你</text>',
    )
    expect(svg).toContain(
      'x="91" y="168" dy="5.368" fill="#101010" font-size="16" font-family="Microsoft YaHei">，</text>',
    )
    expect(svg).toContain(
      'x="112.5" y="168" dy="5.368" fill="#101010" font-size="16" font-family="Microsoft YaHei" cipos="0_1_2">ABC</text>',
    )
    expect(svg).toContain(
      'x="135.5" y="168" dy="5.368" fill="#101010" font-size="16" font-family="Microsoft YaHei">,</text>',
    )
  })

  it('pushes later notes apart for overlong full-width and ASCII lyrics', () => {
    const svg = render(`Q1: 1/ 2/ 3/ 4/\nC1: 多~个~字 example 测试`)

    expect(uses(svg, 1).filter(({ code }) => code.endsWith('/'))).toEqual([
      { x: 83, code: '1/' },
      { x: 166.33333333333, code: '2/' },
      { x: 276.05555555556, code: '3/' },
      { x: 301.05555555556, code: '4/' },
    ])
  })

  it('reserves overlong lyric width before a barline', () => {
    const svg = render(`Q: 1 2 | 3 4 |\nC: 甲 多~个~字 丙 丁`)

    expect(uses(svg, 1)).toEqual([
      { x: 83, code: '1' },
      { x: 120.5, code: '2' },
      { x: 248.83333333333, code: '3' },
      { x: 286.33333333333, code: '4' },
      { x: 213.83333333333, code: '|' },
      { x: 321.33333333333, code: '|' },
    ])
  })

  it('aligns and reserves space for temporary accompaniment and voices', () => {
    const svg = render(`
Q: 1 2 {dsb 3 4} 5 6 |
C: 甲乙丙丁
Q: 1 2 {bz 3/ 4/} 5 6 |
`)

    expect(svg).toContain('x="158" y="130" xlink:href="#shuzi_b_3"')
    expect(svg).toContain('x="195.5" y="130" xlink:href="#shuzi_b_4"')
    expect(svg).toContain('x="158" y="186" xlink:href="#shuzi_b_5"')
    expect(svg).toContain('x="195.5" y="186" xlink:href="#shuzi_b_6"')
    expect(svg).toContain('x="74" y="224"')
    expect(svg).toContain('x="158" y="292" xlink:href="#shuzi_b_bian_3"')
    expect(svg).toContain('x="183" y="292" xlink:href="#shuzi_b_bian_4"')
    expect(svg).toContain('x="158" y="332" xlink:href="#shuzi_b_5"')
    expect(svg).toContain('x="220.5" y="332" xlink:href="#shuzi_b_6"')
  })

  it('reserves SVG brace columns around an in-line temporary voice', () => {
    const svg = render(`Q: 1 2 | {dsb 6, - } 2 - | 3 4 |`)

    expect(svg).toContain('<g id="dakuohu_zuo_2"')
    expect(svg).toContain('<g id="dakuohu_you_2"')
    expect(svg).toContain('x="175.5" y="158" xlink:href="#dakuohu_zuo_2"')
    expect(svg).toContain('x="210.5" y="130" xlink:href="#shuzi_b_6"')
    expect(svg).toContain('x="210.5" y="186" xlink:href="#shuzi_b_2"')
    expect(svg).toContain('x="283" y="158" xlink:href="#dakuohu_you_2"')
    expect(svg).toContain('x="303" y="158" xlink:href="#xiaojiexian"')
    expect(svg).toContain('x="338" y="158" xlink:href="#shuzi_b_3"')
  })

  it('uses a synthetic tail bar when a temporary voice omits its own barline', () => {
    const synthetic = render(`Q: 1 2 | {dsb 3 4} 5 6 |`)
    const explicit = render(`Q: 1 2 | {dsb 3 4 |} 5 6 |`)

    expect(synthetic).toContain('x="283" y="130" xlink:href="#xiaojiexian_weibu"')
    expect(explicit).toContain('x="283" y="130" xlink:href="#xiaojiexian"')
    expect(explicit).not.toContain('x="283" y="130" xlink:href="#xiaojiexian_weibu"')
  })

  it('uses tuplet duration when locating a temporary voice closing bar', () => {
    const svg = render(`Q: 1 2 | {dsb (y3 4 5) 6} (y1 2 3) 4 | 5 6 |`)

    expect(svg).toContain('x="333" y="158" xlink:href="#dakuohu_you_2"')
    expect(svg).toContain('x="353" y="158" xlink:href="#xiaojiexian"')
    expect(svg).toContain('x="388" y="158" xlink:href="#shuzi_b_5"')
  })

  it('positions each lower range when a line has multiple temporary voices', () => {
    const svg = render(`Q: 1 2 {dsb 3 4} 5 6 {dsb 7 1} 2 3 |`)

    expect(svg).toContain('x="158" y="186" xlink:href="#shuzi_b_5"')
    expect(svg).toContain('x="233" y="186" xlink:href="#shuzi_b_2"')
    expect(svg).toContain('x="233" y="130" xlink:href="#shuzi_b_7"')
  })

  it('closes a temporary voice after its matching multi-measure duration', () => {
    const svg = render(`Q: 3 4 | {dsb 1 2 3 4 | 5 6 7 1'} 5 6 7 1' | 1' 7 6 5 | 5 5 |`)

    expect(svg).toContain('x="212.5" y="158" xlink:href="#dakuohu_zuo_2"')
    expect(svg).toContain('x="261.5" y="130" xlink:href="#shuzi_b_1"')
    expect(svg).toContain('x="261.5" y="186" xlink:href="#shuzi_b_5"')
    expect(svg).toContain('x="468" y="130" xlink:href="#xiaojiexian"')
    expect(svg).toContain('x="468" y="186" xlink:href="#xiaojiexian"')
    expect(svg).toContain('x="723.5" y="158" xlink:href="#dakuohu_you_2"')
    expect(svg).toContain('x="751.5" y="158" xlink:href="#xiaojiexian"')
    expect(svg).toContain('x="800.5" y="158" xlink:href="#shuzi_b_5"')
    expect(svg).toContain('x="923" y="158" xlink:href="#xiaojiexian"')
  })

  it('aligns a temporary voice with all sibling voices in the global grid', () => {
    const svg = render(`
Q1: 4. 4/ 4 3/ 2/ | 1 - - - :| 5 - - - | {dsb 1 - 6 - | 4. 5/ 6 - | 7 7/ 7/ (7 6/ 5/) } 6 - 4 - |]/ 2. 3/ 4 - | 5 5/ 5/ (4 3/ 2/) |
Q2: (2 - - - | 3) - - - :|| 3 - - - | 0 1 4 - | 6 - - 4/ 3/ | 2 - - 1/ 2/ |
`)
    const at = (y: number, href: string): number[] =>
      [...svg.matchAll(new RegExp(`<use x="([^"]+)" y="${y}" xlink:href="#${href}"`, 'g'))].map(
        (match) => Number(match[1]),
      )

    expect(at(130, 'shuzi_b_1')).toContain(513.21951219512)
    expect(at(186, 'shuzi_b_6')).toContain(513.21951219512)
    expect(at(264, 'shuzi_b_0')).toContain(513.21951219512)
    expect(at(130, 'xiaojiexian')).toContain(613.23170731707)
    expect(at(186, 'xiaojiexian')).toContain(613.23170731707)
    expect(at(264, 'xiaojiexian')).toContain(613.23170731707)
    expect(at(130, 'shuzi_b_4')).toContain(636.96341463415)
    expect(at(186, 'shuzi_b_2')).toContain(636.96341463415)
    expect(at(264, 'shuzi_b_6')).toContain(636.96341463415)
  })

  it('uses reduced SVG parentheses for temporary accompaniment', () => {
    const svg = render(`Q: 3 4 | {bz 1&zkh 2 3 4&ykh} 5 6 7 1 |`)

    expect(svg).toContain('<g id="kuohu_zuo_bian"')
    expect(svg).toContain('<g id="kuohu_you_bian"')
    expect(svg).toMatch(/xlink:href="#kuohu_zuo_bian"/)
    expect(svg).toMatch(/xlink:href="#kuohu_you_bian"/)
  })

  it('renders reduced ornaments on accompaniment sustains and raises its underlines', () => {
    const svg = render(`Q: 1 | {bz 3&zkh 2// 2// 3/ 4 -&ykh } 5 |`)

    expect(svg).toContain('x="315.5" y="130" xlink:href="#kuohu_you_bian"')
    expect(svg).toContain('x1="184.5" y1="141" x2="246.5" y2="141"')
    expect(svg).toContain('x1="184.5" y1="144" x2="221.5" y2="144"')
  })

  it('emits temporary-voice braces only at visible branch boundaries', () => {
    const rightOnly = render(`Q: 1 2 {dsb 3 4} 5 6 | 7 1 |`)
    const leftOnly = render(`Q: 1 2 | {dsb 3 4} 5 6 |`)

    expect(rightOnly).not.toContain('xlink:href="#dakuohu_zuo_2"')
    expect(rightOnly).toContain('x="230.5" y="158" xlink:href="#dakuohu_you_"')
    expect(rightOnly).toContain('x="250.5" y="158" xlink:href="#xiaojiexian"')
    expect(leftOnly).toContain('x="175.5" y="158" xlink:href="#dakuohu_zuo_2"')
    expect(leftOnly).not.toMatch(/xlink:href="#dakuohu_you_/)
    expect(leftOnly).toContain('x="210.5" y="130" xlink:href="#shuzi_b_3"')
    expect(leftOnly).toContain('x="283" y="186" xlink:href="#xiaojiexian"')
  })

  it('drops a terminal temporary voice like the legacy renderer', () => {
    const svg = render(`Q: 1 {dsb 2#'//[3/]}`)

    expect(svg).not.toContain('code="2#&apos;//[3/]"')
    expect(svg).not.toContain('xlink:href="#shuzi_b_2"')
    expect(svg).not.toContain('<g id="qy0_0"')
  })

  it('splits same-page cross-line slurs at the page margins', () => {
    const svg = render(`Q: 1 2 (3 4 |\nQ: 1 2 3) 4 |`)

    expect(svg).toContain('xlink:href="#lianyinxian_zuo"')
    expect(svg).toContain('xlink:href="#lianyinxian_you"')
    expect(svg).toContain('x2="924" y2="104.8"')
    expect(svg).toContain('x1="77" y1="182.8"')
  })

  it('splits same-page cross-line volta marks at the page margins', () => {
    const svg = render(`Q: 1 |["1." 2 3 |\nQ: |/ 4 5 |] 6 |`)

    expect(svg).toContain('x2="924"')
    expect(svg).toContain('x1="76"')
    expect(svg.match(/>1\.<\/text>/g)).toHaveLength(1)
  })

  it('does not render automatic slur continuations across pages', () => {
    const svg = render(`Q: 1 (2 |\n[fenye]\nQ: 3) 4 |`)

    expect(svg).not.toContain('xlink:href="#lianyinxian_zuo"')
    expect(svg).not.toContain('xlink:href="#lianyinxian_you"')
  })

  it('keeps short multi-measure phrases at their natural width', () => {
    const svg = render(`Q: 1 2 | 3 4 |`)

    expect(uses(svg, 1)).toEqual([
      { x: 83, code: '1' },
      { x: 120.5, code: '2' },
      { x: 190.5, code: '3' },
      { x: 228, code: '4' },
      { x: 155.5, code: '|' },
      { x: 263, code: '|' },
    ])
  })

  it('emits only requested glyph definitions and merges beam lines', () => {
    const svg = render(`Q: 1// 1// 1// 1// |`)

    expect(svg).toContain('<g id="shuzi_b_1"')
    expect(svg).not.toContain('<g id="shuzi_b_2"')
    expect(svg).not.toContain('<g id="xunhuan_zuo"')
    expect(svg.match(/data-type="jianshixian"/g)).toHaveLength(2)
    expect(svg).toContain('x1="77"')
    expect(svg).toContain('x2="164"')
  })

  it('renders score symbols from path-based API glyphs', () => {
    const svg = render(`Q: 1&zkh 2&hx 3&shy 4&cy |&fine`)
    const defs = svg.match(/<defs>([\s\S]*?)<\/defs>/)?.[1] ?? ''

    expect(defs).toContain('<g id="kuohu_zuo"')
    expect(defs).toContain('<g id="huxifu"')
    expect(defs).toContain('<g id="huayin_shang"')
    expect(defs).toContain('<g id="changyinfu1"')
    expect(defs).toContain('<g id="xiaojiexian_fine"')
    expect(defs).toContain('<path')
    expect(defs).not.toContain('<text')
  })

  it('uses the legacy baselines for mordents and barline navigation marks', () => {
    const mordents = render(`Q: 1&sby 1&sby+ 2&xby 3&xby+`)
    const navigationMarks = render(`Q: |&fine |&dc |&ds |&ty |&hs`)

    for (const id of ['boyinfu_shang1', 'boyinfu_shang2', 'boyinfu_xia1', 'boyinfu_xia2']) {
      expect(mordents).toMatch(new RegExp(`<use x="[^"]+" y="130" xlink:href="#${id}"`))
    }
    for (const id of [
      'xiaojiexian_fine',
      'xiaojiexian_dc',
      'xiaojiexian_ds',
      'xiaojiexian_ty',
      'xiaojiexian_hs',
    ]) {
      expect(navigationMarks).toMatch(new RegExp(`<use x="[^"]+" y="130" xlink:href="#${id}"`))
    }
  })

  it('supports legacy page config, pagination, partial redraws, and custom SVG', () => {
    const custom = '<defs><g id="custom_x"></g></defs><use xlink:href="#custom_x"></use>[fenye]'
    const output = render(`Q: 1\n[fenye]\nQ: 2`, {
      pageConfig: JSON.stringify({ page: 'A5', margin_left: '100' }),
      customCode: custom,
      pageNum: 0,
    })

    expect(output).toMatch(/^<svg width="840" height="1193"/)
    expect(output).toContain('x="103"')
    expect(output).toContain('<g id="custom"><defs><g id="custom_x">')
    expect(output.endsWith('[fenye]noRedraw[fenye]')).toBe(true)
  })

  it('renders metadata and lyric text with XML escaping', () => {
    const output = render(`B: A & B\nZ: <作者>\nD: C\nP: 4/4\nQ: 1 2\nC: 你~好 世界`)

    expect(output).toContain('A &amp; B')
    expect(output).toContain('&lt;作者&gt;')
    expect(output).toContain('>你好</text>')
    expect(output).toContain('>世</text>')
  })
})
