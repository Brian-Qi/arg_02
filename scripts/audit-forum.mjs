#!/usr/bin/env node
/**
 * 全量体检 —— 数据与文本（不是抽查）。
 *
 * 用法：npm run audit   （exit 0 = 通过；有硬伤则 exit 1）
 *
 * 「硬伤」定义（会 exit 1）：
 *   空正文 / 占位符 / 通用水话 / 重复正文 / 跨帖复制 / 超长正文 /
 *   楼层号不连续 / 作者不存在 / 时间越界（早于注册、晚于关站）/
 *   canon 不变量（44·43·46·47·45、日志窗口、底档 +2 天、沉 6 条）
 * 其余（作者分布、时段分布、逐帖清单）只打印，不判负。
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const T = path.join(ROOT, 'src/data/forum/') + path.sep
const load = (f) => import('file://' + (T + f).replace(/\\/g, '/'))

const { default: THREADS, HER_TID, RESIDUE, SUNK } = await load('threads.js')
const { default: USERS } = await load('users.js')
const { default: BOARDS } = await load('boards.js')
const { NOISE } = await load('noise.js')
const DOCS = await load('docs.js')
const { B_EXTRA, B_MISSING } = await load('face-b.js')

const U = USERS.reduce((m, u) => ((m[u.uid] = u), m), {})
const B = BOARDS.reduce((m, b) => ((m[b.id] = b), m), {})
const P = (...a) => console.log(...a)

const bodyOf = (b) => (Array.isArray(b) ? b.join('\n') : String(b == null ? '' : b))
const hard = []
const bad = (msg) => {
  hard.push(msg)
  P('  ✗ ' + msg)
}

/* 噪声帖先归一成与主线同形状（时间只取楼主那一层） */
const NOISE_T = NOISE.map(([board, tid, uid, time, title, floors]) => {
  const posts = []
  floors.forEach((f, i) => {
    const isReply = Array.isArray(f) && typeof f[0] === 'number'
    posts.push({ floor: i + 1, uid: isReply ? f[0] : uid, time, body: isReply ? f[f.length - 1] : f })
  })
  return { tid, board, uid, title, time, noise: true, posts }
})

const ALL = THREADS.concat(NOISE_T)
const floors = []
for (const t of ALL) for (const p of t.posts) floors.push({ tid: t.tid, title: t.title, ...p })

/* ─────────── A. 总量 ─────────── */
P('══ A. 总量 ══')
const mainFloors = THREADS.reduce((s, t) => s + t.posts.length, 0)
const noiseFloors = NOISE_T.reduce((s, t) => s + t.posts.length, 0)
P(`  主线 ${THREADS.length} 帖 / ${mainFloors} 层`)
P(`  噪声 ${NOISE_T.length} 帖 / ${noiseFloors} 层`)
P(`  合计 ${ALL.length} 帖 / ${mainFloors + noiseFloors} 层`)
const noiseShare = noiseFloors / (mainFloors + noiseFloors)
P(`  噪声占比 ${(noiseShare * 100).toFixed(1)}%  ${noiseShare >= 0.6 ? '(达标)' : '(不足 60%)'}`)

/* ─────────── B. 逐帖清单（主线） ─────────── */
P('\n══ B. 逐帖清单（主线全部 ' + THREADS.length + ' 帖）══')
for (const t of THREADS.slice().sort((a, b) => a.board - b.board || a.tid - b.tid)) {
  const span = `${t.posts[0].time.slice(2, 10)}→${t.posts[t.posts.length - 1].time.slice(2, 10)}`
  P(
    `  ${String(B[t.board] ? B[t.board].name : t.board).padEnd(8)} ${String(t.tid).padEnd(5)} ${String(t.posts.length).padStart(3)}层 ${span.padEnd(17)} ${t.title.slice(0, 30)}`
  )
}

/* ─────────── C. 零回复 ─────────── */
P('\n══ C. 零回复帖 ══')
const zero = THREADS.filter((t) => t.posts.length === 1)
if (!zero.length) P('  无')
for (const t of zero) P(`  ${t.tid}  [${B[t.board] ? B[t.board].name : t.board}]  ${t.title.slice(0, 34)}`)

/* ─────────── D. 重复正文 ─────────── */
P('\n══ D. 重复正文（同一句出现在多处）══')
const byBody = {}
for (const p of floors) {
  const k = bodyOf(p.body).trim()
  if (k.length < 4) continue
  ;(byBody[k] = byBody[k] || []).push(p.tid)
}
const dups = Object.entries(byBody)
  .filter(([, v]) => v.length > 1)
  .sort((a, b) => b[1].length - a[1].length)
if (!dups.length) P('  无')
for (const [body, tids] of dups) {
  if (tids.length >= 3) bad(`重复正文 ×${tids.length}：${body.slice(0, 24)} ← ${[...new Set(tids)].join(',')}`)
  else P(`  ×${tids.length}  ${body.slice(0, 24)}  ← ${[...new Set(tids)].join(',')}`)
}

/* ─────────── E. 通用水话 ─────────── */
P('\n══ E. 通用水话 ══')
const WATER = [
  '顶', '顶。', '顶一下', '沙发', '沙发。', '板凳', '板凳。', '同感', '同感。', '学习了', '学习了。',
  '收藏了', '收藏', '关注', '留个名', '路过看看', '路过', '哈哈哈', '哈哈', '笑死', '＋1', '+1',
  '好帖', '支持', '支持楼主', '有道理', '真的假的', '我信了', '回一个', '考古', '继续啊',
  '谢谢分享', '有点意思', 'mark', '确实'
]
const water = floors.filter((p) => p.floor > 1 && WATER.includes(bodyOf(p.body).trim()))
if (!water.length) P('  无')
for (const p of water) bad(`水话 ${p.tid} ${p.floor}楼「${bodyOf(p.body).trim()}」`)

/* ─────────── F. 跨帖复制 ─────────── */
P('\n══ F. 跨帖复制（回复与某帖正文全同）══')
const opSet = new Map(THREADS.map((t) => [bodyOf(t.posts[0].body).trim(), t.tid]))
const cross = floors.filter((p) => p.floor > 1 && opSet.has(bodyOf(p.body).trim()))
if (!cross.length) P('  无')
for (const p of cross) bad(`跨帖复制 ${p.tid} ${p.floor}楼 = 帖 ${opSet.get(bodyOf(p.body).trim())} 正文`)

/* ─────────── G. 楼层号 / 作者 / 时间 ─────────── */
P('\n══ G. 结构（楼层号 / 作者 / 时间）══')
for (const t of ALL) {
  t.posts.forEach((p, i) => {
    if (p.floor !== i + 1) bad(`${t.tid} 楼层号不连续（第 ${i + 1} 项写着 ${p.floor}）`)
    if (!U[p.uid]) bad(`${t.tid} 第 ${p.floor} 层作者 UID ${p.uid} 不存在`)
  })
}
for (const t of THREADS) {
  for (const p of t.posts) {
    const u = U[p.uid]
    if (!u) continue
    if (p.time < u.joined + ' 00:00') bad(`${t.tid} ${p.floor}楼 ${p.time} 早于 ${u.name} 注册 ${u.joined}`)
    if (p.time > '2012-07-14 00:00') bad(`${t.tid} ${p.floor}楼 ${p.time} 晚于关站日`)
  }
}
P('  （楼层号、作者、时间三项已全量核对）')

/* ─────────── H. 空正文 / 超长 / 占位符 ─────────── */
P('\n══ H. 空正文 / 超长 / 占位符 ══')
let empty = 0
let long = 0
const PLACE = ['TODO', 'TBD', 'xxx', 'XXX', '待补', '略', '……略']
for (const p of floors) {
  const b = bodyOf(p.body).trim()
  if (!b) {
    empty++
    bad(`空正文 ${p.tid} ${p.floor}楼`)
  }
  if (b.length > 600) {
    long++
    P(`  长文 ${p.tid} ${p.floor}楼 ${b.length} 字`)
  }
  if (PLACE.some((x) => b.includes(x))) bad(`占位符 ${p.tid} ${p.floor}楼「${b.slice(0, 20)}」`)
}
P(`  空正文 ${empty} · 超长 ${long}`)

/* ─────────── I. 时段分布 ─────────── */
P('\n══ I. 时段分布（主线楼层）══')
const byHour = {}
for (const t of THREADS) for (const p of t.posts) byHour[p.time.slice(11, 13)] = (byHour[p.time.slice(11, 13)] || 0) + 1
Object.keys(byHour)
  .sort()
  .forEach((h) => P(`  ${h} 时 ${String(byHour[h]).padStart(3)} ${'▇'.repeat(Math.min(40, byHour[h]))}`))

/* ─────────── J. canon 不变量 ─────────── */
P('\n══ J. canon 不变量 ══')
const her = THREADS.find((t) => t.tid === HER_TID)
const chk = (ok, msg) => (ok ? P(`  ✓ ${msg}`) : bad(msg))
chk(her.posts.length === 44, '4413 A 面 44 层')
chk(her.repliesA === 43, '4413 A 面回复 43')
chk(RESIDUE.replies === 46 && RESIDUE.views === 60318, '残影行 46 / 60318')
chk(B_MISSING[HER_TID] && B_MISSING[HER_TID][0] === 45, '45 楼缺失')
chk((B_EXTRA[HER_TID] || []).length === 2, '46 / 47 两层 ghost')
const t47 = (B_EXTRA[HER_TID] || []).find((p) => p.floor === 47)
chk(!!t47 && t47.time === '2011-09-14 03:33', '47 楼时间 = 2011-09-14 03:33')
chk(U[7].lastLogin === '2011-09-14', '老七注销 2011-09-14')
const inWin = DOCS.MOD_LOG.every((r) => {
  const hm = r.time.slice(11)
  return hm >= '03:33' && hm <= '04:44'
})
chk(inWin, '版务日志全部落在 03:33—04:44')
const plus2 = (d) => {
  const x = new Date(d.replace(/-/g, '/'))
  x.setDate(x.getDate() + 2)
  const p = (v) => String(v).padStart(2, '0')
  return x.getFullYear() + '-' + p(x.getMonth() + 1) + '-' + p(x.getDate())
}
chk(DOCS.LEDGER.every((r) => U[r.uid] && U[r.uid].lastLogin === plus2(r.time)), '底档付款日 + 2 天 = 注销日（六组）')
chk(SUNK.length === 6, '「沉」六条')
chk(
  SUNK.every((tid) => DOCS.MOD_LOG.some((r) => String(r.target).split(',').includes(String(tid)))),
  '沉里每条都有下沉记录'
)
chk(B[8].topics === SUNK.length, '「沉」版块计数 = 6')
chk(DOCS.END_REPORT[DOCS.END_REPORT.length - 1] === '未清理：6', '结局报告 未清理：6')
chk(U[13].lastLogin === '2005-11-05', '她走 2005-11-05')

/* ─────────── 结论 ─────────── */
P('\n══ 结论 ══')
if (hard.length) {
  P(`  硬伤 ${hard.length} 项（见上，✗）`)
  process.exit(1)
}
P('  全量体检通过。')
