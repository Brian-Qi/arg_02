<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps({
  page: { type: Number, default: 1 },
  totalPages: { type: Number, default: 1 }
})

const route = useRoute()
const router = useRouter()

function onJump(e) {
  const v = Number(/** @type {HTMLSelectElement} */ (e.target).value)
  if (v) router.push(to(v))
}

/** 把当前 query 里的其他参数带上，只改 page */
function to(n) {
  return { path: route.path, query: { ...route.query, page: n === 1 ? undefined : n } }
}

const pages = computed(() => {
  const out = []
  const last = props.totalPages
  const cur = props.page
  out.push(1)
  for (let i = cur - 2; i <= cur + 2; i++) {
    if (i > 1 && i < last) out.push(i)
  }
  if (last > 1) out.push(last)
  // 去重 + 排序，并标记省略号
  const uniq = [...new Set(out)].sort((a, b) => a - b)
  const res = []
  let prev = 0
  for (const n of uniq) {
    if (prev && n - prev > 1) res.push('...')
    res.push(n)
    prev = n
  }
  return res
})
</script>

<template>
  <div class="pager">
    <span class="muted">共 {{ totalPages }} 页</span>
    <RouterLink v-if="page > 1" :to="to(page - 1)">上一页</RouterLink>
    <template v-for="(p, i) in pages" :key="i">
      <span v-if="p === '...'"> … </span>
      <b v-else-if="p === page">{{ p }}</b>
      <RouterLink v-else :to="to(p)">{{ p }}</RouterLink>
    </template>
    <RouterLink v-if="page < totalPages" :to="to(page + 1)">下一页</RouterLink>
    <select @change="onJump">
      <option value="">跳转</option>
      <option v-for="n in totalPages" :key="n" :value="n">{{ n }}</option>
    </select>
  </div>
</template>
