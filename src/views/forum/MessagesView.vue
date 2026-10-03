<script setup>
import { computed } from 'vue'
import { MSG_IDENTITY, INBOX, DRAFTS } from '@/data/forum/messages'
import { user } from '@/utils/forum'
import { isImpersonating } from '@/stores/game'
import { fmt } from '@/utils/time'

const allowed = computed(() => isImpersonating.value)
</script>

<template>
  <div class="panel">
    <div class="panel-hd">
      <RouterLink to="/">夜航船 BBS</RouterLink> &raquo; 站内短消息
    </div>
    <div class="panel-bd small">
      <template v-if="allowed">
        当前身份：<b>{{ user(MSG_IDENTITY.uid).name }}（UID {{ MSG_IDENTITY.uid }}）</b>
        <span class="muted">· {{ MSG_IDENTITY.note }}</span>
      </template>
      <template v-else>
        <span class="red">您没有查看短消息的权限。</span>
        <span class="muted">（此账号未开通站内信。）</span>
      </template>
    </div>
  </div>

  <template v-if="allowed">
    <div v-for="box in INBOX" :key="box.key" class="panel">
      <div class="panel-hd">
        {{ box.title }}
        <span class="more muted">收件箱</span>
      </div>
      <div class="panel-bd">
        <div v-for="(m, i) in box.lines" :key="i" class="pm">
          <div class="pm-hd">
            <b>{{ fmt(m.t) }}</b>
            <RouterLink :to="`/u/${m.from}`">{{ user(m.from).name }}</RouterLink>
            &rarr;
            <RouterLink :to="`/u/${m.to}`">{{ user(m.to).name }}</RouterLink>
          </div>
          <div class="pm-bd">
            <div v-for="(ln, j) in m.body" :key="j" class="line">{{ ln }}</div>
            <div v-if="m.img" class="attach">
              <a :href="m.img.src" target="_blank" rel="noopener">
                <img :src="m.img.src" :width="m.img.w" :height="m.img.h" :alt="m.img.name" loading="lazy" />
              </a>
              <div class="attach-name">
                附件：<a :href="m.img.src" target="_blank" rel="noopener">{{ m.img.name }}</a>
                （{{ m.img.w }}×{{ m.img.h }}）
              </div>
            </div>
          </div>
        </div>
        <div v-if="box.tail" class="muted small">{{ box.tail }}</div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-hd">
        草稿箱
        <span class="more muted">未发送</span>
      </div>
      <div class="panel-bd">
        <div v-for="(d, i) in DRAFTS" :key="i" class="pm">
          <div class="pm-hd"><b>{{ fmt(d.t) }}</b> 草稿</div>
          <div class="pm-bd">
            <div v-for="(ln, j) in d.body" :key="j" class="line">{{ ln }}</div>
          </div>
        </div>
      </div>
      <div class="panel-bd small">
        <RouterLink to="/end">结束导出 →</RouterLink>
      </div>
    </div>
  </template>
</template>

<style scoped>
.pm {
  border-bottom: 1px dashed #cfc6b4;
  padding: 8px 0;
}
.pm:last-child {
  border-bottom: 0;
}
.pm-hd {
  font-size: 12px;
  color: #6b5a3e;
}
.pm-hd b {
  margin-right: 8px;
}
.pm-bd {
  margin-top: 4px;
}
.line {
  line-height: 1.9;
}
.attach img {
  height: auto;
}
</style>
