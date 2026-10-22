/**
 * 站点全局配置 — 改 CPS_PARAM 一处即可全局生效。
 * 已填入与公众号推广相同的 CPS 参数；改此值即全局生效。
 */
window.SITE_CONFIG = {
  /** CPS 归因参数（写入小程序码 / URL Link / 开放标签 path：?wxgamepro=...） */
  CPS_PARAM: 'CpsCBgAAoXkpQY91L_hAQA-i',

  /** query 键名，一般勿改 */
  CPS_QUERY_KEY: 'wxgamepro',

  siteName: '微信小游戏精选 · PC 畅玩',
  siteTagline: '精选可在微信 PC 版畅玩的小游戏，手机扫码或电脑搜索即可开始',

  /** 唤起相关：未配置前保持 pending，页面显示「待配置」 */
  deepLinkEnabled: true,
  deepLinkNote: '已接入服务商「推广游戏列表」',
  /** 合集首页用的 CPS 游戏列表 H5 链接（A-GZH-DT） */
  LIST_PROMO_URL: "https://game.weixin.qq.com/cgi-bin/comm/openlink?auth_appid=wx62d9035fd4fd2059&url=https%3A%2F%2Fgame.weixin.qq.com%2Fcgi-bin%2Fminigame%2Fstatic%2Fcps-transfer%2Findex.html%3Ft%3DAARwtQwFAAABAAAAAACakndSXwp4OvR1Im_ZahAAAADA8RG5WEKQmoqKviNESI_t3LmTvWmzAdcdEVGimIgQO_pMkMFabKpxbdphzn-pobcHZQQtcspgb5Ob%26wechat_pkgid%3Dminigame__cps_transfer_index",
  deepLinkUrl: "https://game.weixin.qq.com/cgi-bin/comm/openlink?auth_appid=wx62d9035fd4fd2059&url=https%3A%2F%2Fgame.weixin.qq.com%2Fcgi-bin%2Fminigame%2Fstatic%2Fcps-transfer%2Findex.html%3Ft%3DAARwtQwFAAABAAAAAACakndSXwp4OvR1Im_ZahAAAADA8RG5WEKQmoqKviNESI_t3LmTvWmzAdcdEVGimIgQO_pMkMFabKpxbdphzn-pobcHZQQtcspgb5Ob%26wechat_pkgid%3Dminigame__cps_transfer_index",

  /** 合规 */
  footerDisclaimer:
    '第三方推广落地页，游戏由微信小游戏提供，非腾讯官方',
  contactPlaceholder: '合作 / 投诉请联系服务商（待填写）',

  /** 微信 PC 官方下载（勿镜像包） */
  wechatPcDownloadUrl: 'https://pc.weixin.qq.com/',
};

/** 由 games-data.js 注入；此处做兜底引用，便于页面统一读 SITE_CONFIG.games */
Object.defineProperty(window.SITE_CONFIG, 'games', {
  get: function () {
    return window.GAMES_DATA || [];
  },
});

/** 生成带 CPS 的 path（供后续接入码 / URL Link 时使用） */
window.buildCpsPath = function () {
  var c = window.SITE_CONFIG;
  return '?' + c.CPS_QUERY_KEY + '=' + encodeURIComponent(c.CPS_PARAM);
};

/** 便捷别名：改 SITE_CONFIG.CPS_PARAM 即可；此别名同步读取 */
Object.defineProperty(window, 'CPS_PARAM', {
  get: function () { return window.SITE_CONFIG.CPS_PARAM; },
  set: function (v) { window.SITE_CONFIG.CPS_PARAM = v; },
});

