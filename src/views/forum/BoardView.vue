<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Pager from '@/components/forum/Pager.vue'
import { board as getBoard, user, byBoard, repliesA, lastPostOf, threadByTid } from '@/utils/forum'
import { RESIDUE, SUNK } from '@/data/forum/threads'
import { MOD_LOG, MOD_LOG_FOOT, SITE } from '@/data/forum/docs'
import { fmt, fmtSmart } from '@/utils/time'
import { isB } from '@/composables/useFace'
import { notify } from '@/composables/useNotice'

const props = defineProps({ boardId: { type: String, required: true } })
const route = useRoute()

const PER_PAGE = 20

const bd = computed(() => getBoard(props.boardId))
const isSunkBoard = computed(() => Number(props.boardId) === 8)

/** 沉里的六条：按主楼时间倒序（与版务日志的下沉记录一一对应） */
const sunkRows = computed(() =>
  SUNK.map((tid) => threadByTid(tid))
    .filter(Boolean)
    .slice()
    .sort((a, b) => (a.time < b.time ? 1 : -1))
)

const list = computed(() => (bd.value ? byBoard(bd.value.id) : []))
const page = computed(() => Math.max(1, Number(route.query.page) || 1))
const totalPages = computed(() => Math.max(1, Math.ceil(list.value.length / PER_PAGE)))
const rows = computed(() => list.value.slice((page.value - 1) * PER_PAGE, page.value * PER_PAGE))

/** 列表那一行残影：空标题、点不动。数字却是"最新"的（46 / 2011-9-14 老七） */
const showResidue = computed(() => Number(props.boardId) === RESIDUE.board)
const residueUser = computed(() => user(RESIDUE.lastUid))
</script>

<template>
  <div v-if="!bd" class="panel">
    <div class="panel-bd">版块不存在或已被删除。</div>
  </div>

  <div v-else>
    <div class="panel">
      <div class="panel-hd">
        <RouterLink to="/">{{ SITE.name }}</RouterLink> &raquo; {{ bd.name }}
        <span class="more">
          <template v-if="bd.mods.length"
            >版主：<template v-for="(m, i) in bd.mods" :key="m"
              ><RouterLink :to="`/u/${m}`">{{ user(m).name }}</RouterLink
              ><span v-if="i < bd.mods.length - 1">、</span></template
            ></template
          >
          <span v-else class="muted">版主：空缺</span>
        </span>
      </div>
      <div class="panel-bd small">
        {{ bd.desc }}
        <span class="muted">（主题 {{ bd.topics }} · 帖数 {{ bd.posts }}）</span>
      </div>
    </div>

    <div v-if="bd.readonly" class="panel">
      <div class="panel-bd small red">本版为只读存档，不接受新主题与回复。</div>
    </div>

    <div v-if="isSunkBoard" class="panel">
      <div class="panel-bd small red">
        本版不在目录中。您是通过地址直接进来的。
      </div>
    </div>

    <div v-else-if="isB" class="panel">
      <div class="panel-bd small red">完整导出视图：本列表包含已被下沉、但记录仍在的主题。</div>
    </div>

    <!-- 版务：操作记录（不是主题） -->
    <div v-if="Number(boardId) === 5" class="panel">
      <div class="panel-hd">版务操作记录</div>
      <div class="scroll-x">
        <table class="datatable">
          <thead>
            <tr>
              <th class="col-tlast">时间</th>
              <th class="col-tnum">操作</th>
              <th class="col-ttitle">目标</th>
              <th class="col-tnum">操作人</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in MOD_LOG" :key="i">
              <td><span class="muted">{{ fmt(r.time) }}</span></td>
              <td align="center">{{ r.op }}</td>
              <td>
                <template v-if="r.op === '下沉' || r.op === '上浮'">
                  <RouterLink v-if="threadByTid(Number(String(r.target).split(',')[0]))" :to="`/t/${String(r.target).split(',')[0]}`">{{
                    r.target
                  }}</RouterLink>
                  <span v-else>{{ r.target }}</span>
                </template>
                <span v-else>{{ r.target }}</span>
              </td>
              <td align="center">{{ r.by }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="panel-bd small">
        <span class="muted">{{ fmt(MOD_LOG_FOOT.time) }} · {{ MOD_LOG_FOOT.by }}：</span>{{ MOD_LOG_FOOT.text }}
        <div class="muted" style="margin-top: 4px">
          <RouterLink to="/t/3">见《站规》第 2 条</RouterLink>
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-hd">
        {{ isSunkBoard ? '下沉区' : '主题列表' }}
        <span class="more">
          <a href="#" @click.prevent="notify('本站已停止服务，不能发新主题。')">发新主题</a> ·
          <a href="#" @click.prevent="notify('本站已停止服务，筛选已关闭。')">全部主题</a> ·
          <a href="#" @click.prevent="notify('本站已停止服务，筛选已关闭。')">精华区</a>
        </span>
      </div>
      <div class="scroll-x">
        <table class="datatable">
          <thead>
            <tr>
              <th class="col-tico">　</th>
              <th class="col-ttitle">标题</th>
              <th class="col-tnum num">作者</th>
              <th class="col-tnum num">回复/查看</th>
              <th class="col-tlast">最后发表</th>
            </tr>
          </thead>
          <tbody>
            <!-- 沉：六条 -->
            <template v-if="isSunkBoard">
              <tr v-for="t in sunkRows" :key="t.tid">
                <td class="col-tico"><span class="tstat" :class="t.locked ? 'hot' : 'new'">沉</span></td>
                <td>
                  <span v-if="t.locked" class="tag lock">锁定</span>
                  <RouterLink class="ttitle" :to="`/t/${t.tid}`">{{ t.title }}</RouterLink>
                </td>
                <td class="num"><RouterLink :to="`/u/${t.uid}`">{{ user(t.uid).name }}</RouterLink></td>
                <td class="num">{{ repliesA(t) }} / {{ t.views }}</td>
                <td><span class="bdlast-t muted">{{ fmtSmart(t.time) }}</span></td>
              </tr>
            </template>

            <!-- 普通版块 -->
            <template v-else>
              <tr v-for="t in rows" :key="t.tid">
                <td class="col-tico">
                  <span class="tstat" :class="t.noise ? 'new' : 'hot'">{{ t.noise ? '新' : '精' }}</span>
                </td>
                <td>
                  <span v-if="t.locked" class="tag lock">锁定</span>
                  <RouterLink class="ttitle" :to="`/t/${t.tid}`">{{ t.title }}</RouterLink>
                </td>
                <td class="num"><RouterLink :to="`/u/${t.uid}`">{{ user(t.uid).name }}</RouterLink></td>
                <td class="num">{{ repliesA(t) }} / {{ t.views }}</td>
                <td>
                  <span class="bdlast-t muted">{{ fmtSmart(t.time) }}</span>
                  <div class="bdlast-m">
                    最后回复：<RouterLink :to="`/u/${lastPostOf(t).uid}`">{{ user(lastPostOf(t).uid).name }}</RouterLink>
                  </div>
                </td>
              </tr>
              <tr v-if="!rows.length">
                <td colspan="5" class="center muted">本版暂无主题</td>
              </tr>
            </template>

            <!-- 列表最后一行：那条残影。空标题、没有链接、点不动。 -->
            <tr v-if="showResidue" class="residue">
              <td class="col-tico"><span class="tstat new">新</span></td>
              <td><span class="ttitle dead">　</span></td>
              <td class="num">　</td>
              <td class="num">{{ RESIDUE.replies }} / {{ RESIDUE.views }}</td>
              <td>
                <span class="bdlast-t muted">{{ fmtSmart(RESIDUE.lastTime) }}</span>
                <div class="bdlast-m muted">最后发表：{{ residueUser.name }}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Pager v-if="!isSunkBoard" :page="page" :total-pages="totalPages" />
    </div>
  </div>
</template>

<style scoped>
/* 点不动的那个标题：看着是标题，其实是死的 */
.dead {
  color: #8a7b5f;
  text-decoration: none;
  cursor: default;
}
/* 列表最后那一行残影：和普通行一样 —— 异常不在样式上，在"它是空的" */
.residue .tstat {
  opacity: 0.85;
}
</style>
