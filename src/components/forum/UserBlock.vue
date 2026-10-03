<script setup>
import { computed } from 'vue'
import { user, levelOf, starsOf } from '@/utils/forum'
import { fmtDate, since } from '@/utils/time'
import { notify } from '@/composables/useNotice'

const props = defineProps({
  uid: { type: Number, required: true },
  /** B 面下"已注销会员在发帖"：头像变成没点睛的纸人（空白），并标出矛盾 */
  ghost: { type: Boolean, default: false }
})

const u = computed(() => user(props.uid))
const lv = computed(() => levelOf(u.value))
const stars = computed(() => '★'.repeat(starsOf(u.value)) + '☆'.repeat(5 - starsOf(u.value)))
</script>

<template>
  <div class="u">
    <span class="avatar" :class="{ ghost: ghost }" />
    <div class="uname">
      <RouterLink :to="`/u/${u.uid}`" :class="{ gone: u.gone }">{{ u.name }}</RouterLink>
      <div v-if="ghost && u.gone" class="small red">该会员已注销</div>
      <div v-else-if="ghost" class="small red">该账号最后登录：{{ fmtDate(u.lastLogin) }}</div>
      <div class="stars">{{ stars }}</div>
    </div>

    <div class="uinfo">
      <template v-if="u.gone">
        <div><b>状态：</b><span class="st-off">已注销</span></div>
        <div><b>最后登录：</b>{{ fmtDate(u.lastLogin) }}</div>
        <div class="muted small">（{{ since(u.lastLogin) }}）</div>
      </template>
      <template v-else-if="ghost">
        <div><b>等级：</b><span class="rank">{{ u.title || lv.name }}</span></div>
        <div><b>帖子：</b>{{ u.posts }}</div>
        <div><b>注册：</b>{{ fmtDate(u.joined) }}</div>
        <div><b>最后登录：</b><span class="st-off">{{ fmtDate(u.lastLogin) }}</span></div>
      </template>
      <template v-else>
        <div>
          <b>等级：</b><span class="rank" :class="{ mod: u.mod }">{{ u.title || lv.name }}</span>
        </div>
        <div><b>积分：</b>{{ u.credits }}</div>
        <div><b>帖子：</b>{{ u.posts }}</div>
        <div><b>注册：</b>{{ fmtDate(u.joined) }}</div>
        <div v-if="u.from"><b>来自：</b>{{ u.from }}</div>
        <div>
          <b>状态：</b>
          <span :class="u.online ? 'st-on' : 'st-off'">{{ u.online ? '在线' : '离线' }}</span>
        </div>
      </template>
    </div>

    <div class="uact">
      <template v-if="!u.gone">
        <a href="#" @click.prevent="notify('本站已停止服务，站内信已关闭。')">发短消息</a> ·
        <a href="#" @click.prevent="notify('本站已停止服务，好友功能已关闭。')">加为好友</a>
      </template>
      <template v-else>
        <span class="muted small">—</span>
      </template>
    </div>
  </div>
</template>

<style scoped>
.uname .gone {
  color: #888;
  text-decoration: line-through;
}
</style>
