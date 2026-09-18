(function(){
'use strict';

var SAVE_KEY='sunny_garden_save_v1';
var MAX_ROWS=10, COLS=4, FIELD_SIZE=36;
var MAX_PLAYER_LEVEL=60;
var FREE_FRUIT_CHANCE=0.15;
var lastDropIndex=-1;

var FRUITS=[
  // 30 bậc trái cố định. Giữ nguyên 8 bậc đầu để không phá save/gameplay cũ.
  {id:'mango',level:1,unlock:1,seed:12,value:16},
  {id:'jackfruit',level:2,unlock:2,seed:28,value:36},
  {id:'guava',level:3,unlock:3,seed:45,value:60},
  {id:'dragon-fruit',level:4,unlock:4,seed:70,value:95},
  {id:'coconut',level:5,unlock:6,seed:105,value:145},
  {id:'watermelon',level:6,unlock:8,seed:150,value:220},
  {id:'durian',level:7,unlock:10,seed:220,value:330},
  {id:'mangosteen',level:8,unlock:12,seed:320,value:500},
  {id:'banana',level:9,unlock:14,seed:430,value:670},
  {id:'pineapple',level:10,unlock:16,seed:560,value:880},
  {id:'avocado',level:11,unlock:18,seed:720,value:1140},
  {id:'papaya',level:12,unlock:20,seed:920,value:1470},
  {id:'pomegranate',level:13,unlock:22,seed:1160,value:1870},
  {id:'lychee',level:14,unlock:24,seed:1450,value:2350},
  {id:'rambutan',level:15,unlock:26,seed:1800,value:2940},
  {id:'pomelo',level:16,unlock:28,seed:2220,value:3650},
  {id:'passion-fruit',level:17,unlock:30,seed:2720,value:4500},
  {id:'starfruit',level:18,unlock:32,seed:3320,value:5520},
  {id:'peach',level:19,unlock:34,seed:4040,value:6750},
  {id:'pear',level:20,unlock:36,seed:4900,value:8220},
  {id:'lemon',level:21,unlock:38,seed:5920,value:9970},
  {id:'lime',level:22,unlock:40,seed:7130,value:12050},
  {id:'grapefruit',level:23,unlock:42,seed:8560,value:14520},
  {id:'persimmon',level:24,unlock:44,seed:10240,value:17450},
  {id:'sugar-apple',level:25,unlock:46,seed:12210,value:20920},
  {id:'soursop',level:26,unlock:48,seed:14520,value:25030},
  {id:'sapodilla',level:27,unlock:50,seed:17220,value:29880},
  {id:'longan',level:28,unlock:52,seed:20380,value:35600},
  {id:'langsat',level:29,unlock:54,seed:24060,value:42330},
  {id:'buddhas-hand',level:30,unlock:56,seed:28340,value:50240}
];

var CUSTOMERS=[
  {id:'farmer',name:'Nông dân',minLevel:1,col:0,row:0},
  {id:'post',name:'Cô giao thư',minLevel:1,col:1,row:0},
  {id:'grandma',name:'Bà nội trợ',minLevel:3,col:2,row:0},
  {id:'builder',name:'Thợ xây',minLevel:6,col:3,row:0},
  {id:'girl',name:'Bé gái',minLevel:9,col:4,row:0},
  {id:'gardener',name:'Người làm vườn',minLevel:12,col:0,row:1},
  {id:'rake',name:'Người làm vườn trẻ',minLevel:16,col:1,row:1},
  {id:'baker',name:'Đầu bếp',minLevel:22,col:2,row:1},
  {id:'student',name:'Học sinh',minLevel:30,col:3,row:1},
  {id:'vet',name:'Bác sĩ thú y',minLevel:40,col:4,row:1}
];

var ROW_UNLOCKS=[
  null,null,
  {level:3,cost:100},
  {level:6,cost:240},
  {level:10,cost:520},
  {level:14,cost:950},
  {level:18,cost:1600},
  {level:22,cost:2600},
  {level:26,cost:4200},
  {level:30,cost:6800}
];

var fruitMeta={};
(window.SunnyFruitsData||[]).forEach(function(f){fruitMeta[f.id]=f;});

var els={
  gold:document.getElementById('goldLabel'),
  level:document.getElementById('levelLabel'),
  turn:document.getElementById('turnLabel'),
  xp:document.getElementById('xpLabel'),
  xpFill:document.getElementById('xpFill'),
  customer:document.getElementById('customerPortrait'),
  reward:document.getElementById('orderReward'),
  orderTier:document.getElementById('orderTier'),
  orderSlots:document.getElementById('orderSlots'),
  warehouse:document.getElementById('warehouse'),
  warehouseCount:document.getElementById('warehouseCount'),
  discardBtn:document.getElementById('discardBtn'),
  field:document.getElementById('field'),
  fieldCount:document.getElementById('fieldCount'),
  shop:document.getElementById('seedShop'),
  selectedSeed:document.getElementById('selectedSeedLabel'),
  bookBtn:document.getElementById('fruitBookBtn'),
  bookMiniCount:document.getElementById('bookMiniCount'),
  bookModal:document.getElementById('fruitBookModal'),
  bookGrid:document.getElementById('fruitBookGrid'),
  bookCount:document.getElementById('fruitBookCount'),
  bookClose:document.getElementById('fruitBookClose'),
  toast:document.getElementById('toast')
};

function defaults(){
  return {
    version:1,
    gold:120,
    level:1,
    xp:0,
    turn:0,
    unlockedRows:2,
    warehouse:Array(MAX_ROWS*COLS).fill(null),
    field:Array(FIELD_SIZE).fill(null),
    selectedSeed:'mango',
    selectedWarehouse:null,
    order:null,
    completedOrders:0,
    discoveredFruits:[]
  };
}

function load(){
  try{
    var raw=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');
    var s=Object.assign(defaults(),raw||{});
    if(!Array.isArray(s.warehouse)||s.warehouse.length!==MAX_ROWS*COLS)s.warehouse=Array(MAX_ROWS*COLS).fill(null);
    if(!Array.isArray(s.field)||s.field.length!==FIELD_SIZE)s.field=Array(FIELD_SIZE).fill(null);
    s.unlockedRows=Math.max(2,Math.min(MAX_ROWS,Number(s.unlockedRows)||2));
    s.level=Math.max(1,Math.min(MAX_PLAYER_LEVEL,Number(s.level)||1));
    s.gold=Math.max(0,Number(s.gold)||0);
    s.turn=Math.max(0,Number(s.turn)||0);
    if(!fruitDef(s.selectedSeed)||fruitDef(s.selectedSeed).unlock>s.level)s.selectedSeed='mango';
    if(!Array.isArray(s.discoveredFruits))s.discoveredFruits=[];
    var known={};
    s.discoveredFruits.forEach(function(id){if(fruitDef(id))known[id]=true;});
    s.warehouse.forEach(function(id){if(id&&fruitDef(id))known[id]=true;});
    s.field.forEach(function(cell){if(cell&&cell.fruitId&&fruitDef(cell.fruitId))known[cell.fruitId]=true;});
    s.discoveredFruits=Object.keys(known);
    s.selectedWarehouse=null;
    return s;
  }catch(e){return defaults();}
}

var state=load();
if(!state.order)state.order=generateOrder();

function save(){
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));}catch(e){}
}

function fruitDef(id){
  for(var i=0;i<FRUITS.length;i++)if(FRUITS[i].id===id)return FRUITS[i];
  return null;
}

function fruitName(id){
  return fruitMeta[id]?fruitMeta[id].name:id;
}

function coinHtml(value,small){
  return '<span class="coinIcon'+(small?' small':'')+'" aria-hidden="true"></span><span class="coinValue">'+value+'</span>';
}

function makeFruit(id,extraClass){
  var meta=fruitMeta[id];
  var el=document.createElement('div');
  el.className='fruitArt'+(extraClass?' '+extraClass:'');
  el.title=fruitName(id);
  if(meta&&window.SunnyFruitSheets&&SunnyFruitSheets[meta.sheet]){
    el.style.backgroundImage='url("'+SunnyFruitSheets[meta.sheet]+'")';
    el.style.backgroundPosition=(meta.col*20)+'% '+(meta.row*20)+'%';
  }else{
    el.textContent='🍎';
    el.style.display='grid';
    el.style.placeItems='center';
    el.style.fontSize='28px';
  }
  return el;
}

function isDiscovered(id){
  return state.discoveredFruits.indexOf(id)>=0;
}

function discoverFruit(id,announce){
  if(!fruitDef(id)||isDiscovered(id))return false;
  state.discoveredFruits.push(id);
  if(els.bookBtn){
    els.bookBtn.classList.remove('newFind');
    void els.bookBtn.offsetWidth;
    els.bookBtn.classList.add('newFind');
    setTimeout(function(){els.bookBtn.classList.remove('newFind');},900);
  }
  if(announce){
    setTimeout(function(){toast('📖 Đã khám phá '+fruitName(id)+'!');},120);
  }
  return true;
}

function renderFruitBook(){
  if(!els.bookGrid)return;
  els.bookGrid.innerHTML='';
  var found=0;
  FRUITS.forEach(function(f){
    var discovered=isDiscovered(f.id);
    if(discovered)found++;
    var card=document.createElement('div');
    card.className='bookFruitCard '+(discovered?'found':'unknown');

    var artWrap=document.createElement('div');
    artWrap.className='bookFruitArt';
    if(discovered){
      artWrap.appendChild(makeFruit(f.id));
    }else{
      var q=document.createElement('div');
      q.className='bookQuestion';
      q.textContent='?';
      artWrap.appendChild(q);
    }
    card.appendChild(artWrap);

    var label=document.createElement('div');
    label.className='bookFruitLabel';
    if(discovered){
      label.innerHTML='<b>'+fruitName(f.id)+'</b><small>Lv '+f.level+'</small>';
    }else{
      label.innerHTML='<b>Chưa khám phá</b><small>?</small>';
    }
    card.appendChild(label);
    els.bookGrid.appendChild(card);
  });
  if(els.bookCount)els.bookCount.textContent=found+'/'+FRUITS.length;
  if(els.bookMiniCount)els.bookMiniCount.textContent=found+'/'+FRUITS.length;
}

function openFruitBook(){
  renderFruitBook();
  els.bookModal.classList.remove('hidden');
}

function closeFruitBook(){
  els.bookModal.classList.add('hidden');
}

function xpNeed(level){
  if(level>=MAX_PLAYER_LEVEL)return 0;
  if(level<=10)return 80+(level-1)*42;
  if(level<=30)return 458+(level-10)*55;
  return 1558+(level-30)*72;
}

function toast(text,bad){
  els.toast.textContent=text;
  els.toast.className='toast '+(bad?'bad':'good');
  clearTimeout(toast.t);
  toast.t=setTimeout(function(){els.toast.className='toast hidden';},1600);
}

function unlockedFruits(){
  return FRUITS.filter(function(f){return f.unlock<=state.level;});
}

function pickWeightedFruit(){
  var list=unlockedFruits(),weights=[],total=0;
  for(var i=0;i<list.length;i++){
    var w=Math.max(1,Math.round(100/Math.pow(i+1,1.7)));
    weights.push(w);total+=w;
  }
  var r=Math.random()*total;
  for(var j=0;j<list.length;j++){r-=weights[j];if(r<=0)return list[j].id;}
  return list[0].id;
}

function randomEmptyField(){
  var empty=[];
  for(var i=0;i<state.field.length;i++)if(!state.field[i])empty.push(i);
  if(!empty.length)return -1;
  return empty[Math.floor(Math.random()*empty.length)];
}

function spawnFreeFruit(){
  lastDropIndex=-1;
  if(Math.random()>=FREE_FRUIT_CHANCE)return false;

  var idx=randomEmptyField();
  if(idx<0){
    toast('Sân 6×6 đã đầy • Không còn chỗ cho trái miễn phí',true);
    return false;
  }

  // pickWeightedFruit() chỉ lấy trong unlockedFruits(), tức là không bao giờ
  // rơi loại trái thuộc Level tương lai của Sunny.
  var fruitId=pickWeightedFruit();
  state.field[idx]={kind:'free',fruitId:fruitId};
  lastDropIndex=idx;
  discoverFruit(fruitId,true);
  return true;
}

function advancePlants(){
  for(var i=0;i<state.field.length;i++){
    var c=state.field[i];
    if(c&&c.kind==='plant'&&c.stage<4){
      c.stage++;
      if(c.stage===4)discoverFruit(c.fruitId,true);
    }
  }
}

function takeTurn(afterAdvance){
  state.turn++;
  advancePlants();
  if(afterAdvance)afterAdvance();
  spawnFreeFruit();
  save();
  render();
}

function plantAt(index){
  if(state.field[index])return;
  var def=fruitDef(state.selectedSeed);
  if(!def||def.unlock>state.level){toast('Hạt giống này chưa mở khóa',true);return;}
  if(state.gold<def.seed){toast('Chưa đủ vàng để mua hạt',true);return;}
  state.gold-=def.seed;
  takeTurn(function(){
    state.field[index]={kind:'plant',fruitId:def.id,stage:1};
  });
  toast('Đã gieo '+fruitName(def.id)+' • +1 lượt');
}

function findEmptyWarehouse(){
  var cap=state.unlockedRows*COLS;
  for(var i=0;i<cap;i++)if(!state.warehouse[i])return i;
  return -1;
}

function warehouseUsed(){
  var cap=state.unlockedRows*COLS,n=0;
  for(var i=0;i<cap;i++)if(state.warehouse[i])n++;
  return n;
}

function collectField(index){
  var cell=state.field[index];
  if(!cell)return;
  var ready=cell.kind==='free'||(cell.kind==='plant'&&cell.stage===4);
  if(!ready)return;
  var slot=findEmptyWarehouse();
  if(slot<0){toast('Kho Sunny đã đầy • Hãy ghép hoặc bán bớt trái',true);return;}
  state.warehouse[slot]=cell.fruitId;
  discoverFruit(cell.fruitId,false);
  state.field[index]=null;
  save();render();
  toast(cell.kind==='free'?'Đã nhặt trái miễn phí':'Thu hoạch thành công');
}

function nextFruit(id){
  for(var i=0;i<FRUITS.length;i++){
    if(FRUITS[i].id===id)return i<FRUITS.length-1?FRUITS[i+1].id:null;
  }
  return null;
}

function clickWarehouse(index){
  var cap=state.unlockedRows*COLS;
  if(index<0||index>=cap)return;

  var id=state.warehouse[index];

  if(!id){
    if(state.selectedWarehouse===null)return;
    var fromEmptyMove=state.selectedWarehouse;
    var movingId=state.warehouse[fromEmptyMove];
    if(!movingId){state.selectedWarehouse=null;renderWarehouse();return;}
    state.warehouse[index]=movingId;
    state.warehouse[fromEmptyMove]=null;
    state.selectedWarehouse=null;
    save();
    renderWarehouse();
    toast('Đã chuyển '+fruitName(movingId)+' sang vị trí mới');
    return;
  }

  if(state.selectedWarehouse===null){
    state.selectedWarehouse=index;
    renderWarehouse();
    return;
  }

  if(state.selectedWarehouse===index){
    state.selectedWarehouse=null;
    renderWarehouse();
    return;
  }

  var first=state.warehouse[state.selectedWarehouse];
  if(first===id){
    var up=nextFruit(id);
    if(!up){state.selectedWarehouse=index;renderWarehouse();toast('Đây là trái cấp cao nhất');return;}
    var from=state.selectedWarehouse;
    state.warehouse[from]=null;
    state.warehouse[index]=up;
    discoverFruit(up,true);
    state.selectedWarehouse=null;
    takeTurn();
    toast(fruitName(id)+' + '+fruitName(id)+' → '+fruitName(up));
  }else{
    state.selectedWarehouse=index;
    renderWarehouse();
  }
}

function updateDiscardButton(){
  if(!els.discardBtn)return;
  var enabled=state.selectedWarehouse!==null&&!!state.warehouse[state.selectedWarehouse];
  els.discardBtn.disabled=!enabled;
  els.discardBtn.classList.toggle('active',enabled);
  if(enabled){
    els.discardBtn.title='Vứt bỏ '+fruitName(state.warehouse[state.selectedWarehouse])+' • Không nhận vàng';
  }else{
    els.discardBtn.title='Chọn 1 trái trong kho để vứt bỏ';
  }
}

function discardSelectedFruit(){
  if(state.selectedWarehouse===null)return;
  var index=state.selectedWarehouse;
  var id=state.warehouse[index];
  if(!id)return;

  var ok=window.confirm('Vứt bỏ '+fruitName(id)+'?\n\nKhông nhận vàng và không thể hoàn tác.');
  if(!ok)return;

  state.warehouse[index]=null;
  state.selectedWarehouse=null;
  save();
  render();
  toast('🗑️ Đã vứt bỏ '+fruitName(id),true);
}

function orderAvailableCustomers(){
  return CUSTOMERS.filter(function(c){return c.minLevel<=state.level;});
}

function generateOrder(){
  var people=orderAvailableCustomers();
  var person=people[Math.floor(Math.random()*people.length)];
  var fruits=unlockedFruits();

  // Nhiệm vụ tăng dần theo Level:
  // Lv1-4: đơn nhỏ; Lv5-14: đơn vừa; Lv15-29: đơn lớn;
  // Lv30+: có đơn VIP 4 loại, tối đa 6 ô.
  var maxTypes=Math.min(state.level>=30?4:3,fruits.length);
  var typeCount=1;
  var roll=Math.random();

  if(state.level>=30&&maxTypes>=4){
    if(roll<.22)typeCount=4;
    else if(roll<.57)typeCount=3;
    else if(roll<.90)typeCount=2;
  }else if(state.level>=15&&maxTypes>=3){
    if(roll<.28)typeCount=3;
    else if(roll<.72)typeCount=2;
  }else if(state.level>=5&&maxTypes>=3){
    if(roll<.15)typeCount=3;
    else if(roll<.50)typeCount=2;
  }else if(state.level>=2&&maxTypes>=2){
    if(roll<.35)typeCount=2;
  }

  // Chọn các loại khác nhau. Trái cấp thấp vẫn phổ biến hơn để không tạo đơn quá ác.
  var pool=fruits.slice();
  var chosen=[];
  while(chosen.length<typeCount&&pool.length){
    var weights=[],total=0;
    for(var i=0;i<pool.length;i++){
      var idx=FRUITS.indexOf(pool[i]);
      var age=Math.max(0,fruits.length-1-idx);
      var w=Math.max(2,Math.round(34/Math.pow(idx+1,.78))+Math.min(12,age));
      weights.push(w);total+=w;
    }
    var r=Math.random()*total,pickIndex=0;
    for(var j=0;j<pool.length;j++){r-=weights[j];if(r<=0){pickIndex=j;break;}}
    chosen.push(pool[pickIndex]);
    pool.splice(pickIndex,1);
  }

  var slotCap=state.level>=35?6:(state.level>=20?5:4);
  var extraCapacity=state.level>=15?2:1;
  var maxSlots=Math.min(slotCap,chosen.length+extraCapacity);
  var slotCount=chosen.length;
  if(maxSlots>slotCount){
    var chance=state.level>=20?.78:.58;
    while(slotCount<maxSlots&&Math.random()<chance){
      slotCount++;
      chance-=.16;
    }
  }

  var needs=[],sum=0;
  chosen.forEach(function(f){needs.push(f.id);sum+=f.value;});
  while(needs.length<slotCount){
    var extra=chosen[Math.floor(Math.random()*chosen.length)];
    needs.push(extra.id);sum+=extra.value;
  }

  for(var k=needs.length-1;k>0;k--){
    var swap=Math.floor(Math.random()*(k+1));
    var tmp=needs[k];needs[k]=needs[swap];needs[swap]=tmp;
  }

  var tier='normal';
  if(typeCount>=4||slotCount>=6)tier='vip';
  else if(typeCount>=3||slotCount>=5)tier='large';

  var diversityBonus=(chosen.length-1)*(14+Math.floor(state.level*.9));
  var quantityBonus=Math.max(0,slotCount-2)*(8+Math.floor(state.level*.55));
  var tierMultiplier=tier==='vip'?1.28:(tier==='large'?1.14:1);
  return {
    customer:person.id,
    needs:needs,
    filled:Array(needs.length).fill(null),
    reward:Math.round((sum*1.45+12*slotCount+state.level*4+diversityBonus+quantityBonus)*tierMultiplier),
    xp:Math.round((20+8*slotCount+Math.min(70,state.level*2)+diversityBonus*.55+quantityBonus*.4)*tierMultiplier),
    typeCount:chosen.length,
    tier:tier
  };
}
function customerById(id){
  for(var i=0;i<CUSTOMERS.length;i++)if(CUSTOMERS[i].id===id)return CUSTOMERS[i];
  return CUSTOMERS[0];
}

function addXp(amount){
  if(state.level>=MAX_PLAYER_LEVEL){
    state.level=MAX_PLAYER_LEVEL;
    state.xp=0;
    return;
  }
  state.xp+=amount;
  var leveled=false;
  while(state.level<MAX_PLAYER_LEVEL&&state.xp>=xpNeed(state.level)){
    state.xp-=xpNeed(state.level);
    state.level++;
    state.gold+=30+state.level*12+Math.floor(state.level*state.level*.55);
    leveled=true;
  }
  if(state.level>=MAX_PLAYER_LEVEL)state.xp=0;
  if(leveled)toast('⭐ Lên Level '+state.level+' • Đã mở thêm nội dung!');
}

function orderSlotClick(slotIndex){
  var order=state.order;
  if(!order)return;
  if(order.filled[slotIndex]){
    var back=findEmptyWarehouse();
    if(back<0){toast('Kho không còn chỗ để trả lại',true);return;}
    state.warehouse[back]=order.filled[slotIndex];
    order.filled[slotIndex]=null;
    save();render();return;
  }
  if(state.selectedWarehouse===null){toast('Hãy chọn một trái trong kho trước',true);return;}
  var id=state.warehouse[state.selectedWarehouse];
  if(id!==order.needs[slotIndex]){
    var slot=els.orderSlots.children[slotIndex];
    if(slot){slot.classList.add('wrong');setTimeout(function(){slot.classList.remove('wrong');},450);}
    toast('Không đúng loại trái khách cần',true);
    return;
  }
  order.filled[slotIndex]=id;
  state.warehouse[state.selectedWarehouse]=null;
  state.selectedWarehouse=null;
  var complete=order.filled.every(function(x){return !!x;});
  if(complete){
    state.gold+=order.reward;
    state.completedOrders++;
    addXp(order.xp);
    state.order=generateOrder();
    save();render();
    toast('🎉 Bán hàng thành công • +'+order.reward+' vàng');
  }else{
    save();render();
  }
}

function refreshOrder(){
  if(!state.order)return;
  for(var i=0;i<state.order.filled.length;i++){
    if(state.order.filled[i]){
      var slot=findEmptyWarehouse();
      if(slot>=0){state.warehouse[slot]=state.order.filled[i];state.order.filled[i]=null;}
    }
  }
  state.selectedWarehouse=null;
  state.order=generateOrder();
  save();render();
  toast('Đã đổi khách mới');
}

function unlockRow(rowIndex){
  var target=rowIndex+1;
  if(target!==state.unlockedRows+1){toast('Hãy mở hàng kho theo thứ tự',true);return;}
  var rule=ROW_UNLOCKS[rowIndex];
  if(!rule)return;
  if(state.level<rule.level){toast('Cần đạt Level '+rule.level,true);return;}
  if(state.gold<rule.cost){toast('Cần '+rule.cost+' vàng để mở hàng này',true);return;}
  state.gold-=rule.cost;
  state.unlockedRows++;
  save();render();
  toast('📦 Kho mở rộng thêm 4 ô!');
}

function renderStats(){
  els.gold.textContent=state.gold;
  els.level.textContent=state.level;
  els.turn.textContent=state.turn;
  var need=xpNeed(state.level);
  if(state.level>=MAX_PLAYER_LEVEL){
    els.xp.textContent='MAX';
    els.xpFill.style.width='100%';
  }else{
    els.xp.textContent=state.xp+'/'+need;
    els.xpFill.style.width=Math.min(100,state.xp/need*100)+'%';
  }
}

function renderCustomer(){
  var c=customerById(state.order.customer);
  els.customer.title=c.name;
  els.customer.style.backgroundPosition=(c.col*25)+'% '+(c.row*100)+'%';
  els.reward.innerHTML=coinHtml(state.order.reward,false);
  if(els.orderTier){
    var tier=state.order.tier||'normal';
    els.orderTier.className='orderTier '+tier;
    els.orderTier.textContent=tier==='vip'?'👑':(tier==='large'?'🧺':'🌱');
    els.orderTier.title=tier==='vip'?'Đơn VIP':(tier==='large'?'Đơn lớn':'Đơn thường');
  }
  els.orderSlots.innerHTML='';
  els.orderSlots.setAttribute('aria-label','Đơn hàng gồm '+state.order.needs.length+' trái');
  state.order.needs.forEach(function(id,i){
    var slot=document.createElement('button');
    slot.className='orderSlot '+(state.order.filled[i]?'filled':'need');
    slot.type='button';
    slot.title=state.order.filled[i]?'Đã đủ '+fruitName(id):'Cần '+fruitName(id);
    var art=makeFruit(id);
    slot.appendChild(art);
    if(state.order.filled[i]){
      var tick=document.createElement('span');
      tick.textContent='✓';tick.style.cssText='position:absolute;right:2px;bottom:0;color:#3c9a43;font-weight:900;z-index:3';
      slot.appendChild(tick);
    }
    slot.addEventListener('click',function(){orderSlotClick(i);});
    els.orderSlots.appendChild(slot);
  });
}

function renderWarehouse(){
  els.warehouse.innerHTML='';
  var used=warehouseUsed(),cap=state.unlockedRows*COLS;
  els.warehouseCount.textContent=used+'/'+cap;
  for(var row=0;row<MAX_ROWS;row++){
    var rowEl=document.createElement('div');
    rowEl.className='warehouseRow'+(row>=state.unlockedRows?' locked':'');
    for(var col=0;col<COLS;col++){
      var idx=row*COLS+col;
      var cell=document.createElement('button');
      cell.type='button';
      cell.className='warehouseCell';
      if(idx===state.selectedWarehouse)cell.classList.add('selected');
      var id=state.warehouse[idx];
      if(id){
        cell.appendChild(makeFruit(id));
        cell.title=fruitName(id)+' • Chạm để chọn';
      }else if(row<state.unlockedRows){
        cell.title=state.selectedWarehouse===null?'Ô kho trống':'Chạm để chuyển trái đang chọn vào đây';
        if(state.selectedWarehouse!==null)cell.classList.add('moveTarget');
      }
      if(row<state.unlockedRows){
        cell.addEventListener('click',(function(n){return function(e){e.stopPropagation();clickWarehouse(n);};})(idx));
      }
      rowEl.appendChild(cell);
    }
    if(row>=state.unlockedRows){
      var rule=ROW_UNLOCKS[row];
      var lock=document.createElement('div');
      lock.className='warehouseLock';
      if(row===state.unlockedRows&&rule)lock.innerHTML='<span class="lockLevel">🔒 Lv '+rule.level+'</span><span class="lockCost">'+coinHtml(rule.cost,true)+'</span>';
      else lock.textContent='🔒';
      rowEl.appendChild(lock);
      rowEl.addEventListener('click',(function(r){return function(){unlockRow(r);};})(row));
    }
    els.warehouse.appendChild(rowEl);
  }
}

function growthPosition(stage){
  if(stage===1)return '0% center';
  if(stage===2)return '50% center';
  return '100% center';
}

function renderField(){
  els.field.innerHTML='';
  var occupied=0;
  state.field.forEach(function(cell,index){
    var el=document.createElement('button');
    el.type='button';
    el.className='fieldCell';
    if(!cell){
      el.classList.add('empty');
      el.title='Ô đất trống';
      el.addEventListener('click',function(){plantAt(index);});
    }else{
      occupied++;
      if(cell.kind==='free'){
        el.classList.add('freeFruit');
        if(index===lastDropIndex)el.classList.add('dropIn');
        el.appendChild(makeFruit(cell.fruitId));
        var badge=document.createElement('span');badge.className='freeBadge';badge.textContent='🎁';el.appendChild(badge);
        el.title='Trái miễn phí • Chạm để đưa vào kho';
        el.addEventListener('click',function(){collectField(index);});
      }else if(cell.kind==='plant'){
        if(cell.stage<4){
          var art=document.createElement('div');
          art.className='growthArt';
          art.style.backgroundPosition=growthPosition(cell.stage);
          el.appendChild(art);
          el.title='Cây đang lớn • Giai đoạn '+cell.stage+'/4';
        }else{
          el.classList.add('ready');
          el.appendChild(makeFruit(cell.fruitId));
          el.title='Đã chín • Chạm để thu hoạch';
          el.addEventListener('click',function(){collectField(index);});
        }
      }
    }
    els.field.appendChild(el);
  });
  els.fieldCount.textContent=occupied+'/36';
  lastDropIndex=-1;
}

function renderShop(){
  els.shop.innerHTML='';
  FRUITS.forEach(function(f){
    var card=document.createElement('button');
    card.type='button';
    card.className='seedCard'+(state.selectedSeed===f.id?' selected':'')+(state.level<f.unlock?' locked':'');
    var art=makeFruit(f.id,'seedFruit');
    card.appendChild(art);
    var meta=document.createElement('div');meta.className='seedMeta';
    meta.innerHTML='<b>'+fruitName(f.id)+'</b><small>Lv trái '+f.level+'</small>';
    card.appendChild(meta);
    var price=document.createElement('div');price.className='seedPrice';price.innerHTML=coinHtml(f.seed,true);card.appendChild(price);
    if(state.level<f.unlock){
      var lock=document.createElement('div');lock.className='seedLock';lock.textContent='🔒 Lv '+f.unlock;card.appendChild(lock);
      card.addEventListener('click',function(){toast('Hạt này mở ở Level '+f.unlock,true);});
    }else{
      card.addEventListener('click',function(){
        state.selectedSeed=f.id;
        save();renderShop();
        toast('Đã chọn hạt '+fruitName(f.id));
      });
    }
    els.shop.appendChild(card);
  });
  var def=fruitDef(state.selectedSeed);
  if(def){
    els.selectedSeed.innerHTML='Đang chọn: <b>'+fruitName(def.id)+'</b> • '+coinHtml(def.seed,true)+' • chạm ô đất trống để gieo';
  }else{
    els.selectedSeed.textContent='Chọn hạt rồi chạm ô đất trống';
  }
}

function render(){
  renderStats();
  renderCustomer();
  renderWarehouse();
  renderField();
  renderShop();
  renderFruitBook();
  updateDiscardButton();
}

document.getElementById('nextTurnBtn').addEventListener('click',function(){
  takeTurn();
  toast('☀️ Qua 1 lượt • Cây lớn thêm');
});
document.getElementById('refreshOrderBtn').addEventListener('click',refreshOrder);
if(els.discardBtn)els.discardBtn.addEventListener('click',discardSelectedFruit);
els.bookBtn.addEventListener('click',openFruitBook);
els.bookClose.addEventListener('click',closeFruitBook);
els.bookModal.addEventListener('click',function(e){if(e.target===els.bookModal)closeFruitBook();});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!els.bookModal.classList.contains('hidden'))closeFruitBook();});

render();
save();
if(state.turn===0)toast('Chọn hạt ở dưới → chạm ô đất trống để bắt đầu');

})();