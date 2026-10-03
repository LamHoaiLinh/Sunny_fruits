(()=>{async function boot(){const s=(window.__rushGz||[]).join('');const abc='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';let bits=0,val=0,a=[];for(const c of s){if(c==='=')break;const n=abc.indexOf(c);if(n<0)continue;val=(val<<6)|n;bits+=6;if(bits>=8){bits-=8;a.push((val>>bits)&255)}}const ds=new DecompressionStream('gzip');let txt=await new Response(new Blob([new Uint8Array(a)]).stream().pipeThrough(ds)).text();const steerOld="      const steerRate = 1.65 * (0.45 + 0.55 * speedPct) * char.handling;\n      g.playerX += g.steer * steerRate * dt;\n      g.playerX -= dt * 1.7 * speedPct * speedPct * playerSeg.curve * CENTRIFUGAL;",steerNew="      const moveSpeedPct = clamp(g.speed / char.topSpeed, 0, 1.2);\n      const steerProgress = clamp(moveSpeedPct / 0.35, 0, 1);\n      const steerSpeedFactor = steerProgress * steerProgress * (3 - 2 * steerProgress);\n      const steerRate = 1.65 * steerSpeedFactor * char.handling;\n      g.playerX += g.steer * steerRate * dt;\n      g.playerX -= dt * 1.7 * moveSpeedPct * moveSpeedPct * playerSeg.curve * CENTRIFUGAL;";if(!txt.includes(steerOld))throw new Error('Không tìm thấy logic tay lái cần cập nhật');txt=txt.replace(steerOld,steerNew);
const friendly=[
['Chưa có kỷ lục — vào đua thôi!','Bạn chưa có kỷ lục — vào đua thôi!'],
['Khiên tiêu hao năng lượng; hết khiên mà va chạm thì xe sẽ trượt!','Khiên của bạn tiêu hao năng lượng; khi hết khiên, va chạm sẽ làm xe của bạn trượt!'],
['Hai kỷ lục mới! Thử giữ phong độ','Hai kỷ lục mới! Bạn thử giữ phong độ'],
['Kỷ lục thời gian mới! Lượt sau thử','Kỷ lục thời gian mới! Lượt sau bạn thử'],
['Kỷ lục điểm mới! Lượt sau thử','Kỷ lục điểm mới! Lượt sau bạn thử'],
['Giảm chỉ 1 va chạm ở lượt sau','Bạn chỉ cần giảm 1 va chạm ở lượt sau'],
['Tắt Bất tử để chinh phục kỷ lục thật.','Bạn hãy tắt Bất tử để chinh phục kỷ lục thật.'],
['Thử đổi tay lái để chơi theo một phong cách hoàn toàn khác.','Bạn thử đổi tay lái để chơi theo một phong cách hoàn toàn khác.']
];for(const [a,b] of friendly)txt=txt.replaceAll(a,b);

// TRAFFIC_FAIRNESS_V2
// IOS_ROTATION_LAYOUT_V6
const layoutOld=`let lastVW = 0, lastVH = 0;

function layout() {
  const vw = window.innerWidth, vh = window.innerHeight;
  if (!vw || !vh) return;   // hidden/zero-sized pane — keep previous size
  lastVW = vw; lastVH = vh;
  const s = Math.min(vw / 960, vh / 540) * 0.98;
  canvas.style.width = Math.round(960 * s) + 'px';
  canvas.style.height = Math.round(540 * s) + 'px';
  const cr = canvas.getBoundingClientRect();
  const sr = stage.getBoundingClientRect();
  overlay.style.left = (cr.left - sr.left) + 'px';
  overlay.style.top = (cr.top - sr.top) + 'px';
  overlay.style.width = cr.width + 'px';
  overlay.style.height = cr.height + 'px';
}

window.addEventListener('resize', layout);
document.addEventListener('visibilitychange', () => layout());
layout();`;

const layoutNew=`let lastVW = 0, lastVH = 0;

function viewportSize() {
  const vv = window.visualViewport;
  const vw = Math.max(1, Math.round((vv && vv.width) || document.documentElement.clientWidth || window.innerWidth || 1));
  const vh = Math.max(1, Math.round((vv && vv.height) || document.documentElement.clientHeight || window.innerHeight || 1));
  return { vw, vh };
}

function layout() {
  const { vw, vh } = viewportSize();
  if (!vw || !vh) return;
  lastVW = vw; lastVH = vh;

  // Reset stale geometry first. iOS Safari can preserve old inline sizes across rotation.
  canvas.style.width = '';
  canvas.style.height = '';
  overlay.style.left = '0px';
  overlay.style.top = '0px';
  overlay.style.width = '0px';
  overlay.style.height = '0px';

  const s = Math.min(vw / 960, vh / 540) * 0.98;
  canvas.style.width = Math.max(1, Math.round(960 * s)) + 'px';
  canvas.style.height = Math.max(1, Math.round(540 * s)) + 'px';

  // Read geometry on the next painted layout state.
  const cr = canvas.getBoundingClientRect();
  const sr = stage.getBoundingClientRect();
  overlay.style.left = Math.round(cr.left - sr.left) + 'px';
  overlay.style.top = Math.round(cr.top - sr.top) + 'px';
  overlay.style.width = Math.round(cr.width) + 'px';
  overlay.style.height = Math.round(cr.height) + 'px';
}

let layoutTimer = 0;
function queueLayout() {
  cancelAnimationFrame(layoutTimer);
  layoutTimer = requestAnimationFrame(() => {
    layout();
    requestAnimationFrame(layout);
  });
  [60, 140, 280, 520].forEach(ms => setTimeout(layout, ms));
}

window.addEventListener('resize', queueLayout, { passive: true });
window.addEventListener('orientationchange', queueLayout, { passive: true });
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', queueLayout, { passive: true });
  window.visualViewport.addEventListener('scroll', queueLayout, { passive: true });
}
document.addEventListener('visibilitychange', queueLayout);
queueLayout();`;

if(!txt.includes(layoutOld)) throw new Error('Không tìm thấy layout cũ để thay');
txt=txt.replace(layoutOld,layoutNew);

const stepOld=`  if (window.innerWidth !== lastVW || window.innerHeight !== lastVH) layout();`;
const stepNew=`  { const v = viewportSize(); if (v.vw !== lastVW || v.vh !== lastVH) layout(); }`;
if(!txt.includes(stepOld)) throw new Error('Không tìm thấy resize guard trong vòng lặp');
txt=txt.replace(stepOld,stepNew);

const trafficFixes=[
["return clamp(Math.round(64 * densityRamp(progress) * DIFF.density), 28, NPC_MAX);","return clamp(Math.round(52 * densityRamp(progress) * DIFF.density), 24, NPC_MAX);"],
["chaoyang: [['scooter', 0.7], ['car', 0.1], ['bus', 0.1], ['ped', 0.1]],","chaoyang: [['scooter', 0.78], ['car', 0.07], ['bus', 0.03], ['ped', 0.12]],"],
["minzu: [['scooter', 0.62], ['car', 0.18], ['taxi', 0.1], ['bus', 0.1]],","minzu: [['scooter', 0.76], ['car', 0.12], ['taxi', 0.08], ['bus', 0.04]],"],
["bridge: [['car', 0.38], ['taxi', 0.16], ['bus', 0.2], ['scooter', 0.26]],","bridge: [['car', 0.24], ['taxi', 0.12], ['bus', 0.06], ['scooter', 0.58]],"],
["qingxiu: [['scooter', 0.6], ['car', 0.14], ['ped', 0.16], ['bus', 0.1]],","qingxiu: [['scooter', 0.72], ['car', 0.08], ['ped', 0.16], ['bus', 0.04]],"],
["function laneBlocked(z, center, ignoreNpc = null, gap = 1050) {","function laneBlocked(z, center, ignoreNpc = null, gap = 1350) {"],
["const WALL_WINDOW = 820;","const WALL_WINDOW = 1150;"],
["for (let attempt = 0; attempt < 20; attempt++) {","for (let attempt = 0; attempt < 36; attempt++) {"],
["      type = pickType(zoneAt(segIdx).key);\n      lane = type === 'ped' ? { c: 0, i: -1 } : chooseFairLane(z, npc);",
"      type = pickType(zoneAt(segIdx).key);\n      if (type === 'bus' && g.npcs.some(other => other !== npc && other.active && !other.popped && other.type === 'bus' && Math.abs(other.z - z) < 3000)) continue;\n      lane = type === 'ped' ? { c: 0, i: -1 } : chooseFairLane(z, npc);"],
["              if (next !== npc.laneIndex && !laneBlocked(npc.z, target, npc, 900)) {",
"              if (next !== npc.laneIndex && !laneBlocked(npc.z, target, npc, 1250) && !wouldCloseCorridor(npc.z, next, nz, npc)) {"],
["          npc.z = oldNpcZ;\n          npc.offset = oldNpcOffset;",
"          npc.z = oldNpcZ + Math.max(0, npc.z - oldNpcZ) * 0.28;\n          npc.speed = Math.min(npc.speed, char.topSpeed * 0.48);\n          npc.offset = oldNpcOffset;"]
];
for(const [a,b] of trafficFixes){if(!txt.includes(a))throw new Error("Traffic patch không tìm thấy mẫu: "+a.slice(0,80));txt=txt.replace(a,b);}

const moveNeedle="      npc.z += npc.speed * dt;\n\n      if (npc.type === 'ped') {";
const movePatch="      npc.z += npc.speed * dt;\n\n      if (npc.type !== 'ped') {\n        const followZone = zoneAt(clamp(Math.floor(npc.z / SEG_LEN), 0, segments.length - 1));\n        const followCenters = laneCenters(followZone.lanes);\n        const followLane = nearestLaneIndex(npc.offset, followCenters);\n        let leader = null, leaderDz = Infinity;\n        for (const other of g.npcs) {\n          if (other === npc || !other.active || other.popped || other.type === 'ped' || other.z <= npc.z) continue;\n          const oz = zoneAt(clamp(Math.floor(other.z / SEG_LEN), 0, segments.length - 1));\n          if (oz.key !== followZone.key || nearestLaneIndex(other.offset, followCenters) !== followLane) continue;\n          const dz = other.z - npc.z;\n          if (dz < leaderDz) { leaderDz = dz; leader = other; }\n        }\n        if (leader) {\n          const large = ['car','taxi','bus'].includes(npc.type) || ['car','taxi','bus'].includes(leader.type);\n          const safe = (npc.type === 'bus' || leader.type === 'bus') ? 1250 : (large ? 900 : 650);\n          if (leader.z - npc.z < safe) npc.z = Math.max(oldNpcZ, leader.z - safe);\n          if (leader.z - oldNpcZ < safe * 1.6) npc.speed = Math.min(npc.speed, leader.speed * 0.96);\n        }\n        if (npc.type === 'bus') {\n          let busAhead = null, busDz = Infinity;\n          for (const other of g.npcs) {\n            if (other === npc || !other.active || other.popped || other.type !== 'bus' || other.z <= npc.z) continue;\n            const oz = zoneAt(clamp(Math.floor(other.z / SEG_LEN), 0, segments.length - 1));\n            if (oz.key !== followZone.key) continue;\n            const dz = other.z - npc.z;\n            if (dz < busDz) { busDz = dz; busAhead = other; }\n          }\n          if (busAhead && busAhead.z - npc.z < 2600) {\n            npc.z = Math.max(oldNpcZ, busAhead.z - 2600);\n            npc.speed = Math.min(npc.speed, busAhead.speed * 0.94);\n          }\n        }\n      }\n\n      if (npc.type === 'ped') {";
if(!txt.includes(moveNeedle))throw new Error("Traffic patch không tìm thấy đoạn di chuyển NPC");
txt=txt.replace(moveNeedle,movePatch);

// TRAFFIC_DENSITY_V4 · giảm ~37% tổng lưu lượng
// TRAFFIC_FAIRNESS_V3
const trafficV3=[
["return clamp(Math.round(52 * densityRamp(progress) * DIFF.density), 24, NPC_MAX);","return clamp(Math.round(29 * densityRamp(progress) * DIFF.density), 13, 36);"],
["function laneBlocked(z, center, ignoreNpc = null, gap = 1350) {","function laneBlocked(z, center, ignoreNpc = null, gap = 1650) {"],
["const WALL_WINDOW = 1150;","const WALL_WINDOW = 2200;"],
["if (type === 'bus' && g.npcs.some(other => other !== npc && other.active && !other.popped && other.type === 'bus' && Math.abs(other.z - z) < 3000)) continue;","if (type === 'bus' && g.npcs.some(other => other !== npc && other.active && !other.popped && other.type === 'bus' && Math.abs(other.z - z) < 4200)) continue;\n      if (['car','taxi','bus'].includes(type)) {\n        const spawnZone = zoneAt(segIdx);\n        const nearLarge = g.npcs.filter(other => other !== npc && other.active && !other.popped && ['car','taxi','bus'].includes(other.type) && Math.abs(other.z - z) < 2200).length;\n        const maxLarge = spawnZone.lanes >= 4 ? 2 : 1;\n        if (nearLarge >= maxLarge) continue;\n      }"]
];
for(const [a,b] of trafficV3){if(!txt.includes(a))throw new Error("Traffic V3 không tìm thấy mẫu: "+a.slice(0,90));txt=txt.replace(a,b);}

const largeHook="        if (npc.type === 'bus') {";
const largePatch="        if (['car','taxi','bus'].includes(npc.type)) {\n          let largeAhead = null, largeDz = Infinity;\n          for (const other of g.npcs) {\n            if (other === npc || !other.active || other.popped || !['car','taxi','bus'].includes(other.type) || other.z <= npc.z) continue;\n            const oz = zoneAt(clamp(Math.floor(other.z / SEG_LEN), 0, segments.length - 1));\n            if (oz.key !== followZone.key) continue;\n            const dz = other.z - npc.z;\n            if (dz < largeDz) { largeDz = dz; largeAhead = other; }\n          }\n          if (largeAhead) {\n            const band = (npc.type === 'bus' || largeAhead.type === 'bus') ? 2200 : 1700;\n            if (largeAhead.z - npc.z < band) npc.z = Math.max(oldNpcZ, largeAhead.z - band);\n            if (largeAhead.z - oldNpcZ < band * 1.5) npc.speed = Math.min(npc.speed, largeAhead.speed * 0.95);\n          }\n        }\n        if (npc.type === 'bus') {";
if(!txt.includes(largeHook))throw new Error("Traffic V3 không tìm thấy largeHook");
txt=txt.replace(largeHook,largePatch);

(0,eval)(txt);window.__rushStarted=true;installSunnyHelp();delete window.__rushGz}boot().catch(e=>{console.error(e);document.body.insertAdjacentHTML('beforeend','<div style="position:fixed;inset:0;display:grid;place-items:center;background:#111;color:#fff;z-index:9999;font:16px sans-serif">Không thể khởi động game. Hãy dùng Chrome/Android mới.</div>')})
function installSunnyHelp(){
  const SUNNY_HELP_V1=true;
  const modal=document.createElement('div');
  modal.id='sunny-help-modal';
  modal.hidden=true;
  modal.innerHTML=`
    <div class="help-card" role="dialog" aria-modal="true" aria-labelledby="help-title">
      <div class="help-head">
        <div><div class="help-kicker">CUỘC ĐUA XE ĐIỆN · ĐÀ NẴNG</div><h2 id="help-title">HƯỚNG DẪN CÁCH CHƠI</h2></div>
        <button id="help-close-x" class="help-x" aria-label="Đóng hướng dẫn">×</button>
      </div>
      <div class="help-grid">
        <section><b>🏁 1. CÁCH WIN</b><p>Bạn chạy hết khoảng <strong>5 km</strong>, từ Quảng trường 2/9 đến <strong>vạch đích Sơn Trà</strong>. Qua vạch đích là hoàn thành lượt chơi. Game không loại bạn giữa đường.</p><p><strong>Hạng S:</strong> dưới 1:55 · <strong>A:</strong> dưới 2:20 · <strong>B:</strong> dưới 2:55 · lâu hơn là C.</p></section>
        <section><b>🛵 2. ĐIỀU KHIỂN</b><p>Điện thoại: <strong>◀ ▶</strong> để lái · <strong>GA</strong> để tăng tốc · <strong>PHANH</strong> để giảm tốc · 📢 để bấm còi.</p><p>Máy tính: <strong>← → / A D</strong> lái · <strong>↑ / W</strong> ga · <strong>↓ / S</strong> phanh · <strong>Space</strong> còi · <strong>P</strong> tạm dừng.</p><p>Khi xe còn trớn, bạn vẫn lái trái/phải được; tốc độ càng thấp thì xe chuyển ngang càng chậm.</p></section>
        <section><b>🛡️ 3. KHIÊN & VA CHẠM</b><p>Khiên đang sáng có thể đẩy xe khác sang bên và ghi điểm, nhưng mỗi lần đẩy sẽ tốn năng lượng. Khiên cạn, va chạm sẽ làm xe bạn xoay/trượt và mất nhịp.</p><p>Năng lượng khiên tự hồi khi bạn không vừa húc xe; đủ năng lượng thì khiên tự bật lại.</p></section>
        <section><b>✨ 4. COMBO & FLOW</b><p><strong>Vượt sạch → Lách sát → Lách hoàn hảo</strong> giúp tăng chuỗi kỹ năng và nạp thanh FLOW. Lách càng sát và càng nhanh thì điểm càng cao.</p><p>FLOW đầy sẽ <strong>tự kích hoạt</strong>: điểm kỹ năng ×2, xe bốc hơn nhẹ và khiên hồi nhanh hơn. Va chạm sẽ làm mất chuỗi/Flow.</p></section>
        <section><b>🎯 5. NÊN CHƠI THẾ NÀO?</b><p>Muốn về đích nhanh: giữ tốc độ, phanh trước cụm xe và chọn khe thoát. Muốn nhiều điểm: săn Lách sát/Lách hoàn hảo để giữ combo và bật Flow.</p><p><strong>Thắng cơ bản = về đích.</strong> Thắng đẹp = hạng S + ít va chạm + phá kỷ lục điểm/thời gian.</p></section>
        <section><b>👤 6. CHỌN TAY LÁI</b><p><strong>Minh:</strong> dễ làm quen, hồi phục tốt · <strong>Hạnh:</strong> mạnh về khiên · <strong>Nam:</strong> thưởng Lách sát và nạp Flow nhanh · <strong>Mai:</strong> giữ combo/Flow lâu.</p><p>Chế độ Bất tử dùng để tập và <strong>không tính kỷ lục</strong>.</p></section>
      </div>
      <button id="help-close" class="btn help-done">ĐÃ HIỂU · QUAY LẠI</button>
    </div>`;
  document.body.appendChild(modal);
  const close=()=>{modal.hidden=true};
  modal.querySelector('#help-close').addEventListener('click',close);
  modal.querySelector('#help-close-x').addEventListener('click',close);
  modal.addEventListener('pointerdown',e=>{if(e.target===modal)close()});
  const open=()=>{modal.hidden=false};
  function addButtons(){
    const overlay=document.getElementById('overlay');
    const screen=overlay&&overlay.querySelector('.screen');
    if(!screen||screen.dataset.helpReady==='1')return;
    const start=screen.querySelector('#btn-start');
    const back=screen.querySelector('#btn-back');
    const resume=screen.querySelector('#btn-resume');
    if(start){
      const b=document.createElement('button');b.className='btn secondary game-help-open';b.textContent='? HƯỚNG DẪN';b.addEventListener('click',open);start.insertAdjacentElement('afterend',b);screen.dataset.helpReady='1';
    }else if(back){
      const b=document.createElement('button');b.className='btn secondary game-help-open';b.textContent='? HƯỚNG DẪN';b.addEventListener('click',open);back.insertAdjacentElement('beforebegin',b);screen.dataset.helpReady='1';
    }else if(resume){
      const row=resume.closest('.btn-row');if(row){const b=document.createElement('button');b.className='btn secondary game-help-open';b.textContent='? HƯỚNG DẪN';b.addEventListener('click',open);row.appendChild(b);screen.dataset.helpReady='1';}
    }
  }
  const overlay=document.getElementById('overlay');
  if(overlay)new MutationObserver(()=>requestAnimationFrame(addButtons)).observe(overlay,{childList:true,subtree:true});
  requestAnimationFrame(addButtons);
}
})();