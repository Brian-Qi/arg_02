import { reactive, computed } from 'vue'
import { getItem, setItem } from '@/utils/storage'
import { ME_UID } from '@/data/forum/users'

/**
 * 游戏状态。
 *
 * 纪律：**所有推进都来自"做过的事"，不是"看过的话"。**
 *   loggedIn    —— 有没有从那道登录页进来（默认没有；不登进不去论坛）
 *   impersonate —— 借了谁的号（点了《版主交接帖》里那条移交链接才有的）
 *   seenEnd     —— 是否已经走到过结局屏
 *
 * 注意：**没有"玩家回帖"这回事**。玩家是来做数据导出的，不是来发帖的。
 * 也没有分支结局 —— 单结局，做多做少、做对做错，结尾那一屏一样。
 */
const state = reactive({
  loggedIn: getItem('g_loggedin', false),
  impersonate: getItem('g_impersonate', null), // uid | null
  seenEnd: getItem('g_seen_end', false)
})

export const game = state

export const loggedIn = computed(() => state.loggedIn)

/** 登录：临时核销访问（用户名固定是老槐，口令随便填都算过——站已经没人管了） */
export function login() {
  state.loggedIn = true
  setItem('g_loggedin', true)
  return true
}

/** 退出：回登录页（并且归还借身） */
export function logout() {
  state.loggedIn = false
  state.impersonate = null
  setItem('g_loggedin', false)
  setItem('g_impersonate', null)
}

/** 当前"我"是谁：借身之后就是被借的那个号 */
export const currentUid = computed(() => state.impersonate || ME_UID)

/** 是否在借身（C 面）—— 只有老七（UID 7） */
export const isImpersonating = computed(() => state.impersonate === 7)

/** 借身：点《版主交接帖》里那条链接 */
export function takeover(uid) {
  state.impersonate = uid
  setItem('g_impersonate', uid)
  return true
}

/** 归还（退出借身） */
export function release() {
  state.impersonate = null
  setItem('g_impersonate', null)
}

export function markEnd() {
  state.seenEnd = true
  setItem('g_seen_end', true)
}

/** 全部重来（给测试与"从头再看一遍"用） */
export function reset() {
  state.loggedIn = false
  state.impersonate = null
  state.seenEnd = false
  for (const k of ['g_loggedin', 'g_impersonate', 'g_seen_end']) setItem(k, null)
}
