// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import { createApp, nextTick } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'

import App from '@/App.vue'
import { backup, setMode, setWindow, grantPurge, purge } from '@/stores/backup'
import { takeover, release, login, logout, loggedIn } from '@/stores/game'
import { dismissNotice } from '@/composables/useNotice'
import { LOGIN_PASSWORD } from '@/data/forum/docs'
import { threadByTid } from '@/utils/forum'

/* 直接复用真实路由表 */
const routes = [
  { path: '/login', component: () => import('@/views/forum/LoginView.vue') },
  { path: '/', component: () => import('@/views/forum/ForumIndex.vue') },
  { path: '/b/:boardId', component: () => import('@/views/forum/BoardView.vue'), props: true },
  { path: '/t/:tid', component: () => import('@/views/forum/ThreadView.vue'), props: true },
  { path: '/u/:uid', component: () => import('@/views/forum/ProfileView.vue'), props: true },
  { path: '/msg', component: () => import('@/views/forum/MessagesView.vue') },
  { path: '/search', component: () => import('@/views/forum/SearchView.vue') },
  { path: '/end', component: () => import('@/views/forum/EndingView.vue') },
  { path: '/:pathMatch(.*)*', component: () => import('@/views/forum/NotFound.vue') }
]

async function renderAt(path) {
  const router = createRouter({ history: createMemoryHistory(), routes })
  const el = document.createElement('div')
  document.body.appendChild(el)
  const app = createApp(App)
  app.use(router)
  await router.push(path)
  await router.isReady()
  app.mount(el)
  await nextTick()
  await nextTick()
  return { el, router, app }
}

async function mountAt(path) {
  const { el } = await renderAt(path)
  return el.textContent || ''
}

/** 导航是异步的（还有懒加载的页面），等它落定再断言 */
async function flush() {
  await nextTick()
  await new Promise((r) => setTimeout(r, 120))
  await nextTick()
}

function setFace(name) {
  release()
  setMode('quick')
  setWindow('00:00', '23:59')
  if (name === 'B') setMode('full')
  if (name === 'C') takeover(7)
}

beforeEach(() => {
  login()
  setFace('A')
  backup.canPurge = false
  backup.purged = false
})

describe('页面渲染（真挂载）', () => {
  it('首页：站名、版块表、子不语那行的最后发表是老七', async () => {
    const t = await mountAt('/')
    expect(t).toContain('夜航船 BBS')
    expect(t).toContain('子不语')
    expect(t).toContain('2011-9-14 03:33')
    expect(t).toContain('老七')
    expect(t).toContain('本站将于 2012-07-14 起停止服务')
  })

  it('/b/2：列表最后一行是那条残影（46 / 60318、老七、点不动）', async () => {
    const t = await mountAt('/b/2')
    expect(t).toContain('46 / 60318')
    expect(t).toContain('最后发表：老七')
  })

  it('/t/4413 A 面：44 层，没有 45 楼那个洞', async () => {
    const t = await mountAt('/t/4413')
    expect(t).toContain('我们学校的老楼')
    expect(t).toContain('我知道了')
    expect(t).toContain('44 楼')
    expect(t).not.toContain('第 45 层不存在')
    expect(t).not.toContain('越叫越清楚了')
  })

  it('/t/4413 B 面：多出 45 缺口 + 46/47，并标出"该账号最后登录"', async () => {
    setFace('B')
    const t = await mountAt('/t/4413')
    expect(t).toContain('第 45 层不存在')
    expect(t).toContain('今天我叫回去了。')
    expect(t).toContain('楼下的名字，越叫越清楚了。')
    expect(t).toContain('47 楼')
    expect(t).toContain('2005-11-5')
  })

  it('/t/4421：A 面读不到那句；B 面读到"这里没有这个人。"', async () => {
    const a = await mountAt('/t/4421')
    expect(a).toContain('有人见过我女儿吗')
    expect(a).not.toContain('这里没有这个人')
    setFace('B')
    const b = await mountAt('/t/4421')
    expect(b).toContain('这里没有这个人。')
  })

  it('/t/4417：一楼有那条移交链接', async () => {
    const t = await mountAt('/t/4417')
    expect(t).toContain('msg.php?u=7')
  })

  it('/b/8「沉」：不在目录中 + 六条标题', async () => {
    const t = await mountAt('/b/8')
    expect(t).toContain('本版不在目录中')
    expect(t).toContain('有人见过我女儿吗')
    expect(t).toContain('（照片）老楼后门')
    expect(t).toContain('[讣告]')
  })

  it('/b/8 的帖在 A 面点进去是空的', async () => {
    const t = await mountAt('/t/4421')
    expect(t).toContain('（本主题无可见内容）')
  })

  it('/b/5：版务操作记录 + 巡查03 那句备注', async () => {
    const t = await mountAt('/b/5')
    expect(t).toContain('版务操作记录')
    expect(t).toContain('删楼')
    expect(t).toContain('下沉不是删除。她还在，只是不在任何版块里。')
    expect(t).toContain('03:47')
  })

  it('/search：秋江淮 0 条；老楼 1 条且点不动', async () => {
    const a = await mountAt('/search?q=秋江淮')
    expect(a).toContain('共找到')
    expect(a).toContain('没有找到相关主题')
    const b = await mountAt('/search?q=老楼')
    expect(b).toContain('（记录）我们学校的老楼')
  })

  it('/u/13：她的资料页（最后登录停在断更那天）', async () => {
    const t = await mountAt('/u/13')
    expect(t).toContain('淮')
    expect(t).toContain('2005-11-5')
    expect(t).toContain('最后登录')
    // 她没有注销 —— 账号还在，只是不再动了
    expect(t).toContain('离线')
  })

  it('/msg：没借身时无权限；借身之后读到要价', async () => {
    const a = await mountAt('/msg')
    expect(a).toContain('您没有查看短消息的权限')
    setFace('C')
    const b = await mountAt('/msg')
    expect(b).toContain('与加害者')
    expect(b).toContain('八千。三天。备注别写名字。')
    expect(b).toContain('沉的那个版块，我不看。')
    expect(b).toContain('第几次了。')
    expect(b).toContain('她妈上个月又来搜了一次')
  })

  it('/end：关站公告 + 四行报告 + 最后一屏是她妈的标题', async () => {
    const t = await mountAt('/end')
    expect(t).toContain('未能导出：1')
    expect(t).toContain('未删除：1')
    expect(t).toContain('未结帖：1')
    expect(t).toContain('未清理：6')
    expect(t).toContain('有人见过我女儿吗')
    expect(t).toContain('她叫秋江淮，今年十七')
  })

  it('导出工具：模式、凌晨段、唯一一条导不出；清库权限未授予时是"无权限"', async () => {
    const t = await mountAt('/')
    expect(t).toContain('数据导出工具')
    expect(t).toContain('快速导出')
    expect(t).toContain('完整导出')
    expect(t).toContain('校验模式')
    expect(t).toContain('tid=4413')
    expect(t).toContain('正文缺失')
    expect(t).toContain('核销注销账号')
    expect(t).toContain('老槐')
    expect(t).toContain('无权限')
    expect(backup.open).toBe(true)
  })

  it('P8：授予清库权限之后才出现"删除源数据"；点了什么都不发生', async () => {
    logout()
    login()
    grantPurge()
    const t = await mountAt('/')
    expect(t).toContain('删除源数据')
    purge()
    const t2 = await mountAt('/')
    // 无确认、无报错、无提示 —— 沉默就是反馈
    expect(t2).not.toContain('已执行')
    expect(t2).not.toContain('帖还在')
    expect(t2).toContain('删除源数据')
  })

  it('A/B 面：登录的就是他自己的旧号（老槐 · 临时核销访问）', async () => {
    const t = await mountAt('/')
    expect(t).toContain('当前登录')
    expect(t).toContain('老槐')
    expect(t).toContain('临时核销访问')
  })

  it('/u/44 是他的号，/t/4413 的 31 楼（在生前）也是他', async () => {
    const p = await mountAt('/u/44')
    expect(p).toContain('老槐')
    // 页面上不许写"这是你的号"—— 玩家自己认
    expect(p).not.toContain('您当年的账号')
    expect(p).toContain('已注销')
    const th = await mountAt('/t/4413')
    expect(th).toContain('楼主还在更吗')
  })

  it('借身之后页头出现"退出借身"', async () => {
    setFace('C')
    const t = await mountAt('/')
    expect(t).toContain('退出借身')
    expect(t).toContain('老七')
  })
})

describe('登录页（这是门）', () => {
  it('未登录时，深链也只能看见登录页', async () => {
    logout()
    const t = await mountAt('/t/4413')
    expect(t).toContain('会员登录')
    expect(t).toContain('注销核销')
    expect(t).toContain('老槐')
    expect(t).not.toContain('我们学校的老楼')
    expect(t).not.toContain('数据导出工具')
  })

  it('账号 / 密码 / 验证码是页面自己敲进去的（玩家没动手）', async () => {
    logout()
    const { el } = await renderAt('/login')
    expect(el.querySelector('#lgname').value).toBe('老槐')
    expect(el.querySelector('#lgpwd').value.length).toBeGreaterThan(0)
    expect(el.querySelector('#lgcap').value).toBe(el.querySelector('.captcha').textContent.trim())
  })

  it('密码框默认是掩码；勾上「显示密码」才看得见那串字', async () => {
    logout()
    const { el } = await renderAt('/login')
    const pw = el.querySelector('#lgpwd')
    expect(pw.getAttribute('type')).toBe('password')
    const box = el.querySelector('#lgshow')
    expect(box).toBeTruthy()
    box.checked = true
    box.dispatchEvent(new Event('change', { bubbles: true }))
    await nextTick()
    expect(el.querySelector('#lgpwd').getAttribute('type')).toBe('text')
    // 藏在这儿的那串：**她最后一楼的日期**（玩家能在 /t/4413 的 43、44 楼对上）
    expect(el.querySelector('#lgpwd').value).toBe('20051103')
  })

  it('那串口令 = 她最后一楼的日期（能对得上，不是作者的暗号）', async () => {
    expect(LOGIN_PASSWORD).toBe('20051103')
    const her = threadByTid(4413)
    const last = her.posts.find((p) => p.floor === 44)
    expect(last.time.slice(0, 10).replace(/-/g, '')).toBe(LOGIN_PASSWORD)
  })

  it('把密码清空 → 密码不能为空，不放行', async () => {
    logout()
    const { el, router } = await renderAt('/login')
    const pw = el.querySelector('#lgpwd')
    pw.value = ''
    pw.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()
    el.querySelector('.loginwrap form').dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }))
    await nextTick()
    expect(el.textContent).toContain('密码不能为空')
    expect(loggedIn.value).toBe(false)
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('用户名不对 → 用户名不存在，或该账号已注销', async () => {
    logout()
    const { el } = await renderAt('/login')
    const nm = el.querySelector('#lgname')
    nm.value = '路人甲'
    nm.dispatchEvent(new Event('input', { bubbles: true }))
    const pw = el.querySelector('#lgpwd')
    pw.value = 'x'
    pw.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()
    el.querySelector('.loginwrap form').dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }))
    await nextTick()
    expect(el.textContent).toContain('用户名不存在')
    expect(loggedIn.value).toBe(false)
  })

  it('验证码错 → 验证码错误，且自动换一张', async () => {
    logout()
    const { el } = await renderAt('/login')
    const pw = el.querySelector('#lgpwd')
    pw.value = 'x'
    pw.dispatchEvent(new Event('input', { bubbles: true }))
    const before = el.querySelector('.captcha').textContent
    const cap = el.querySelector('#lgcap')
    cap.value = 'zzzz'
    cap.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()
    const nm = el.querySelector('#lgname')
    nm.value = '老槐'
    nm.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()
    el.querySelector('.loginwrap form').dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }))
    await nextTick()
    expect(el.textContent).toContain('验证码错误')
    expect(loggedIn.value).toBe(false)
    expect(el.querySelector('.captcha').textContent).not.toBe('')
    expect(before.length).toBe(4)
  })

  it('填对口令与验证码 → 进论坛（页头出现老槐 · 临时核销访问）', async () => {
    logout()
    const { el, router } = await renderAt('/login')
    const pw = el.querySelector('#lgpwd')
    pw.value = 'wg-0713'
    pw.dispatchEvent(new Event('input', { bubbles: true }))
    const cap = el.querySelector('#lgcap')
    cap.value = el.querySelector('.captcha').textContent.trim()
    cap.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()
    const nm = el.querySelector('#lgname')
    nm.value = '老槐'
    nm.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()
    el.querySelector('.loginwrap form').dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }))
    await flush()
    expect(loggedIn.value).toBe(true)
    expect(router.currentRoute.value.path).toBe('/')
    expect(el.textContent).toContain('当前登录')
    expect(el.textContent).toContain('老槐')
    expect(el.textContent).toContain('临时核销访问')
  })

  it('验证码是 DOM 画出来的（没有裂图，也不用文字解释）', async () => {
    logout()
    const { el } = await renderAt('/login')
    const box = el.querySelector('.captcha')
    expect(box).toBeTruthy()
    expect(box.textContent.trim().length).toBe(4)
    expect(el.querySelector('img')).toBeNull()
    expect(el.textContent).not.toContain('图片未能加载')
  })

  it('从深链被挡下 → 登录后回到那个地址', async () => {
    logout()
    const { el, router } = await renderAt('/b/2')
    expect(el.textContent).toContain('会员登录')
    const pw = el.querySelector('#lgpwd')
    pw.value = 'x'
    pw.dispatchEvent(new Event('input', { bubbles: true }))
    const cap = el.querySelector('#lgcap')
    cap.value = el.querySelector('.captcha').textContent.trim()
    cap.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()
    const nm = el.querySelector('#lgname')
    nm.value = '老槐'
    nm.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()
    el.querySelector('.loginwrap form').dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }))
    await flush()
    expect(loggedIn.value).toBe(true)
    expect(router.currentRoute.value.path).toBe('/b/2')
    expect(el.textContent).toContain('子不语')
  })

  it('「换一个」和「注册 / 找回密码」一样，都是停站提示（不是死链接）', async () => {
    logout()
    const { el } = await renderAt('/login')
    const before = el.querySelector('.captcha').textContent
    const a = [...el.querySelectorAll('a')].find((x) => x.textContent.trim() === '换一个')
    expect(a).toBeTruthy()
    a.click()
    await nextTick()
    expect(el.textContent).toContain('本站已停止服务，验证码已关闭。')
    // 没换：验证码还是那一张
    expect(el.querySelector('.captcha').textContent).toBe(before)

    const reg = [...el.querySelectorAll('a')].find((x) => x.textContent.trim() === '注册')
    reg.click()
    await nextTick()
    expect(el.textContent).toContain('本站已停止服务，注册已关闭。')
  })

  it('未登录时页头显示"游客"，并有登录 / 注册', async () => {
    logout()
    const t = await mountAt('/login')
    expect(t).toContain('当前登录')
    expect(t).toContain('游客')
    expect(t).toContain('注册')
    expect(t).toContain('公告')
  })

  it('页头「退出」→ 回登录页，登录状态清掉', async () => {
    const { el, router } = await renderAt('/')
    const a = [...el.querySelectorAll('a')].find((x) => x.textContent.trim() === '退出')
    expect(a).toBeTruthy()
    a.click()
    await flush()
    expect(loggedIn.value).toBe(false)
    expect(router.currentRoute.value.path).toBe('/login')
  })
})

describe('占位按钮与顶栏搜索（回归）', () => {
  it('首页没有 /t/undefined（子不语那行不该有链接）', async () => {
    const { el } = await renderAt('/')
    expect(el.innerHTML).not.toContain('/t/undefined')
    expect(el.textContent).toContain('2011-9-14 03:33')
    // 子不语那格：只有日期与作者，没有可点的标题
    const tds = [...el.querySelectorAll('td')]
    const sub = tds.find((td) => td.textContent.includes('2011-9-14 03:33'))
    expect(sub).toBeTruthy()
    expect(sub.querySelectorAll('a').length).toBe(0)
  })

  it('顶栏搜索：提交后跳到 /search?q=…', async () => {
    const { el, router } = await renderAt('/')
    const input = el.querySelector('.navsearch input')
    const form = el.querySelector('.navsearch')
    input.value = '淮山'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()
    form.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }))
    await new Promise((r) => setTimeout(r, 120))
    await nextTick()
    expect(router.currentRoute.value.path).toBe('/search')
    expect(router.currentRoute.value.query.q).toBe('淮山')
  })

  it('占位按钮点了会给出站点提示（不再是死链接）', async () => {
    dismissNotice()
    const { el } = await renderAt('/b/2')
    const a = [...el.querySelectorAll('a')].find((x) => x.textContent.trim() === '发新主题')
    expect(a).toBeTruthy()
    a.click()
    await nextTick()
    expect(el.textContent).toContain('本站已停止服务，不能发新主题。')
  })

  it('「顶端」不是占位：点了不出提示条', async () => {
    dismissNotice()
    const { el } = await renderAt('/t/4413')
    const a = [...el.querySelectorAll('a')].find((x) => x.textContent.trim() === '顶端')
    expect(a).toBeTruthy()
    a.click()
    await nextTick()
    expect(el.querySelector('.noticebar')).toBeNull()
  })
})
