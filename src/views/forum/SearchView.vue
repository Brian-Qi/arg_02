<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { search, snippet } from '@/utils/search'
import { user, board as boardOf } from '@/utils/forum'
import { fmt } from '@/utils/time'

const route = useRoute()
const router = useRouter()

const kw = ref(String(route.query.q || ''))
const boardId = ref(String(route.query.b || ''))

const result = computed(() => search(kw.value))
const hits = computed(() => (boardId.value ? result.value.hits.filter((h) => String(h.board) === boardId.value) : result.value.hits))

function go() {
  router.replace({ path: '/search', query: { q: kw.value.trim() || undefined, b: boardId.value || undefined } })
}
</script>

<template>
  <div class="panel">
    <div class="panel-hd">
      <RouterLink to="/">夜航船 BBS</RouterLink> &raquo; 站内搜索
    </div>
    <div class="panel-bd">
      <form class="searchform" @submit.prevent="go">
        关键词：<input v-model="kw" maxlength="20" />
        版块：
        <select v-model="boardId">
          <option value="">全部</option>
          <option value="1">夜话</option>
          <option value="2">子不语</option>
          <option value="3">风物</option>
          <option value="4">寻人</option>
          <option value="5">版务</option>
          <option value="7">归档 · 2003</option>
        </select>
        <button type="submit">搜索</button>
      </form>
      <div class="muted small" style="margin-top: 8px">
        共找到 <b>{{ hits.length }}</b> 条。
      </div>
    </div>
  </div>

  <div v-if="kw.trim()" class="panel">
    <div class="panel-hd">搜索结果</div>
    <div class="scroll-x">
      <table class="datatable">
        <thead>
          <tr>
            <th class="col-ttitle">标题</th>
            <th class="col-tnum">版块</th>
            <th class="col-tnum">作者</th>
            <th class="col-tlast">发表</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(h, i) in hits" :key="i">
            <td>
              <!-- 沉里的残留行：能搜到，点不动 -->
              <span v-if="h.dead" class="ttitle dead">{{ h.title }}</span>
              <template v-else>
                <RouterLink class="ttitle" :to="`/t/${h.tid}`">{{ h.title }}</RouterLink>
                <div v-if="h.floor" class="muted small">
                  #{{ h.floor }} 楼：
                  <span v-for="(seg, j) in snippet(h.body, kw.trim())" :key="j" :class="{ hl: seg.hl }">{{ seg.t }}</span>
                </div>
              </template>
            </td>
            <td align="center">{{ boardOf(h.board).name }}</td>
            <td align="center">{{ user(h.uid).name }}</td>
            <td><span class="muted">{{ fmt(h.date) }}</span></td>
          </tr>
          <tr v-if="!hits.length">
            <td colspan="4" class="center muted">没有找到相关主题。</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.dead {
  color: #8a7b5f;
  text-decoration: none;
  cursor: default;
}
.hl {
  background: #ffef9e;
}
.searchform input,
.searchform select {
  font-family: inherit;
  font-size: 12px;
  border: 1px solid #b9ad93;
  padding: 1px 4px;
}
</style>
