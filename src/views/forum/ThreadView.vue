<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import PostItem from '@/components/forum/PostItem.vue'
import Pager from '@/components/forum/Pager.vue'
import { threadByTid, user, repliesA, repliesB, board } from '@/utils/forum'
import { postsOf, face, isSunk } from '@/composables/useFace'
import { bPartialOf } from '@/data/forum/face-b'
import { ADMIN_ALIAS } from '@/data/forum/users'
import { fmt } from '@/utils/time'
import { takeover } from '@/stores/game'

const props = defineProps({ tid: { type: String, required: true } })
const router = useRouter()

const t = computed(() => threadByTid(Number(props.tid)))

/** 沉里的帖：A 面点进去是空的（正文要「完整导出」之后才捞得回来） */
const emptied = computed(() => !!t.value && isSunk(t.value.tid) && face.value === 'A' && t.value.tid !== 4413)

const floors = computed(() => (t.value ? postsOf(t.value) : []))
const replies = computed(() => (!t.value ? 0 : face.value === 'A' ? repliesA(t.value) : repliesB(t.value)))
const partialNote = computed(() => (t.value ? bPartialOf(t.value.tid) : ''))

const authorName = computed(() => {
  if (!t.value) return ''
  return t.value.bylineAlias ? ADMIN_ALIAS : user(t.value.uid).name
})

/** 《版主交接帖》里那条移交链接 —— 点了就是借身（C 面） */
const HANDOVER_TID = 4417
function doTakeover() {
  takeover(7)
  router.push('/msg')
}
</script>

<template>
  <div v-if="!t" class="panel">
    <div class="panel-bd">指定的主题不存在或已被删除。</div>
  </div>

  <div v-else>
    <div class="panel">
      <div class="panel-hd">
        <RouterLink to="/">{{ '夜航船 BBS' }}</RouterLink> &raquo;
        <RouterLink :to="`/b/${t.board}`">{{ board(t.board).name }}</RouterLink> &raquo; 主题
      </div>
      <div class="panel-bd">
        <h1 class="ttitle-h1">
          <span v-if="t.locked" class="tag lock">锁定</span>
          {{ t.title }}
        </h1>
        <div class="small muted" style="margin-top: 6px">
          查看 {{ t.views }} · 回复 {{ replies }} · 作者
          <RouterLink :to="`/u/${t.uid}`">{{ authorName }}</RouterLink>
          · 发表于 {{ fmt(t.time) }}
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-bd small red">本主题已锁定，不再接受回复。</div>
    </div>

    <div v-if="emptied" class="panel">
      <div class="panel-bd center muted" style="padding: 40px 0">（本主题无可见内容）</div>
    </div>

    <template v-else>
      <div v-if="partialNote" class="panel">
        <div class="panel-bd small muted">{{ partialNote }}</div>
      </div>

      <PostItem
        v-for="p in floors"
        :key="p.floor"
        :post="p"
        :floor="p.floor"
        :is-owner="p.uid === t.uid"
        :locked="!!t.locked"
        :ghost="!!p.ghost"
        :team-link="t.tid === HANDOVER_TID && p.floor === 1"
        @takeover="doTakeover"
      />
    </template>

    <div class="panel">
      <div class="panel-hd">快速回复</div>
      <div class="panel-bd small muted">
        本站已停止服务，不能回复。
        <RouterLink to="/end" class="more" style="float: right">结束导出 →</RouterLink>
      </div>
    </div>

    <Pager />
  </div>
</template>

<style scoped>
/* 帖头那个大标题：12px 宋体的老论坛里，标题也就稍大一点 */
.ttitle-h1 {
  margin: 0;
  font-family: var(--y2k-head);
  font-size: 16px;
  font-weight: normal;
}
</style>
