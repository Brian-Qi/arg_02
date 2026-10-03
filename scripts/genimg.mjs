#!/usr/bin/env node
/**
 * 项目侧薄壳 —— 真正的出图工具只有一份：F:\tools\genimg.mjs
 * 这里只做三件事：注入项目默认输出目录、转发参数、允许用 $env:GENIMG_TOOL 换工具路径。
 * （不做第二份拷贝，避免工具本体漂移。）
 *
 * 用法（在 test_04 目录下）：
 *   npm run gen                    # 出 assets/manifests/forum-01.json 里的图
 *   npm run gen:dry                # 只看会生成哪些文件名，不真的出图
 *   node scripts/genimg.mjs "提示词" -o photo-x -a 3:2
 *   node scripts/genimg.mjs --manifest assets/manifests/forum-02.json
 *
 * 关键：Key 由工具本体负责读取（$env:GRS_KEY → F:\tools\.grs_key → F:\ARG_test\.grs_key）
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const TOOL = process.env.GENIMG_TOOL || 'F:\\tools\\生图\\genimg.mjs'
const RAW_DIR = process.env.GENIMG_DIR || path.join(root, '_raw_img')

if (!fs.existsSync(TOOL)) {
  console.error(`找不到出图工具：${TOOL}`)
  console.error('可用 $env:GENIMG_TOOL 指定路径（默认为 F:\\tools\\genimg.mjs）。')
  process.exit(1)
}

const argv = process.argv.slice(2)
const has = (f) => argv.some((a) => a === f)
if (!has('-d') && !has('--dir')) argv.push('-d', RAW_DIR)

fs.mkdirSync(RAW_DIR, { recursive: true })

const r = spawnSync(process.execPath, [TOOL, ...argv], { stdio: 'inherit' })
process.exit(r.status == null ? 1 : r.status)
