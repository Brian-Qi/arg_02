<script setup>
import { computed } from 'vue'
import BOARDS from '@/data/forum/boards'
import { user, byBoard } from '@/utils/forum'
import { SITE, CLOSING_NOTICE, ONLINE } from '@/data/forum/docs'
import { currentUid } from '@/stores/game'
import { fmtSmart } from '@/utils/time'

/**
 * 列表缓存没重建 —— 所以这两行的"最后发表"是旧的、也是错的。
 * 注意：它们**没有可点的主题**（子不语那行正是首页上的残影；版务最后一条是关站公告），
 * 所以这里**只给日期与作者，不给链接**。
 */
const LAST_OVERRIDE = {
  2: { time: '2011-9-14 03:33', uid: 7 },
  5: { time: '2012-07-13 23:58', uid: 1 }
}

const boards = computed(() => BOARDS.filter((b) => !b.hidden))

const totalTopics = computed(() => boards.value.reduce((s, b) => s + b.topics, 0))
const totalPosts = computed(() => boards.value.reduce((s, b) => s + b.posts, 0))

function lastOf(b) {
  if (LAST_OVERRIDE[b.id]) return LAST_OVERRIDE[b.id]
  const list = byBoard(b.id)
  if (!list.length) return null
  const t = list[0]
  return { time: t.time, uid: t.uid, tid: t.tid, title: t.title }
}
</script>

<template>
  <div class="panel">
    <div class="panel-hd">
      论坛首页
      <span class="more">{{ CLOSING_NOTICE.lines[0] }}（{{ CLOSING_NOTICE.by }}）</span>
    </div>
    <div class="panel-bd small muted">
      {{ SITE.name }} · 开站 {{ SITE.opened }} · 当前在线 {{ ONLINE }} 人 · 最高在线 118 人（2006-11-03）
    </div>
  </div>

  <div class="panel">
    <div class="panel-hd">版块</div>
    <div class="scroll-x">
      <table class="datatable">
        <thead>
          <tr>
            <th class="col-bdico">　</th>
            <th class="col-bdname">版块</th>
            <th class="col-bdnum num">主题</th>
            <th class="col-bdnum num">帖数</th>
            <th class="col-bdlast">最后发表</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in boards" :key="b.id">
            <td class="col-bdico"><span class="bdico" :class="{ hot: b.hot }">{{ b.ico }}</span></td>
            <td class="col-bdname">
              <RouterLink :to="`/b/${b.id}`">{{ b.name }}</RouterLink>
              <div class="bddesc">{{ b.desc }}</div>
            </td>
            <td class="num">{{ b.topics }}</td>
            <td class="num">{{ b.posts }}</td>
            <td>
              <template v-if="lastOf(b)">
                <span class="bdlast-t muted">{{ fmtSmart(lastOf(b).time) }}</span>
                <div class="bdlast-m">
                  <template v-if="lastOf(b).tid">
                    <RouterLink class="ttitle" :to="`/t/${lastOf(b).tid}`">{{ lastOf(b).title }}</RouterLink>
                    <span class="muted"> · {{ user(lastOf(b).uid).name }}</span>
                  </template>
                  <span v-else class="muted">{{ user(lastOf(b).uid).name }}</span>
                </div>
              </template>
              <span v-else class="muted">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="panel-bd small muted">
      共 {{ totalTopics }} 个主题 / {{ totalPosts }} 篇帖子 · 今日 {{ 12 }} 帖 · 昨日 {{ 31 }} 帖
    </div>
  </div>

  <div class="panel">
    <div class="panel-hd">在线会员</div>
    <div class="panel-bd small">
      当前在线 <b>{{ ONLINE }}</b> 人 ——
      <RouterLink :to="`/u/${currentUid}`">{{ user(currentUid).name }}</RouterLink>
      <span class="muted">（UID {{ currentUid }}）</span>
    </div>
  </div>
</template>
