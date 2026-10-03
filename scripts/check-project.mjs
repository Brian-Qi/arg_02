#!/usr/bin/env node
/**
 * 项目体检：npm run check
 *   1. src 里引用的 /img/ /audio/ 是否都真实存在（缺了就会 404）
 *   2. assets/manifests 里的图，有没有还没生成/还没转 webp 的
 *   3. 图片 / 音频体积
 * 有缺失时退出码为 1，可直接接进 CI。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(root, 'src')
const PUB = path.join(root, 'public')
const MANIFEST_DIR = path.join(root, 'assets', 'manifests')

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

/* ---------- 1. 引用体检 ---------- */
const refs = new Set()
for (const f of walk(SRC).filter((f) => /\.(vue|js|css|scss)$/.test(f))) {
  const t = fs.readFileSync(f, 'utf8')
  for (const m of t.matchAll(/["'`(](\/(?:img|audio)\/[A-Za-z0-9_.\-/]+)/g)) refs.add(m[1])
}
const missing = [...refs].filter((r) => !fs.existsSync(path.join(PUB, r.slice(1))))

console.log('== 引用但缺失（会 404）==')
console.log(missing.length ? missing.map((m) => '  MISSING ' + m).join('\n') : '  无')

/* ---------- 2. 清单体检 ---------- */
const manifests = fs.existsSync(MANIFEST_DIR) ? fs.readdirSync(MANIFEST_DIR).filter((f) => f.endsWith('.json')) : []
const notGenerated = []
let manifestTotal = 0
for (const mf of manifests) {
  let list = []
  try {
    list = JSON.parse(fs.readFileSync(path.join(MANIFEST_DIR, mf), 'utf8'))
  } catch (e) {
    console.log(`\n== 清单 ${mf} 解析失败：${e.message}`)
    continue
  }
  for (const it of list) {
    manifestTotal++
    const stem = String(it.file || '').replace(/\.(png|jpe?g|webp)$/i, '')
    if (!stem) continue
    if (!fs.existsSync(path.join(PUB, 'img', stem + '.webp'))) notGenerated.push(stem)
  }
}
console.log(`\n== 清单 ==\n  ${manifests.length} 个清单 / ${manifestTotal} 条`)
console.log(notGenerated.length ? notGenerated.map((n) => '  待生成 ' + n + '.webp').join('\n') : '  全部已生成')

/* ---------- 3. 体积 ---------- */
function sizeOf(dir) {
  if (!fs.existsSync(dir)) return [0, 0]
  const files = fs.readdirSync(dir)
  let total = 0
  for (const f of files) {
    const p = path.join(dir, f)
    if (fs.statSync(p).isFile()) total += fs.statSync(p).size
  }
  return [files.length, total]
}
const [imgN, imgB] = sizeOf(path.join(PUB, 'img'))
console.log(`\n== 图片 ==\n  ${imgN} 个，共 ${(imgB / 1048576).toFixed(1)} MB`)
const [auN, auB] = sizeOf(path.join(PUB, 'audio'))
console.log(`\n== 音频 ==\n  ${auN ? auN + ' 个，共 ' + (auB / 1024).toFixed(0) + ' KB' : '（无）'}`)
console.log('\n== 自托管字体 ==\n  （无：本站刻意只用系统字体 —— 宋体/黑体，仿千禧年论坛）')

/* ---------- 4. 类名体检 ----------
 * 模板里用到的类，必须在**共享样式**（src/assets/styles/*.css）或**本组件 scoped 样式**里有定义。
 * 防的就是"自己编一个类名"这种错：编了，就等于没样式（首页版块列的 logo 就是这么丢的）。
 */
const cssFiles = walk(path.join(SRC, 'assets', 'styles')).filter((f) => f.endsWith('.css'))
const sharedCss = cssFiles.map((f) => fs.readFileSync(f, 'utf8')).join('\n')
function classesDefined(text) {
  const out = new Set()
  const t = String(text).replace(/\/\*[\s\S]*?\*\//g, ' ')
  for (const m of t.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) out.add(m[1])
  return out
}
const sharedSet = classesDefined(sharedCss)
const vueFiles = walk(SRC).filter((f) => f.endsWith('.vue'))
const undef = []
for (const f of vueFiles) {
  const src = fs.readFileSync(f, 'utf8')
  const tm = src.match(/<template>([\s\S]*)<\/template>/)
  const tmpl = tm ? tm[1] : ''
  const localSet = classesDefined((src.match(/<style[^>]*>([\s\S]*?)<\/style>/g) || []).join('\n'))
  const used = new Set()
  for (const m of tmpl.matchAll(/(?<!:)\bclass="([^"]+)"/g)) {
    for (const c of m[1].split(/\s+/)) if (c && !c.startsWith('{') && !c.startsWith('$')) used.add(c)
  }
  for (const m of tmpl.matchAll(/:class="([^"]+)"/g)) {
    for (const k of m[1].matchAll(/['"]?(-?[_a-zA-Z][\w-]*)['"]?\s*:/g)) used.add(k[1])
    for (const l of m[1].matchAll(/'([^']+)'/g)) for (const c of l[1].split(/\s+/)) if (c) used.add(c)
  }
  const miss = [...used].filter((c) => !sharedSet.has(c) && !localSet.has(c))
  if (miss.length) undef.push('  ' + path.relative(root, f) + ' → ' + miss.join(', '))
}
console.log('\n== 类名体检（模板里用了、却没定义的类）==')
console.log(undef.length ? undef.join('\n') : '  无')

if (missing.length || notGenerated.length || undef.length) process.exitCode = 1
