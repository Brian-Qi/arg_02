<script setup>
import { ref } from 'vue'
import { SITE, CLOSING_NOTICE, END_REPORT, END_LAST } from '@/data/forum/docs'
import { markEnd } from '@/stores/game'

const black = ref(false)

function goBlack() {
  black.value = true
  markEnd()
}
</script>

<template>
  <!-- 最后一屏，之后黑屏 -->
  <div v-if="black" class="blackout" @click="goBlack" />

  <template v-else>
    <div class="panel">
      <div class="panel-hd">主题列表 - 夜航船 BBS</div>
      <div class="panel-bd center" style="padding: 24px 0">
        <div style="font-size: 15px; line-height: 2.2">
          {{ CLOSING_NOTICE.lines[0] }}
        </div>
        <div class="muted" style="margin-top: 6px">—— {{ CLOSING_NOTICE.by }}</div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-hd">导出报告</div>
      <div class="panel-bd">
        <pre class="report">{{ END_REPORT.join('\n') }}</pre>
      </div>
      <div class="panel-bd small muted">
        {{ SITE.domain }} · {{ SITE.processed }} · 当前在线 1 人
      </div>
    </div>

    <div class="panel">
      <div class="panel-bd center">
        <a href="#" @click.prevent="goBlack">关闭窗口</a>
      </div>
    </div>

    <div class="lastscreen" @click="goBlack">
      <div class="lt">{{ END_LAST.title }}</div>
      <div class="l2">{{ END_LAST.line2 }}</div>
      <div class="lb">—— {{ END_LAST.by }}</div>
    </div>

    <div class="panel">
      <div class="panel-bd small muted" style="text-align: center">
        点一下，屏就黑了。
      </div>
    </div>
  </template>
</template>

<style scoped>
.report {
  font-family: inherit;
  font-size: 13px;
  line-height: 2;
  margin: 0;
  white-space: pre-wrap;
}
.lastscreen {
  margin: 18px auto;
  padding: 60px 20px;
  max-width: 480px;
  text-align: center;
  border: 1px solid #cfc6b4;
  background: #fdfaf3;
  cursor: pointer;
}
.lastscreen .lt {
  font-size: 18px;
  letter-spacing: 2px;
}
.lastscreen .l2 {
  margin-top: 10px;
  font-size: 14px;
}
.lastscreen .lb {
  margin-top: 16px;
  font-size: 12px;
  color: #8a7b5f;
}
.blackout {
  position: fixed;
  inset: 0;
  background: #000;
  z-index: 9999;
  cursor: pointer;
}
</style>
