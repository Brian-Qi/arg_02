<script setup>
import { computed } from 'vue'
import { user, levelOf, starsOf, byBoard, repliesA } from '@/utils/forum'
import { fmtDate, fmt, since } from '@/utils/time'
import { face } from '@/composables/useFace'

const props = defineProps({ uid: { type: String, required: true } })

const u = computed(() => user(Number(props.uid)))
const lv = computed(() => levelOf(u.value))
const stars = computed(() => '★'.repeat(starsOf(u.value)) + '☆'.repeat(5 - starsOf(u.value)))
const paper = computed(() => face.value !== 'A' && u.value.gone)

/** 他发过的、还看得见的主题 */
const threads = computed(() =>
  [1, 2, 3, 4, 5, 7]
    .flatMap((bid) => byBoard(bid))
    .filter((t) => t.uid === u.value.uid)
    .slice(0, 20)
)
</script>

<template>
  <div class="panel">
    <div class="panel-hd">
      <RouterLink to="/">夜航船 BBS</RouterLink> &raquo; 会员资料
    </div>
    <div class="panel-bd">
      <table class="profile">
        <tbody>
          <tr>
            <td class="k">用户名</td>
            <td>
              <span class="avatar" :class="{ ghost: paper }" />
              <b>{{ u.name }}</b>
            </td>
          </tr>
          <tr>
            <td class="k">用户组</td>
            <td><span class="rank" :class="{ mod: u.mod }">{{ u.title || lv.name }}</span> {{ stars }}</td>
          </tr>
          <tr>
            <td class="k">UID</td>
            <td>{{ u.uid }}</td>
          </tr>
          <tr>
            <td class="k">注册时间</td>
            <td>{{ fmtDate(u.joined) }}</td>
          </tr>
          <tr>
            <td class="k">帖子</td>
            <td>{{ u.posts }}</td>
          </tr>
          <tr>
            <td class="k">积分</td>
            <td>{{ u.credits }}</td>
          </tr>
          <tr v-if="u.from">
            <td class="k">来自</td>
            <td>{{ u.from }}</td>
          </tr>
          <tr>
            <td class="k">最后登录</td>
            <td>
              {{ fmtDate(u.lastLogin) }}
              <span class="muted">（{{ since(u.lastLogin) }}）</span>
            </td>
          </tr>
          <tr>
            <td class="k">状态</td>
            <td>
              <span v-if="u.gone" class="st-off">已注销</span>
              <span v-else :class="u.online ? 'st-on' : 'st-off'">{{ u.online ? '在线' : '离线' }}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="u.sig" class="muted" style="margin-top: 8px">签名档：{{ u.sig }}</div>
    </div>
  </div>

  <div class="panel">
    <div class="panel-hd">该会员发表过的主题</div>
    <div class="scroll-x">
      <table class="datatable">
        <thead>
          <tr>
            <th class="col-ttitle">标题</th>
            <th class="col-tnum num">回复</th>
            <th class="col-tlast">最后发表</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in threads" :key="t.tid">
            <td><RouterLink class="ttitle" :to="`/t/${t.tid}`">{{ t.title }}</RouterLink></td>
            <td class="num">{{ repliesA(t) }}</td>
            <td><span class="muted">{{ fmt(t.time) }}</span></td>
          </tr>
          <tr v-if="!threads.length">
            <td colspan="3" class="center muted">没有找到该会员发表的、还看得见的主题。</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.profile {
  width: auto;
  border-collapse: collapse;
}
.profile td {
  padding: 4px 10px 4px 0;
  font-size: 12px;
  vertical-align: top;
}
.profile .k {
  color: #6b5a3e;
  width: 84px;
}
</style>
