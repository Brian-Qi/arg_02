import { reactive, computed } from 'vue'
import { getItem, setItem } from '@/utils/storage'
import { HER_TID, RESIDUE } from '@/data/forum/threads'
import { TOOL_LOG_QUICK, TOOL_LOG_FULL, TOOL_TODO } from '@/data/forum/docs'

/**
 * 导出工具的状态（模块级单例，照第一部的做法不用 Pinia）。
 *
 * 这是玩家唯一的"道具"，也是换面的物理载体：
 *   quick  快速导出 —— 只看得到仍然存在的东西（A 面视角）
 *   full   完整导出 —— 连被删的、被沉的一并捞出来（B 面）
 *   check  校验模式 —— 交叉比对，把缺的那一条浮出来（B 面）
 *
 * 时间范围是换面的第二个入口：只有**收窄到** 03:33—04:44 才成立。
 * 默认 00:00—23:59 是"包含"凌晨段的，那样人人都在 B 面。
 */
const state = reactive({
  open: getItem('bk_open', true),
  mode: getItem('bk_mode', 'quick'),
  progress: 0,
  running: false,
  timeFrom: getItem('bk_from', '00:00'),
  timeTo: getItem('bk_to', '23:59'),
  /** P8：站长给了清库权限之后，玩家才敢点的那一下 */
  canPurge: getItem('bk_canpurge', false),
  purged: getItem('bk_purged', false)
})

let timer = null

export const backup = state

export const MODES = [
  { key: 'quick', name: '快速导出', desc: '只导出仍然存在的主题' },
  { key: 'full', name: '完整导出', desc: '含被删、被沉、已注销的记录' },
  { key: 'check', name: '校验模式', desc: '交叉比对引用与存在，列出缺号' }
]

export const currentMode = computed(() => MODES.find((m) => m.key === state.mode) || MODES[0])

/** 工具待办里那一条：玩家自己的旧号 */
export const todoAccount = TOOL_TODO

/** 唯一一条导不出的 */
export const missingTid = HER_TID

/** 列表上那条残影的数字（列表 46 / 帖内 43 —— 差 3） */
export const residue = RESIDUE

/** 日志：快速导出得到前半段；完整导出 / 收窄之后追加后半段 */
export const toolLog = computed(() => {
  const deep = state.mode !== 'quick' || inNightWindow.value
  return deep ? TOOL_LOG_QUICK.concat(TOOL_LOG_FULL) : TOOL_LOG_QUICK
})

/**
 * 导出时间范围是否**被收窄到** 03:33—04:44 之内（不是"包含"）。
 */
export const inNightWindow = computed(() => state.timeFrom >= '03:33' && state.timeTo <= '04:44')

export function setMode(key) {
  state.mode = key
  setItem('bk_mode', key)
  run()
}

/** 设定导出时间范围（换面的第二个入口） */
export function setWindow(from, to) {
  state.timeFrom = from
  state.timeTo = to
  setItem('bk_from', from)
  setItem('bk_to', to)
  run()
}

export function grantPurge() {
  state.canPurge = true
  setItem('bk_canpurge', true)
}

/**
 * 「删除源数据」。
 * 无确认、无报错、无提示 —— 它删的是**你手里那份副本**，
 * 服务器上那份从来不归玩家管。所以点了之后，帖还在。
 */
export function purge() {
  state.purged = true
  setItem('bk_purged', true)
  return { ok: true, silent: true }
}

export function run() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  // 无 DOM（测试环境）或系统要求减少动效时，直接到位，不起定时器
  const noDom = typeof window === 'undefined'
  const reduce =
    !noDom &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (noDom || reduce) {
    state.progress = 100
    state.running = false
    return
  }
  state.progress = 0
  state.running = true
  timer = setInterval(() => {
    state.progress = Math.min(100, state.progress + 7)
    if (state.progress >= 100) {
      clearInterval(timer)
      timer = null
      state.running = false
    }
  }, 60)
}

export function toggle(force) {
  state.open = typeof force === 'boolean' ? force : !state.open
  setItem('bk_open', state.open)
  if (state.open && state.progress === 0) run()
}
