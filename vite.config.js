import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 部署到子路径时用  DEPLOY_BASE=/arg_02/  构建；本地开发默认根路径。
const BASE = process.env.DEPLOY_BASE || '/'

// 构建期把运行时写死的 /img/、/audio/ 前缀成 base（dev 不受影响）
function baseAssetPlugin(base) {
  const b = base === '/' ? '' : base.replace(/\/$/, '')
  const fix = (s) =>
    String(s)
      .replace(/(["'`])\/(img|audio)\//g, `$1${b}/$2/`)
      .replace(/url\(\s*(['"]?)\/(img|audio)\//g, (m, q, d) => `url(${q}${b}/${d}/`)
  return {
    name: 'base-asset',
    apply: 'build',
    generateBundle(_, bundle) {
      for (const f of Object.values(bundle)) {
        if (f.type === 'chunk') f.code = fix(f.code)
        else if (f.fileName.endsWith('.css')) f.source = fix(f.source)
      }
    }
  }
}

export default defineConfig({
  plugins: [vue(), baseAssetPlugin(BASE)],
  base: BASE,
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  },
  server: { host: true, port: 5175 }
})
