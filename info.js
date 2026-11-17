/* ============================================================
   礦坑原型 · 玩法介紹（漢堡選單裡的 Info）
   ------------------------------------------------------------
   說明裡的數字全部從 mining.js 的設定讀出來，
   改了價格或倍率，這一頁會自動跟著變。
   ============================================================ */
(function () {

const M = MINING, C = M.CONFIG, ORES = M.ORE_TYPES, PICKS = M.PICKS;
const money = n => '$' + n.toLocaleString('en-US');
const hex = c => '#' + c.toString(16).padStart(6, '0');
const hitsNeeded = (ore, pi) =>
  Math.ceil(ore.hits * (1 + Math.max(0, ore.needPick - pi) * C.EXTRA_HITS_PER_TIER));

/* ---------- 樣式 ---------- */
const css = document.createElement('style');
css.textContent = `
#infoOverlay { position:absolute; inset:0; z-index:65; display:none; align-items:center; justify-content:center;
  background:rgba(4,6,12,.72); backdrop-filter:blur(6px); }
#infoOverlay.open { display:flex; }
#infoWin { position:relative; width:92%; max-height:84%; overflow:auto; background:#161a24;
  border:1px solid rgba(255,220,160,.28); border-radius:14px; padding:20px 18px 18px;
  box-shadow:0 24px 70px rgba(0,0,0,.7); color:#d9d2c3; font-size:12.5px; line-height:1.75; }
#infoWin h2 { font-size:18px; letter-spacing:3px; color:#ffd79a; margin-bottom:2px; }
#infoWin .sub { font-size:11px; color:#7f7a6c; margin-bottom:10px; }
#infoWin h3 { font-size:13px; color:#9fb4d8; letter-spacing:1px; margin:16px 0 6px;
  border-bottom:1px solid rgba(255,255,255,.09); padding-bottom:5px; }
#infoWin ol, #infoWin ul { padding-left:18px; }
#infoWin li { margin:2px 0; }
#infoWin b { color:#ffd79a; font-weight:600; }
#infoWin table { width:100%; border-collapse:collapse; margin:4px 0 2px; font-size:11.5px; }
#infoWin th, #infoWin td { padding:4px 3px; text-align:center; border-bottom:1px solid rgba(255,255,255,.06); }
#infoWin th { color:#9a9384; font-weight:normal; }
#infoWin td:first-child, #infoWin th:first-child { text-align:left; }
#infoWin .dot { display:inline-block; width:9px; height:9px; border-radius:50%; margin-right:5px; vertical-align:0; }
#infoWin .easy { color:#7ee08a; }
#infoWin .note { font-size:11px; color:#8f8a7c; }
#infoClose { position:absolute; right:10px; top:10px; width:30px; height:30px; border-radius:50%;
  background:#2c3a52; border:1px solid #66738a; color:#ffe0ad; font-size:16px; line-height:28px;
  text-align:center; cursor:pointer; }
#infoClose:hover { background:#3b4d6b; }
#infoBtn { font-size:12px !important; opacity:1 !important; background:#35465f !important;
  border-color:#ffd24d !important; color:#ffd79a !important; }
`;
document.head.appendChild(css);

/* ---------- 內容 ---------- */
const oreRows = ORES.map(o => `<tr>
  <td><span class="dot" style="background:${hex(o.color)}"></span>${o.name}</td>
  <td>×${o.varMax}</td>
  <td>${PICKS[o.needPick].name}</td>
  <td>${o.hits}${L(' 下', ' hits')}</td></tr>`).join('');

const pickRows = PICKS.map((pk, i) => `<tr>
  <td>${pk.name}</td><td>${money(pk.price)}</td><td>${pk.speed}${L(' 倍', '×')}</td>
  ${ORES.map(o => {
    const n = hitsNeeded(o, i);
    return `<td class="${n === o.hits ? 'easy' : ''}">${n}</td>`;
  }).join('')}</tr>`).join('');

const jackRows = PICKS.map((pk, i) => `<tr>
  <td>${pk.name}</td>
  <td>${(C.JACK_RATE[i] * 100).toFixed(1)}%</td>
  <td>×${C.JACK_SPAN[i]}</td>
  <td>${Math.round((1 - C.JACK_SHARE[i]) * 100)}%</td></tr>`).join('');

const unlockList = PICKS.map(pk => pk.unlockAt
  ? L(`<li><b>${pk.name}</b>：累積挖到 <b>${pk.unlockAt}</b> 顆礦自動解鎖</li>`,
      `<li><b>${pk.name}</b>: unlocks automatically after mining <b>${pk.unlockAt}</b> ores</li>`)
  : L(`<li><b>${pk.name}</b>：一開始就有</li>`,
      `<li><b>${pk.name}</b>: yours from the start</li>`)).join('');

/* 礦石欄位標題：中文取第一個字，英文用彩色圓點（英文名太長塞不下） */
const oreHeads = ORES.map(o => L(`<th>${o.name.slice(0, 1)}</th>`,
  `<th><span class="dot" style="background:${hex(o.color)};margin:0" title="${o.name}"></span></th>`)).join('');

const htmlZh = `
<div id="infoClose">✕</div>
<h2>玩 法 介 紹</h2>
<div class="sub">帶著十字鎬下礦坑，把礦石換成錢。</div>

<h3>一、怎麼玩</h3>
<ol>
  <li>點地面走過去，靠近礦石後按<b>開採</b>。</li>
  <li>挖到的礦進背包，到<b>商店</b>賣掉。</li>
  <li>挖得越多，十字鎬自動升級。</li>
</ol>

<h3>二、十字鎬＝下注</h3>
<ul>
  <li>十字鎬不用買也不會壞，但<b>每挖一次要付場地費</b>，金額就是它的價格。</li>
  <li>開局 <b>${money(C.START_MONEY)}</b> 加一把木十字鎬。按開採旁的圓鈕換鎬：貴的賭大，便宜的穩。</li>
  ${unlockList}
</ul>

<h3>三、礦石與倍率</h3>
<table>
  <tr><th>礦石</th><th>大獎天花板</th><th>順手的鎬</th><th>順手敲幾下</th></tr>
  ${oreRows}
</table>
<ul>
  <li><b>賣價＝十字鎬價格 × 倍率</b>。×1 以上是賺，最低 ×${C.MULT_FLOOR}。</li>
  <li>多數時候抽到平常收成（最高 ×${C.ORD_CEIL}），少數時候抽到大獎。</li>
  <li class="note">長期平均拿回下注的 ${Math.round(C.PAYOUT_RTP * 100)}%，四把鎬都一樣。</li>
</ul>

<h3>四、十字鎬等級</h3>
<ul>
  <li>任何鎬都能挖任何礦，低一階多敲 ${Math.round(C.EXTRA_HITS_PER_TIER * 100)}%。</li>
  <li><b>越高階越大起大落</b>：大獎更大更常中，平常收成更差。</li>
</ul>
<table>
  <tr><th>十字鎬</th><th>中大獎</th><th>天花板</th><th>平常收成</th></tr>
  ${jackRows}
</table>
<table>
  <tr><th>十字鎬</th><th>價格</th><th>揮速</th>${oreHeads}</tr>
  ${pickRows}
</table>
<div class="note">右邊四欄是挖那種礦要敲幾下，<span class="easy">綠色</span>代表順手。</div>

<h3>五、商店與 TURBO</h3>
<ul>
  <li>走到商店旁，或直接點右下角的<b>商店</b>鈕。可單顆賣，也可全部賣出。</li>
  <li>開採鈕左邊的 <b>⚡TURBO</b> 打開後，挖到的礦當場賣掉，不進背包。</li>
</ul>

<h3>六、重生與營地</h3>
<ul>
  <li>地圖上同時有 <b>${C.ACTIVE_ORES}</b> 顆礦，挖掉一顆 ${C.RESPAWN_SEC} 秒後在別處重生。</li>
  <li>商店下方有帳篷，按<b>睡覺</b>可讓全地圖礦石重抽一批。</li>
</ul>

<h3>七、破產</h3>
<ul>
  <li>錢不夠、背包也空了時，<b>礦工工會</b>會發 <b>${money(C.SUBSIDY)}</b> 讓你繼續。</li>
</ul>
`;

const htmlEn = `
<div id="infoClose">✕</div>
<h2>HOW TO PLAY</h2>
<div class="sub">Take your pickaxe into the mine and turn ore into cash.</div>

<h3>1. Basics</h3>
<ol>
  <li>Tap the ground to walk. Next to an ore, press <b>MINE</b>.</li>
  <li>Mined ore goes into your bag. Sell it at the <b>Shop</b>.</li>
  <li>The more you mine, the better your pickaxe gets — upgrades are automatic.</li>
</ol>

<h3>2. Pickaxe = Your Bet</h3>
<ul>
  <li>Pickaxes are free and never break, but <b>every swing costs a mining fee</b> equal to the pickaxe's price.</li>
  <li>You start with <b>${money(C.START_MONEY)}</b> and a Wooden Pickaxe. Tap the round button next to MINE to switch: pricey picks bet big, cheap picks play it safe.</li>
  ${unlockList}
</ul>

<h3>3. Ores &amp; Multipliers</h3>
<table>
  <tr><th>Ore</th><th>Top prize</th><th>Best pick</th><th>Hits (best pick)</th></tr>
  ${oreRows}
</table>
<ul>
  <li><b>Sell price = pickaxe price × multiplier</b>. Above ×1 is profit; the minimum is ×${C.MULT_FLOOR}.</li>
  <li>Most of the time you get a regular haul (up to ×${C.ORD_CEIL}); once in a while you hit a jackpot.</li>
  <li class="note">In the long run you get back ${Math.round(C.PAYOUT_RTP * 100)}% of your bets — the same for all four pickaxes.</li>
</ul>

<h3>4. Pickaxe Tiers</h3>
<ul>
  <li>Any pickaxe can mine any ore; each tier below the best pick needs ${Math.round(C.EXTRA_HITS_PER_TIER * 100)}% more hits.</li>
  <li><b>Higher tiers swing harder</b>: bigger, more frequent jackpots, but weaker regular hauls.</li>
</ul>
<table>
  <tr><th>Pickaxe</th><th>Jackpot</th><th>Top prize</th><th>Regular</th></tr>
  ${jackRows}
</table>
<table>
  <tr><th>Pickaxe</th><th>Price</th><th>Speed</th>${oreHeads}</tr>
  ${pickRows}
</table>
<div class="note">The colored columns show how many hits each ore takes; <span class="easy">green</span> means it's that pick's specialty.</div>

<h3>5. Shop &amp; TURBO</h3>
<ul>
  <li>Walk up to the shop, or tap the <b>Shop</b> button at the bottom right. Sell ores one by one or all at once.</li>
  <li>Turn on <b>⚡TURBO</b> (left of MINE) to sell ore on the spot instead of bagging it.</li>
</ul>

<h3>6. Respawns &amp; Camp</h3>
<ul>
  <li>There are always <b>${C.ACTIVE_ORES}</b> ores on the map. Each one you mine regrows elsewhere after ${C.RESPAWN_SEC} seconds.</li>
  <li>There's a tent below the shop — press <b>SLEEP</b> to reroll every ore on the map.</li>
</ul>

<h3>7. Going Broke</h3>
<ul>
  <li>Out of money with an empty bag? The <b>Miners' Guild</b> will hand you <b>${money(C.SUBSIDY)}</b> to keep going.</li>
</ul>
`;
const html = L(htmlZh, htmlEn);

/* ---------- 視窗 ---------- */
const stage = document.getElementById('stage') || document.body;
const overlay = document.createElement('div');
overlay.id = 'infoOverlay';
overlay.innerHTML = `<div id="infoWin">${html}</div>`;
stage.appendChild(overlay);
if (stage === document.body) overlay.style.position = 'fixed';

function closeMenu() {
  const panel = document.getElementById('panel');
  const gear = document.getElementById('gear');
  if (panel) panel.classList.remove('open');
  if (gear) gear.classList.remove('open');
}
function openInfo() {
  closeMenu();
  G.keys = {};
  document.getElementById('infoWin').scrollTop = 0;
  overlay.classList.add('open');
}
function closeInfo() { overlay.classList.remove('open'); }

document.getElementById('infoClose').addEventListener('click', closeInfo);
overlay.addEventListener('pointerdown', e => { if (e.target === overlay) closeInfo(); });
overlay.addEventListener('pointerdown', e => e.stopPropagation());   // 別讓點擊穿到遊戲畫面
addEventListener('keydown', e => { if (e.code === 'Escape' && overlay.classList.contains('open')) closeInfo(); });

/* ---------- 漢堡選單最上面的 Info 按鈕 ---------- */
const panel = document.getElementById('panel');
if (panel) {
  const btn = document.createElement('button');
  btn.id = 'infoBtn';
  btn.type = 'button';
  btn.textContent = L('Info　玩法介紹', 'Info · How to Play');
  btn.addEventListener('click', e => { e.stopPropagation(); openInfo(); });
  panel.prepend(btn);
}

window.GAME_INFO = { open: openInfo, close: closeInfo };

})();
