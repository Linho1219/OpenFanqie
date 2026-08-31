import { defineConfig } from 'vitest/config'

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: 'src/index.ts',
      name: 'OpenFanqieExportPdf',
      formats: ['es', 'cjs'],
      fileName: (format) =>
        format === 'es' ? 'open-fanqie-export-pdf.js' : 'open-fanqie-export-pdf.cjs',
    },
  },
  test: {
    coverage: {
      reporter: ['text', 'html'],
    },
  },
})
