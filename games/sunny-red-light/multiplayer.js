(()=>{
'use strict';

const SUPABASE_URL='https://qjpcxhackvoewcxlatis.supabase.co';
const SUPABASE_KEY='sb_publishable_TArSkv7lbokFpK9KZxp5Iw_iJ7f29wh';
const FIXED_NAMES=['Sunny','Nít','Bố','Mẹ'];
const FUN_NAMES=[
  'Khoai Mỡ','Bắp Rang','Bé Ú','Mèo Mập','Cục Bột','Cá Viên','Gà Rán','Heo Bay','Bánh Bao','Xí Muội',
  'Cà Na','Tí Quậy','Tèo Lửa','Na Lùn','Mít Ướt','Đậu Đỏ','Bún Bò','Trứng Cút','Cục Kẹo','Bắp Luộc',
  'Chanh Chua','Cún Mập','Mèo Méo','Bé Bự','Cục Nợ','Ú Nu','Tí Hon','Mực Khô','Cơm Cháy','Sữa Chua'
];

const $=id=>document.getElementById(id);
const lobbyOverlay=$('lobbyOverlay');
const roomOverlay=$('roomOverlay');
const roomsList=$('roomsList');
const nameButtons=$('nameButtons');
const selectedName=$('selectedName');
const createRoomBtn=$('createRoomBtn');
const refreshRoomsBtn=$('refreshRoomsBtn');
const netStatus=$('netStatus');
const roomTitle=$('roomTitle');
const roomPlayers=$('roomPlayers');
const roomStartBtn=$('roomStartBtn');
const roomLeaveBtn=$('roomLeaveBtn');
const roomHint=$('roomHint');

function randomHex(bytes=24){
  const arr=new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr,b=>b.toString(16).padStart(2,'0')).join('');
}
function ensureLocal(key,maker){
  let v=localStorage.getItem(key);
  if(!v){v=maker();localStorage.setItem(key,v)}
  return v;
}
const clientId=ensureLocal('srl_client_id',()=>crypto.randomUUID?crypto.randomUUID():randomHex(16));
const clientToken=ensureLocal('srl_client_token',()=>randomHex(24));
let playerName=localStorage.getItem('srl_player_name')||'';
let room=null;
let isHost=false;
let channel=null;
let channelReady=false;
let presencePlayers=new Map();
let roomsTimer=0;
let heartbeatTimer=0;
let busy=false;

const api=window.supabase?.createClient
  ? window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}})
  : null;

const net={
  clientId,
  get playerName(){return playerName},
  get room(){return room},
  get isHost(){return isHost},
  get connected(){return !!channelReady},
  onRoundStart:null,
  onBossState:null,
  onPlayerState:null,
  onRoomReset:null,
  broadcastBoss,
  broadcastPlayer,
  backToRoom,
  showRoom,
  leaveRoom
};
window.SRLNet=net;

function setStatus(ok,text=''){
  if(!netStatus)return;
  netStatus.classList.toggle('ok',!!ok);
  netStatus.classList.toggle('bad',!ok);
  netStatus.textContent=text|| (ok?'●':'○');
}
function safeName(name){
  return String(name||'').trim().slice(0,24);
}
function pickName(name){
  playerName=safeName(name);
  if(!playerName)return;
  localStorage.setItem('srl_player_name',playerName);
  selectedName.textContent=playerName;
  [...nameButtons.querySelectorAll('button')].forEach(b=>b.classList.toggle('selected',b.dataset.name===playerName));
  createRoomBtn.disabled=false;
}
function randomName(){
  let next=FUN_NAMES[(Math.random()*FUN_NAMES.length)|0];
  if(next===playerName)next=FUN_NAMES[(FUN_NAMES.indexOf(next)+1)%FUN_NAMES.length];
  pickName(next);
}
function renderNameButtons(){
  nameButtons.innerHTML='';
  FIXED_NAMES.forEach(name=>{
    const b=document.createElement('button');
    b.className='name-chip';b.dataset.name=name;b.textContent=name;
    b.addEventListener('click',()=>pickName(name));
    nameButtons.appendChild(b);
  });
  const dice=document.createElement('button');
  dice.className='name-chip dice';dice.textContent='🎲';dice.setAttribute('aria-label','Tên ngẫu nhiên');
  dice.addEventListener('click',randomName);nameButtons.appendChild(dice);
  if(playerName)pickName(playerName);else{selectedName.textContent='?';createRoomBtn.disabled=true}
}

async function rpc(name,args){
  if(!api)throw new Error('Supabase unavailable');
  const {data,error}=await api.rpc(name,args);
  if(error)throw error;
  return data;
}
async function refreshRooms(){
  if(room||busy||!api)return;
  try{
    setStatus(true,'●');
    const data=await rpc('srl_list_rooms',{});
    renderRooms(Array.isArray(data)?data:[]);
  }catch(e){
    setStatus(false,'○');
    renderRooms([],true);
  }
}
function renderRooms(list,failed=false){
  roomsList.innerHTML='';
  if(failed){
    const d=document.createElement('div');d.className='room-empty';d.textContent='↻';roomsList.appendChild(d);return;
  }
  if(!list.length){
    const d=document.createElement('div');d.className='room-empty';d.textContent='＋';roomsList.appendChild(d);return;
  }
  list.forEach(r=>{
    const b=document.createElement('button');b.className='room-card';
    const title=document.createElement('span');title.className='room-card-title';title.textContent=r.room_name;
    const count=document.createElement('span');count.className='room-card-count';count.textContent='👥 '+r.player_count+'/'+r.max_players;
    b.append(title,count);b.addEventListener('click',()=>joinRoom(r.id));
    roomsList.appendChild(b);
  });
}
async function createRoom(){
  if(!playerName||busy)return;
  busy=true;createRoomBtn.disabled=true;
  try{
    const data=await rpc('srl_create_room',{p_client_id:clientId,p_name:playerName,p_token:clientToken});
    const r=Array.isArray(data)?data[0]:data;
    if(!r)throw new Error('No room');
    await enterRoom(r,true);
  }catch(e){
    setStatus(false,'○');
  }finally{
    busy=false;createRoomBtn.disabled=!playerName;
  }
}
async function joinRoom(roomId){
  if(!playerName){randomName()}
  if(busy)return;
  busy=true;
  try{
    const data=await rpc('srl_join_room',{p_room_id:roomId,p_client_id:clientId,p_name:playerName,p_token:clientToken});
    const r=Array.isArray(data)?data[0]:data;
    if(!r)throw new Error('No room');
    await enterRoom(r,false);
  }catch(e){
    await refreshRooms();
  }finally{busy=false}
}
async function enterRoom(r,host){
  room={id:r.room_id,name:r.room_name,maxPlayers:r.max_players||8,status:r.status||'lobby'};
  isHost=host;channelReady=false;presencePlayers.clear();
  lobbyOverlay.classList.remove('show');roomOverlay.classList.add('show');
  roomTitle.textContent=room.name;
  roomStartBtn.style.display=isHost?'grid':'none';
  roomStartBtn.disabled=true;
  roomHint.textContent=isHost?'👥  ▶':'•••';
  await setupChannel();
  startHeartbeat();
}
async function setupChannel(){
  if(channel){try{await api.removeChannel(channel)}catch(e){}}
  channel=api.channel('srl:room:'+room.id,{
    config:{broadcast:{self:true},presence:{key:clientId}}
  });
  channel
    .on('presence',{event:'sync'},syncPresence)
    .on('presence',{event:'join'},syncPresence)
    .on('presence',{event:'leave'},syncPresence)
    .on('broadcast',{event:'round_start'},msg=>{
      const p=msg.payload||{};
      if(net.onRoundStart)net.onRoundStart(p);
    })
    .on('broadcast',{event:'boss'},msg=>{
      const p=msg.payload||{};
      if(p.clientId===clientId)return;
      if(net.onBossState)net.onBossState(p);
    })
    .on('broadcast',{event:'player'},msg=>{
      const p=msg.payload||{};
      if(p.clientId===clientId)return;
      if(net.onPlayerState)net.onPlayerState(p);
    })
    .on('broadcast',{event:'room_reset'},()=>{
      room.status='lobby';showRoom();
      if(net.onRoomReset)net.onRoomReset();
    })
    .subscribe(async status=>{
      if(status==='SUBSCRIBED'){
        channelReady=true;setStatus(true,'●');
        await channel.track({client_id:clientId,name:playerName,is_host:isHost,joined_at:Date.now()});
        roomStartBtn.disabled=!isHost;
        syncPresence();
      }else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'||status==='CLOSED'){
        channelReady=false;setStatus(false,'○');roomStartBtn.disabled=true;
      }
    });
}
function syncPresence(){
  if(!channel)return;
  const raw=channel.presenceState();
  presencePlayers.clear();
  Object.values(raw).forEach(entries=>{
    (entries||[]).forEach(p=>{
      const id=p.client_id||p.presence_ref;
      if(id)presencePlayers.set(id,p);
    });
  });
  renderRoomPlayers();
}
function renderRoomPlayers(){
  roomPlayers.innerHTML='';
  const arr=[...presencePlayers.values()];
  arr.sort((a,b)=>(b.is_host?1:0)-(a.is_host?1:0));
  arr.forEach(p=>{
    const chip=document.createElement('span');chip.className='player-chip';
    chip.textContent=(p.is_host?'★ ':'')+safeName(p.name||'Player');
    roomPlayers.appendChild(chip);
  });
  const n=arr.length||1;
  roomHint.textContent=isHost?'👥 '+n+'/'+(room?.maxPlayers||8)+'  ▶':'👥 '+n+'/'+(room?.maxPlayers||8)+'  •••';
}
async function startRound(){
  if(!isHost||!room||!channelReady||busy)return;
  busy=true;roomStartBtn.disabled=true;
  try{
    const seed=Math.floor(Math.random()*2000000000)+1;
    const data=await rpc('srl_start_room',{p_room_id:room.id,p_client_id:clientId,p_token:clientToken,p_seed:seed});
    const r=Array.isArray(data)?data[0]:data;
    if(!r)throw new Error('start failed');
    room.status='playing';
    await channel.send({type:'broadcast',event:'round_start',payload:{
      roomId:room.id,seed:Number(r.round_seed||seed),startAt:r.round_started_at,hostId:clientId
    }});
  }catch(e){
    roomStartBtn.disabled=false;
  }finally{busy=false}
}
async function broadcastBoss(payload){
  if(!isHost||!channelReady||!channel)return;
  try{
    await channel.send({type:'broadcast',event:'boss',payload:{...payload,clientId}});
  }catch(e){}
}
async function broadcastPlayer(payload){
  if(!channelReady||!channel)return;
  try{
    await channel.send({type:'broadcast',event:'player',payload:{...payload,clientId,name:playerName}});
  }catch(e){}
}
function showRoom(){
  lobbyOverlay.classList.remove('show');roomOverlay.classList.add('show');
  roomStartBtn.style.display=isHost?'grid':'none';
  roomStartBtn.disabled=!isHost||!channelReady;
}
async function backToRoom(){
  if(!room)return;
  if(isHost){
    try{
      await rpc('srl_reset_room',{p_room_id:room.id,p_client_id:clientId,p_token:clientToken});
      room.status='lobby';
      if(channelReady)await channel.send({type:'broadcast',event:'room_reset',payload:{hostId:clientId}});
    }catch(e){}
  }
  showRoom();
}
async function leaveRoom(){
  const oldRoom=room;
  if(!oldRoom)return;
  room=null;isHost=false;channelReady=false;presencePlayers.clear();
  stopHeartbeat();
  roomOverlay.classList.remove('show');lobbyOverlay.classList.add('show');
  try{if(channel){await channel.untrack();await api.removeChannel(channel)}}catch(e){}
  channel=null;
  try{await rpc('srl_leave_room',{p_room_id:oldRoom.id,p_client_id:clientId,p_token:clientToken})}catch(e){}
  refreshRooms();
}
function startHeartbeat(){
  stopHeartbeat();
  heartbeatTimer=setInterval(async()=>{
    if(!room)return;
    try{
      const ok=await rpc('srl_heartbeat',{p_room_id:room.id,p_client_id:clientId,p_token:clientToken});
      if(!ok)setStatus(false,'○');
    }catch(e){setStatus(false,'○')}
  },12000);
}
function stopHeartbeat(){if(heartbeatTimer){clearInterval(heartbeatTimer);heartbeatTimer=0}}

function init(){
  renderNameButtons();
  createRoomBtn.addEventListener('click',createRoom);
  refreshRoomsBtn.addEventListener('click',refreshRooms);
  roomStartBtn.addEventListener('click',startRound);
  roomLeaveBtn.addEventListener('click',leaveRoom);
  if(!api){
    setStatus(false,'○');renderRooms([],true);return;
  }
  setStatus(true,'●');
  refreshRooms();
  roomsTimer=setInterval(refreshRooms,3000);
}
init();
})();