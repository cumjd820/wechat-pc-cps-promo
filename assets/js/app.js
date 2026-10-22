(function () {
  'use strict';

  function detectDevice() {
    var ua = navigator.userAgent || '';
    var isWeChat = /MicroMessenger/i.test(ua);
    var isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua) ||
      (navigator.maxTouchPoints > 1 && window.innerWidth < 900);
    if (isWeChat) return 'wechat';
    if (isMobile) return 'mobile';
    return 'pc';
  }

  function toast(msg) {
    var el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.classList.remove('show'); }, 1800);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () {
        toast('已复制「' + text + '」');
      }).catch(function () {
        fallbackCopy(text);
      });
    }
    fallbackCopy(text);
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      toast('已复制「' + text + '」');
    } catch (e) {
      toast('复制失败，请手动选择');
    }
    document.body.removeChild(ta);
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function categoryRoot(cat) {
    if (!cat) return '其他';
    return String(cat).split('/')[0] || '其他';
  }

  function cardHtml(g, base) {
    base = base || '';
    var href = base + 'g/' + encodeURIComponent(g.appid) + '.html';
    var banner = g.banner
      ? '<img class="banner" src="' + escapeHtml(g.banner) + '" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.className=\'banner fallback\';this.removeAttribute(\'src\');this.textContent=\'暂无封面\'">'
      : '<div class="banner fallback">暂无封面</div>';
    var logo = g.logo
      ? '<img class="logo" src="' + escapeHtml(g.logo) + '" alt="" loading="lazy" referrerpolicy="no-referrer">'
      : '<div class="logo" style="background:#0d111a"></div>';
    // shareNew 仅作内部 data，不展示给 C 端
    return (
      '<a class="game-card" href="' + href + '" data-appid="' + escapeHtml(g.appid) + '"' +
      ' data-share-new="' + escapeHtml(g.shareNew) + '" data-share-return="' + escapeHtml(g.shareReturn) + '"' +
      ' data-category="' + escapeHtml(categoryRoot(g.category)) + '">' +
      banner +
      '<div class="body">' +
      '<div class="row">' + logo +
      '<div><h3>' + escapeHtml(g.name) + '</h3>' +
      '<div class="meta"><span class="tag">' + escapeHtml(g.category || '游戏') + '</span></div></div></div>' +
      '<p class="intro">' + escapeHtml(g.intro || '') + '</p>' +
      '</div></a>'
    );
  }

  function renderHome() {
    var grid = document.getElementById('games');
    if (!grid) return;
    var games = (window.SITE_CONFIG && window.SITE_CONFIG.games) || window.GAMES_DATA || [];
    grid.innerHTML = games.map(function (g) { return cardHtml(g, ''); }).join('');

    var cats = ['全部'];
    games.forEach(function (g) {
      var c = categoryRoot(g.category);
      if (cats.indexOf(c) === -1) cats.push(c);
    });
    var filters = document.getElementById('filters');
    if (filters) {
      filters.innerHTML = cats.map(function (c, i) {
        return '<button type="button" class="chip' + (i === 0 ? ' active' : '') + '" data-cat="' + escapeHtml(c) + '">' + escapeHtml(c) + '</button>';
      }).join('');
      filters.addEventListener('click', function (e) {
        var btn = e.target.closest('.chip');
        if (!btn) return;
        filters.querySelectorAll('.chip').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var cat = btn.getAttribute('data-cat');
        grid.querySelectorAll('.game-card').forEach(function (card) {
          var show = cat === '全部' || card.getAttribute('data-category') === cat;
          card.style.display = show ? '' : 'none';
        });
      });
    }

    var title = document.getElementById('site-title');
    if (title && window.SITE_CONFIG) title.textContent = window.SITE_CONFIG.siteName;
    var lead = document.getElementById('site-lead');
    if (lead && window.SITE_CONFIG) lead.textContent = window.SITE_CONFIG.siteTagline;
  }

  function getPromoLink(appid) {
    var map = window.PROMO_LINKS || {};
    return (appid && map[appid]) || '';
  }

  function applyCta(device, gameName, appid) {
    var primary = document.getElementById('cta-primary');
    var hint = document.getElementById('cta-hint');
    var badge = document.getElementById('device-badge');
    var pcGuide = document.getElementById('pc-guide');
    var qrHint = document.getElementById('qr-hint');
    var cfg = window.SITE_CONFIG || {};
    var promo = getPromoLink(appid);

    if (badge) {
      var labels = { pc: '当前环境：电脑浏览器', mobile: '当前环境：手机浏览器', wechat: '当前环境：微信内' };
      badge.textContent = labels[device] || '';
    }

    if (!primary) return;

    if (promo) {
      if (pcGuide) {
        pcGuide.hidden = false;
        var note = pcGuide.querySelector('.hint');
        if (note) note.innerHTML = '推广链接已接入。电脑浏览器请<strong>微信扫码</strong>；直接跳转可能无法打开微信。';
      }
      if (device === 'pc') {
        primary.textContent = '请用微信扫下方二维码';
        if (hint) hint.textContent = '电脑浏览器请用手机微信扫下方二维码；或先打开微信 PC 再允许唤起。';
        if (qrHint) qrHint.textContent = '扫码后在微信内打开即可进入游戏。';
        primary.onclick = function () {
          var qr = document.getElementById('qr-block');
          if (qr) qr.scrollIntoView({ behavior: 'smooth', block: 'center' });
          toast('请使用微信扫一扫下方二维码');
        };
      } else if (device === 'wechat') {
        primary.textContent = '打开游戏';
        if (hint) hint.textContent = '将在微信内直接打开本游戏。';
        if (qrHint) qrHint.textContent = '也可扫下方二维码打开。';
        primary.onclick = function () { window.location.href = promo; };
      } else {
        primary.textContent = '打开游戏';
        if (hint) hint.textContent = '将尝试唤起微信打开；若失败请扫下方二维码。';
        if (qrHint) qrHint.textContent = '推荐使用微信扫码打开。';
        primary.onclick = function () { window.location.href = promo; };
      }
      return;
    }

    if (device === 'pc') {
      primary.textContent = '打开微信 PC 版畅玩';
      if (hint) hint.textContent = '请在微信 PC 客户端搜索游戏名进入；一键唤起：' + (cfg.deepLinkEnabled ? '已启用' : (cfg.deepLinkNote || '待配置'));
      if (pcGuide) pcGuide.hidden = false;
      if (qrHint) qrHint.textContent = '也可用手机微信扫下方码打开。';
      primary.onclick = function () {
        if (cfg.deepLinkEnabled && cfg.deepLinkUrl) {
          window.location.href = cfg.deepLinkUrl;
        } else {
          toast('唤起链接待配置 — 请按右侧三步在微信 PC 中搜索「' + (gameName || '') + '」');
          if (gameName) copyText(gameName);
        }
      };
    } else if (device === 'wechat') {
      primary.textContent = '立即开始（微信内）';
      if (hint) hint.textContent = '开放标签唤起：' + (cfg.deepLinkNote || '待配置') + '。可先复制游戏名在微信内搜索。';
      if (pcGuide) pcGuide.hidden = true;
      if (qrHint) qrHint.textContent = '可用微信扫下方码打开。';
      primary.onclick = function () {
        toast('开放标签待配置 — 已为你复制游戏名，可在微信搜索');
        if (gameName) copyText(gameName);
      };
    } else {
      primary.textContent = '微信扫码打开';
      if (hint) hint.textContent = '请用手机微信扫描下方二维码；或复制游戏名到微信搜索。';
      if (pcGuide) pcGuide.hidden = true;
      if (qrHint) qrHint.textContent = '请用微信扫下方二维码。';
      primary.onclick = function () {
        var qr = document.getElementById('qr-block');
        if (qr) qr.scrollIntoView({ behavior: 'smooth', block: 'center' });
        toast('请使用微信扫一扫');
      };
    }
  }

  function bindCopyName(name) {
    var btn = document.getElementById('btn-copy-name');
    if (!btn || !name) return;
    btn.addEventListener('click', function () { copyText(name); });
  }

  function renderRelated(currentAppid) {
    var wrap = document.getElementById('related-grid');
    if (!wrap) return;
    var games = (window.SITE_CONFIG && window.SITE_CONFIG.games) || window.GAMES_DATA || [];
    var current = games.find(function (g) { return g.appid === currentAppid; });
    var root = current ? categoryRoot(current.category) : null;
    var list = games.filter(function (g) { return g.appid !== currentAppid; });
    list.sort(function (a, b) {
      var sa = categoryRoot(a.category) === root ? 0 : 1;
      var sb = categoryRoot(b.category) === root ? 0 : 1;
      return sa - sb;
    });
    wrap.innerHTML = list.slice(0, 4).map(function (g) { return cardHtml(g, '../'); }).join('');
  }

  function fillFooter() {
    var d = document.getElementById('footer-disclaimer');
    var c = document.getElementById('footer-contact');
    var cfg = window.SITE_CONFIG || {};
    if (d) d.textContent = cfg.footerDisclaimer || '';
    if (c) c.textContent = cfg.contactPlaceholder || '';
  }

  window.PromoApp = {
    detectDevice: detectDevice,
    renderHome: renderHome,
    applyCta: applyCta,
    getPromoLink: getPromoLink,
    bindCopyName: bindCopyName,
    renderRelated: renderRelated,
    fillFooter: fillFooter,
    cardHtml: cardHtml,
    toast: toast,
    copyText: copyText,
  };
})();
