<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { SELF_UID } from '@/data/forum/users'
import { LOGIN_PASSWORD } from '@/data/forum/docs'
import { user } from '@/utils/forum'
import { loggedIn, login, logout, currentUid, isImpersonating } from '@/stores/game'

/**
 * 会员登录（门）。
 * 外壳（页头 / 页脚）由 App.vue 统一给 —— 同一个站，不许长成两个样子。
 *
 * **账号、密码、验证码不是玩家填的，是当着玩家的面一个字一个字敲进去的。**
 * 没有解释，没有旁白 —— 页面自己动，玩家看着。敲完停在"登 录"上，等他按。
 *
 * 校验是真的：用户名不对 / 密码空 / 验证码错，各有各的失败态。
 * 唯一"松"的地方是口令本身（站早就没人管了）—— 这一条只在规格里，不写在界面上。
 */
const props = defineProps({ next: { type: String, default: '' } })

const router = useRouter()

const ACCOUNT = '老槐'
/**
 * 他自己的口令 —— **她最后一楼的日期**（见 data/forum/docs.js 的 LOGIN_PASSWORD）。
 * 打字机敲进去时是掩码的；勾上「显示密码」才看得见。玩家能在 /t/4413 的 43、44 楼对上这一天。
 */
const PASSWD = LOGIN_PASSWORD

const name = ref('')
const pwd = ref('')
const cap = ref('')
const err = ref('')
const typing = ref(false)
const showPwd = ref(false)

const nameEl = ref(null)
const pwdEl = ref(null)
const capEl = ref(null)

const CODE_CHARS = '2345678abcdefghkmnpqrstuvwxyz'

function genCode() {
  let out = ''
  for (let i = 0; i < 4; i++) out += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  return out
}

const code = ref(genCode())

/** 无 DOM / 无动效支持 / 要求减少动效：直接到位，不起定时器（与全站一致） */
function instant() {
  return (
    typeof window === 'undefined' ||
    !window.matchMedia ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

let timers = []
function clearTimers() {
  timers.forEach((id) => clearTimeout(id))
  timers = []
}

function focusField(which) {
  const el = which === 'name' ? nameEl.value : which === 'pwd' ? pwdEl.value : capEl.value
  if (el && el.focus) el.focus()
}

/** 当着玩家的面敲进去 */
function typeAll() {
  clearTimers()
  if (instant()) {
    name.value = ACCOUNT
    pwd.value = PASSWD
    cap.value = code.value
    typing.value = false
    return
  }
  name.value = ''
  pwd.value = ''
  cap.value = ''
  typing.value = true

  const steps = [
    { field: 'name', text: ACCOUNT, settle: 460 },
    { field: 'pwd', text: PASSWD, settle: 340 },
    { field: 'cap', text: code.value, settle: 300 }
  ]

  let at = 380
  steps.forEach((step, si) => {
    timers.push(setTimeout(() => focusField(step.field), Math.max(0, at - 200)))
    for (let i = 1; i <= step.text.length; i++) {
      at += 85 + Math.random() * 75
      const piece = step.text.slice(0, i)
      timers.push(
        setTimeout(() => {
          if (step.field === 'name') name.value = piece
          else if (step.field === 'pwd') pwd.value = piece
          else cap.value = piece
        }, at)
      )
    }
    at += step.settle
    if (si === steps.length - 1) timers.push(setTimeout(() => (typing.value = false), at))
  })
}

onMounted(typeAll)
onBeforeUnmount(clearTimers)

function refreshCode() {
  code.value = genCode()
  cap.value = ''
  // 换一张之后，照样当着玩家的面把它敲进去
  if (instant()) {
    cap.value = code.value
  } else {
    typing.value = true
    let at = 180
    for (let i = 1; i <= code.value.length; i++) {
      at += 90 + Math.random() * 70
      const piece = code.value.slice(0, i)
      timers.push(
        setTimeout(() => {
          cap.value = piece
        }, at)
      )
    }
    timers.push(setTimeout(() => (typing.value = false), at + 120))
  }
}

const already = computed(() => loggedIn.value)

function submit() {
  err.value = ''
  if (String(name.value).trim() !== ACCOUNT) {
    err.value = '用户名不存在，或该账号已注销。'
    return
  }
  if (!String(pwd.value).trim()) {
    err.value = '密码不能为空。'
    return
  }
  if (String(cap.value).trim().toLowerCase() !== code.value) {
    err.value = '验证码错误。'
    refreshCode()
    return
  }
  login()
  const back = props.next && props.next !== '/login' ? props.next : '/'
  router.push(back)
}

function doRegister() {
  err.value = '本站已停止服务，注册已关闭。'
}

function doFindPwd() {
  err.value = '本站已停止服务，找回密码已关闭。'
}

/** 「换一个」也是死的 —— 停服的站上，控件全是死的（填错验证码时系统自己会换一张） */
function doRefreshCaptcha() {
  err.value = '本站已停止服务，验证码已关闭。'
}

function doLogout() {
  logout()
  err.value = ''
}
</script>

<template>
  <div class="loginwrap">
    <div class="panel">
      <div class="panel-hd">会员登录</div>

      <div class="panel-bd">
        <div v-if="err" class="errline">{{ err }}</div>

        <template v-if="already">
          <div class="row">
            您已登录：<b>{{ user(currentUid).name }}</b>
            <span class="muted">（UID {{ currentUid }}）</span>
            <span v-if="isImpersonating" class="red">· 当前是借身状态</span>
          </div>
          <div class="row">
            <RouterLink to="/">进入论坛 →</RouterLink>
            <span class="sep">|</span>
            <a href="#" @click.prevent="doLogout">退出</a>
          </div>
        </template>

        <form v-else @submit.prevent="submit">
          <div class="row">
            <label for="lgname">用户名</label>
            <input id="lgname" ref="nameEl" v-model="name" name="username" maxlength="20" autocomplete="off" />
          </div>
          <div class="row">
            <label for="lgpwd">密　码</label>
            <input
              id="lgpwd"
              ref="pwdEl"
              v-model="pwd"
              name="password"
              :type="showPwd ? 'text' : 'password'"
              maxlength="20"
              autocomplete="off"
            />
            <label class="showpwd" for="lgshow">
              <input id="lgshow" v-model="showPwd" type="checkbox" />
              显示密码
            </label>
          </div>
          <div class="row">
            <label for="lgcap">验证码</label>
            <input id="lgcap" ref="capEl" v-model="cap" name="captcha" maxlength="4" autocomplete="off" class="capinput" />
            <span class="captcha">{{ code }}</span>
            <a href="#" class="small" @click.prevent="doRefreshCaptcha">换一个</a>
          </div>
          <div class="row">
            <label>&nbsp;</label>
            <button type="submit" class="btn">登 录</button>
            <a href="#" class="small" @click.prevent="doRegister">注册</a>
            <span class="sep">|</span>
            <a href="#" class="small" @click.prevent="doFindPwd">找回密码</a>
          </div>
        </form>
      </div>

      <div class="panel-bd small">
        <div class="red">本次为<b>注销核销</b>的临时访问：请勿修改、删除任何数据。</div>
        <div class="muted" style="margin-top: 6px">
          工单 <b>WG-0713</b> · 核销对象：<b>老槐（UID {{ SELF_UID }}）</b>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loginwrap {
  max-width: 520px;
  margin: 20px auto 0;
}
.row {
  padding: 4px 0;
  font-size: 12px;
}
.row label {
  display: inline-block;
  width: 62px;
  color: #6b5a3e;
}
.row input {
  width: 160px;
  font-family: inherit;
  font-size: 12px;
  border: 1px solid #b9ad93;
  padding: 2px 4px;
  background: #fff;
}
.row input.capinput {
  width: 68px;
}
/* 「显示密码」：老表单那种小勾选框，紧贴密码框右侧。
   注意选择器要写成 .row label.showpwd —— 不然会被上面的 .row label{width:62px} 压回去，四个字就折行了 */
.row label.showpwd {
  display: inline-block;
  width: auto;
  margin-left: 8px;
  font-size: 11px;
  color: #8a7b5f;
  white-space: nowrap;
  cursor: pointer;
}
.row label.showpwd input[type='checkbox'] {
  width: auto;
  margin: 0 2px 0 0;
  vertical-align: -1px;
}
.errline {
  margin-bottom: 8px;
  padding: 4px 8px;
  border: 1px solid #e0b4b4;
  background: #fff3f3;
  color: #a33;
  font-size: 12px;
}
.btn {
  font-family: inherit;
  font-size: 12px;
  padding: 2px 16px;
  border: 1px solid #6b5a3e;
  background: #e4dcc8;
  cursor: pointer;
}
/* 验证码：DOM 画的，不是图 —— 老论坛那种歪歪扭扭的四位码 */
.captcha {
  display: inline-block;
  margin: 0 6px;
  padding: 0 8px;
  border: 1px solid #c9bda3;
  background: repeating-linear-gradient(45deg, #fdfaf3 0 3px, #f1ead8 3px 6px);
  font-family: 'Courier New', monospace;
  font-size: 13px;
  letter-spacing: 4px;
  color: #6b5a3e;
  text-decoration: line-through;
  vertical-align: middle;
  user-select: none;
}
</style>
