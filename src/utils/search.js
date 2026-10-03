import { allThreads } from '@/utils/forum'
import { SUNK } from '@/data/forum/threads'

/**
 * 站内搜索。
 *
 * 规则是**故意设计**的，而且都能用"老论坛"解释过去：
 *  ① **沉里的帖不入索引** —— 索引是站长手动生成的，下沉过的主题他只勾掉名字。
 *     结果：搜「秋江淮」「王素芬」是 0 条（她和她妈的帖都在沉里），
 *     搜「淮」只会撞上一堆"淮南""淮河"。**名字搜不出来，只能一帖一帖读。**
 *  ② **4413 标题还留在索引里** —— 那条帖当年是先进索引、后被下沉的，
 *     而索引**没有重建**。所以搜「老楼」能搜到它：
 *     一条点不开的结果。**列表上那条残影，和这条搜索结果是同一件没做完的事。**
 *  ③ **版主名不入索引**（索引只收标题与正文）。
 *
 * 帖内正文命中：只给"最早那一层"的片段。
 */
export function search(rawQuery) {
  const kw = String(rawQuery || '').trim()
  if (!kw) return { hits: [], total: 0 }

  const hits = []
  for (const t of allThreads()) {
    const sunk = SUNK.indexOf(t.tid) >= 0
    // ① 沉里的帖，只有 4413 标题那条残留
    if (sunk && t.tid !== 4413) continue

    const inTitle = String(t.title).indexOf(kw) >= 0

    let hit = null
    if (!sunk) {
      // 沉里的帖正文一概不入索引；其余帖逐层找
      for (const p of t.posts) {
        const text = bodyText(p.body)
        if (text.indexOf(kw) >= 0) {
          hit = { floor: p.floor, body: text }
          break
        }
      }
    }

    if (inTitle || hit) {
      hits.push({
        tid: t.tid,
        board: t.board,
        title: t.title,
        uid: t.uid,
        date: t.time,
        floor: hit ? hit.floor : null,
        body: hit ? hit.body : '',
        // 沉里的残留行 → 点不动
        dead: sunk
      })
    }
  }

  hits.sort((a, b) => (a.date < b.date ? 1 : -1))
  return { hits, total: hits.length }
}

function bodyText(body) {
  if (Array.isArray(body)) return body.join('　')
  return String(body == null ? '' : body)
}

/** 命中片段：截关键词前后一小段，切成"高亮/非高亮"若干段（避免 v-html） */
export function snippet(body, kw, span = 26) {
  const s = String(body || '')
  const i = s.indexOf(kw)
  if (i < 0) return [{ t: s.slice(0, span * 2), hl: false }]
  const from = Math.max(0, i - span)
  const to = Math.min(s.length, i + kw.length + span)
  const out = []
  if (from > 0) out.push({ t: '…', hl: false })
  out.push({ t: s.slice(from, i), hl: false })
  out.push({ t: kw, hl: true })
  out.push({ t: s.slice(i + kw.length, to), hl: false })
  if (to < s.length) out.push({ t: '…', hl: false })
  return out
}
