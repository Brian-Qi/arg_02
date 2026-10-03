<script setup>
import { computed } from 'vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BOARDS from '@/data/forum/boards'
import { SITE, CLOSING_NOTICE } from '@/data/forum/docs'
import { user } from '@/utils/forum'
import { SELF_UID } from '@/data/forum/users'
import { currentUid, isImpersonating, release, logout, loggedIn } from '@/stores/game'
import { notify } from '@/composables/useNotice'

const router = useRouter()

const kw = ref('')
/** 页头上的搜索框（当年论坛的标准位置） */
function goSearch() {
  router.push({ path: '/search', query: kw.value.trim() ? { q: kw.value.trim() } : {} })
  kw.value = ''
}

function exitBorrow() {
  release()
  router.push('/')
}

/** 退出＝真退出：清掉登录与借身，回登录页 */
function doExit() {
  logout()
  router.push('/login')
}

const navBoards = computed(() => BOARDS.filter((b) => !b.readonly && !b.hidden))

/** 玩家登的是自己的旧号（老槐）—— 借身之后就不是了 */
const isSelfAccount = computed(() => currentUid.value === SELF_UID)

/** 没登录时页头照常显示外壳，只是"当前登录"是游客（Discuz 原样） */
const gw = computed(() => !loggedIn.value)
function goLogin() {
  router.push('/login')
}
function doRegister() {
  notify('本站已停止服务，注册已关闭。')
}
</script>

<template>
  <header>
    <div class="banner">
      <div class="wave"></div>
      <div class="brand">
        <h1>{{ SITE.name }}</h1>
        <p>河在这儿，人在这儿，话在这儿</p>
      </div>
      <div class="since">Opened {{ SITE.opened }} · {{ SITE.powered }}</div>
    </div>

    <nav class="nav">
      <div class="wrap nav-in">
        <div class="nowrap">
          <RouterLink to="/">论坛首页</RouterLink>
          <span class="sep">|</span>
          <template v-for="(b, i) in navBoards" :key="b.id">
            <RouterLink :to="`/b/${b.id}`">{{ b.name }}</RouterLink>
            <span v-if="i < navBoards.length - 1" class="sep">|</span>
          </template>
          <RouterLink to="/b/6">义庄</RouterLink>
          <span class="sep">|</span>
          <RouterLink to="/b/7">归档 · 2003</RouterLink>
          <span class="sep">|</span>
          <RouterLink to="/search">搜索</RouterLink>
        </div>
        <form class="navsearch nowrap" @submit.prevent="goSearch">
          <input v-model="kw" name="q" maxlength="20" placeholder="搜索" aria-label="站内搜索" />
          <button type="submit">搜索</button>
        </form>
        <div class="me nowrap">
          <template v-if="gw">
            当前登录：<b>游客</b>
            <span class="sep">|</span>
            <a href="#" @click.prevent="goLogin">登录</a>
            <span class="sep">|</span>
            <a href="#" @click.prevent="doRegister">注册</a>
          </template>
          <template v-else>
            当前登录：<b>{{ user(currentUid).name }}</b>
            <span class="uid">(UID {{ currentUid }})</span>
            <span v-if="isSelfAccount && !isImpersonating" class="muted">· 临时核销访问</span>
            <span class="sep">|</span>
            <RouterLink to="/msg">站内信</RouterLink>
            <template v-if="isImpersonating">
              <span class="sep">|</span>
              <a href="#" @click.prevent="exitBorrow">退出借身</a>
            </template>
            <span class="sep">|</span>
            <a href="#" @click.prevent="doExit">退出</a>
          </template>
        </div>
      </div>
    </nav>

    <div class="wrap">
      <div class="announce">
        <span class="tag-a">公告</span>
        <span class="roll">
          {{ CLOSING_NOTICE.lines[0] }}（{{ CLOSING_NOTICE.by }}）
        </span>
      </div>
    </div>
  </header>
</template>
