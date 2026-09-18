(function(){
'use strict';

var SAVE_KEY='sunny_garden_save_v1';
var MAX_ROWS=10, COLS=4, FIELD_SIZE=36;
var lastDropIndex=-1;

var FRUITS=[
  {id:'mango',level:1,unlock:1,seed:12,value:16},
  {id:'jackfruit',level:2,unlock:2,seed:28,value:36},
  {id:'guava',level:3,unlock:3,seed:45,value:60},
  {id:'dragon-fruit',level:4,unlock:4,seed:70,value:95},
  {id:'coconut',level:5,unlock:6,seed:105,value:145},
  {id:'watermelon',level:6,unlock:8,seed:150,value:220},
  {id:'durian',level:7,unlock:10,seed:220,value:330},
  {id:'mangosteen',level:8,unlock:12,seed:320,value:500}
];

var CUSTOMERS=[
  {id:'farmer',name:'Nông dân',minLevel:1,col:0,row:0},
  {id:'post',name:'Cô giao thư',minLevel:1,col:1,row:0},
  {id:'grandma',name:'Bà nội trợ',minLevel:2,col:2,row:0},
  {id:'builder',name:'Thợ xây',minLevel:3,col:3,row:0},
  {id:'girl',name:'Bé gái',minLevel:4,col:4,row:0},
  {id:'gardener',name:'Người làm vườn',minLevel:5,col:0,row:1},
  {id:'rake',name:'Người làm vườn trẻ',minLevel:6,col:1,row:1},
  {id:'baker',name:'Đầu bếp',minLevel:8,col:2,row:1},
  {id:'student',name:'Học sinh',minLevel:10,col:3,row:1},
  {id:'vet',name:'Bác sĩ thú y',minLevel:12,col:4,row:1}
];

var ROW_UNLOCKS=[
  null,null,
  {level:2,cost:80},
  {level:4,cost:160},
  {level:6,cost:300},
  {level:8,cost:520},
  {level:10,cost:800},
  {level:12,cost:1200},
  {level:15,cost:1700},
  {level:18,cost:2300}
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
  orderSlots:document.getElementById('orderSlots'),
  warehouse:document.getElementById('warehouse'),
  warehouseCount:document.getElementById('warehouseCount'),
  field:document.getElementById('field'),
  fieldCount:document.getElementById('fieldCount'),
  shop:document.getElementById('seedShop'),
  selectedSeed:document.getElementById('selectedSeedLabel'),
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
    completedOrders:0
  };
}

function load(){
  try{
    var raw=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');
    var s=Object.assign(defaults(),raw||{});
    if(!Array.isArray(s.warehouse)||s.warehouse.length!==MAX_ROWS*COLS)s.warehouse=Array(MAX_ROWS*COLS).fill(null);
    if(!Array.isArray(s.field)||s.field.length!==FIELD_SIZE)s.field=Array(FIELD_SIZE).fill(null);
    s.unlockedRows=Math.max(2,Math.min(MAX_ROWS,Number(s.unlockedRows)||2));
    s.level=Math.max(1,Number(s.level)||1);
    s.gold=Math.max(0,Number(s.gold)||0);
    s.turn=Math.max(0,Number(s.turn)||0);
    if(!fruitDef(s.selectedSeed)||fruitDef(s.selectedSeed).unlock>s.level)s.selectedSeed='mango';
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

function xpNeed(level){return 80+(level-1)*45;}

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
  var idx=randomEmptyField();
  if(idx<0){
    lastDropIndex=-1;
    toast('Sân 6×6 đã đầy • Lượt này không rơi trái miễn phí',true);
    return false;
  }
  state.field[idx]={kind:'free',fruitId:pickWeightedFruit()};
  lastDropIndex=idx;
  return true;
}

function advancePlants(){
  for(var i=0;i<state.field.length;i++){
    var c=state.field[i];
    if(c&&c.kind==='plant'&&c.stage<4)c.stage++;
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
    state.selectedWarehouse=null;
    takeTurn();
    toast(fruitName(id)+' + '+fruitName(id)+' → '+fruitName(up));
  }else{
    state.selectedWarehouse=index;
    renderWarehouse();
  }
}

function orderAvailableCustomers(){
  return CUSTOMERS.filter(function(c){return c.minLevel<=state.level;});
}

function generateOrder(){
  var people=orderAvailableCustomers();
  var person=people[Math.floor(Math.random()*people.length)];
  var fruits=unlockedFruits();
  var maxSlots=Math.min(4,1+Math.floor((state.level-1)/3));
  var count=1+Math.floor(Math.random()*maxSlots);
  var needs=[],sum=0;
  for(var i=0;i<count;i++){
    var roll=Math.random();
    var maxIndex=Math.min(fruits.length-1,Math.floor(state.level/3)+1);
    var pick;
    if(roll<.62)pick=fruits[Math.floor(Math.random()*Math.max(1,Math.min(2,fruits.length)))];
    else pick=fruits[Math.floor(Math.random()*(maxIndex+1))];
    needs.push(pick.id);sum+=pick.value;
  }
  return {
    customer:person.id,
    needs:needs,
    filled:Array(needs.length).fill(null),
    reward:Math.round(sum*1.45+12*count+state.level*3),
    xp:20+8*count+Math.min(20,state.level*2)
  };
}

function customerById(id){
  for(var i=0;i<CUSTOMERS.length;i++)if(CUSTOMERS[i].id===id)return CUSTOMERS[i];
  return CUSTOMERS[0];
}

function addXp(amount){
  state.xp+=amount;
  var leveled=false;
  while(state.xp>=xpNeed(state.level)){
    state.xp-=xpNeed(state.level);
    state.level++;
    state.gold+=25+state.level*8;
    leveled=true;
  }
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
  els.xp.textContent=state.xp+'/'+need;
  els.xpFill.style.width=Math.min(100,state.xp/need*100)+'%';
}

function renderCustomer(){
  var c=customerById(state.order.customer);
  els.customer.title=c.name;
  els.customer.style.backgroundPosition=(c.col*25)+'% '+(c.row*100)+'%';
  els.reward.innerHTML=coinHtml(state.order.reward,false);
  els.orderSlots.innerHTML='';
  state.order.needs.forEach(function(id,i){
    var slot=document.createElement('button');
    slot.className='orderSlot '+(state.order.filled[i]?'filled':'need');
    slot.type='button';
    slot.title=state.order.filled[i]?'Đã đủ '+fruitName(id):'Cần '+fruitName(id);
    var art=makeFruit(id);
    if(!state.order.filled[i])art.style.opacity='.48';
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
}

document.getElementById('nextTurnBtn').addEventListener('click',function(){
  takeTurn();
  toast('☀️ Qua 1 lượt • Cây lớn thêm');
});
document.getElementById('refreshOrderBtn').addEventListener('click',refreshOrder);

render();
save();
if(state.turn===0)toast('Chọn hạt ở dưới → chạm ô đất trống để bắt đầu');

})();