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
(0,eval)(txt);installSunnyHelp();delete window.__rushGz}boot().catch(e=>{console.error(e);document.body.insertAdjacentHTML('beforeend','<div style="position:fixed;inset:0;display:grid;place-items:center;background:#111;color:#fff;z-index:9999;font:16px sans-serif">Không thể khởi động game. Hãy dùng Chrome/Android mới.</div>')})
function installSunnyHelp(){
  const SUNNY_HELP_V1=true;
  const modal=document.createElement('div');
  modal.id='sunny-help-modal';
  modal.hidden=true;
  modal.innerHTML=\`
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
    </div>\`;
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