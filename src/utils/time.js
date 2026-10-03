/** 千禧年论坛的时间显示法：月份日期不补零（2003-7-14 12:33） */
export function fmt(t) {
  if (!t) return ''
  const m = String(t).match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/)
  if (!m) return String(t)
  return `${m[1]}-${Number(m[2])}-${Number(m[3])} ${m[4]}:${m[5]}`
}

/** 当年只显示月日（千禧年论坛的习惯）；不是当年就带上年份 */
export function fmtSmart(t, nowYear = '2012') {
  const f = fmt(t)
  return f.slice(0, 4) === nowYear ? f.slice(5) : f
}

/** 取日期部分 */
export function fmtDate(t) {
  const m = String(t || '').match(/^(\d{4})-(\d{2})-(\d{2})/)
  return m ? `${m[1]}-${Number(m[2])}-${Number(m[3])}` : String(t || '')
}

/** 相隔多久（用于"最后登录于"） */
export function since(t, now = '2012-07-14') {
  const d1 = new Date(String(t).replace(/-/g, '/'))
  const d2 = new Date(String(now).replace(/-/g, '/'))
  const days = Math.floor((d2.getTime() - d1.getTime()) / 86400000)
  if (days < 1) return '今天'
  if (days < 31) return days + ' 天前'
  if (days < 365) return Math.floor(days / 30) + ' 个月前'
  return Math.floor(days / 365) + ' 年前'
}
