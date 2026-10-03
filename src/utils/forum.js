import USERS, { LEVELS, SELF_UID, ME_UID, ADMIN_ALIAS } from '@/data/forum/users'
import BOARDS from '@/data/forum/boards'
import MAIN, { SUNK } from '@/data/forum/threads'
import { NOISE } from '@/data/forum/noise'

export { SELF_UID, ME_UID, ADMIN_ALIAS }

export const userMap = new Map(USERS.map((u) => [u.uid, u]))
export const boardMap = new Map(BOARDS.map((b) => [b.id, b]))

/** 取会员；查不到的（被系统清理的号）统一显示为"已注销会员" */
export function user(uid) {
  return (
    userMap.get(Number(uid)) || {
      uid: Number(uid),
      name: '已注销会员',
      title: '',
      credits: 0,
      posts: 0,
      joined: '',
      from: '',
      online: false,
      lastLogin: '',
      gone: true,
      mod: false,
      me: false,
      selfUid: false,
      sig: ''
    }
  )
}

export function levelOf(u) {
  const credits = (u && u.credits) || 0
  return LEVELS.find((l) => credits >= l.min) || LEVELS[LEVELS.length - 1]
}

export function starsOf(u) {
  return levelOf(u).stars
}

export function board(id) {
  return boardMap.get(Number(id)) || null
}

/** 楼层叫法：1 楼 / 沙发 / 板凳 */
export function floorName(n) {
  return n === 1 ? '1 楼' : n === 2 ? '沙发' : n === 3 ? '板凳' : n + ' 楼'
}

export const ME = userMap.get(ME_UID)
export const SELF = userMap.get(SELF_UID)

/* ------------------------------------------------------------------ *
 * 噪声帖 → 与主线同样的形状
 * 噪声形状：[board, tid, uid, 发帖时间, 标题, [楼层…]]
 *   楼层：'正文' / ['若干行']            → 楼主自己（时间 = 发帖时间）
 *         [uid, '正文']                  → 回复（时间由确定性排布给出）
 *         [uid, '时间', 正文]            → 回复（时间钉死）
 * ------------------------------------------------------------------ */

export function fmtTime(d) {
  const p = (n) => String(n).padStart(2, '0')
  return (
    d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes())
  )
}

function hash(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** 关站之后不可能再有帖子 —— 噪声里的越界时间统一收口 */
const TIME_CAP = '2012-07-13 23:59'
function capTime(t) {
  const s = String(t)
  if (s <= TIME_CAP) return s
  const m = s.match(/^\d{4}-\d{2}-(\d{2}) (\d{2}:\d{2})$/)
  return m ? '2012-06-' + m[1] + ' ' + m[2] : '2012-06-01 12:00'
}

/** 回复时间：确定性排布 —— 不早于楼主发帖、不晚于回复者最后登录 */
function replyTime(threadTime, tid, floor, authorUid) {
  const base = new Date(capTime(threadTime).replace(/-/g, '/'))
  const addMin = (hash(tid + '-' + floor) % 4320) + 5
  const t = new Date(base.getTime() + addMin * 60000)
  const u = user(authorUid)
  if (u && u.lastLogin) {
    const cap = new Date(u.lastLogin.replace(/-/g, '/'))
    cap.setHours(23, 59)
    if (t.getTime() > cap.getTime()) return fmtTime(cap)
  }
  return capTime(fmtTime(t))
}

function normalizeNoise(item) {
  const [boardId, tid, uid, time, title, floors] = item
  const t0 = capTime(time)
  const posts = []
  let selfFloors = 0
  floors.forEach((f, idx) => {
    const floor = idx + 1
    const isReply = Array.isArray(f) && typeof f[0] === 'number'
    if (!isReply) {
      selfFloors++
      posts.push({ floor, uid, time: t0, body: f })
    } else {
      const a = f[0]
      const pinned = f.length === 3
      posts.push({ floor, uid: a, time: capTime(pinned ? f[1] : replyTime(t0, tid, floor, a)), body: f[f.length - 1] })
    }
  })
  return {
    tid,
    board: boardId,
    uid,
    title,
    time: t0,
    views: 100 + (hash('v' + tid) % 4000),
    repliesA: floors.length - selfFloors,
    repliesB: floors.length - selfFloors,
    locked: false,
    noise: true,
    posts
  }
}

export const NOISE_THREADS = NOISE.map(normalizeNoise)

let _all = null
export function allThreads() {
  if (!_all) _all = MAIN.concat(NOISE_THREADS)
  return _all
}

export function threadByTid(tid) {
  return allThreads().find((t) => t.tid === Number(tid)) || null
}

/** 版块里的主题：按最后活动倒序（沉里的排在最前，因为它的记录最新） */
export function byBoard(boardId) {
  const id = Number(boardId)
  return allThreads()
    .filter((t) => Number(t.board) === id)
    .slice()
    .sort((a, b) => (lastTimeOf(a) < lastTimeOf(b) ? 1 : -1))
}

/** 主题的最后活动时间 */
export function lastTimeOf(t) {
  const ps = t.posts || []
  const last = ps.length ? ps[ps.length - 1].time : t.time
  return last > t.time ? last : t.time
}

export function lastPostOf(t) {
  const ps = t.posts || []
  const last = ps.length ? ps[ps.length - 1] : null
  if (!last) return { uid: t.uid, time: t.time }
  return { uid: last.uid, time: last.time }
}

/** 回复数（当前面由调用方决定；这里给 A/B 两个数） */
export function repliesA(t) {
  return typeof t.repliesA === 'number' ? t.repliesA : (t.posts || []).length - 1
}

export function repliesB(t) {
  return typeof t.repliesB === 'number' ? t.repliesB : repliesA(t)
}

export function isSunkThread(tid) {
  return SUNK.indexOf(Number(tid)) >= 0
}
