<script setup>
import { useRoute } from 'vue-router'
import ForumHeader from '@/components/forum/ForumHeader.vue'
import ForumFooter from '@/components/forum/ForumFooter.vue'
import BackupTool from '@/components/backup/BackupTool.vue'
import NoticeBar from '@/components/forum/NoticeBar.vue'
import LoginView from '@/views/forum/LoginView.vue'
import { loggedIn } from '@/stores/game'

/**
 * 门：没登录就只能看见那道登录页 —— 不管地址栏写的是什么。
 * 但**外壳（页头 / 页脚）照常在场**：同一个站，不该长成两个样子。
 * 页头那时显示"当前登录：游客"，跟 Discuz 一样。
 */
const route = useRoute()
</script>

<template>
  <ForumHeader />
  <div class="wrap">
    <RouterView v-if="loggedIn || route.path === '/login'" />
    <LoginView v-else :next="route.fullPath" />
    <ForumFooter />
  </div>
  <BackupTool v-if="loggedIn" />
  <NoticeBar />
</template>
