/**
 * 会员表 —— UID 越小注册越早（2003-07-14 开站那天是 UID 1）
 *
 * gone: true  = 已注销（六位注销者，2008–2011 陆续走人）
 * me: true    = 玩家当前登录的账号 —— **老槐（UID 44）**：
 *               公司派单要求"注销账号须本人核销"，他就用临时核销访问登着自己的旧号。
 * selfUid     = 玩家自己的旧号（与 me 同一个）
 *
 * 纪律：**已注销者的 lastLogin 就是他的注销日**（版务日志里的"删号"日期要对得上）。
 * 地名一律泛称，不影射真实地点。
 */

export const LEVELS = [
  { min: 5000, name: '金牌会员', stars: 5 },
  { min: 2000, name: '银牌会员', stars: 4 },
  { min: 500, name: '高级会员', stars: 3 },
  { min: 100, name: '注册会员', stars: 2 },
  { min: 0, name: '新手上路', stars: 1 }
]

export const SELF_UID = 44
export const ME_UID = 44

/** 讣闻等站务公告的署名（UID 1 的站务马甲名） */
export const ADMIN_ALIAS = '夜航船站务'

export default [
  {
    uid: 1,
    name: '船老大',
    alias: ADMIN_ALIAS,
    title: '站长',
    credits: 9999,
    posts: 2317,
    joined: '2003-07-14',
    from: '河东 · 河沿',
    online: false,
    lastLogin: '2012-07-13',
    mod: true,
    sig: '本站由个人维护，不收赞助、不挂广告。有事先看《站规》。'
  },
  {
    uid: 3,
    name: '巡查03',
    title: '巡查',
    credits: 3200,
    posts: 1889,
    joined: '2003-07-15',
    from: '桥西',
    online: false,
    lastLogin: '2012-07-13',
    mod: true,
    sig: '只受理举报，不聊天。'
  },
  {
    uid: 7,
    name: '老七',
    title: '版主',
    credits: 8210,
    posts: 5104,
    joined: '2003-07-14',
    from: '河东',
    online: false,
    // 2011-09-14 发完《版主交接帖》之后自己注销了
    lastLogin: '2011-09-14',
    gone: true,
    mod: true,
    sig: '子不语版主。有怪事说给我听，我记着。'
  },
  {
    uid: 13,
    name: '淮',
    title: '注册会员',
    credits: 126,
    posts: 47,
    joined: '2005-03-02',
    from: '',
    online: false,
    // 断更在 2005-11-03；最后登录停在 2005-11-05。
    lastLogin: '2005-11-05',
    sig: '',
    note: '最后登录停在断更那天'
  },
  {
    uid: 44,
    name: '老槐',
    title: '注册会员',
    credits: 318,
    posts: 142,
    joined: '2003-09-21',
    from: '河东',
    online: true,
    lastLogin: '2006-09-14',
    gone: true,
    selfUid: true,
    me: true,
    note: '本人临时核销访问（2012-07-13）',
    sig: '十年没来了。'
  },

  /* ---- 六位注销者：2008–2011 陆续走人（付款日 + 2 天 = 注销日） ---- */
  { uid: 77, name: '阿半', title: '注册会员', credits: 188, posts: 52, joined: '2004-03-02', from: '城南', online: false, lastLogin: '2008-11-14', gone: true, sig: '' },
  { uid: 89, name: '老K', title: '注册会员', credits: 244, posts: 76, joined: '2004-09-19', from: '桥东', online: false, lastLogin: '2009-06-02', gone: true, sig: '' },
  { uid: 102, name: '一只柚子', title: '高级会员', credits: 720, posts: 258, joined: '2005-01-08', from: '城北', online: false, lastLogin: '2009-12-21', gone: true, sig: '' },
  { uid: 118, name: '沉默的大多数', title: '注册会员', credits: 296, posts: 84, joined: '2004-05-30', from: '河东', online: false, lastLogin: '2010-08-09', gone: true, sig: '' },
  { uid: 129, name: '半仙', title: '注册会员', credits: 160, posts: 41, joined: '2005-04-17', from: '城西', online: false, lastLogin: '2011-01-27', gone: true, sig: '' },
  { uid: 156, name: '阿虎', title: '注册会员', credits: 205, posts: 63, joined: '2004-11-11', from: '城南', online: false, lastLogin: '2011-05-30', gone: true, sig: '' },

  /* ---- 她母亲：只为找女儿注册过一次，之后再没来过 ---- */
  {
    uid: 2260,
    name: '王素芬',
    title: '新手上路',
    credits: 2,
    posts: 1,
    joined: '2006-04-11',
    from: '',
    online: false,
    lastLogin: '2006-04-11',
    sig: '',
    note: '只发过一帖'
  },

  /* ---- 衬底：夜话 / 风物 的常客 ---- */
  { uid: 12, name: '沈家老三', title: '注册会员', credits: 268, posts: 64, joined: '2003-07-14', from: '河东', online: false, lastLogin: '2012-07-13', sig: '' },
  { uid: 21, name: '城东老李', title: '注册会员', credits: 402, posts: 118, joined: '2003-07-15', from: '城东', online: false, lastLogin: '2012-07-13', sig: '喝喝茶，看看帖。' },
  { uid: 33, name: '修伞老王', title: '注册会员', credits: 155, posts: 39, joined: '2003-07-16', from: '桥东', online: false, lastLogin: '2012-07-13', sig: '' },
  { uid: 58, name: '桥头小开', title: '高级会员', credits: 640, posts: 233, joined: '2003-07-20', from: '桥西', online: false, lastLogin: '2012-07-13', sig: '桥东那家面馆已经拆了，别找了。' },
  { uid: 66, name: '河上船工', title: '注册会员', credits: 211, posts: 71, joined: '2003-07-22', from: '河沿', online: false, lastLogin: '2012-07-13', sig: '' },
  { uid: 71, name: '旧巷老周', title: '注册会员', credits: 320, posts: 90, joined: '2003-08-01', from: '旧巷', online: false, lastLogin: '2012-07-13', sig: '' },
  { uid: 88, name: '城西老张', title: '高级会员', credits: 2150, posts: 604, joined: '2003-07-14', from: '城西', online: true, lastLogin: '2012-07-13', sig: '有事说事，别发语音。' },
  { uid: 105, name: '老墙门', title: '注册会员', credits: 133, posts: 28, joined: '2003-08-10', from: '河东', online: false, lastLogin: '2012-07-13', sig: '' },

  /* ---- 4421 里那两条敷衍（无名无姓，只有这两句） ---- */
  { uid: 611, name: '路人甲', title: '注册会员', credits: 96, posts: 22, joined: '2003-07-18', from: '', online: false, lastLogin: '2012-07-13', sig: '' },
  { uid: 612, name: '路人乙', title: '注册会员', credits: 74, posts: 15, joined: '2003-07-25', from: '', online: false, lastLogin: '2012-07-13', sig: '' },

  /* ---- 公司这次的派单号（不是玩家的账号；只在工具的日志里露一面） ---- */
  {
    uid: 2012,
    name: '夜话维护',
    title: '运维',
    credits: 0,
    posts: 0,
    joined: '2012-06-20',
    from: '—',
    online: false,
    lastLogin: '2012-07-13',
    sig: ''
  }
]
