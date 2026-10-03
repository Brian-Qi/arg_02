/**
 * 页面上的"死文本"—— 公告、站规、日志、底档、交接记录、工具日志、搜索表、结局。
 *
 * 纪律：这里的每一段都有作者（站长 / 巡查03 / 老七 / 工具），
 * **没有一句是旁白**。恐怖写在状态里，不点评。
 */

export const SITE = {
  name: '夜航船 BBS',
  domain: 'bbs.yehangchuan.cn',
  opened: '2003-07-14',
  closed: '2012-07-14',
  powered: 'Powered by Discuz! 4.1.0',
  processed: 'Processed in 0.031250 second(s), 6 queries',
  counter: '0017349'
}

/* ---------------- 关闭公告（全站顶部） ---------------- */
export const CLOSING_NOTICE = {
  by: '船老大',
  lines: ['本站将于 2012-07-14 起停止服务。谢谢这些年陪着的各位。']
}

/* ---------------- 站规（2003 立 / 2007 修订） ---------------- */
export const RULES_CURRENT = [
  '1. 禁水、禁转帖、禁改帖。违者删。',
  '2. 03:33—04:44 之间发布的主题不予保留。',
  '3. 请务必回复。',
  '4. 版主有权下沉、锁定、删除任何主题，无需说明。',
  '5. 请勿讨论版块「沉」。'
]

export const RULES_NOTE = [
  '修订说明（2007-03-01）',
  '- 新增第 2 条。',
  '- 第 3 条：原"主题超过 44 天不得回复"，改为"请务必回复"。'
]

export const RULES_BY = '船老大'

/* ---------------- 版务操作记录（/b/5） ---------------- */
export const MOD_LOG = [
  { time: '2005-11-06 03:47', op: '下沉', target: '4413', by: '老七' },
  { time: '2005-11-06 03:47', op: '下沉', target: '4414,4415,4416', by: '老七' },
  { time: '2005-11-06 03:49', op: '删楼', target: '4413-45', by: '老七' },
  { time: '2006-04-12 03:41', op: '下沉', target: '4421', by: '老七' },
  { time: '2007-02-19 04:02', op: '下沉', target: '4508', by: '老七' },
  { time: '2008-11-14 03:33', op: '删号', target: '77', by: '老七' },
  { time: '2009-06-02 04:20', op: '删号', target: '89', by: '老七' },
  { time: '2009-12-17 03:58', op: '上浮', target: '4421', by: '老七' },
  { time: '2009-12-19 04:03', op: '下沉', target: '4421', by: '老七' },
  { time: '2009-12-21 03:51', op: '删号', target: '102', by: '老七' },
  { time: '2010-08-09 04:04', op: '删号', target: '118', by: '老七' },
  { time: '2011-01-27 03:44', op: '删号', target: '129', by: '老七' },
  { time: '2011-05-30 04:11', op: '删号', target: '156', by: '老七' },
  { time: '2011-09-14 03:33', op: '注销', target: '7', by: '老七' }
]

export const MOD_LOG_FOOT = {
  by: '巡查03',
  time: '2006-04-12 03:41',
  text: '下沉不是删除。她还在，只是不在任何版块里。'
}

/* ---------------- 底档（「沉」深处 · 时间收窄后） ---------------- */
export const LEDGER = [
  { time: '2008-11-12', uid: 77, amount: '¥3,000', target: '4413（要求删 21 楼）', note: '0921' },
  { time: '2009-05-31', uid: 89, amount: '¥5,000', target: '4413（要求删 14、21 楼）', note: '0503' },
  { time: '2009-12-19', uid: 102, amount: '¥2,000', target: '4421（12-17 上浮后，要求重新下沉）', note: '——' },
  { time: '2010-08-07', uid: 118, amount: '¥8,000', target: '4413 + 合影', note: '附：全家福' },
  { time: '2011-01-25', uid: 129, amount: '¥4,000', target: '4413', note: '——' },
  { time: '2011-05-28', uid: 156, amount: '¥6,000', target: '4413 + 合影', note: '附：全家福' }
]

/** 底档最后一条不是交易：他把入口留下了，没有人来取。 */
export const HANDOVER = {
  time: '2011-09-14 03:30',
  text: '老七把「沉」的入口留在了 4417《版主交接帖》里，留给下一个人。没有人来取。',
  tid: 4417
}

/* ---------------- 导出工具的日志原文 ---------------- */
export const TOOL_LOG_QUICK = [
  { t: '03:36:58', text: 'login: 老槐（UID 44）  临时核销访问' },
  { t: '03:37:00', text: 'todo: 待核销注销账号  老槐（UID 44）  本人确认 ... pending' },
  { t: '03:37:02', text: 'export board/2 ... ok  (96 threads)' },
  { t: '03:37:04', text: 'export board/5 ... ok  (41 threads)' },
  { t: '03:41:12', text: 'fetch tid=4413 body ... FAILED  body_missing', bad: true },
  { t: '03:41:12', text: 'see: board/5 operation_log' },
  { t: '03:41:13', text: 'done.  195 ok, 1 failed' }
]

export const TOOL_LOG_FULL = [
  { t: '04:02:51', text: 'range = 03:33:00 - 04:44:00' },
  { t: '04:02:55', text: 'tid=4413  layers 1..44 -> 1..47  (+3)' },
  { t: '04:02:55', text: 'tid=4413  floor 45: record_missing (deleted)' },
  { t: '04:02:56', text: 'tid=4413  floor 46,47: author=13  via session uid=7' },
  { t: '04:02:58', text: 'checksum tid=4413/47 = 9f2c41d8   (last export: 4a1703bb)  DIFF' },
  { t: '04:03:00', text: 'active writer detected.  someone is still touching this.' },
  { t: '04:03:01', text: '  active writer ip = 203.0.113.7' },
  { t: '04:03:01', text: '  note: 与发布关站公告的 IP 相同。（雇你干活的人正在动它）' }
]

/** 工具待办里那一条 —— 玩家自己的旧号（他要亲手核销掉自己） */
export const TOOL_TODO = { uid: 44, name: '老槐', label: '待核销注销账号' }

/**
 * 登录页那串口令 —— **她最后一楼的日期**（2005-11-03 23:59）。
 *
 * 埋点纪律（血泪）：**必须一眼认得出是什么，并且能在别处对上。**
 * 玩家在 `/t/4413` 的 43、44 楼会看到 `2005-11-3`；他点开「显示密码」，
 * 看到的是同一天的八个数字。他不需要任何解释就能把两者对上——
 * 然后他会问：**为什么老槐的口令是这一天？** 没有人回答他。
 *
 * （曾经写成 `meikandong`（没看懂）——那是只有作者看得懂的暗号，玩家认不出来，等于没埋。）
 */
export const LOGIN_PASSWORD = '20051103'

/* ---------------- 搜索关键词表（用于测试与体检） ---------------- */
export const SEARCH_EXPECT = [
  { q: '秋江淮', hits: 0, why: '索引帖被锁，正文不入索引' },
  { q: '淮', hits: 12, why: '全是"淮南""淮河"，无她' },
  { q: '老楼', hits: 1, why: '4413 的残留标题行（点不动）' },
  { q: '四角游戏', hits: 1, why: '一条引用' },
  { q: '沉', hits: 2, why: '站规第 5 条 + 归档旧站规' },
  { q: '站规', hits: 1, why: '站规页' },
  { q: '44', hits: 1, why: '站规第 3 条' },
  { q: '王素芬', hits: 0, why: '4421 已下沉，不入索引' },
  { q: '老七', hits: 0, why: '版主名不入索引' }
]

/* ---------------- 结局（固定，不因操作改变） ---------------- */
export const END_REPORT = ['未能导出：1', '未删除：1', '未结帖：1', '未清理：6']

export const END_LAST = {
  title: '有人见过我女儿吗',
  line2: '她叫秋江淮，今年十七',
  by: '2006-04-11'
}

/* ---------------- 首页版块表里那条「残影」以外的静态数字 ---------------- */
export const ONLINE = 1
