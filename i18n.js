/* ============================================================
   礦坑原型 · 語言切換（中文 / English）
   ------------------------------------------------------------
   用法：
     L('中文', 'English')   → 依目前語言回傳其中一個字串
     網址加 ?lang=en 或 ?lang=zh 可直接指定語言（會被記住）
     index_en.html 會轉到 index.html?lang=en
   HTML 裡的固定文字：在元素上加 data-en="English text"
   （或 data-en-aria-label、data-en-title），L.applyDom() 會換掉。
   這個檔案必須比其他遊戲腳本更早載入。
   ============================================================ */
(() => {
  const KEY = 'mole-mine-lang';
  let lang = 'zh';
  try {
    const q = new URLSearchParams(location.search).get('lang');
    if (q === 'en' || q === 'zh') { lang = q; localStorage.setItem(KEY, q); }
    else if (localStorage.getItem(KEY) === 'en') lang = 'en';
  } catch (_) {}

  const L = (zh, en) => (lang === 'en' ? en : zh);
  L.lang = lang;
  L.isEn = lang === 'en';

  /* 把 data-en / data-en-<attr> 套到 root 底下的元素上 */
  L.applyDom = (root = document) => {
    if (lang !== 'en' || !root.querySelectorAll) return;
    root.querySelectorAll('[data-en]').forEach(el => { el.innerHTML = el.getAttribute('data-en'); });
    ['aria-label', 'title', 'alt'].forEach(attr => {
      root.querySelectorAll(`[data-en-${attr}]`).forEach(el => {
        el.setAttribute(attr, el.getAttribute(`data-en-${attr}`));
      });
    });
  };

  /* 切換語言：記住選擇後重新載入（所有文字都在載入時決定） */
  L.set = next => {
    try { localStorage.setItem(KEY, next); } catch (_) {}
    const url = new URL(location.href);
    url.searchParams.set('lang', next);
    location.href = url.toString();
  };

  window.L = L;
  document.documentElement.lang = L('zh-Hant', 'en');
  if (lang === 'en') document.documentElement.classList.add('lang-en');
})();
