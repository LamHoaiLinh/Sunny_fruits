(()=>{async function boot(){
  const s=(window.__rushGz||[]).join('');
  const abc='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let bits=0,val=0,a=[];
  for(const c of s){
    if(c==='=')break;
    const n=abc.indexOf(c);
    if(n<0)continue;
    val=(val<<6)|n;bits+=6;
    if(bits>=8){bits-=8;a.push((val>>bits)&255)}
  }
  if(typeof DecompressionStream==='undefined')throw new Error('Trình duyệt chưa hỗ trợ giải nén game');
  const ds=new DecompressionStream('gzip');
  const txt=await new Response(new Blob([new Uint8Array(a)]).stream().pipeThrough(ds)).text();
  (0,eval)(txt);
  window.__rushStarted=true;
  delete window.__rushGz;
}boot().catch(e=>{
  console.error(e);
  const old=document.getElementById('boot-error');if(old)old.remove();
  const d=document.createElement('div');d.id='boot-error';
  d.style.cssText='position:fixed;left:12px;right:12px;bottom:12px;z-index:99999;background:#431b1b;color:#fff;border:1px solid #ff7777;border-radius:12px;padding:12px;font:13px/1.4 system-ui,sans-serif;white-space:pre-wrap';
  d.textContent='Game chưa khởi động được: '+String(e.message||e);
  document.body.appendChild(d);
})})();