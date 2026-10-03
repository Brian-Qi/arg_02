import { describe, it, expect } from 'vitest'

import THREADS, { HER_TID, RESIDUE, SUNK } from '@/data/forum/threads'
import { B_EXTRA } from '@/data/forum/face-b'
import USERS, { SELF_UID, ME_UID } from '@/data/forum/users'
import BOARDS from '@/data/forum/boards'
import { NOISE } from '@/data/forum/noise'
import {
  MOD_LOG,
  LEDGER,
  RULES_CURRENT,
  RULES_NOTE,
  END_REPORT,
  TOOL_LOG_QUICK,
  TOOL_LOG_FULL,
  SITE
} from '@/data/forum/docs'
import { search } from '@/utils/search'
import { postsOf, face } from '@/composables/useFace'
import { backup, setMode, setWindow } from '@/stores/backup'
import { takeover, release, login, logout, loggedIn } from '@/stores/game'
import { allThreads, user } from '@/utils/forum'

const her = THREADS.find((t) => t.tid === HER_TID)
const byTid = (tid) => allThreads().find((t) => t.tid === tid)
const toMin = (t) => {
  const m = String(t).match(/(\d{2}):(\d{2})/)
  return m ? Number(m[1]) * 60 + Number(m[2]) : NaN
}
const plusDays = (d, n) => {
  const x = new Date(d.replace(/-/g, '/'))
  x.setDate(x.getDate() + n)
  const p = (v) => String(v).padStart(2, '0')
  return x.getFullYear() + '-' + p(x.getMonth() + 1) + '-' + p(x.getDate())
}

function setFace(name) {
  release()
  setMode('quick')
  setWindow('00:00', '23:59')
  if (name === 'B') setMode('full')
  if (name === 'C') takeover(7)
}

describe('A. 数字自洽（44 / 43 / 46 / 47 / 45）', () => {
  it('4413 A 面 44 层、回复 43', () => {
    setFace('A')
    expect(postsOf(her).length).toBe(44)
    expect(her.repliesA).toBe(43)
    expect(postsOf(her).filter((p) => p.missing).length).toBe(0)
  })

  it('4413 B 面 47 层、回复 46、45 楼是洞', () => {
    setFace('B')
    const ps = postsOf(her)
    expect(ps.length).toBe(47)
    expect(ps.filter((p) => p.missing).map((p) => p.floor)).toEqual([45])
    expect(her.repliesB).toBe(46)
  })

  it('46 / 47 楼是 "已不在的人在发帖"', () => {
    setFace('B')
    const ps = postsOf(her)
    expect(ps.find((p) => p.floor === 46).ghost).toBe(true)
    expect(ps.find((p) => p.floor === 47).ghost).toBe(true)
  })

  it('列表那一行（残影）：46 / 60318 / 2011-9-14 03:33 / 老七', () => {
    expect(RESIDUE.replies).toBe(46)
    expect(RESIDUE.views).toBe(60318)
    expect(RESIDUE.lastUid).toBe(7)
    expect(RESIDUE.lastTime).toBe('2011-9-14 03:33')
  })

  it('47 楼时间 = 老七注销时间 = 残影最后发表', () => {
    const last = her.posts.concat(B_EXTRA[HER_TID]).find((p) => p.floor === 47)
    expect(last.time).toBe('2011-09-14 03:33')
    expect(user(7).lastLogin).toBe('2011-09-14')
    expect(RESIDUE.lastTime).toBe('2011-9-14 03:33')
  })

  it('标题里有"老楼"（搜索要用）', () => {
    expect(her.title).toContain('老楼')
  })

  it('她自己的楼层时间单调递增', () => {
    const mine = her.posts.filter((p) => p.uid === 13)
    for (let i = 1; i < mine.length; i++) {
      expect(mine[i].time >= mine[i - 1].time).toBe(true)
    }
  })
})

describe('B. 版务日志与底档', () => {
  it('全部操作都落在 03:33—04:44（免留痕窗口）', () => {
    for (const r of MOD_LOG) {
      const s = toMin(r.time.slice(11))
      expect(s).toBeGreaterThanOrEqual(toMin('03:33'))
      expect(s).toBeLessThanOrEqual(toMin('04:44'))
    }
  })

  it('有 删楼 4413-45 / 上浮 4421 / 第二次下沉 4421', () => {
    expect(MOD_LOG.some((r) => r.op === '删楼' && r.target === '4413-45')).toBe(true)
    expect(MOD_LOG.some((r) => r.op === '上浮' && r.target === '4421')).toBe(true)
    expect(MOD_LOG.filter((r) => r.op === '下沉' && r.target === '4421').length).toBe(2)
  })

  it('底档每笔付款日 + 2 天 = 对应会员的注销日（六组全对得上）', () => {
    expect(LEDGER.length).toBe(6)
    for (const row of LEDGER) {
      expect(user(row.uid).lastLogin).toBe(plusDays(row.time, 2))
    }
  })

  it('42 号操作里那条 2005-11-06 批量下沉对应 4414/4415/4416', () => {
    const r = MOD_LOG.find((x) => x.target === '4414,4415,4416')
    expect(r.time.startsWith('2005-11-06')).toBe(true)
  })

  it('「沉」里正好六条，且每条都能在日志里找到下沉记录', () => {
    expect(SUNK.length).toBe(6)
    for (const tid of SUNK) {
      expect(MOD_LOG.some((r) => (r.op === '下沉' || r.op === '删楼') && String(r.target).split(',').includes(String(tid)))).toBe(
        true
      )
    }
  })

  it('未清理：6 与「沉」的条数、版块表一致', () => {
    expect(END_REPORT[END_REPORT.length - 1]).toBe('未清理：6')
    expect(BOARDS.find((b) => b.id === 8).topics).toBe(SUNK.length)
  })
})

describe('C. 站规 / 讣闻 / 死期', () => {
  it('现行站规第 2 条就是那个窗口', () => {
    expect(RULES_CURRENT.join('\n')).toContain('03:33—04:44')
  })
  it('第 3 条被翻过面（现行"请务必回复"；修订说明里有旧版）', () => {
    expect(RULES_CURRENT.join('\n')).toContain('请务必回复')
    expect(RULES_NOTE.join('\n')).toContain('44')
    expect(RULES_NOTE.join('\n')).toContain('请务必回复')
  })
  it('讣闻帖 4414：站务发、写明 11 月 5 日', () => {
    const t = byTid(4414)
    expect(t.uid).toBe(1)
    expect(t.bylineAlias).toBe(true)
    expect(t.posts[0].body.join('')).toContain('11 月 5 日')
  })
  it('她走 2005-11-05，且不是靠推的（讣闻写了）', () => {
    expect(user(13).lastLogin).toBe('2005-11-05')
    expect(byTid(4414).posts[0].body.join('')).toContain('11 月 5 日')
  })
  it('老槐（玩家旧号）那一条在她生前', () => {
    const p = her.posts.find((x) => x.uid === SELF_UID)
    expect(p.time).toBe('2005-10-28 22:14')
    expect(p.time < user(13).lastLogin).toBe(true)
    expect(user(SELF_UID).selfUid).toBe(true)
    expect(user(SELF_UID).gone).toBe(true)
  })
})

describe('D. 面引擎', () => {
  it('默认 A 面', () => {
    setFace('A')
    expect(face.value).toBe('A')
  })
  it('完整导出 / 校验模式 → B 面', () => {
    setFace('A')
    setMode('full')
    expect(face.value).toBe('B')
    setMode('check')
    expect(face.value).toBe('B')
    setMode('quick')
    expect(face.value).toBe('A')
  })
  it('时间收窄到 03:33—04:44 → B 面；默认全天不算', () => {
    setFace('A')
    setWindow('03:33', '04:44')
    expect(face.value).toBe('B')
    setWindow('00:00', '23:59')
    expect(face.value).toBe('A')
    setWindow('03:30', '04:44')
    expect(face.value).toBe('A')
  })
  it('借身 → C 面；归还 → A 面', () => {
    setFace('C')
    expect(face.value).toBe('C')
    release()
    expect(face.value).toBe('A')
  })
})

describe('E. 搜索（名字搜不出来，只能一帖一帖读）', () => {
  const hits = (q) => search(q).total
  it('秋江淮 / 王素芬 / 老七 = 0 条', () => {
    setFace('A')
    expect(hits('秋江淮')).toBe(0)
    expect(hits('王素芬')).toBe(0)
    expect(hits('老七')).toBe(0)
  })
  it('淮 = 12 条（全是日常，没有她）', () => {
    expect(hits('淮')).toBe(12)
  })
  it('老楼 = 1 条，而且点不动', () => {
    const r = search('老楼')
    expect(r.total).toBe(1)
    expect(r.hits[0].tid).toBe(HER_TID)
    expect(r.hits[0].dead).toBe(true)
  })
  it('沉 = 2 条 / 站规 = 1 条 / 44 = 1 条 / 四角游戏 = 1 条', () => {
    expect(hits('沉')).toBe(2)
    expect(hits('站规')).toBe(1)
    expect(hits('44')).toBe(1)
    expect(hits('四角游戏')).toBe(1)
  })
})

describe('F. 数据完整性', () => {
  it('每条主线帖的 tid / uid / 楼层都有效', () => {
    const uids = new Set(USERS.map((u) => u.uid))
    for (const t of THREADS) {
      expect(uids.has(t.uid)).toBe(true)
      expect(BOARDS.some((b) => b.id === t.board)).toBe(true)
      expect(t.posts.length).toBeGreaterThan(0)
      for (const p of t.posts) {
        expect(uids.has(p.uid)).toBe(true)
        expect(typeof p.floor).toBe('number')
      }
      expect(t.posts[0].floor).toBe(1)
    }
  })

  it('噪声帖：作者都存在，回复时间不早于注册、不晚于最后登录', () => {
    const uids = new Set(USERS.map((u) => u.uid))
    for (const t of allThreads()) {
      if (!t.noise) continue
      for (const p of t.posts) {
        expect(uids.has(p.uid)).toBe(true)
        const u = user(p.uid)
        expect(p.time >= u.joined + ' 00:00').toBe(true)
        expect(p.time <= u.lastLogin + ' 23:59').toBe(true)
      }
    }
  })

  it('噪声的形状与主线一致（floor 连续、无缺号）', () => {
    for (const t of allThreads()) {
      if (!t.noise) continue
      t.posts.forEach((p, i) => expect(p.floor).toBe(i + 1))
    }
  })

  it('NOISE 每条都是 6 元组', () => {
    for (const n of NOISE) {
      expect(Array.isArray(n)).toBe(true)
      expect(n.length).toBe(6)
    }
  })

  it('4421 的四楼只在 B 面（老七：这里没有这个人。）', () => {
    setFace('A')
    const t = byTid(4421)
    expect(postsOf(t).length).toBe(3)
    setFace('B')
    const b = postsOf(t)
    expect(b.length).toBe(4)
    expect(b.find((p) => p.floor === 4).uid).toBe(7)
    expect(b.find((p) => p.floor === 4).body).toBe('这里没有这个人。')
  })

  it('4508 的 78 楼：注销之后还在发帖', () => {
    setFace('B')
    const p = postsOf(byTid(4508)).find((x) => x.floor === 78)
    expect(p.uid).toBe(89)
    expect(p.ghost).toBe(true)
    expect(p.time.slice(0, 10) > user(89).lastLogin).toBe(true)
  })

  it('工具：唯一一条导不出的是 4413；完整导出日志里有 +3 与校验和 DIFF', () => {
    expect(TOOL_LOG_QUICK.some((l) => l.text.includes('tid=4413'))).toBe(true)
    expect(TOOL_LOG_QUICK.some((l) => l.text.includes('body_missing'))).toBe(true)
    expect(TOOL_LOG_FULL.some((l) => l.text.includes('(+3)'))).toBe(true)
    expect(TOOL_LOG_FULL.some((l) => l.text.includes('DIFF'))).toBe(true)
    expect(TOOL_LOG_FULL.some((l) => l.text.includes('active writer'))).toBe(true)
  })

  it('站名 / 域名 / 关站日', () => {
    expect(SITE.name).toBe('夜航船 BBS')
    expect(SITE.domain).toBe('bbs.yehangchuan.cn')
    expect(SITE.opened).toBe('2003-07-14')
    expect(SITE.closed).toBe('2012-07-14')
  })

  it('玩家当前登录 = 老槐（UID 44）—— 他自己的旧号', () => {
    expect(ME_UID).toBe(44)
    expect(SELF_UID).toBe(44)
    expect(user(ME_UID).name).toBe('老槐')
    expect(user(ME_UID).selfUid).toBe(true)
    expect(user(ME_UID).gone).toBe(true)
    expect(END_REPORT.length).toBe(4)
  })

  it('登录门：默认未登录，login / logout 可控', () => {
    logout()
    expect(loggedIn.value).toBe(false)
    login()
    expect(loggedIn.value).toBe(true)
    logout()
    expect(loggedIn.value).toBe(false)
  })

  it('备份工具默认全天（不能一进来就是 B 面）', () => {
    expect(backup.timeFrom).toBe('00:00')
    expect(backup.timeTo).toBe('23:59')
  })
})
