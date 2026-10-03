<script setup>
import { notice, dismissNotice } from '@/composables/useNotice'
</script>

<template>
  <div v-if="notice" class="noticebar" role="status" @click="dismissNotice">
    <span class="tag-a">提示</span>
    <span>{{ notice }}</span>
    <a href="#" class="cls" @click.prevent="dismissNotice">×</a>
  </div>
</template>

<style scoped>
.noticebar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 500;
  padding: 6px 12px;
  background: #fffbe6;
  border-top: 1px solid #d8c98a;
  font-size: 12px;
  color: #6b5a3e;
  cursor: pointer;
}
.noticebar .tag-a {
  display: inline-block;
  margin-right: 8px;
  padding: 0 5px;
  background: #b9ad93;
  color: #fff;
}
.noticebar .cls {
  float: right;
  text-decoration: none;
}
</style>
