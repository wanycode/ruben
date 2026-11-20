import { defineConfig } from 'vite'
import { copyFileSync, readdirSync } from 'node:fs'

const pages = Object.fromEntries(
  readdirSync('.')
    .filter((file) => file.endsWith('.html'))
    .map((file) => [file.replace(/\.html$/, ''), file]),
)

// robots.txt and sitemap.xml live next to the pages; copy them into the build.
const copyRootFiles = () => ({
  name: 'copy-root-files',
  apply: 'build',
  closeBundle() {
    for (const file of ['robots.txt', 'sitemap.xml']) copyFileSync(file, `dist/${file}`)
  },
})

export default defineConfig({
  plugins: [copyRootFiles()],
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      input: pages,
    },
  },
})
