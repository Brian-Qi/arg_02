import { createRouter, createWebHistory } from 'vue-router'

const ForumIndex = () => import('@/views/forum/ForumIndex.vue')
const LoginView = () => import('@/views/forum/LoginView.vue')
const BoardView = () => import('@/views/forum/BoardView.vue')
const ThreadView = () => import('@/views/forum/ThreadView.vue')
const ProfileView = () => import('@/views/forum/ProfileView.vue')
const MessagesView = () => import('@/views/forum/MessagesView.vue')
const SearchView = () => import('@/views/forum/SearchView.vue')
const EndingView = () => import('@/views/forum/EndingView.vue')
const NotFound = () => import('@/views/forum/NotFound.vue')

const routes = [
  { path: '/login', name: 'login', component: LoginView, meta: { title: '会员登录 - 夜航船 BBS' } },
  { path: '/', name: 'forum-index', component: ForumIndex, meta: { title: '夜航船 BBS - Powered by Discuz!' } },
  { path: '/b/:boardId', name: 'board', component: BoardView, props: true },
  { path: '/t/:tid', name: 'thread', component: ThreadView, props: true },
  { path: '/u/:uid', name: 'profile', component: ProfileView, props: true },
  { path: '/msg', name: 'messages', component: MessagesView, meta: { title: '站内短消息 - 夜航船 BBS' } },
  { path: '/search', name: 'search', component: SearchView, meta: { title: '站内搜索 - 夜航船 BBS' } },
  { path: '/end', name: 'ending', component: EndingView, meta: { title: '夜航船 BBS' } },
  { path: '/:pathMatch(.*)*', name: 'notfound', component: NotFound, meta: { title: '夜航船 BBS - 你访问的页面不存在' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.afterEach((to) => {
  if (to.meta && to.meta.title) document.title = String(to.meta.title)
})

export default router
