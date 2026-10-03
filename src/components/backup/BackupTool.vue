<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  backup,
  MODES as modes,
  currentMode,
  setMode,
  setWindow,
  missingTid,
  toolLog,
  todoAccount,
  inNightWindow,
  purge,
  toggle
} from '@/stores/backup'
import { HER_TID } from '@/data/forum/threads'
import { SITE } from '@/data/forum/docs'

const router = useRouter()

const open = computed(() => backup.open)
const progress = computed(() => backup.progress)
const log = computed(() => toolLog.value)

const from = ref(backup.timeFrom)
const to = ref(backup.timeTo)

function applyRange() {
  setWindow(from.value, to.value)
}

function nightShift() {
  from.value = '03:33'
  to.value = '04:44'
  setWindow(from.value, to.value)
}

function dayShift() {
  from.value = '00:00'
  to.value = '23:59'
  setWindow(from.value, to.value)
}

/** 唯一一条导不出的 */
const failedBody = computed(() => 'tid=' + missingTid + ' · 正文缺失 · 参见【版务】操作记录')

function gotoTid() {
  router.push('/t/' + HER_TID)
}

function gotoLog() {
  router.push('/b/5')
}

function doPurge() {
  purge()
}
</script>

<template>
  <div class="tool">
    <div class="tool-hd" @click="toggle()">
      <b>数据导出工具 v0.9</b>
      <span class="muted">（{{ SITE.domain }}）</span>
      <span class="more">{{ open ? '收起 ▾' : '展开 ▴' }}</span>
    </div>

    <div v-if="open" class="tool-bd">
      <div class="row">
        <span class="lbl">模式</span>
        <button
          v-for="m in modes"
          :key="m.key"
          class="mbtn"
          :class="{ on: currentMode.key === m.key }"
          :title="m.desc"
          @click="setMode(m.key)"
        >
          {{ m.name }}
        </button>
      </div>

      <div class="row">
        <span class="lbl">时间范围</span>
        <input v-model="from" class="tin" maxlength="5" />
        —
        <input v-model="to" class="tin" maxlength="5" />
        <button class="mbtn" @click="applyRange">应用</button>
        <button class="mbtn" :class="{ on: inNightWindow }" @click="nightShift">凌晨段</button>
        <button class="mbtn" @click="dayShift">全天</button>
      </div>

      <div class="row">
        <span class="lbl">进度</span>
        <div class="bar"><i :style="{ width: progress + '%' }" /></div>
        <span class="muted">{{ progress }}%</span>
      </div>

      <div class="row">
        <span class="lbl">待办</span>
        <span class="muted">
          todo: {{ todoAccount.label }}　{{ todoAccount.name }}（UID {{ todoAccount.uid }}） ... pending
        </span>
      </div>

      <div class="row">
        <span class="lbl">文件树</span>
        <div class="tree">
          <div class="t-node">board/1&nbsp;&nbsp;夜话&nbsp;&nbsp;(812)</div>
          <div class="t-node">board/2&nbsp;&nbsp;子不语&nbsp;&nbsp;(96)</div>
          <div class="t-node">board/3&nbsp;&nbsp;风物&nbsp;&nbsp;(206)</div>
          <div class="t-node">board/4&nbsp;&nbsp;寻人&nbsp;&nbsp;(48)</div>
          <div class="t-node">board/5&nbsp;&nbsp;版务&nbsp;&nbsp;(41)</div>
          <div class="t-node">board/7&nbsp;&nbsp;归档&nbsp;&nbsp;(96)</div>
          <div class="t-node bad">board/2/4413&nbsp;&nbsp;<b>body_missing</b></div>
        </div>
      </div>

      <div class="row">
        <span class="lbl">未能导出</span>
        <div class="fail">
          <a href="#" @click.prevent="gotoTid">{{ failedBody }}</a>
          <a href="#" @click.prevent="gotoLog" class="more">[操作记录]</a>
        </div>
      </div>

      <div class="row">
        <span class="lbl">日志</span>
        <div class="log">
          <div v-for="(l, i) in log" :key="i" :class="{ bad: l.bad }">
            [{{ l.t }}] {{ l.text }}
          </div>
        </div>
      </div>

      <div class="row">
        <span class="lbl">校验和</span>
        <div class="log">
          <div>4413/44&nbsp;&nbsp;= 1c7a90e2（稳定）</div>
          <div class="bad">4413/47&nbsp;&nbsp;= 9f2c41d8（上次 4a1703bb）&nbsp;&nbsp;DIFF</div>
        </div>
      </div>

      <div class="row">
        <span class="lbl">清库</span>
        <template v-if="backup.canPurge">
          <button class="mbtn danger" @click="doPurge">删除源数据</button>
        </template>
        <span v-else class="muted">无权限。</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tool {
  border: 1px solid #b9ad93;
  background: #f4efe2;
  font-size: 12px;
  margin: 12px 0;
}
.tool-hd {
  padding: 4px 8px;
  background: #e4dcc8;
  border-bottom: 1px solid #b9ad93;
  cursor: pointer;
  display: flex;
  gap: 8px;
  align-items: center;
}
.tool-hd .more {
  margin-left: auto;
  color: #6b5a3e;
}
.tool-bd {
  padding: 8px;
}
.row {
  display: flex;
  gap: 6px;
  align-items: baseline;
  padding: 3px 0;
  flex-wrap: wrap;
}
.lbl {
  width: 64px;
  color: #6b5a3e;
  flex: 0 0 auto;
}
.mbtn {
  font-size: 12px;
  font-family: inherit;
  border: 1px solid #b9ad93;
  background: #fdfaf3;
  padding: 1px 8px;
  cursor: pointer;
}
.mbtn.on {
  background: #6b5a3e;
  color: #fff;
  border-color: #6b5a3e;
}
.mbtn.danger {
  border-color: #a33;
  color: #a33;
}
.tin {
  width: 52px;
  font-family: inherit;
  font-size: 12px;
  border: 1px solid #b9ad93;
  padding: 1px 4px;
}
.bar {
  width: 180px;
  height: 10px;
  border: 1px solid #b9ad93;
  background: #fdfaf3;
  display: inline-block;
}
.bar i {
  display: block;
  height: 100%;
  background: #6b5a3e;
}
.tree,
.log {
  font-family: Consolas, 'Courier New', monospace;
  font-size: 11px;
  line-height: 1.7;
  background: #fdfaf3;
  border: 1px solid #d8cfba;
  padding: 4px 6px;
  width: 100%;
}
.t-node.bad,
.log .bad {
  color: #a33;
}
.fail a {
  color: #a33;
}
</style>
