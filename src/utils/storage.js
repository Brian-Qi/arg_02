/**
 * localStorage 统一入口（照第一部的做法：统一前缀 + JSON + 不抛错）。
 * 无 DOM 环境（测试）下静默降级。
 */
const PREFIX = 'yh_'

export function getItem(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch (e) {
    return fallback
  }
}

export function setItem(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch (e) {
    /* 隐私模式 / 无 DOM：忽略 */
  }
}
