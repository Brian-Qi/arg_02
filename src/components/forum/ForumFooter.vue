<script setup>
import { SITE } from '@/data/forum/docs'

/** 页脚：计数器 · 执行时间 · Powered by —— 千禧年论坛的"仪式感"三件套 */
const VISITS = 1720557

function digits(n) {
  return String(n).padStart(7, '0').split('')
}
</script>

<template>
  <footer class="footer">
    <div class="count">
      您是第
      <span class="counter"><i v-for="(d, i) in digits(VISITS)" :key="i">{{ d }}</i></span>
      位访问者
    </div>
    <div class="power">
      Powered by <b>Discuz! 4.1.0</b> © 2001-2006 Comsenz Inc. · <span class="mono">Gzip 已启用</span> ·
      <span class="mono">{{ SITE.processed }}</span>
    </div>
    <div class="power">{{ SITE.name }} · 非经营性个人网站 · 不挂广告、不接受赞助</div>
  </footer>
</template>
