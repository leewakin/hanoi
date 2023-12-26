import typescript from '@rollup/plugin-typescript'
import { defineConfig } from 'rollup'
import { join } from 'node:path'
import { cwd } from 'node:process'
import {
  readFileSync,
  writeFileSync,
  existsSync,
  rmSync,
  mkdirSync,
} from 'node:fs'

export default defineConfig({
  input: 'src/main.ts',
  output: {
    format: 'iife',
  },
  plugins: [typescript(), customOutput()],
})

function customOutput() {
  return {
    name: 'custom-output',
    generateBundle(options, bundle) {
      rmAndMkDistdir()
      replaceCodeInHTML(bundle['main.js'].code)
    },
  }
}

function rmAndMkDistdir() {
  const distPath = join(cwd(), 'dist')
  if (existsSync(distPath)) {
    rmSync(distPath, { recursive: true, force: true })
  }
  mkdirSync(distPath)
}

function replaceCodeInHTML(code) {
  let html = readFileSync(join(cwd(), 'hanoi.html'), 'utf-8')
  html = html.replace(
    /<script type="module" src="dist\/main.js">/,
    `<script>${code}`
  )

  writeFileSync(join(cwd(), 'dist', 'hanoi.html'), html, 'utf-8')
}
