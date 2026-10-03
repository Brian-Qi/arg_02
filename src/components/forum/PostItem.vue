<script setup>
import { computed } from 'vue'
import UserBlock from './UserBlock.vue'
import { user, floorName } from '@/utils/forum'
import { fmt } from '@/utils/time'
import { notify } from '@/composables/useNotice'

/** 「顶端」是真的滚回顶部（不是占位）；其余几个是占位，点了给一句站点提示 */
function toTop() {
  // 无 DOM / 无动效支持（测试环境）时不折腾
  const canScroll = typeof window !== 'undefined' && window.matchMedia
  if (!canScroll) return
  try {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (e) {
    /* 忽略 */
  }
}

/**
 * 一个楼层。
 * - body 可以是字符串，也可以是若干行
 * - missing: true → 被删掉、只剩一个洞的楼层（`[第 45 层不存在]`）
 * - ghost: true   → "已不在的人在发帖"（B 面）
 * - teamLink: true→ 《版主交接帖》一楼里那条移交链接（点了＝借身）
 */
const props = defineProps({
  post: { type: Object, required: true },
  floor: { type: Number, required: true },
  isOwner: { type: Boolean, default: false },
  locked: { type: Boolean, default: false },
  ghost: { type: Boolean, default: false },
  teamLink: { type: Boolean, default: false }
})

const emit = defineEmits(['takeover'])

const u = computed(() => user(props.post.uid))
const lines = computed(() => (Array.isArray(props.post.body) ? props.post.body : [props.post.body]))

const ghostTag = computed(() => {
  if (!props.ghost) return ''
  return u.value.gone ? '该会员已注销' : '该账号最后登录：' + (u.value.lastLogin || '—')
})
</script>

<template>
  <!-- 被删掉的那一层：只剩一个洞 -->
  <div v-if="post.missing" class="post-missing">[第 {{ floor }} 层不存在]</div>

  <div v-else class="post" :class="{ ghostly: ghost }">
    <UserBlock :uid="post.uid" :ghost="ghost" />

    <div class="c">
      <div class="cbar">
        <span class="fl">
          <b>{{ floorName(floor) }}</b>
          <span v-if="isOwner" class="tag top">楼主</span>
          <span v-if="ghost" class="tag lock">{{ ghostTag }}</span>
        </span>
        发表于 {{ fmt(post.time) }} ·
        <a href="#" @click.prevent="notify('本站已停止服务，筛选已关闭。')">只看该用户</a>
      </div>

      <div class="cbd">
        <div class="body">
          <div v-for="(ln, i) in lines" :key="i" class="line">{{ ln }}</div>
        </div>

        <div v-if="teamLink" class="act">
          <a href="#" @click.prevent="emit('takeover')">msg.php?u=7&amp;k=6d1f9a</a>
        </div>

        <div v-if="post.img" class="attach">
          <a :href="post.img.src" target="_blank" rel="noopener">
            <img :src="post.img.src" :width="post.img.w" :height="post.img.h" :alt="post.img.name" loading="lazy" />
          </a>
          <div class="attach-name">
            附件：<a :href="post.img.src" target="_blank" rel="noopener">{{ post.img.name }}</a>
            （{{ post.img.w }}×{{ post.img.h }}）
          </div>
        </div>
      </div>

      <div class="cactions">
        <template v-if="!locked">
          <a href="#" @click.prevent="notify('本站已停止服务，不能引用。')">引用</a>
          <a href="#" @click.prevent="notify('本站已停止服务，举报通道已关闭。')">报告</a>
        </template>
        <span v-else class="muted">引用</span>
        <a href="#" @click.prevent="notify('本站已停止服务，评分已关闭。')">评分</a>
        <a href="#" @click.prevent="toTop">顶端</a>
      </div>

      <div v-if="u.sig" class="sig">{{ u.sig }}</div>
    </div>
  </div>
</template>

<style scoped>
/* 被删掉的那一层：只剩一个洞 —— 不解释，只是"没有" */
.post-missing {
  margin: 6px 0;
  padding: 6px 10px;
  border: 1px dashed #cfc6b4;
  background: #f7f3e8;
  color: #8a7b5f;
  font-size: 11px;
  text-align: center;
}
.body {
  font-size: 14px;
  line-height: 1.9;
}
.line {
  min-height: 1.9em;
}
.sig {
  margin: 8px 12px 0;
}
.attach img {
  height: auto;
}
.cactions {
  margin: 8px 12px 0;
  text-align: right;
  font-size: 11px;
}
.cactions a {
  margin-left: 10px;
}
.cactions .muted {
  margin-left: 10px;
}
</style>
