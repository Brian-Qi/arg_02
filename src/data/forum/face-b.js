/**
 * B 面（里层）—— 删过、没删干净的那一层。
 *
 * 只有三种看法能进 B 面（见 composables/useFace.js）：
 *   ① 导出模式切「完整导出 / 校验模式」
 *   ② 导出时间范围收窄到 03:33—04:44
 *   ③ 借身（那已经是 C 面了）
 *
 * 纪律：B 面**不是平行宇宙**。它多的东西只有三类——
 *   - 被删掉、但计数没减的楼层（45）
 *   - 用别人的号发出来的楼层（46/47、4508 的 78）
 *   - 原本就存在、只是 A 面看不见的一句（4421 的 4 楼）
 * 全站一条时间线。
 */

/**
 * 每帖多出来的楼层。
 * ghost: true = 发帖账号的本人早已不在（死了 / 注销了）。
 */
export const B_EXTRA = {
  // 老七用她的号发的两条。**倒数第二条在 2011-08-30，最后一条在 2011-09-14 03:33
  // ——也就是他注销、跑路的那一刻。**
  4413: [
    { floor: 46, uid: 13, time: '2011-08-30 04:11', body: '今天我叫回去了。', ghost: true },
    { floor: 47, uid: 13, time: '2011-09-14 03:33', body: '楼下的名字，越叫越清楚了。', ghost: true }
  ],
  // 她母亲第二天就被沉了，但四楼留下了。
  4421: [{ floor: 4, uid: 7, time: '2006-04-11 22:03', body: '这里没有这个人。' }],
  // 已注销的人在发帖：老K（UID 89）注销于 2009-06-02，这层在 2009-08。
  4508: [{ floor: 78, uid: 89, time: '2009-08-14 03:50', body: '那栋楼的事，差不多得了。', ghost: true }]
}

/** 被删掉、只剩一个洞的楼层。页面上渲染成 `[第 45 层不存在]`。 */
export const B_MISSING = {
  4413: [45]
}

/** 只恢复了一部分的帖，给一句说明（不是旁白，是工具/存档的字段说明）。 */
export const B_PARTIAL = {
  4508: '本主题仅恢复以下楼层（其余记录缺失）'
}

/** 该帖在 B 面是否有"多出来的东西" */
export function bExtraOf(tid) {
  return B_EXTRA[tid] || []
}

export function bMissingOf(tid) {
  return B_MISSING[tid] || []
}

export function bPartialOf(tid) {
  return B_PARTIAL[tid] || ''
}

/** 已注销者的头像在 B 面变成没点睛的纸人 */
export function isPaperAvatar(user, faceName) {
  return faceName !== 'A' && !!user && !!user.gone
}
