(() => {
'use strict';

const A='assets/';
const STORAGE_KEY='sunnyPrincessState_v1';
const ALBUM_KEY='sunnyPrincessAlbum_v1';
const STARS_KEY='sunnyPrincessStars_v1';
const LAYOUT_KEY='sunnyPrincessLayout_v1';
const USER_HIDDEN_KEY='sunnyPrincessHiddenItems_v1';

const categories=[
  {key:'hair',label:'Kiểu tóc',short:'Tóc',emoji:'💇‍♀️',icon:`${A}ui/icon_hair.png`,z:40},
  {key:'top',label:'Áo',short:'Áo',emoji:'👚',icon:`${A}ui/icon_top.png`,z:30},
  {key:'skirt',label:'Váy',short:'Váy',emoji:'👗',icon:`${A}ui/icon_skirt.png`,z:20},
  {key:'shoes',label:'Giày',short:'Giày',emoji:'👟',icon:`${A}ui/icon_shoes.png`,z:10},
  {key:'accessory',label:'Phụ kiện',short:'Phụ kiện',emoji:'👑',icon:`${A}ui/icon_accessory.png`,z:50}
];
const names={
  hair:['Tóc hai bên','Tóc ngắn tinh nghịch','Tóc xoăn dài','Tóc búi tròn','Tóc tết hồng','Tóc đuôi ngựa xanh','Tóc búi kẹo ngọt','Tóc xoăn nâu dài','Tóc búi đôi nơ hồng','Tóc vàng tết vòng hoa','Tóc xoăn nâu nơ hồng','Tóc cột hai bên nơ tím','Tóc búi cao ngọc trai','Tóc lob nâu nhạt','Tóc tết lệch hoa hồng','Tóc gợn tím xanh pastel','Tóc bob hồng ngắn','Tóc búi vương miện','Tóc đuôi ngựa vàng','Tóc bob đen mái bằng','Tóc tết đôi nâu đỏ','Tóc xoăn dài nâu sáng','Tóc mái hồng buông xoăn','Tóc thẳng vàng dài','Tóc búi rối đen'],
  top:['Áo thun hồng','Áo vàng chanh','Áo hoodie xanh','Áo len dâu tây','Áo hoodie Kuromi','Áo mèo con','Áo mây cầu vồng'],
  skirt:['Váy voan bồng','Chân váy jean','Váy dài hoa','Chân váy cầu vồng','Váy bồng Kuromi','Váy bồng trời sao','Váy mây mưa'],
  shoes:['Giày da đỏ','Giày thể thao trắng','Ủng mưa hồng','Giày ba lê','Giày đế dày Kuromi','Dép thỏ','Ủng mưa mặt trời'],
  accessory:['Vương miện nhỏ','Kẹp nơ','Vòng cổ ngọc trai','Túi đeo chéo','Mũ Kuromi','Tai gấu','Kẹp mây cầu vồng','Kẹp ngôi sao']
};
const hiddenItemIds=new Set(['hair_11','hair_14','hair_16']);
const items={};
for(const c of categories){
  items[c.key]=names[c.key]
    .map((name,i)=>({
      id:`${c.key}_${i+1}`,name,category:c.key,
      layer:`${A}layers/${c.key}_${i+1}.png`,thumb:`${A}thumbs/${c.key}_${i+1}.png`
    }))
    .filter(item=>!hiddenItemIds.has(item.id));
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
function sanitizeSelection(selection={}){
  const clean={...emptySelection(),...selection};
  for(const c of categories){
    const id=clean[c.key];
    if(id && (!findItem(id)||userHiddenItemIds.has(id))) clean[c.key]=null;
  }
  return clean;
}
let state={model:'girl_1',scene:'sky',activeCategory:'hair',selection:emptySelection()};
let album=[];
let stars=0;
let mission=null;
let pendingMission=null;
let toastTimer=null;
let layoutConfig={};
let userHiddenItemIds=new Set();
let editorMode=false;
let editorItemId=null;

const $=s=>document.querySelector(s);
const el=(tag,cls)=>{const n=document.createElement(tag);if(cls)n.className=cls;return n};
const findModel=id=>models.find(x=>x.id===id)||models[0];
const findScene=id=>scenes.find(x=>x.id===id)||scenes[0];
const findItem=id=>{for(const c of categories){const x=items[c.key].find(y=>y.id===id);if(x)return x}return null};
const findCategory=key=>categories.find(c=>c.key===key);
const visibleItems=category=>items[category].filter(it=>!userHiddenItemIds.has(it.id));

function placementKey(itemId,modelId=state.model){return `${modelId}:${itemId}`}
function defaultPlacement(itemId){
  const it=findItem(itemId),c=it?findCategory(it.category):null;
  return {x:0,y:0,scale:1,rotation:0,z:c?.z||10}
}
function getPlacement(itemId,modelId=state.model){
  const p=layoutConfig[placementKey(itemId,modelId)]||{};
  const d=defaultPlacement(itemId);
  return {
    x:Number.isFinite(Number(p.x))?Number(p.x):d.x,
    y:Number.isFinite(Number(p.y))?Number(p.y):d.y,
    scale:Number.isFinite(Number(p.scale))?Number(p.scale):d.scale,
    rotation:Number.isFinite(Number(p.rotation))?Number(p.rotation):d.rotation,
    z:Number.isFinite(Number(p.z))?Number(p.z):d.z
  }
}
function persistLayout(){try{localStorage.setItem(LAYOUT_KEY,JSON.stringify(layoutConfig))}catch{}}
function persistHidden(){try{localStorage.setItem(USER_HIDDEN_KEY,JSON.stringify([...userHiddenItemIds]))}catch{}}
function applyPlacement(img,p){
  const tx=(p.x/1024)*100,ty=(p.y/1536)*100;
  img.style.transform=`translate(${tx}%,${ty}%) rotate(${p.rotation}deg) scale(${p.scale})`;
  img.style.zIndex=String(p.z)
}

function safeJSON(key,fallback){try{const x=JSON.parse(localStorage.getItem(key)||'null');return x??fallback}catch{return fallback}}
function load(){
  const hidden=safeJSON(USER_HIDDEN_KEY,[]);
  userHiddenItemIds=new Set(Array.isArray(hidden)?hidden.filter(id=>findItem(id)):[]);
  const saved=safeJSON(STORAGE_KEY,null);
  if(saved && saved.selection){state={...state,...saved,selection:sanitizeSelection(saved.selection)}}
  album=safeJSON(ALBUM_KEY,[]); if(!Array.isArray(album))album=[];
  stars=Number(localStorage.getItem(STARS_KEY)||0)||0;
  layoutConfig=safeJSON(LAYOUT_KEY,{}); if(!layoutConfig||typeof layoutConfig!=='object'||Array.isArray(layoutConfig))layoutConfig={};
}
function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch{}}
function persistAlbum(){try{localStorage.setItem(ALBUM_KEY,JSON.stringify(album.slice(0,40)))}catch{}}
function persistStars(){try{localStorage.setItem(STARS_KEY,String(stars))}catch{}}
function showToast(msg,ms=1450){const t=$('#toast');clearTimeout(toastTimer);t.textContent=msg;t.hidden=false;toastTimer=setTimeout(()=>t.hidden=true,ms)}

function renderAll(){renderStage();renderModels();renderScenes();renderCategories();renderItems();renderBadges();renderMissionBar();updateHiddenCount();persist();if(editorMode)updateEditorPanel()}
function renderStage(){
  const m=findModel(state.model),s=findScene(state.scene);
  $('#sceneImg').src=s.bg;$('#sceneImg').alt=s.name;
  $('#modelImg').src=state.selection.hair?m.bald:m.base;$('#modelImg').alt=m.name;
  for(const c of categories){
    const img=$(`#layer${c.key[0].toUpperCase()+c.key.slice(1)}`),id=state.selection[c.key];
    img.classList.remove('editor-target');
    if(id){
      const it=findItem(id),p=getPlacement(id,state.model);
      img.src=it.layer;img.hidden=false;applyPlacement(img,p);
      if(editorMode&&editorItemId===id)img.classList.add('editor-target')
    }else{
      img.hidden=true;img.removeAttribute('src');img.style.removeProperty('transform');img.style.removeProperty('z-index')
    }
  }
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
  categories.forEach(c=>{const b=el('button','category-tab'+(c.key===state.activeCategory?' active':''));b.innerHTML=`<img src="${c.icon}" alt=""><span>${c.short}</span>`;b.onclick=()=>{state.activeCategory=c.key;if(editorMode)editorItemId=state.selection[c.key]||editorItemId;renderCategories();renderItems();updateWardrobeHead();if(editorMode){renderStage();updateEditorPanel()}};box.appendChild(b)});updateWardrobeHead()
}
function updateWardrobeHead(){const c=categories.find(x=>x.key===state.activeCategory);$('#categoryEmoji').textContent=c.emoji;$('#categoryTitle').textContent=c.label}
function renderItems(){
  const box=$('#itemGrid');box.innerHTML='';
  const targetIds=new Set(mission?.targets||[]);
  visibleItems(state.activeCategory).forEach(it=>{const b=el('button','item-card'+(state.selection[it.category]===it.id?' selected':'')+(targetIds.has(it.id)?' target':''));b.dataset.id=it.id;b.title=it.name;b.innerHTML=`<img src="${it.thumb}" alt=""><span>${it.name}</span>`;b.onclick=()=>toggleItem(it);box.appendChild(b)})
}
function toggleItem(it){
  const removing=state.selection[it.category]===it.id;
  state.selection[it.category]=removing?null:it.id;
  if(editorMode)editorItemId=removing?null:it.id;
  renderStage();renderItems();renderMissionBar();persist();checkMission();
  if(editorMode)updateEditorPanel()
}
function renderBadges(){$('#starCount').textContent=stars;$('#albumBadge').textContent=album.length;$('#albumBadge').hidden=album.length===0}

function randomize(){for(const c of categories){const list=visibleItems(c.key);state.selection[c.key]=list.length?list[Math.floor(Math.random()*list.length)].id:null}renderAll();checkMission();showToast('✨ Sunny đã có một bộ đồ mới!')}
function resetLook(){state.selection=emptySelection();editorItemId=null;renderAll();showToast('Đã cởi hết đồ để phối lại')}
function removeCurrent(){const c=state.activeCategory;if(!state.selection[c]){showToast('Chưa mặc món nào ở mục này');return}if(editorItemId===state.selection[c])editorItemId=null;state.selection[c]=null;renderStage();renderItems();renderMissionBar();persist();if(editorMode)updateEditorPanel()}

function snapshot(){return {id:`look_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,model:state.model,scene:state.scene,selection:{...state.selection},ts:Date.now()}}
function saveLook(){if(!Object.values(state.selection).some(Boolean)){showToast('Sunny mặc ít nhất một món trước nhé');return}album.unshift(snapshot());album=album.slice(0,40);persistAlbum();renderBadges();showToast('📸 Đã lưu vào album!')}
function loadLook(look){state.model=look.model||'girl_1';state.scene=look.scene||'sky';state.selection=sanitizeSelection(look.selection);renderAll();closeModal('albumModal');showToast('Đã mặc lại bộ đồ này ✨')}
function deleteLook(id){album=album.filter(x=>x.id!==id);persistAlbum();renderAlbum();renderBadges()}
function renderAlbum(){
  const grid=$('#albumGrid');grid.innerHTML='';
  if(!album.length){grid.innerHTML='<div class="album-empty">Chưa có bộ đồ nào.<br>Sunny phối đồ rồi bấm “Lưu album” nhé.</div>';return}
  album.forEach(look=>{const card=el('article','album-item');const thumb=el('div','album-thumb');thumb.append(...buildLookImages(look));const acts=el('div','album-actions');acts.innerHTML='<button class="load-look">Mặc lại</button><button class="download-look">Tải ảnh</button><button class="delete-look">×</button>';acts.querySelector('.load-look').onclick=()=>loadLook(look);acts.querySelector('.download-look').onclick=()=>downloadLook(look);acts.querySelector('.delete-look').onclick=()=>deleteLook(look.id);card.append(thumb,acts);grid.appendChild(card)})
}
function buildLookImages(look){
  const m=findModel(look.model),s=findScene(look.scene),sel=sanitizeSelection(look.selection);const arr=[];
  const bg=new Image();bg.className='bg';bg.src=s.bg;bg.alt='';arr.push(bg);
  const base=new Image();base.src=sel.hair?m.bald:m.base;base.alt='';base.style.zIndex='1';arr.push(base);
  const layers=categories.map(c=>sel[c.key]).filter(Boolean).map(id=>({id,p:getPlacement(id,look.model)})).sort((a,b)=>a.p.z-b.p.z);
  for(const row of layers){const im=new Image();im.src=findItem(row.id).layer;im.alt='';applyPlacement(im,row.p);arr.push(im)}
  return arr
}

function openModal(id){document.getElementById(id).hidden=false}
function closeModal(id){document.getElementById(id).hidden=true}
function openPreview(look=snapshot()){
  const box=$('#previewStage');box.innerHTML='';box.append(...buildLookImages(look));$('#downloadBtn').onclick=()=>downloadLook(look);openModal('previewModal')
}

function currentEditorItem(){
  const active=state.selection[state.activeCategory];
  if(active){editorItemId=active;return findItem(active)}
  if(editorItemId){
    const it=findItem(editorItemId);
    if(it&&state.selection[it.category]===editorItemId)return it
  }
  const any=Object.values(state.selection).find(Boolean)||null;
  editorItemId=any;
  return any?findItem(any):null
}
function clampPlacement(p){
  p.x=Math.max(-1024,Math.min(1024,Math.round(Number(p.x)||0)));
  p.y=Math.max(-1536,Math.min(1536,Math.round(Number(p.y)||0)));
  p.scale=Math.max(.3,Math.min(2.5,Math.round((Number(p.scale)||1)*100)/100));
  p.rotation=Math.max(-180,Math.min(180,Math.round(Number(p.rotation)||0)));
  p.z=Math.max(2,Math.min(99,Math.round(Number(p.z)||2)));
  return p
}
function saveEditorPlacement(itemId,p){
  layoutConfig[placementKey(itemId,state.model)]=clampPlacement(p);
  persistLayout();renderStage();updateEditorPanel()
}
function mutateEditorPlacement(fn){
  const it=currentEditorItem();if(!it){showToast('Hãy chọn một món đồ trước');return}
  const p=getPlacement(it.id,state.model);fn(p);saveEditorPlacement(it.id,p)
}
function nudgeEditor(dx,dy,step){
  mutateEditorPlacement(p=>{p.x+=dx*step;p.y+=dy*step})
}
function renderEditorLayerList(currentId){
  const box=$('#editorLayerList');if(!box)return;box.innerHTML='';
  const rows=categories.map(c=>state.selection[c.key]).filter(Boolean)
    .map(id=>({id,it:findItem(id),z:getPlacement(id,state.model).z}))
    .sort((a,b)=>b.z-a.z);
  rows.forEach(r=>{const d=el('div','editor-layer-row'+(r.id===currentId?' current':''));d.innerHTML=`<span>${r.it.name}</span><b>Layer ${r.z}</b>`;box.appendChild(d)})
}
function updateEditorPanel(){
  if(!editorMode)return;
  const it=currentEditorItem(),controls=$('#editorControls'),empty=$('#editorEmpty'),thumb=$('#editorThumb');
  $('#advancedEditBtn')?.classList.add('active');
  document.querySelectorAll('.stage-layer').forEach(x=>x.classList.remove('editor-target'));
  if(!it){
    controls.disabled=true;empty.hidden=false;thumb.hidden=true;
    $('#editorItemName').textContent='Chưa chọn món';$('#editorModelName').textContent=findModel(state.model).name;
    renderEditorLayerList(null);return
  }
  controls.disabled=false;empty.hidden=true;thumb.hidden=false;thumb.src=it.thumb;
  $('#editorItemName').textContent=it.name;$('#editorModelName').textContent='Người mẫu: '+findModel(state.model).name;
  const p=getPlacement(it.id,state.model);
  $('#editorXY').textContent=`X ${p.x} • Y ${p.y}`;
  $('#editScale').value=String(p.scale);$('#scaleValue').textContent=`${Math.round(p.scale*100)}%`;
  $('#editRotation').value=String(p.rotation);$('#rotationValue').textContent=`${p.rotation}°`;
  $('#editLayer').value=String(p.z);$('#layerValue').textContent=String(p.z);
  const layerEl=$(`#layer${it.category[0].toUpperCase()+it.category.slice(1)}`);
  layerEl?.classList.add('editor-target');
  renderEditorLayerList(it.id)
}
function openEditor(){
  editorMode=true;document.body.classList.add('editor-mode');$('#advancedEditor').hidden=false;
  editorItemId=state.selection[state.activeCategory]||Object.values(state.selection).find(Boolean)||null;
  renderStage();updateEditorPanel();showToast('Chế độ chỉnh sửa chuyên sâu đã bật')
}
function closeEditor(){
  editorMode=false;document.body.classList.remove('editor-mode');$('#advancedEditor').hidden=true;$('#advancedEditBtn')?.classList.remove('active');
  document.querySelectorAll('.stage-layer').forEach(x=>x.classList.remove('editor-target'));
  showToast('Đã lưu cấu hình vị trí và layer')
}
function resetCurrentItemLayout(){
  const it=currentEditorItem();if(!it)return;
  delete layoutConfig[placementKey(it.id,state.model)];persistLayout();renderStage();updateEditorPanel();showToast('Đã đưa món này về vị trí mặc định')
}
function changeLayer(action){
  const it=currentEditorItem();if(!it)return;
  const otherZ=categories.map(c=>state.selection[c.key]).filter(id=>id&&id!==it.id).map(id=>getPlacement(id,state.model).z);
  mutateEditorPlacement(p=>{
    if(action==='up')p.z+=1;
    else if(action==='down')p.z-=1;
    else if(action==='top')p.z=(otherZ.length?Math.max(...otherZ):p.z)+1;
    else if(action==='bottom')p.z=(otherZ.length?Math.min(...otherZ):p.z)-1
  })
}

function updateHiddenCount(){
  const n=userHiddenItemIds.size,el=$('#hiddenCount');if(el)el.textContent=String(n)
}
function unequipEditorItem(){
  const it=currentEditorItem();if(!it){showToast('Hãy chọn một món đồ trước');return}
  if(state.selection[it.category]===it.id)state.selection[it.category]=null;
  editorItemId=null;renderAll();showToast('Đã cởi '+it.name)
}
function hideCurrentItem(){
  const it=currentEditorItem();if(!it){showToast('Hãy chọn một món đồ trước');return}
  if(!window.confirm(`Ẩn "${it.name}" khỏi game?\n\nMón này sẽ biến khỏi tủ đồ, Phối nhanh và Thử thách. Bạn vẫn có thể khôi phục trong mục “Món đã ẩn”.`))return;
  userHiddenItemIds.add(it.id);persistHidden();
  if(state.selection[it.category]===it.id)state.selection[it.category]=null;
  if(mission?.targets?.includes(it.id))mission=null;
  if(pendingMission?.targets?.includes(it.id))pendingMission=null;
  editorItemId=null;renderAll();renderHiddenItems();showToast('Đã ẩn '+it.name+' khỏi game',2000)
}
function renderHiddenItems(){
  const box=$('#hiddenItemsList');if(!box)return;box.innerHTML='';
  const hidden=[...userHiddenItemIds].map(findItem).filter(Boolean);
  if(!hidden.length){box.innerHTML='<div class="hidden-items-empty">Chưa có món nào bị ẩn.</div>';$('#restoreAllHiddenBtn').hidden=true;updateHiddenCount();return}
  $('#restoreAllHiddenBtn').hidden=false;
  hidden.sort((a,b)=>a.category.localeCompare(b.category)||a.name.localeCompare(b.name,'vi'));
  hidden.forEach(it=>{
    const row=el('div','hidden-item-row'),cat=findCategory(it.category);
    row.innerHTML=`<img src="${it.thumb}" alt=""><div><b>${it.name}</b><small>${cat?.label||it.category}</small></div><button type="button">Khôi phục</button>`;
    row.querySelector('button').onclick=()=>restoreHiddenItem(it.id);
    box.appendChild(row)
  });
  updateHiddenCount()
}
function restoreHiddenItem(id){
  const it=findItem(id);userHiddenItemIds.delete(id);persistHidden();renderItems();renderHiddenItems();updateHiddenCount();
  if(it)showToast('Đã khôi phục '+it.name)
}
function restoreAllHidden(){
  if(!userHiddenItemIds.size)return;
  userHiddenItemIds.clear();persistHidden();renderItems();renderHiddenItems();updateHiddenCount();showToast('Đã khôi phục tất cả món đồ')
}
function openHiddenManager(){renderHiddenItems();openModal('hiddenItemsModal')}

function generateMission(){
  const cats=categories.filter(c=>visibleItems(c.key).length).sort(()=>Math.random()-.5).slice(0,3);
  pendingMission={targets:cats.map(c=>{const l=visibleItems(c.key);return l[Math.floor(Math.random()*l.length)].id}),scene:scenes[Math.floor(Math.random()*scenes.length)].id};renderChallengePreview()
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
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=1536;const ctx=canvas.getContext('2d');const m=findModel(look.model),s=findScene(look.scene),sel=sanitizeSelection(look.selection);
  const bg=await loadImage(s.bg),r=coverRect(bg.naturalWidth,bg.naturalHeight,1024,1536);ctx.drawImage(bg,r.sx,r.sy,r.sw,r.sh,0,0,1024,1536);
  const base=await loadImage(sel.hair?m.bald:m.base);ctx.drawImage(base,0,0,1024,1536);
  const layers=categories.map(c=>sel[c.key]).filter(Boolean).map(id=>({id,p:getPlacement(id,look.model)})).sort((a,b)=>a.p.z-b.p.z);
  for(const row of layers){
    const im=await loadImage(findItem(row.id).layer),p=row.p;
    ctx.save();ctx.translate(512+p.x,768+p.y);ctx.rotate(p.rotation*Math.PI/180);ctx.scale(p.scale,p.scale);ctx.drawImage(im,-512,-768,1024,1536);ctx.restore()
  }
  return canvas
}
async function downloadLook(look){try{showToast('Đang tạo ảnh…');const canvas=await composeLook(look);canvas.toBlob(blob=>{if(!blob){showToast('Không tạo được ảnh');return}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`Sunny-Princess-${Date.now()}.png`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);showToast('⬇ Đã tạo ảnh PNG')},'image/png')}catch(e){console.error(e);showToast('Không tạo được ảnh, thử lại nhé')}}

function wire(){
  $('#randomBtn').onclick=randomize;$('#resetBtn').onclick=resetLook;$('#saveBtn').onclick=saveLook;$('#albumBtn').onclick=()=>{renderAlbum();openModal('albumModal')};$('#previewBtn').onclick=()=>openPreview();$('#removeItemBtn').onclick=removeCurrent;
  $('#advancedEditBtn').onclick=()=>editorMode?closeEditor():openEditor();$('#closeEditorBtn').onclick=closeEditor;$('#finishEditorBtn').onclick=closeEditor;$('#resetItemLayoutBtn').onclick=resetCurrentItemLayout;
  $('#unequipEditorBtn').onclick=unequipEditorItem;$('#hideItemBtn').onclick=hideCurrentItem;$('#manageHiddenBtn').onclick=openHiddenManager;$('#restoreAllHiddenBtn').onclick=restoreAllHidden;
  document.querySelectorAll('[data-dx][data-dy]').forEach(b=>b.onclick=()=>nudgeEditor(Number(b.dataset.dx),Number(b.dataset.dy),Number($('#editorStep').value)||5));
  document.querySelectorAll('[data-rotate]').forEach(b=>b.onclick=()=>mutateEditorPlacement(p=>p.rotation+=Number(b.dataset.rotate)));
  document.querySelectorAll('[data-layer-action]').forEach(b=>b.onclick=()=>changeLayer(b.dataset.layerAction));
  $('#editScale').oninput=e=>mutateEditorPlacement(p=>p.scale=Number(e.target.value));
  $('#editRotation').oninput=e=>mutateEditorPlacement(p=>p.rotation=Number(e.target.value));
  $('#editLayer').oninput=e=>mutateEditorPlacement(p=>p.z=Number(e.target.value));
  $('#challengeBtn').onclick=()=>{generateMission();openModal('challengeModal')};$('#newChallengeBtn').onclick=generateMission;$('#startChallengeBtn').onclick=startMission;$('#hintBtn').onclick=hintMission;$('#cancelMissionBtn').onclick=()=>{mission=null;renderMissionBar();renderItems();showToast('Đã dừng thử thách')};
  document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>closeModal(b.dataset.close));
  document.querySelectorAll('.modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)closeModal(m.id)}));
  $('#previewModal').addEventListener('click',e=>{if(e.target===$('#previewModal'))closeModal('previewModal')});
  window.addEventListener('keydown',e=>{
    if(e.key==='Escape'){for(const id of ['albumModal','challengeModal','previewModal','hiddenItemsModal'])closeModal(id);if(editorMode)closeEditor();return}
    if(!editorMode||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)||e.target.matches('input,select,textarea'))return;
    e.preventDefault();const step=e.shiftKey?10:(Number($('#editorStep').value)||5);
    if(e.key==='ArrowLeft')nudgeEditor(-1,0,step);if(e.key==='ArrowRight')nudgeEditor(1,0,step);if(e.key==='ArrowUp')nudgeEditor(0,-1,step);if(e.key==='ArrowDown')nudgeEditor(0,1,step)
  });
  for(const ev of ['contextmenu','dragstart','selectstart'])document.addEventListener(ev,e=>e.preventDefault());
  let sx=0,sy=0;
  document.addEventListener('touchstart',e=>{const t=e.touches[0];if(t){sx=t.clientX;sy=t.clientY}},{passive:true});
  document.addEventListener('touchmove',e=>{const t=e.touches[0];if(!t)return;const dx=t.clientX-sx,dy=t.clientY-sy;if(Math.abs(dx)>Math.abs(dy)+6&&Math.abs(dx)>10)e.preventDefault()},{passive:false});
}

load();wire();renderAll();
})();
