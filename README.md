# 《本版禁止回复》

第二部网页 ARG —— 论坛体民俗微恐。
玩家受托给一个即将关闭的 2003 年老论坛（**夜航船 BBS**）做数据导出。
导出到一半会发现：那条帖删不掉，是因为**删它的人还在用它挣钱**。
**单结局、零超现实、零旁白**——没有鬼，全是人干的。

- 故事 / 真相：`../本版禁止回复_重做大纲_整合版_补充并入版.md`
- 解密链与判据：`../ARG2_解密链与解锁表.md`
- 页面上要出现什么：`../ARG2_内容清单.md`
- 页面骨架：`../ARG2_页面设计大纲.md`

---

## 全流程

```
① 改内容(数据)  →  ② 加图(素材)  →  ③ 五道闸门  →  ④ 本地看  →  ⑤ 构建/部署
      ↑                                                    │
      └──────────────── 不满意就回到 ① ←──────────────────┘
```

### 一次性准备

```bash
npm install
# 出图的 API Key 由工具本体读取（$env:GRS_KEY → F:\tools\.grs_key → F:\ARG_test\.grs_key），不入库
```

### ① 改内容（数据层 `src/data/forum/`）

| 文件 | 装什么 |
|---|---|
| `boards.js` | 版块（含隐藏版块「沉」id=8） |
| `users.js` | 会员；`gone: true` 表示已注销（其 lastLogin 就是他的注销日） |
| `threads.js` | **主线九帖**，只放 A 面看得见的楼层；`RESIDUE` 是列表那条残影 |
| `face-b.js` | B 面：45 缺口、46/47、她妈帖 4 楼、4508 的 78 楼（纸人发帖） |
| `docs.js` | 站规两版 / 公告 / 版务日志 / 底档 / 交接记录 / 工具日志 / 搜索表 / 结局 |
| `messages.js` | 私信（C 面可见）：与加害者 / 与站长 / 与巡查03 + 草稿箱 |
| `noise.js` | 噪声帖（衬底）。格式 `[board, tid, uid, 时间, 标题, [楼层…]]` |

写内容的纪律：

- **噪声必须压过主线**（当前 89%）。没有噪声，恐怖感归零。
- **回复必须针对这一帖在聊什么**（接上一楼、打圆场、讲自己经历、跑题、纠正楼主），
  不要"顶/沙发/同感"这种用不上的废话——`audit` 会点名。
- **噪声楼层的时间一律不写**，交给 `utils/forum.js` 的 `normalizeNoise` 确定性排布。
- **主线的时间必须写**，且单调递增、不早于注册、不晚于最后登录。
- **不要"顺手修"** 正文里的全角空格、错别字——那是刻意的年代感。
- 改完一定跑 `npm run audit`：它会**钉住 canon 数字**（44/43/46/47/45、日志窗口、底档 +2 天、沉 6 条）。

### ② 加图（素材管线）

出图工具本体在 `F:\tools\生图\genimg.mjs`；本项目 `scripts/` 里只有薄壳与转换脚本（不复制本体，避免两份漂移）。

```bash
# 清单：assets/manifests/forum-0N.json（现 01/02/03）
npm run gen:dry    # 先看会生成哪些文件名，不出图
npm run gen        # 出图 -> _raw_img/
npm run img:webp   # _raw_img/*.png -> public/img/*.webp（原图移入 _raw_orig/）
npm run check      # 引用体检：缺图/缺清单会以 1 退出
npm run assets     # = gen + img:webp + check（一键）
```

- **提示词必须写明"不出现任何文字、字母、数字、水印"**——AI 会在纸面、招牌、书脊上乱写字。
- **人脸一律不可辨**（红线）。需要文字的地方**一律用 DOM 渲染**。
- 引用一律写 `/img/xxx.webp` 绝对路径，并**带宽高**防 CLS。

### ③ 闸门（每次改完都要全绿）

```bash
npm run lint        # ESLint                 → 0 error 0 warning
npm run typecheck   # vue-tsc                → exit 0
npm test            # vitest 57 用例          → 全过
npm run check       # 引用/清单体检            → exit 0
npm run audit       # 全量文本体检 + canon 不变量 → exit 0
npm run build       # 生产构建                → 成功
```

- `tests/forum.spec.js` 钉**数据不变量**（面引擎、搜索、底档、日志窗口…）。
- `tests/render.spec.js` 在 **jsdom 里真挂载页面**，断言页面上真能看到那句话（这才算验证到页面）。

### ④ 本地看

```bash
npm run dev          # http://localhost:5175 —— 开发者的端口
```

第一屏是 **`/login` 会员登录（门）**：**账号 / 密码 / 验证码不是给玩家填的——是当着玩家的面一个字一个字敲进去的**，
玩家只看，敲完按「登 录」。**没登录时，任何地址都只给这一页**，但页头页脚照常在（显示"游客"）；
登进来才是论坛（页头变成 `老槐 · 临时核销访问`，导出工具才出现）。页头「退出」是真退出，回登录页。

> **验证时不要用 5175，也不要按端口杀进程。** 细节见 `AGENTS.md` 的「本地验证的纪律」。

### ⑤ 构建 / 部署（押后）

```bash
# PowerShell
$env:DEPLOY_BASE='/arg_02/'; npm run build
```

上传 `dist/` 到服务器 `/var/www/briandolph/arg_02/`；**不要碰 `/arg_01/`**（第一部）。

---

## 目录

```
src/
├── assets/styles/      # fonts → forum-base → forum-pages → forum-responsive（+ backup.css）
├── components/forum/   # 页头（含搜索框）/ 页脚（计数器）/ 用户栏（纸人）/ 楼层
├── components/backup/  # 导出工具（唯一道具）
├── composables/        # useFace：A / B / C 三面
├── data/forum/         # 版块 / 会员 / 主线帖 / B面 / 死文本 / 私信 / 噪声
├── router/
├── views/forum/        # 登录（门）/ 首页 / 帖列表 / 帖子 / 会员资料 / 搜索 / 私信 / 结局 / 404
└── utils/              # forum（含噪声归一化）/ search / time / storage
assets/manifests/       # 出图提示词清单
scripts/                # genimg 薄壳 / to-webp / check-project / audit-forum
tests/                  # 不变量（forum.spec）+ 真挂载渲染（render.spec）
```
