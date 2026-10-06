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
const roomScore=$('roomScore');
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
function safeName(name){return String(name||'').trim().slice(0,24)}
function normalizeScores(v){return v&&typeof v==='object'&&!Array.isArray(v)?v:{}}
function normalizeRoom(raw={}){
  return {
    id:raw.room_id||raw.id||'',
    name:raw.room_name||raw.name||'Phòng',
    maxPlayers:Number(raw.max_players||raw.maxPlayers||8),
    status:raw.status||'lobby',
    hostClientId:raw.host_client_id||raw.hostClientId||'',
    hostName:raw.host_name||raw.hostName||'',
    matchState:raw.match_state||raw.matchState||'waiting',
    roundNumber:Number(raw.round_number||raw.roundNumber||0),
    scores:normalizeScores(raw.scores),
    scoreNames:normalizeScores(raw.score_names||raw.scoreNames),
    lastRoundWinner:raw.last_round_winner||raw.lastRoundWinner||null,
    roundSeed:Number(raw.round_seed||raw.roundSeed||0),
    roundStartedAt:raw.round_started_at||raw.roundStartedAt||null,
    roundRoster:Array.isArray(raw.round_roster||raw.roundRoster)?(raw.round_roster||raw.roundRoster):[],
    botCount:Number(raw.bot_count??raw.botCount??0)
  };
}
function randomSkinForName(name){
  const n=String(name||'').trim().toLowerCase();
  const fixed={sunny:'rabbit','nít':'cat',nit:'cat','bố':'tiger',bo:'tiger','mẹ':'elephant',me:'elephant'};
  if(fixed[n])return fixed[n];
  const skins=['rabbit','cat','dog','elephant','crocodile','chicken','toad','tiger'];
  let h=2166136261;
  for(let i=0;i<n.length;i++){h^=n.charCodeAt(i);h=Math.imul(h,16777619)}
  return skins[(h>>>0)%skins.length];
}

const clientId=ensureLocal('srl_client_id',()=>crypto.randomUUID?crypto.randomUUID():randomHex(16));
const clientToken=ensureLocal('srl_client_token',()=>randomHex(24));
const presenceJoinedAt=Date.now();
let playerName=localStorage.getItem('srl_player_name')||'';
let room=null;
let isHost=false;
let channel=null;
let channelReady=false;
let localSpectator=false;
let presencePlayers=new Map();
let roomsTimer=0;
let heartbeatTimer=0;
let hostClaimTimer=0;
let busy=false;
let roundFinishing=false;
let pendingResume=null;

const api=window.supabase?.createClient
  ? window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}})
  : null;

const net={
  clientId,
  get playerName(){return playerName},
  get room(){return room},
  get isHost(){return isHost},
  get connected(){return !!channelReady},
  get playerCount(){return presencePlayers.size},
  get matchState(){return room?.matchState||'waiting'},
  get roundNumber(){return room?.roundNumber||0},
  get scores(){return room?.scores||{}},
  get scoreNames(){return room?.scoreNames||{}},
  get spectating(){return localSpectator},
  get pendingResume(){return pendingResume},
  onRoundStart:null,
  onBossState:null,
  onPlayerState:null,
  onRoundResult:null,
  onRoomReset:null,
  onHostChange:null,
  onRescue:null,
  onResumeRound:null,
  broadcastBoss,
  broadcastPlayer,
  broadcastRescue,
  finishRound,
  startRound,
  resetMatch,
  backToRoom,
  showRoom,
  leaveRoom,
  setSpectating,
  getParticipants:()=>[...presencePlayers.values()].map(p=>({...p})),
  consumePendingResume(){const p=pendingResume;pendingResume=null;return p}
};
window.SRLNet=net;

function setStatus(ok,text=''){
  if(!netStatus)return;
  netStatus.classList.toggle('ok',!!ok);
  netStatus.classList.toggle('bad',!ok);
  netStatus.textContent=text||(ok?'●':'○');
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
    b.addEventListener('click',()=>pickName(name));nameButtons.appendChild(b);
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
async function fetchRoomState(roomId){
  return normalizeRoom(await rpc('srl_room_state',{p_room_id:roomId,p_client_id:clientId,p_token:clientToken}));
}
function applyRoomState(raw={}){
  const prev=room||{};
  const next=normalizeRoom(raw);
  if(!('room_id' in raw)&&!('id' in raw))next.id=prev.id||next.id;
  if(!('room_name' in raw)&&!('name' in raw))next.name=prev.name||next.name;
  if(!('max_players' in raw)&&!('maxPlayers' in raw))next.maxPlayers=prev.maxPlayers||next.maxPlayers;
  if(!('host_client_id' in raw)&&!('hostClientId' in raw))next.hostClientId=prev.hostClientId||next.hostClientId;
  if(!('host_name' in raw)&&!('hostName' in raw))next.hostName=prev.hostName||next.hostName;
  if(!('last_round_winner' in raw)&&!('lastRoundWinner' in raw))next.lastRoundWinner=prev.lastRoundWinner||null;
  room={...prev,...next};
  isHost=room.hostClientId===clientId;
  renderRoomState();
}
function renderScores(container,scores=room?.scores||{},names=room?.scoreNames||{}){
  if(!container)return;
  const entries=Object.entries(scores).map(([key,val])=>({key,score:Number(val)||0,name:safeName(names[key]||key)}))
    .sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name,'vi'));
  container.innerHTML='';
  if(!entries.length){container.textContent='☆ ☆ ☆';return}
  entries.slice(0,8).forEach(x=>{
    const chip=document.createElement('span');chip.className='score-chip';
    chip.textContent=x.name+' '+('⭐'.repeat(Math.max(0,Math.min(2,x.score)))||'☆');
    container.appendChild(chip);
  });
}
function renderRoomState(){
  if(!room)return;
  roomTitle.textContent=room.name;
  renderScores(roomScore);
  const n=presencePlayers.size||1;
  const round=room.roundNumber?('R'+room.roundNumber+'/3'):'BO3';
  roomHint.textContent='👥 '+n+'/'+room.maxPlayers+'  '+round;
  roomStartBtn.style.display=isHost?'grid':'none';
  roomStartBtn.disabled=!isHost||!channelReady||room.matchState==='round';
  roomStartBtn.textContent=room.matchState==='finished'?'↻':'▶';
}
async function refreshRooms(){
  if(room||busy||!api)return;
  try{
    setStatus(true,'●');
    const data=await rpc('srl_list_rooms',{});
    renderRooms(Array.isArray(data)?data:[]);
  }catch(e){setStatus(false,'○');renderRooms([],true)}
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
    b.append(title,count);b.addEventListener('click',()=>joinRoom(r.id));roomsList.appendChild(b);
  });
}
async function createRoom(){
  if(!playerName||busy)return;
  busy=true;createRoomBtn.disabled=true;
  try{
    const data=await rpc('srl_create_room',{p_client_id:clientId,p_name:playerName,p_token:clientToken});
    const r=Array.isArray(data)?data[0]:data;
    if(!r)throw new Error('No room');
    await enterRoom(await fetchRoomState(r.room_id),false);
  }catch(e){setStatus(false,'○')}
  finally{busy=false;createRoomBtn.disabled=!playerName}
}
async function joinRoom(roomId){
  if(!playerName)randomName();
  if(busy)return;
  busy=true;
  try{
    await rpc('srl_join_room',{p_room_id:roomId,p_client_id:clientId,p_name:playerName,p_token:clientToken});
    await enterRoom(await fetchRoomState(roomId),false);
  }catch(e){await refreshRooms()}
  finally{busy=false}
}
async function enterRoom(raw,resumed=false){
  room=normalizeRoom(raw);
  isHost=room.hostClientId===clientId;
  channelReady=false;presencePlayers.clear();roundFinishing=false;
  localSpectator=resumed&&room.matchState==='round';
  localStorage.setItem('srl_room_id',room.id);
  lobbyOverlay.classList.remove('show');
  roomOverlay.classList.toggle('show',room.matchState!=='round');
  renderRoomState();
  await setupChannel();
  startHeartbeat();
  if(resumed&&room.matchState==='round'){
    pendingResume={roomId:room.id,seed:room.roundSeed,startAt:room.roundStartedAt,roundNumber:room.roundNumber,
      scores:room.scores,scoreNames:room.scoreNames,participants:room.roundRoster,botCount:room.botCount,spectator:true};
    setTimeout(()=>{
      if(net.onResumeRound&&pendingResume){const p=pendingResume;pendingResume=null;net.onResumeRound(p)}
    },60);
  }
}
async function trackPresence(){
  if(!channelReady||!channel||!room)return;
  try{
    await channel.track({
      client_id:clientId,name:playerName,is_host:isHost,spectator:localSpectator,
      skin:randomSkinForName(playerName),joined_at:presenceJoinedAt
    });
  }catch(e){}
}
async function setupChannel(){
  if(channel){try{await api.removeChannel(channel)}catch(e){}}
  channel=api.channel('srl:room:'+room.id,{config:{broadcast:{self:true},presence:{key:clientId}}});
  channel
    .on('presence',{event:'sync'},syncPresence)
    .on('presence',{event:'join'},syncPresence)
    .on('presence',{event:'leave'},syncPresence)
    .on('broadcast',{event:'round_start'},msg=>{
      const p=msg.payload||{};
      if(p.roomId!==room?.id)return;
      room.status='playing';room.matchState='round';room.roundNumber=Number(p.roundNumber||room.roundNumber||1);
      room.roundSeed=Number(p.seed||0);room.roundStartedAt=p.startAt||null;
      room.scores=normalizeScores(p.scores||room.scores);room.scoreNames=normalizeScores(p.scoreNames||room.scoreNames);
      roundFinishing=false;localSpectator=false;trackPresence();
      roomOverlay.classList.remove('show');
      if(net.onRoundStart)net.onRoundStart(p);
    })
    .on('broadcast',{event:'boss'},msg=>{
      const p=msg.payload||{};if(p.clientId===clientId)return;
      if(net.onBossState)net.onBossState(p);
    })
    .on('broadcast',{event:'player'},msg=>{
      const p=msg.payload||{};if(p.clientId===clientId)return;
      if(net.onPlayerState)net.onPlayerState(p);
    })
    .on('broadcast',{event:'rescue'},msg=>{
      const p=msg.payload||{};if(net.onRescue)net.onRescue(p);
    })
    .on('broadcast',{event:'round_result'},msg=>{
      const p=msg.payload||{};
      room.matchState=p.matchState||room.matchState;
      room.roundNumber=Number(p.roundNumber||room.roundNumber);
      room.scores=normalizeScores(p.scores||room.scores);room.scoreNames=normalizeScores(p.scoreNames||room.scoreNames);
      room.lastRoundWinner=p.winnerKey||room.lastRoundWinner;roundFinishing=false;
      if(net.onRoundResult)net.onRoundResult(p);
    })
    .on('broadcast',{event:'host_changed'},msg=>{
      const p=msg.payload||{};if(p.roomId&&p.roomId!==room?.id)return;
      applyHostIdentity(p.hostId,p.hostName,true);
    })
    .on('broadcast',{event:'room_reset'},msg=>{
      const p=msg.payload||{};if(p.roomId&&p.roomId!==room?.id)return;
      room.status='lobby';room.matchState='waiting';room.roundNumber=0;room.scores={};room.scoreNames={};room.lastRoundWinner=null;
      localSpectator=false;trackPresence();showRoom();
      if(net.onRoomReset)net.onRoomReset();
    })
    .subscribe(async status=>{
      if(status==='SUBSCRIBED'){
        channelReady=true;setStatus(true,'●');await trackPresence();syncPresence();renderRoomState();
      }else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'||status==='CLOSED'){
        channelReady=false;setStatus(false,'○');renderRoomState();
      }
    });
}
function syncPresence(){
  if(!channel)return;
  const raw=channel.presenceState();presencePlayers.clear();
  Object.values(raw).forEach(entries=>{
    (entries||[]).forEach(p=>{
      const id=p.client_id||p.presence_ref;
      if(id)presencePlayers.set(id,p);
    });
  });
  renderRoomPlayers();renderRoomState();scheduleHostClaim();
}
function renderRoomPlayers(){
  roomPlayers.innerHTML='';
  const arr=[...presencePlayers.values()];
  arr.sort((a,b)=>{
    if(a.client_id===room?.hostClientId)return -1;
    if(b.client_id===room?.hostClientId)return 1;
    return Number(a.joined_at||0)-Number(b.joined_at||0);
  });
  arr.forEach(p=>{
    const chip=document.createElement('span');chip.className='player-chip';
    chip.textContent=(p.client_id===room?.hostClientId?'★ ':'')+(p.spectator?'👀 ':'')+safeName(p.name||'Player');
    roomPlayers.appendChild(chip);
  });
}
function scheduleHostClaim(){
  if(!room||isHost||room.matchState==='finished')return;
  if(presencePlayers.has(room.hostClientId)){if(hostClaimTimer){clearTimeout(hostClaimTimer);hostClaimTimer=0}return}
  if(hostClaimTimer)return;
  hostClaimTimer=setTimeout(()=>{hostClaimTimer=0;maybeClaimHost()},2600);
}
async function maybeClaimHost(){
  if(!room||isHost||!channelReady)return;
  const candidates=[...presencePlayers.values()].filter(p=>p.client_id)
    .sort((a,b)=>Number(a.joined_at||0)-Number(b.joined_at||0)||String(a.client_id).localeCompare(String(b.client_id)));
  if(!candidates.length||candidates[0].client_id!==clientId)return;
  try{
    const r=await rpc('srl_claim_host',{p_room_id:room.id,p_client_id:clientId,p_token:clientToken});
    if(r?.host_client_id)await applyHostIdentity(r.host_client_id,r.host_name,false);
    if(r?.claimed&&r.host_client_id===clientId&&channelReady){
      await channel.send({type:'broadcast',event:'host_changed',payload:{roomId:room.id,hostId:clientId,hostName:playerName}});
    }else if(!r?.claimed)scheduleHostClaim();
  }catch(e){scheduleHostClaim()}
}
async function applyHostIdentity(hostId,hostName,broadcastReceived=false){
  if(!room||!hostId)return;
  const changed=room.hostClientId!==hostId;
  room.hostClientId=hostId;room.hostName=safeName(hostName||room.hostName);
  isHost=hostId===clientId;
  await trackPresence();renderRoomPlayers();renderRoomState();
  if(changed&&net.onHostChange)net.onHostChange({hostId,hostName:room.hostName,isHost,broadcastReceived});
}
function currentParticipants(){
  return [...presencePlayers.values()].filter(p=>p.client_id)
    .map(p=>({id:p.client_id,name:safeName(p.name||'Player'),skin:p.skin||randomSkinForName(p.name)}));
}
async function startRound(){
  if(!isHost||!room||!channelReady||busy)return;
  if(room.matchState==='finished')return resetMatch();
  if(!['waiting','intermission'].includes(room.matchState))return;
  busy=true;roomStartBtn.disabled=true;
  try{
    const seed=Math.floor(Math.random()*2000000000)+1;
    const participants=currentParticipants();
    const targetTotal=Math.min(room.maxPlayers,6);
    const botCount=Math.max(0,Math.min(5,targetTotal-participants.length));
    const r=await rpc('srl_start_round_v2',{
      p_room_id:room.id,p_client_id:clientId,p_token:clientToken,p_seed:seed,
      p_roster:participants,p_bot_count:botCount
    });
    applyRoomState(r);
    const payload={
      roomId:room.id,seed:Number(r.round_seed||seed),startAt:r.round_started_at,hostId:clientId,
      roundNumber:Number(r.round_number||1),scores:normalizeScores(r.scores),scoreNames:normalizeScores(r.score_names),
      participants:Array.isArray(r.round_roster)?r.round_roster:participants,
      botCount:Number(r.bot_count??botCount)
    };
    await channel.send({type:'broadcast',event:'round_start',payload});
  }catch(e){renderRoomState()}
  finally{busy=false}
}
async function finishRound(winnerKey,winnerName){
  if(!isHost||!room||room.matchState!=='round'||roundFinishing)return null;
  roundFinishing=true;
  try{
    const r=await rpc('srl_finish_round',{
      p_room_id:room.id,p_client_id:clientId,p_token:clientToken,
      p_winner_key:String(winnerKey||'nobody'),p_winner_name:safeName(winnerName||'—')
    });
    room.matchState=r.match_state||room.matchState;room.roundNumber=Number(r.round_number||room.roundNumber);
    room.scores=normalizeScores(r.scores);room.scoreNames=normalizeScores(r.score_names);
    room.lastRoundWinner=r.winner_key||r.last_round_winner||winnerKey;
    const payload={
      roomId:room.id,matchState:room.matchState,roundNumber:room.roundNumber,
      scores:room.scores,scoreNames:room.scoreNames,
      winnerKey:r.winner_key||winnerKey,winnerName:r.winner_name||winnerName,winnerScore:Number(r.winner_score||0)
    };
    if(channelReady)await channel.send({type:'broadcast',event:'round_result',payload});
    return payload;
  }catch(e){roundFinishing=false;return null}
}
async function resetMatch(){
  if(!isHost||!room||busy)return;
  busy=true;
  try{
    const r=await rpc('srl_reset_match',{p_room_id:room.id,p_client_id:clientId,p_token:clientToken});
    room.status=r.status||'lobby';room.matchState=r.match_state||'waiting';room.roundNumber=0;room.scores={};room.scoreNames={};
    localSpectator=false;roundFinishing=false;await trackPresence();
    if(channelReady)await channel.send({type:'broadcast',event:'room_reset',payload:{roomId:room.id,hostId:clientId}});
    showRoom();
  }catch(e){}
  finally{busy=false}
}
async function broadcastBoss(payload){
  if(!isHost||!channelReady||!channel)return;
  try{await channel.send({type:'broadcast',event:'boss',payload:{...payload,clientId}})}catch(e){}
}
async function broadcastPlayer(payload){
  if(!channelReady||!channel)return;
  try{await channel.send({type:'broadcast',event:'player',payload:{...payload,clientId,name:playerName}})}catch(e){}
}
async function broadcastRescue(payload){
  if(!channelReady||!channel)return;
  try{await channel.send({type:'broadcast',event:'rescue',payload:{...payload,fromId:clientId,fromName:playerName}})}catch(e){}
}
async function setSpectating(flag){localSpectator=!!flag;await trackPresence()}
function showRoom(){
  if(!room)return;
  lobbyOverlay.classList.remove('show');roomOverlay.classList.add('show');renderRoomState();renderRoomPlayers();
}
async function backToRoom(){
  if(!room)return;
  if(room.matchState==='finished'&&isHost)return resetMatch();
  showRoom();
}
async function leaveRoom(){
  const oldRoom=room;if(!oldRoom)return;
  let leaveResult=null;
  try{leaveResult=await rpc('srl_leave_room_v2',{p_room_id:oldRoom.id,p_client_id:clientId,p_token:clientToken})}catch(e){}
  if(leaveResult?.new_host_client_id&&channelReady&&channel){
    try{await channel.send({type:'broadcast',event:'host_changed',payload:{
      roomId:oldRoom.id,hostId:leaveResult.new_host_client_id,hostName:leaveResult.new_host_name||''
    }})}catch(e){}
  }
  room=null;isHost=false;channelReady=false;localSpectator=false;presencePlayers.clear();roundFinishing=false;
  localStorage.removeItem('srl_room_id');stopHeartbeat();
  if(hostClaimTimer){clearTimeout(hostClaimTimer);hostClaimTimer=0}
  roomOverlay.classList.remove('show');lobbyOverlay.classList.add('show');
  try{if(channel){await channel.untrack();await api.removeChannel(channel)}}catch(e){}
  channel=null;refreshRooms();
}
function startHeartbeat(){
  stopHeartbeat();
  heartbeatTimer=setInterval(async()=>{
    if(!room)return;
    try{
      const r=await rpc('srl_heartbeat_v2',{p_room_id:room.id,p_client_id:clientId,p_token:clientToken});
      if(!r?.ok){setStatus(false,'○');return}
      setStatus(true,'●');
      if(r.host_client_id&&r.host_client_id!==room.hostClientId)await applyHostIdentity(r.host_client_id,r.host_name,false);
      room.status=r.status||room.status;room.matchState=r.match_state||room.matchState;
      room.roundNumber=Number(r.round_number??room.roundNumber);
      room.scores=normalizeScores(r.scores||room.scores);room.scoreNames=normalizeScores(r.score_names||room.scoreNames);
      room.roundRoster=Array.isArray(r.round_roster)?r.round_roster:room.roundRoster;
      room.botCount=Number(r.bot_count??room.botCount);
      renderRoomState();scheduleHostClaim();
    }catch(e){setStatus(false,'○');scheduleHostClaim()}
  },5000);
}
function stopHeartbeat(){if(heartbeatTimer){clearInterval(heartbeatTimer);heartbeatTimer=0}}
async function resumeSavedRoom(){
  const saved=localStorage.getItem('srl_room_id');
  if(!saved||!playerName)return false;
  try{
    const raw=await rpc('srl_resume_room',{p_room_id:saved,p_client_id:clientId,p_token:clientToken});
    await enterRoom(raw,true);return true;
  }catch(e){localStorage.removeItem('srl_room_id');return false}
}
async function init(){
  renderNameButtons();
  createRoomBtn.addEventListener('click',createRoom);
  refreshRoomsBtn.addEventListener('click',refreshRooms);
  roomStartBtn.addEventListener('click',()=>room?.matchState==='finished'?resetMatch():startRound());
  roomLeaveBtn.addEventListener('click',leaveRoom);
  if(!api){setStatus(false,'○');renderRooms([],true);return}
  setStatus(true,'●');
  const resumed=await resumeSavedRoom();
  if(!resumed)refreshRooms();
  roomsTimer=setInterval(refreshRooms,3000);
}
init();
})();