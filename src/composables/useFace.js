import { computed } from 'vue'
import { backup } from '@/stores/backup'
import { isImpersonating } from '@/stores/game'
import { B_EXTRA, B_MISSING } from '@/data/forum/face-b'
import { SUNK } from '@/data/forum/threads'

/**
 * 「面」引擎 —— 不是灵异，是**同一份数据的三层可见度**。
 *
 *   A 面（表）：默认。一个正常的老论坛。
 *   B 面（里）：删过、没删干净的那一层。两个独立入口 ——
 *                ① 导出模式切「完整导出 / 校验模式」
 *                ② 导出时间范围收窄到 03:33—04:44
 *               （所以玩家会有"不止一个办法看见它"的感觉）
 *   C 面（借身）：点了《版主交接帖》里那条链接，用老七的号登进去。
 *
 * 换面只由**动作**触发：切模式、改时间范围、点那条链接。
 * 没有密码，没有控制台，没有彩蛋式跳吓。
 */
export const face = computed(() => {
  if (isImpersonating.value) return 'C'
  const inWindow = backup.timeFrom >= '03:33' && backup.timeTo <= '04:44'
  const byMode = backup.mode === 'full' || backup.mode === 'check'
  return inWindow || byMode ? 'B' : 'A'
})

/** 是否在"里层"（B 或 C） */
export const isB = computed(() => face.value !== 'A')

export const faceName = computed(() => (face.value === 'A' ? '表' : face.value === 'B' ? '里' : '借身'))

/** 这条主题是不是在「沉」里（＝被下沉过） */
export function isSunk(tid) {
  return SUNK.indexOf(tid) >= 0
}

/**
 * 某帖在"当前面"下的楼层数组。
 * B 面会：合并多出来的楼层、把被删的楼层标成洞、给只恢复了一部分的帖打标记。
 */
export function postsOf(thread) {
  if (!thread) return []
  const base = thread.posts.slice().sort((a, b) => a.floor - b.floor)
  if (face.value === 'A') return base

  const extra = (B_EXTRA[thread.tid] || []).map((p) => Object.assign({}, p))
  const missing = (B_MISSING[thread.tid] || []).map((f) => ({ floor: f, missing: true }))
  return base.concat(extra).concat(missing).sort((a, b) => a.floor - b.floor)
}

/** 这个楼层是不是"已不在的人在发帖" */
export function isGhost(post) {
  return face.value !== 'A' && !!post && !!post.ghost
}

/** 该帖在当前面下有没有异常（列表页据此打标记） */
export function hasAnomaly(thread) {
  if (!thread || face.value === 'A') return false
  return !!B_EXTRA[thread.tid] || !!B_MISSING[thread.tid]
}
