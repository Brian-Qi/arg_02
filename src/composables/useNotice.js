import { ref } from 'vue'

/**
 * 一行"论坛自己的"系统提示 —— 不是旁白，是站点 UI 的话（像 Discuz 的报错条）。
 *
 * 用在：那些占位按钮（发新主题 / 引用 / 报告 / 评分 / 发短消息 / 加为好友 / 退出）。
 * 纪律：只陈述站点的状态（"本站已停止服务，不能发帖。"），不点评、不叙述、不吓人。
 */
const message = ref('')
let timer = null

export const notice = message

export function notify(text, ms = 2600) {
  message.value = String(text || '')
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    message.value = ''
    timer = null
  }, ms)
}

export function dismissNotice() {
  if (timer) clearTimeout(timer)
  timer = null
  message.value = ''
}
