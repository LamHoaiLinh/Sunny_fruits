(() => {
'use strict';

const A='assets/';
const STORAGE_KEY='sunnyPrincessState_v1';
const ALBUM_KEY='sunnyPrincessAlbum_v1';
const STARS_KEY='sunnyPrincessStars_v1';

const categories=[
  {key:'hair',label:'Kiểu tóc',short:'Tóc',emoji:'💇‍♀️',icon:`${A}ui/icon_hair.png`,z:40},
  {key:'top',label:'Áo',short:'Áo',emoji:'👚',icon:`${A}ui/icon_top.png`,z:30},
  {key:'skirt',label:'Váy',short:'Váy',emoji:'👗',icon:`${A}ui/icon_skirt.png`,z:20},
  {key:'shoes',label:'Giày',short:'Giày',emoji:'👟',icon:`${A}ui/icon_shoes.png`,z:10},
  {key:'accessory',label:'Phụ kiện',short:'Phụ kiện',emoji:'👑',icon:`${A}ui/icon_accessory.png`,z:50}
];
const names={
  hair:['Tóc hai bên','Tóc ngắn tinh nghịch','Tóc xoăn dài','Tóc búi tròn','Tóc tết hồng','Tóc đuôi ngựa xanh','Tóc búi kẹo ngọt'],
  top:['Áo thun hồng','Áo vàng chanh','Áo hoodie xanh','Áo len dâu tây','Áo hoodie Kuromi','Áo mèo con','Áo mây cầu vồng'],
  skirt:['Váy voan bồng','Chân váy jean','Váy dài hoa','Chân váy cầu vồng','Váy bồng Kuromi','Váy bồng trời sao','Váy mây mưa'],
  shoes:['Giày da đỏ','Giày thể thao trắng','Ủng mưa hồng','Giày ba lê','Giày đế dày Kuromi','Dép thỏ','Ủng mưa mặt trời'],
  accessory:['Vương miện nhỏ','Kẹp nơ','Vòng cổ ngọc trai','Túi đeo chéo','Mũ Kuromi','Tai gấu','Kẹp mây cầu vồng','Kẹp ngôi sao']
};
const items={};
for(const c of categories){
  items[c.key]=names[c.key].map((name,i)=>({
    id:`${c.key}_${i+1}`,name,category:c.key,
    layer:`${A}layers/${c.key}_${i+1}.png`,thumb:`${A}thumbs/${c.key}_${i+1}.png`
  }));
}
const models=[
  {id:'girl_1',name:'Đào Đào'},
  {id:'girl_2',name:'Ca Cao'},
  {id:'girl_3',name:'Ánh Dương'},
  {id:'girl_4',name:'Vy Vy'}
].map(m=>({...m,base:`${A}chars/${m.id}.png`,bald:`${A}chars/${m.id}_bald.png`,thumb:`${A}chars/thumbs/${m.id}.png`}));
const scenes=[
  ['sky','Trời mây mộng mơ'],['garden','Vườn hoa'],['beach','Bãi biển'],['castle','Đại sảnh lâu đài'],['bedroom','Phòng ngủ ấm áp'],['snow','Xứ tuyết sao']
].map(([id,name])=>({id,name,bg:`${A}scenes/${id}.png`,thumb:`${A}scenes/thumbs/${id}.png`}));

const emptySelection=()=>({hair:null,top:null,skirt:null,shoes:null,accessory:null});
let state={model:'girl_1',scene:'sky',activeCategory:'hair',selection:emptySelection()};
let album=[];
let stars=0;
let mission=null;
let pendingMission=null;
let toastTimer=null;

const $=s=>document.querySelector(s);
const el=(tag,cls)=>{const n=document.createElement(tag);if(cls)n.className=cls;return n};
const findModel=id=>models.find(x=>x.id===id)||models[0];
const findScene=id=>scenes.find(x=>x.id===id)||scenes[0];
const findItem=id=>{for(const c of categories){const x=items[c.key].find(y=>y.id===id);if(x)return x}return null};

function safeJSON(key,fallback){try{const x=JSON.parse(localStorage.getItem(key)||'null');return x??fallback}catch{return fallback}}
function load(){
  const saved=safeJSON(STORAGE_KEY,null);
  if(saved && saved.selection){state={...state,...saved,selection:{...emptySelection(),...saved.selection}}}
  album=safeJSON(ALBUM_KEY,[]); if(!Array.isArray(album))album=[];
  stars=Number(localStorage.getItem(STARS_KEY)||0)||0;
}
function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch{}}
function persistAlbum(){try{localStorage.setItem(ALBUM_KEY,JSON.stringify(album.slice(0,40)))}catch{}}
function persistStars(){try{localStorage.setItem(STARS_KEY,String(stars))}catch{}}
function showToast(msg,ms=1450){const t=$('#toast');clearTimeout(toastTimer);t.textContent=msg;t.hidden=false;toastTimer=setTimeout(()=>t.hidden=true,ms)}

function renderAll(){renderStage();renderModels();renderScenes();renderCategories();renderItems();renderBadges();renderMissionBar();persist()}
function renderStage(){
  const m=findModel(state.model),s=findScene(state.scene);
  $('#sceneImg').src=s.bg;$('#sceneImg').alt=s.name;
  $('#modelImg').src=state.selection.hair?m.bald:m.base;$('#modelImg').alt=m.name;
  for(const c of categories){const img=$(`#layer${c.key[0].toUpperCase()+c.key.slice(1)}`);const id=state.selection[c.key];if(id){img.src=findItem(id).layer;img.hidden=false}else{img.hidden=true;img.removeAttribute('src')}}
}
function renderModels(){
  const box=$('#modelSwitcher');box.innerHTML='';
  models.forEach(m=>{const b=el('button','model-chip'+(m.id===state.model?' active':''));b.dataset.id=m.id;b.title=m.name;b.innerHTML=`<img src="${m.thumb}" alt=""><span>${m.name}</span>`;b.onclick=()=>{state.model=m.id;renderAll();checkMission()};box.appendChild(b)})
}
function renderScenes(){
  const box=$('#sceneSwitcher');box.innerHTML='';
  scenes.forEach(s=>{const b=el('button','scene-chip'+(s.id===state.scene?' active':''));b.dataset.id=s.id;b.title=s.name;b.setAttribute('aria-label',s.name);b.innerHTML=`<img src="${s.thumb}" alt="">`;b.onclick=()=>{state.scene=s.id;renderAll();checkMission()};box.appendChild(b)})
}
function renderCategories(){
  const box=$('#categoryTabs');box.innerHTML='';
  categories.forEach(c=>{const b=el('button','category-tab'+(c.key===state.activeCategory?' active':''));b.innerHTML=`<img src="${c.icon}" alt=""><span>${c.short}</span>`;b.onclick=()=>{state.activeCategory=c.key;renderCategories();renderItems();updateWardrobeHead()};box.appendChild(b)});updateWardrobeHead()
}
function updateWardrobeHead(){const c=categories.find(x=>x.key===state.activeCategory);$('#categoryEmoji').textContent=c.emoji;$('#categoryTitle').textContent=c.label}
function renderItems(){
  const box=$('#itemGrid');box.innerHTML='';
  const targetIds=new Set(mission?.targets||[]);
  items[state.activeCategory].forEach(it=>{const b=el('button','item-card'+(state.selection[it.category]===it.id?' selected':'')+(targetIds.has(it.id)?' target':''));b.dataset.id=it.id;b.title=it.name;b.innerHTML=`<img src="${it.thumb}" alt=""><span>${it.name}</span>`;b.onclick=()=>toggleItem(it);box.appendChild(b)})
}
function toggleItem(it){state.selection[it.category]=state.selection[it.category]===it.id?null:it.id;renderStage();renderItems();renderMissionBar();persist();checkMission()}
function renderBadges(){$('#starCount').textContent=stars;$('#albumBadge').textContent=album.length;$('#albumBadge').hidden=album.length===0}

function randomize(){for(const c of categories){const list=items[c.key];state.selection[c.key]=list[Math.floor(Math.random()*list.length)].id}renderAll();checkMission();showToast('✨ Sunny đã có một bộ đồ mới!')}
function resetLook(){state.selection=emptySelection();renderAll();showToast('Đã cởi hết đồ để phối lại')}
function removeCurrent(){const c=state.activeCategory;if(!state.selection[c]){showToast('Chưa mặc món nào ở mục này');return}state.selection[c]=null;renderStage();renderItems();renderMissionBar();persist()}

function snapshot(){return {id:`look_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,model:state.model,scene:state.scene,selection:{...state.selection},ts:Date.now()}}
function saveLook(){if(!Object.values(state.selection).some(Boolean)){showToast('Sunny mặc ít nhất một món trước nhé');return}album.unshift(snapshot());album=album.slice(0,40);persistAlbum();renderBadges();showToast('📸 Đã lưu vào album!')}
function loadLook(look){state.model=look.model||'girl_1';state.scene=look.scene||'sky';state.selection={...emptySelection(),...(look.selection||{})};renderAll();closeModal('albumModal');showToast('Đã mặc lại bộ đồ này ✨')}
function deleteLook(id){album=album.filter(x=>x.id!==id);persistAlbum();renderAlbum();renderBadges()}
function renderAlbum(){
  const grid=$('#albumGrid');grid.innerHTML='';
  if(!album.length){grid.innerHTML='<div class="album-empty">Chưa có bộ đồ nào.<br>Sunny phối đồ rồi bấm “Lưu album” nhé.</div>';return}
  album.forEach(look=>{const card=el('article','album-item');const thumb=el('div','album-thumb');thumb.append(...buildLookImages(look));const acts=el('div','album-actions');acts.innerHTML='<button class="load-look">Mặc lại</button><button class="download-look">Tải ảnh</button><button class="delete-look">×</button>';acts.querySelector('.load-look').onclick=()=>loadLook(look);acts.querySelector('.download-look').onclick=()=>downloadLook(look);acts.querySelector('.delete-look').onclick=()=>deleteLook(look.id);card.append(thumb,acts);grid.appendChild(card)})
}
function buildLookImages(look){
  const m=findModel(look.model),s=findScene(look.scene),sel={...emptySelection(),...(look.selection||{})};const arr=[];
  const bg=new Image();bg.className='bg';bg.src=s.bg;bg.alt='';arr.push(bg);
  const base=new Image();base.src=sel.hair?m.bald:m.base;base.alt='';base.style.zIndex='1';arr.push(base);
  for(const c of [...categories].sort((a,b)=>a.z-b.z)){const id=sel[c.key];if(!id)continue;const im=new Image();im.src=findItem(id).layer;im.alt='';im.style.zIndex=String(c.z);arr.push(im)}return arr
}

function openModal(id){document.getElementById(id).hidden=false}
function closeModal(id){document.getElementById(id).hidden=true}
function openPreview(look=snapshot()){
  const box=$('#previewStage');box.innerHTML='';box.append(...buildLookImages(look));$('#downloadBtn').onclick=()=>downloadLook(look);openModal('previewModal')
}

function generateMission(){
  const cats=[...categories].sort(()=>Math.random()-.5).slice(0,3);
  pendingMission={targets:cats.map(c=>{const l=items[c.key];return l[Math.floor(Math.random()*l.length)].id}),scene:scenes[Math.floor(Math.random()*scenes.length)].id};renderChallengePreview()
}
function renderChallengePreview(){
  const box=$('#challengePreview');box.innerHTML='';if(!pendingMission)return;
  pendingMission.targets.forEach(id=>{const it=findItem(id),d=el('div','challenge-goal');d.innerHTML=`<img src="${it.thumb}" alt=""><b>${it.name}</b>`;box.appendChild(d)});
  const s=findScene(pendingMission.scene),d=el('div','challenge-goal scene');d.innerHTML=`<img src="${s.thumb}" alt=""><b>${s.name}</b>`;box.appendChild(d)
}
function startMission(){if(!pendingMission)generateMission();mission=JSON.parse(JSON.stringify(pendingMission));closeModal('challengeModal');renderAll();showToast('🎯 Bắt đầu! Hãy tìm đúng các hình')}
function renderMissionBar(){
  const bar=$('#missionBar');const box=$('#missionTargets');if(!mission){bar.hidden=true;return}bar.hidden=false;box.innerHTML='';
  mission.targets.forEach(id=>{const it=findItem(id),im=new Image();im.src=it.thumb;im.className='mission-target'+(state.selection[it.category]===id?' done':'');im.title=it.name;box.appendChild(im)});
  const s=findScene(mission.scene),im=new Image();im.src=s.thumb;im.className='mission-target scene'+(state.scene===mission.scene?' done':'');im.title=s.name;box.appendChild(im)
}
function checkMission(){if(!mission)return;const itemsOk=mission.targets.every(id=>{const it=findItem(id);return state.selection[it.category]===id});if(itemsOk&&state.scene===mission.scene){stars++;persistStars();renderBadges();mission=null;renderMissionBar();celebrate();showToast('🎉 Chính xác! Sunny nhận được 1 ⭐',2300)}}
function hintMission(){
  if(!mission)return;
  const missing=mission.targets.find(id=>{const it=findItem(id);return state.selection[it.category]!==id});
  if(missing){const it=findItem(missing);state.activeCategory=it.category;renderCategories();renderItems();setTimeout(()=>{const b=document.querySelector(`.item-card[data-id="${missing}"]`);b?.classList.add('pulse');b?.scrollIntoView({block:'nearest',behavior:'smooth'})},40);showToast(`💡 Tìm trong mục ${categories.find(c=>c.key===it.category).label}`);return}
  if(state.scene!==mission.scene){const b=document.querySelector(`.scene-chip[data-id="${mission.scene}"]`);b?.classList.add('pulse');showToast('💡 Còn thiếu đúng bối cảnh')}
}
function celebrate(){const box=$('#confetti');box.innerHTML='';const icons=['⭐','✨','💖','🌸'];for(let i=0;i<28;i++){const p=el('span','confetti-piece');p.textContent=icons[i%icons.length];p.style.left=`${Math.random()*100}%`;p.style.setProperty('--x',`${(Math.random()-.5)*180}px`);p.style.animationDelay=`${Math.random()*.4}s`;box.appendChild(p)}setTimeout(()=>box.innerHTML='',2400)}

async function loadImage(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src})}
function coverRect(iw,ih,w,h){const s=Math.max(w/iw,h/ih),sw=w/s,sh=h/s,sx=(iw-sw)/2,sy=(ih-sh)/2;return{sx,sy,sw,sh}}
async function composeLook(look){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=1536;const ctx=canvas.getContext('2d');const m=findModel(look.model),s=findScene(look.scene),sel={...emptySelection(),...(look.selection||{})};
  const bg=await loadImage(s.bg),r=coverRect(bg.naturalWidth,bg.naturalHeight,1024,1536);ctx.drawImage(bg,r.sx,r.sy,r.sw,r.sh,0,0,1024,1536);
  const base=await loadImage(sel.hair?m.bald:m.base);ctx.drawImage(base,0,0,1024,1536);
  for(const c of [...categories].sort((a,b)=>a.z-b.z)){const id=sel[c.key];if(!id)continue;const im=await loadImage(findItem(id).layer);ctx.drawImage(im,0,0,1024,1536)}
  return canvas
}
async function downloadLook(look){try{showToast('Đang tạo ảnh…');const canvas=await composeLook(look);canvas.toBlob(blob=>{if(!blob){showToast('Không tạo được ảnh');return}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`Sunny-Princess-${Date.now()}.png`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);showToast('⬇ Đã tạo ảnh PNG')},'image/png')}catch(e){console.error(e);showToast('Không tạo được ảnh, thử lại nhé')}}

function wire(){
  $('#randomBtn').onclick=randomize;$('#resetBtn').onclick=resetLook;$('#saveBtn').onclick=saveLook;$('#albumBtn').onclick=()=>{renderAlbum();openModal('albumModal')};$('#previewBtn').onclick=()=>openPreview();$('#removeItemBtn').onclick=removeCurrent;
  $('#challengeBtn').onclick=()=>{generateMission();openModal('challengeModal')};$('#newChallengeBtn').onclick=generateMission;$('#startChallengeBtn').onclick=startMission;$('#hintBtn').onclick=hintMission;$('#cancelMissionBtn').onclick=()=>{mission=null;renderMissionBar();renderItems();showToast('Đã dừng thử thách')};
  document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>closeModal(b.dataset.close));
  document.querySelectorAll('.modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)closeModal(m.id)}));
  $('#previewModal').addEventListener('click',e=>{if(e.target===$('#previewModal'))closeModal('previewModal')});
  window.addEventListener('keydown',e=>{if(e.key==='Escape'){for(const id of ['albumModal','challengeModal','previewModal'])closeModal(id)}});
  for(const ev of ['contextmenu','dragstart','selectstart'])document.addEventListener(ev,e=>e.preventDefault());
  let sx=0,sy=0;
  document.addEventListener('touchstart',e=>{const t=e.touches[0];if(t){sx=t.clientX;sy=t.clientY}},{passive:true});
  document.addEventListener('touchmove',e=>{const t=e.touches[0];if(!t)return;const dx=t.clientX-sx,dy=t.clientY-sy;if(Math.abs(dx)>Math.abs(dy)+6&&Math.abs(dx)>10)e.preventDefault()},{passive:false});
}

load();wire();renderAll();
})();
