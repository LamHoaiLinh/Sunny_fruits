(()=>{
'use strict';

const canvas=document.getElementById('canvas');
const ctx=canvas.getContext('2d');
const comboEl=document.getElementById('combo');
const pad=document.getElementById('gesturePad');
const laneControls=document.getElementById('laneControls');
const laneButtons=[...document.querySelectorAll('.lane-btn')];
const gameRoot=document.getElementById('game');
const resultOverlay=document.getElementById('resultOverlay');
const resultIcon=document.getElementById('resultIcon');
const resultText=document.getElementById('resultText');
const resultScore=document.getElementById('resultScore');
const restartBtn=document.getElementById('restartBtn');
const spectatorBadge=document.getElementById('spectatorBadge');
const rescueBtn=document.getElementById('rescueBtn');
const progressFill=document.getElementById('progressFill');
const countdownOverlay=document.getElementById('countdownOverlay');
const countdownValue=document.getElementById('countdownValue');
const lobbyOverlay=document.getElementById('lobbyOverlay');
const roomOverlay=document.getElementById('roomOverlay');
const DPR=Math.min(2,window.devicePixelRatio||1);

const INPUTS=['up','down','left','right','tap'];
const SYMBOL={up:'↑',down:'↓',left:'←',right:'→',tap:'●'};
const NPC_COLORS=['#ef6a7a','#5c82ff','#f0aa32','#7a63d5','#45b986','#e6763f','#4e9ac8','#d463aa'];
const LANE_X=[.34,.50,.66];
const BOT_NAMES=['Mèo Máy','Gà Máy','Hổ Máy','Voi Máy','Cá Sấu Máy'];
const BOT_SKINS=['cat','chicken','tiger','elephant','crocodile'];
const SPRITE_CELL=24;
const SPRITE_META={
  rabbit:{walkStart:0,walkCount:5,fallStart:5,fallCount:5},
  cat:{walkStart:10,walkCount:5,fallStart:15,fallCount:5},
  dog:{walkStart:20,walkCount:5,fallStart:25,fallCount:5},
  elephant:{walkStart:30,walkCount:5,fallStart:35,fallCount:5},
  crocodile:{walkStart:40,walkCount:5,fallStart:45,fallCount:5},
  chicken:{walkStart:50,walkCount:5,fallStart:55,fallCount:5},
  toad:{walkStart:60,walkCount:5,fallStart:65,fallCount:5},
  tiger:{walkStart:70,walkCount:5,fallStart:75,fallCount:5}
};
const SKINS=['rabbit','cat','dog','elephant','crocodile','chicken','toad','tiger'];
const characterAtlas=new Image();
let spritesReady=false;

const state={
  running:false,alive:true,won:false,progress:0,combo:[],comboIndex:0,comboDoneCount:0,
  playerLane:1,playerX:LANE_X[1],targetLaneX:LANE_X[1],playerY:.84,targetY:.84,
  movingUntil:0,laneMovingUntil:0,lastTs:0,graceUntil:0,
  scanAngle:-.56,scanHalf:.20,scanPlan:[],scanIndex:0,scanSegmentStart:0,scanSegmentFrom:-.56,lastPattern:-1,
  remoteBossAngle:-.56,remoteBossHalf:.20,remoteBossAt:0,
  cueKind:'',cueUntil:0,cueSeq:0,lastRemoteCueSeq:0,
  lastBossBroadcast:0,lastPlayerBroadcast:0,
  npcs:[],remotePlayers:new Map(),obstacles:[],shots:[],
  activeParticipants:[],botCount:0,roundEnding:false,roundResult:null,
  spectating:false,eliminated:false,revivedOnce:false,rescueUsed:false,rescueMode:false,rescueTarget:null,
  roundSeed:0,roundStartPerf:0,resultShown:false,hitAt:0
};

let W=0,H=0;
let pointer=null;
let countdownRaf=0;

function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function lerp(a,b,t){return a+(b-a)*t}
function rand(a,b){return a+Math.random()*(b-a)}
function rngItem(arr){return arr[(Math.random()*arr.length)|0]}
function normalizeAngle(a){while(a>Math.PI)a-=Math.PI*2;while(a<-Math.PI)a+=Math.PI*2;return a}
function ease(t,name){
  if(name==='linear')return t;
  if(name==='in')return t*t;
  if(name==='out')return 1-(1-t)*(1-t);
  if(name==='inout')return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  if(name==='snap')return 1-Math.pow(1-t,3);
  return t;
}
function vibrate(ms){
  try{navigator.vibrate?.(ms)}catch(e){}
}
function resize(){
  W=Math.max(320,innerWidth);H=Math.max(520,innerHeight);
  canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);
  canvas.style.width=W+'px';canvas.style.height=H+'px';
  ctx.setTransform(DPR,0,0,DPR,0,0);
}
window.addEventListener('resize',resize,{passive:true});resize();

function hashString(s){
  let h=2166136261;
  for(let i=0;i<String(s).length;i++){h^=String(s).charCodeAt(i);h=Math.imul(h,16777619)}
  return h>>>0;
}
function skinFor(id,name){
  const n=String(name||'').trim().toLowerCase();
  const fixed={sunny:'rabbit','nít':'cat',nit:'cat','bố':'tiger',bo:'tiger','mẹ':'elephant',me:'elephant'};
  return fixed[n]||SKINS[hashString(String(id||name||'sunny'))%SKINS.length];
}
function localSkin(){
  const net=window.SRLNet;
  return skinFor(net?.clientId,net?.playerName||'Sunny');
}
async function loadCharacterAtlas(){
  try{
    const parts=await Promise.all(Array.from({length:4},(_,i)=>
      fetch('assets/characters/atlas.'+String(i).padStart(2,'0')+'.txt?v=20261006-animation1')
        .then(r=>{if(!r.ok)throw new Error('sprite '+i);return r.text()})
    ));
    characterAtlas.onload=()=>{spritesReady=true;draw()};
    characterAtlas.onerror=()=>{spritesReady=false};
    characterAtlas.src='data:image/webp;base64,'+parts.join('');
  }catch(e){spritesReady=false}
}
loadCharacterAtlas();

function spriteFrame(skin,mode,now,hitAt=0){
  const m=SPRITE_META[skin]||SPRITE_META.rabbit;
  if(mode==='fall'){
    const elapsed=Math.max(0,now-hitAt);
    if(elapsed>=680)return m.fallStart+m.fallCount-1;
    return m.fallStart+Math.min(m.fallCount-1,Math.floor(elapsed/680*m.fallCount));
  }
  if(mode==='walk')return m.walkStart+(Math.floor(now/105)%m.walkCount);
  return m.walkStart;
}
function drawSpriteCharacter(skin,x,y,size,mode='idle',hitAt=0,alpha=1){
  if(!spritesReady||!characterAtlas.complete)return false;
  const frame=spriteFrame(skin,mode,performance.now(),hitAt);
  ctx.save();
  ctx.globalAlpha=alpha;
  ctx.imageSmoothingEnabled=true;
  ctx.drawImage(characterAtlas,frame*SPRITE_CELL,0,SPRITE_CELL,SPRITE_CELL,
    x-size/2,y-size*.86,size,size);
  ctx.restore();
  return true;
}
function spawnShot(x,y,isLocal=false){
  const b=bossWorld(),now=performance.now();
  state.shots.push({sx:b.x,sy:b.y+8,tx:x,ty:y-12,start:now,seed:Math.random()*6.28});
  beep(92,.045,'square',.065);
  setTimeout(()=>beep(245,.055,'triangle',.026),30);
  if(isLocal)vibrate([80,35,105]);
}
function drawShotEffects(now){
  state.shots=state.shots.filter(s=>now-s.start<520);
  for(const s of state.shots){
    const age=now-s.start;
    if(age<125){
      const a=1-age/125;
      ctx.save();
      ctx.globalAlpha=.82*a;
      ctx.strokeStyle='#ff334d';ctx.lineWidth=7;
      ctx.beginPath();ctx.moveTo(s.sx,s.sy);ctx.lineTo(s.tx,s.ty);ctx.stroke();
      ctx.globalAlpha=a;ctx.strokeStyle='#fff7d6';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(s.sx,s.sy);ctx.lineTo(s.tx,s.ty);ctx.stroke();
      ctx.restore();
    }
    if(age<360){
      const p=age/360,r=8+p*30;
      ctx.save();ctx.globalAlpha=(1-p)*.9;
      ctx.strokeStyle='#ff5b48';ctx.lineWidth=4*(1-p)+1;
      ctx.beginPath();ctx.arc(s.tx,s.ty,r,0,Math.PI*2);ctx.stroke();
      for(let i=0;i<7;i++){
        const a=s.seed+i*Math.PI*2/7,dist=10+p*34;
        const x=s.tx+Math.cos(a)*dist,y=s.ty+Math.sin(a)*dist;
        ctx.fillStyle=i%2?'#ffd45c':'#ffffff';
        ctx.beginPath();ctx.arc(x,y,Math.max(1,4*(1-p)),0,Math.PI*2);ctx.fill();
      }
      if(age<90){
        ctx.globalAlpha=1-age/90;ctx.fillStyle='#fff';
        ctx.beginPath();ctx.arc(s.tx,s.ty,13*(1-age/90)+3,0,Math.PI*2);ctx.fill();
      }
      ctx.restore();
    }
  }
}

function comboLength(){
  if(state.progress<.32)return 3;
  if(state.progress<.82)return 4;
  return 5;
}
function newCombo(){
  const n=comboLength(),arr=[];
  while(arr.length<n){
    const v=rngItem(INPUTS);
    if(arr.length&&arr[arr.length-1]===v&&Math.random()<.65)continue;
    arr.push(v);
  }
  state.combo=arr;state.comboIndex=0;renderCombo();
}
function renderCombo(){
  comboEl.innerHTML='';
  state.combo.forEach((v,i)=>{
    const s=document.createElement('span');
    s.className='combo-token'+(i<state.comboIndex?' done':i===state.comboIndex?' active':'');
    s.textContent=SYMBOL[v];
    comboEl.appendChild(s);
  });
}
function beep(freq=520,dur=.06,type='sine',gain=.035){
  try{
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
    beep.ac=beep.ac||new AC();const ac=beep.ac;if(ac.state==='suspended')ac.resume();
    const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=freq;g.gain.value=gain;
    o.connect(g);g.connect(ac.destination);o.start();
    g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+dur);o.stop(ac.currentTime+dur);
  }catch(e){}
}
function padClass(name){
  pad.classList.remove('good','bad');void pad.offsetWidth;pad.classList.add(name);
  setTimeout(()=>pad.classList.remove(name),150);
}
function resetComboWrong(){
  state.comboIndex=0;renderCombo();padClass('bad');beep(150,.11,'sawtooth',.045);vibrate([35,20,35]);
}

function playerWorld(){return{x:state.playerX*W,y:state.playerY*H}}
function bossWorld(){return{x:W*.5,y:H*.155}}
function currentCover(){
  return state.obstacles.find(o=>o.type==='cover'&&o.lane===state.playerLane&&Math.abs(state.progress-o.progress)<=o.radius);
}
function pointInVision(px,py){
  const b=bossWorld(),dx=px-b.x,dy=py-b.y;
  if(dy<0)return false;
  const angle=Math.atan2(dx,dy),d=Math.hypot(dx,dy);
  return d<H*.84&&Math.abs(normalizeAngle(angle-state.scanAngle))<=state.scanHalf;
}
function visionContainsPlayer(){
  if(performance.now()<state.graceUntil)return false;
  if(currentCover())return false;
  const p=playerWorld();return pointInVision(p.x,p.y);
}
function dangerousNow(){return state.running&&state.alive&&visionContainsPlayer()}

function applyLaneEffect(oldProgress,newProgress){
  let extraMoveMs=0;
  for(const o of state.obstacles){
    if(o.used||o.lane!==state.playerLane)continue;
    const crossed=oldProgress<=o.progress+.012&&newProgress>=o.progress-.012;
    if(!crossed)continue;
    if(o.type==='boost'){
      o.used=true;
      state.progress=Math.min(1,state.progress+.035);
      beep(1120,.09,'triangle',.032);vibrate(18);
    }else if(o.type==='mud'){
      o.used=true;
      extraMoveMs=120;
      beep(220,.05,'sine',.018);
    }
  }
  return extraMoveMs;
}
function makeInputCombo(n){
  const arr=[];
  while(arr.length<n){
    const v=rngItem(INPUTS);
    if(arr.length&&arr[arr.length-1]===v&&Math.random()<.65)continue;
    arr.push(v);
  }
  return arr;
}
function findRescueTarget(){
  const allowed=new Set(state.activeParticipants.map(p=>p.id));
  for(const p of state.remotePlayers.values()){
    if(allowed.has(p.id)&&!p.alive&&!p.won&&!p.revived)return p;
  }
  return null;
}
function updateRescueButton(){
  const t=state.alive&&!state.won&&!state.spectating&&!state.rescueUsed&&!state.rescueMode?findRescueTarget():null;
  state.rescueTarget=t?.id||null;
  rescueBtn.classList.toggle('show',!!t);
  rescueBtn.textContent=t?'❤️ '+String(t.name||'').slice(0,8):'❤️';
}
function startRescue(){
  const t=findRescueTarget();
  if(!t||state.rescueUsed||!state.alive||state.spectating||state.roundEnding)return;
  state.rescueTarget=t.id;state.rescueMode=true;
  state.combo=makeInputCombo(5);state.comboIndex=0;
  comboEl.classList.add('rescue');rescueBtn.classList.remove('show');renderCombo();
  beep(660,.07,'triangle',.03);vibrate(18);
}
function finishRescue(){
  const target=state.remotePlayers.get(state.rescueTarget);
  if(!target){state.rescueMode=false;comboEl.classList.remove('rescue');newCombo();return}
  state.rescueUsed=true;state.rescueMode=false;comboEl.classList.remove('rescue');
  state.progress=Math.max(0,state.progress-.12);
  state.targetY=progressToY(state.progress);
  state.playerY=Math.max(state.playerY,state.targetY);
  progressFill.style.width=(state.progress*100).toFixed(1)+'%';
  target.alive=true;target.revived=true;target.progress=.32;target.hitAt=0;target.movingUntil=performance.now()+420;
  window.SRLNet?.broadcastRescue?.({targetId:target.id,targetName:target.name,progress:.32});
  beep(1040,.11,'triangle',.04);vibrate([25,20,25]);broadcastPlayer(true);newCombo();updateRescueButton();
}
function inputGesture(kind){
  if(!state.running||!state.alive||state.won||state.spectating||state.roundEnding)return;
  if(dangerousNow())return lose();
  const expected=state.combo[state.comboIndex];
  if(kind!==expected)return resetComboWrong();
  state.comboIndex++;renderCombo();padClass('good');beep(720+state.comboIndex*65,.045,'sine',.025);vibrate(10);
  if(state.comboIndex>=state.combo.length){
    if(state.rescueMode)return finishRescue();
    state.comboIndex=0;state.comboDoneCount++;
    const oldProgress=state.progress;
    const step=state.combo.length===3?.098:state.combo.length===4?.112:.126;
    state.progress=Math.min(1,state.progress+step);
    const extraMoveMs=applyLaneEffect(oldProgress,state.progress);
    progressFill.style.width=(state.progress*100).toFixed(1)+'%';
    state.targetY=progressToY(state.progress);
    state.movingUntil=performance.now()+460+extraMoveMs;
    beep(980,.08,'triangle',.035);broadcastPlayer(true);
    if(state.progress>=1)setTimeout(()=>{if(state.alive)win()},480);else newCombo();
  }
}
function changeLane(nextLane){
  if(!state.running||!state.alive||state.won||state.spectating||state.roundEnding)return;
  const lane=clamp(Number(nextLane)||0,0,2);
  if(lane===state.playerLane)return;
  if(dangerousNow())return lose();
  state.playerLane=lane;state.targetLaneX=LANE_X[lane];
  state.laneMovingUntil=performance.now()+380;
  laneButtons.forEach((b,i)=>b.classList.toggle('selected',i===lane));
  beep(560,.045,'triangle',.018);vibrate(12);
  broadcastPlayer(true);
}

function setSpectator(on,showEye=true){
  state.spectating=!!on;
  gameRoot.classList.toggle('spectating',state.spectating);
  spectatorBadge.classList.toggle('show',state.spectating&&showEye);
  if(state.spectating)rescueBtn.classList.remove('show');
  window.SRLNet?.setSpectating?.(state.spectating);
}
function lose(){
  if(!state.alive||state.won||state.roundEnding)return;
  state.alive=false;state.eliminated=true;state.hitAt=performance.now();pad.classList.remove('danger');
  const p=playerWorld();spawnShot(p.x,p.y,true);
  broadcastPlayer(true);
  setTimeout(()=>{if(state.eliminated&&!state.roundEnding)setSpectator(true,true)},720);
}
function win(){
  if(!state.alive||state.won||state.roundEnding)return;
  state.won=true;beep(880,.15,'triangle',.05);setTimeout(()=>beep(1180,.18,'triangle',.05),100);vibrate([35,30,35]);
  rescueBtn.classList.remove('show');broadcastPlayer(true);
}
function renderScoreBoard(scores={},names={}){
  resultScore.innerHTML='';
  const arr=Object.entries(scores).map(([key,val])=>({key,score:Number(val)||0,name:String(names[key]||key).slice(0,18)}))
    .sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name,'vi'));
  for(const x of arr.slice(0,8)){
    const chip=document.createElement('span');chip.className='score-chip';
    chip.textContent=x.name+' '+('⭐'.repeat(Math.max(0,Math.min(2,x.score)))||'☆');
    resultScore.appendChild(chip);
  }
}
function showRoundResult(p){
  state.running=false;state.roundEnding=true;state.roundResult=p;state.resultShown=true;
  setSpectator(false,false);rescueBtn.classList.remove('show');comboEl.classList.remove('rescue');
  resultIcon.textContent=p.matchState==='finished'?'🏆':'🥇';
  resultText.textContent=(p.winnerName||'—')+(p.matchState==='finished'?'  ★★':'  R'+(p.roundNumber||''));
  renderScoreBoard(p.scores||{},p.scoreNames||{});
  restartBtn.style.display=window.SRLNet?.isHost?'grid':'none';
  restartBtn.textContent=p.matchState==='finished'?'↻':'▶';
  resultOverlay.classList.add('show');
  beep(p.matchState==='finished'?1180:920,.14,'triangle',.045);
}
function receiveRescue(p){
  if(!p?.targetId)return;
  const now=performance.now();
  if(p.targetId===window.SRLNet?.clientId){
    if(!state.eliminated||state.revivedOnce||state.roundEnding)return;
    state.revivedOnce=true;state.eliminated=false;state.alive=true;state.won=false;state.hitAt=0;
    state.progress=clamp(Number(p.progress)||.32,.22,.42);state.targetY=progressToY(state.progress);state.playerY=state.targetY;
    state.graceUntil=now+1600;progressFill.style.width=(state.progress*100).toFixed(1)+'%';
    setSpectator(false,false);newCombo();beep(1050,.12,'triangle',.04);vibrate([30,20,30]);broadcastPlayer(true);
  }else{
    const t=state.remotePlayers.get(p.targetId);
    if(t&&!t.revived){
      t.revived=true;t.alive=true;t.won=false;t.hitAt=0;t.progress=clamp(Number(p.progress)||.32,.22,.42);t.movingUntil=now+420;t.t=now;
    }
  }
  updateRescueButton();
}

function createNpcs(){
  const xs=[.20,.27,.39,.61,.73,.80];
  state.npcs=xs.map((x,i)=>({
    x:x+rand(-.015,.015),y:rand(.72,.92),targetY:0,alive:true,finished:false,
    movingUntil:0,nextMoveAt:performance.now()+rand(350,1500),reckless:Math.random()<.24,
    color:NPC_COLORS[i%NPC_COLORS.length],tilt:rand(-.08,.08),skin:SKINS[i%SKINS.length],hitAt:0
  }));
  state.npcs.forEach(n=>n.targetY=n.y);
}
function npcSeen(n){return pointInVision(n.x*W,n.y*H)}
function updateNpcs(ts,dt){
  for(const n of state.npcs){
    if(!n.alive||n.finished)continue;
    const moving=ts<n.movingUntil;
    n.y+=(n.targetY-n.y)*Math.min(1,dt*(moving?7.2:9.5));
    if(n.y<=.265){n.y=.265;n.targetY=.265;n.finished=true;continue}
    if(moving&&npcSeen(n)){
      n.alive=false;n.movingUntil=0;n.hitAt=ts;
      spawnShot(n.x*W,n.y*H,false);
      continue
    }
    if(ts>=n.nextMoveAt){
      const seen=npcSeen(n),willRisk=n.reckless?Math.random()<.58:Math.random()<.12;
      if(!seen||willRisk){
        n.targetY=Math.max(.265,n.y-rand(.020,.047));
        n.movingUntil=ts+rand(290,520);n.nextMoveAt=ts+rand(720,1500);
      }else n.nextMoveAt=ts+rand(320,760);
    }
  }
}

function seeded(seed){
  let x=(Number(seed)||123456789)>>>0;
  return ()=>{
    x^=x<<13;x^=x>>>17;x^=x<<5;
    return((x>>>0)%1000000)/1000000;
  };
}
function createObstacles(seed){
  const r=seeded(seed||987654321);
  const pickLane=()=>Math.floor(r()*3);
  const items=[
    {type:'cover',lane:pickLane(),progress:.30,radius:.045,used:false},
    {type:'boost',lane:pickLane(),progress:.46,radius:.030,used:false},
    {type:'cover',lane:pickLane(),progress:.61,radius:.045,used:false},
    {type:'boost',lane:pickLane(),progress:.72,radius:.030,used:false},
    {type:'mud',lane:pickLane(),progress:.84,radius:.030,used:false}
  ];
  if(items[1].lane===items[0].lane)items[1].lane=(items[1].lane+1)%3;
  if(items[3].lane===items[2].lane)items[3].lane=(items[3].lane+2)%3;
  state.obstacles=items;
}

function difficulty(){
  if(!state.roundStartPerf)return 0;
  const elapsed=clamp((performance.now()-state.roundStartPerf)/120000,0,1);
  return clamp(state.progress*.78+elapsed*.22,0,1);
}
function dur(base,min){return Math.max(min,base*(1-difficulty()*.22))}
function segment(to,ms,e='inout',width=null){return{to,ms,e,width}}
function hold(ms,width=null){return{hold:true,ms,width}}
function warnHold(ms,width,kind){return{hold:true,ms,width,cue:kind}}
function availablePatternIds(){
  const d=difficulty();
  if(d<.28)return[0,1];
  if(d<.58)return[0,1,3,5];
  return[0,1,2,3,4,5,6,7];
}
function choosePatternId(){
  const d=difficulty();
  const trickAllowed=d>.38&&Math.random()<.24;
  const all=trickAllowed?[8,9]:availablePatternIds();
  const pool=all.filter(id=>id!==state.lastPattern);
  const id=rngItem(pool.length?pool:all);state.lastPattern=id;return id;
}
function triggerBossCue(kind,seq=null){
  if(!kind)return;
  if(seq!==null){
    if(seq<=state.lastRemoteCueSeq)return;
    state.lastRemoteCueSeq=seq;
  }else{
    state.cueSeq++;
  }
  state.cueKind=kind;state.cueUntil=performance.now()+620;
  beep(kind==='reverse'?760:900,.06,'triangle',.03);vibrate(24);
}
function buildScanPlan(){
  const b=.60,id=choosePatternId(),d=difficulty();
  const slow=dur(rand(1750,2250),1250),med=dur(rand(1120,1450),820),fast=dur(rand(620,820),480);
  const shortPause=dur(rand(360,650),260),longPause=dur(rand(780,1200),560);
  const narrow=.165+d*.018,normal=.188+d*.025,wide=.215+d*.025;
  let p=[];
  if(id===0)p=[segment(-b,med,'inout',normal),hold(shortPause,normal),segment(b,slow,'inout',normal)];
  if(id===1)p=[segment(b,med,'out',normal),hold(longPause,wide),segment(-b,med,'inout',wide)];
  if(id===2)p=[segment(-b,fast,'snap',narrow),hold(shortPause,narrow),segment(.18,med,'out',normal),segment(-.18,fast*.72,'snap',wide),hold(shortPause*.75,wide),segment(b,med,'inout',normal)];
  if(id===3)p=[segment(b,fast,'snap',narrow),hold(shortPause*.75,narrow),segment(-b,fast,'snap',normal)];
  if(id===4)p=[segment(.05,med*.80,'out',normal),segment(b,med*.78,'in',wide),segment(.05,fast*.78,'snap',wide),hold(shortPause*.85,wide),segment(-b,med,'inout',normal)];
  if(id===5)p=[segment(-b,med,'out',normal),segment(0,med*.82,'inout',narrow),hold(longPause,narrow),segment(b,fast,'snap',wide)];
  if(id===6)p=[segment(-.28,med*.76,'inout',narrow),hold(shortPause,narrow),segment(.22,fast*.86,'snap',wide),segment(-.08,fast*.72,'snap',wide),hold(shortPause*.8,normal),segment(b,med*.90,'out',normal)];
  if(id===7)p=[segment(b,slow,'in',normal),segment(.12,fast*.72,'snap',wide),hold(shortPause*.9,wide),segment(-b,fast,'snap',narrow),hold(longPause*.72,narrow)];
  if(id===8)p=[segment(.18,med,'out',normal),warnHold(620,normal,'reverse'),segment(-b,fast,'snap',wide),hold(shortPause,wide),segment(.35,med,'inout',normal)];
  if(id===9)p=[segment(-.14,slow*.72,'inout',normal),warnHold(560,narrow,'dash'),segment(.48,fast,'snap',wide),hold(shortPause*.75,wide),segment(-.40,med,'out',normal)];
  p.push(hold(dur(rand(240,440),190),normal));
  state.scanPlan=p;state.scanIndex=0;state.scanSegmentStart=0;state.scanSegmentFrom=state.scanAngle;
}
function updateScannerHost(ts,dt){
  if(!state.scanPlan.length||state.scanIndex>=state.scanPlan.length)buildScanPlan();
  const seg=state.scanPlan[state.scanIndex];
  if(!state.scanSegmentStart){
    state.scanSegmentStart=ts;state.scanSegmentFrom=state.scanAngle;
    if(seg.cue)triggerBossCue(seg.cue);
  }
  const t=clamp((ts-state.scanSegmentStart)/seg.ms,0,1);
  state.scanAngle=seg.hold?state.scanSegmentFrom:lerp(state.scanSegmentFrom,seg.to,ease(t,seg.e));
  const targetWidth=seg.width??(.188+difficulty()*.022);
  state.scanHalf+=(targetWidth-state.scanHalf)*Math.min(1,dt*4.5);
  if(t>=1){
    if(!seg.hold)state.scanAngle=seg.to;
    state.scanIndex++;state.scanSegmentStart=0;state.scanSegmentFrom=state.scanAngle;
    if(state.scanIndex>=state.scanPlan.length)buildScanPlan();
  }
}
function updateScannerRemote(dt){
  const fresh=performance.now()-state.remoteBossAt<1500;
  if(fresh){
    state.scanAngle+=normalizeAngle(state.remoteBossAngle-state.scanAngle)*Math.min(1,dt*14);
    state.scanHalf+=(state.remoteBossHalf-state.scanHalf)*Math.min(1,dt*10);
  }else{
    updateScannerHost(performance.now(),dt);
  }
}
function broadcastBoss(ts){
  const net=window.SRLNet;
  if(!net||!net.isHost||!net.connected||ts-state.lastBossBroadcast<95)return;
  state.lastBossBroadcast=ts;
  net.broadcastBoss({angle:state.scanAngle,half:state.scanHalf,cueKind:state.cueKind,cueSeq:state.cueSeq,t:Date.now()});
}
function broadcastPlayer(force=false){
  const net=window.SRLNet,now=performance.now();
  if(!net||!net.connected||(!force&&now-state.lastPlayerBroadcast<120))return;
  state.lastPlayerBroadcast=now;
  net.broadcastPlayer({
    progress:state.progress,alive:state.alive,won:state.won,y:state.playerY,lane:state.playerLane,
    skin:localSkin(),t:Date.now()
  });
}
function receiveBoss(p){
  if(!p||!Number.isFinite(Number(p.angle)))return;
  state.remoteBossAngle=Number(p.angle);
  state.remoteBossHalf=clamp(Number(p.half)||.20,.12,.32);
  state.remoteBossAt=performance.now();
  if(Number(p.cueSeq)>state.lastRemoteCueSeq)triggerBossCue(String(p.cueKind||'dash'),Number(p.cueSeq));
}
function receivePlayer(p){
  if(!p||!p.clientId)return;
  const now=performance.now(),old=state.remotePlayers.get(p.clientId);
  const progress=clamp(Number(p.progress)||0,0,1);
  const lane=Number.isFinite(Number(p.lane))?clamp(Number(p.lane),0,2):1;
  const alive=p.alive!==false;
  const moved=!!old&&(Math.abs(progress-old.progress)>.002||lane!==old.lane);
  const diedNow=!!old&&old.alive&&!alive;
  const hitAt=diedNow?now:(!alive?(old?.hitAt||now-700):0);
  if(diedNow)spawnShot(LANE_X[lane]*W,progressToY(progress)*H,false);
  state.remotePlayers.set(p.clientId,{
    id:p.clientId,name:String(p.name||'Player').slice(0,24),progress,lane,alive,won:!!p.won,
    skin:String(p.skin||old?.skin||skinFor(p.clientId,p.name)),
    hitAt,movingUntil:moved?now+520:(old?.movingUntil||0),t:now
  });
}
function progressToY(p){return .84-(.84-.245)*clamp(p,0,1)}

function resetRound(seed=0){
  state.running=false;state.alive=true;state.won=false;state.progress=0;state.comboIndex=0;state.comboDoneCount=0;
  state.playerLane=1;state.playerX=LANE_X[1];state.targetLaneX=LANE_X[1];state.playerY=.84;state.targetY=.84;
  state.movingUntil=0;state.laneMovingUntil=0;state.lastTs=0;state.graceUntil=0;
  state.scanAngle=-.56;state.scanHalf=.20;state.scanPlan=[];state.scanIndex=0;state.scanSegmentStart=0;state.scanSegmentFrom=-.56;state.lastPattern=-1;
  state.remoteBossAngle=-.56;state.remoteBossHalf=.20;state.remoteBossAt=0;
  state.cueKind='';state.cueUntil=0;state.cueSeq=0;state.lastRemoteCueSeq=0;
  state.lastBossBroadcast=0;state.lastPlayerBroadcast=0;state.remotePlayers.clear();state.shots=[];
  state.roundSeed=Number(seed)||0;state.roundStartPerf=0;state.resultShown=false;state.hitAt=0;
  progressFill.style.width='0%';resultOverlay.classList.remove('show');pad.classList.remove('danger','bad','good');
  laneButtons.forEach((b,i)=>b.classList.toggle('selected',i===1));
  createNpcs();createObstacles(state.roundSeed);newCombo();buildScanPlan();draw();
}
function scheduleRound(payload){
  cancelAnimationFrame(countdownRaf);
  resetRound(payload?.seed||0);
  lobbyOverlay?.classList.remove('show');roomOverlay?.classList.remove('show');resultOverlay.classList.remove('show');
  countdownOverlay.classList.add('show');
  const parsed=Date.parse(payload?.startAt||'');
  const target=Number.isFinite(parsed)?parsed:Date.now()+2200;
  const tick=()=>{
    const remain=target-Date.now();
    if(remain<=0){
      countdownValue.textContent='●';
      countdownRaf=requestAnimationFrame(()=>{
        countdownOverlay.classList.remove('show');beginRound();
      });
      return;
    }
    countdownValue.textContent=String(Math.max(1,Math.ceil(remain/1000)));
    countdownRaf=requestAnimationFrame(tick);
  };
  tick();
}
function beginRound(){
  state.running=true;state.roundStartPerf=performance.now();state.graceUntil=performance.now()+2200;state.lastTs=0;
  if(window.SRLNet?.isHost){
    state.scanPlan=[];buildScanPlan();
    window.SRLNet.broadcastBoss({angle:state.scanAngle,half:state.scanHalf,cueKind:'',cueSeq:0,t:Date.now()});
  }
  broadcastPlayer(true);beep(620,.08,'triangle',.03);requestAnimationFrame(loop);
}
function stopRound(){
  state.running=false;cancelAnimationFrame(countdownRaf);countdownOverlay.classList.remove('show');
  resultOverlay.classList.remove('show');pad.classList.remove('danger');
}

function pointerStart(e){
  if(!state.running||!state.alive)return;
  const r=pad.getBoundingClientRect();
  if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)return;
  pointer={id:e.pointerId,x:e.clientX,y:e.clientY,t:performance.now()};
  try{pad.setPointerCapture(e.pointerId)}catch(_){}
  e.preventDefault();
}
function pointerEnd(e){
  if(!pointer||pointer.id!==e.pointerId)return;
  const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y,d=Math.hypot(dx,dy);pointer=null;e.preventDefault();
  const threshold=Math.max(24,Math.min(W,H)*.04);
  if(d<threshold)return inputGesture('tap');
  if(Math.abs(dx)>Math.abs(dy))inputGesture(dx>0?'right':'left');
  else inputGesture(dy>0?'down':'up');
}
pad.addEventListener('pointerdown',pointerStart,{passive:false});
pad.addEventListener('pointerup',pointerEnd,{passive:false});
pad.addEventListener('pointercancel',()=>pointer=null,{passive:true});
pad.addEventListener('contextmenu',e=>e.preventDefault());
pad.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();inputGesture('tap')}});

laneButtons.forEach((b,i)=>b.addEventListener('click',()=>changeLane(i)));

restartBtn.addEventListener('click',async()=>{
  stopRound();
  await window.SRLNet?.backToRoom?.();
  resetRound();
});

function update(ts){
  const dt=Math.min(.04,(ts-(state.lastTs||ts))/1000);state.lastTs=ts;
  if(!state.running)return;
  if(window.SRLNet?.isHost)updateScannerHost(ts,dt);else updateScannerRemote(dt);
  broadcastBoss(ts);updateNpcs(ts,dt);

  if(state.alive&&!state.won){
    const moving=ts<state.movingUntil;
    const laneMoving=ts<state.laneMovingUntil;
    state.playerY+=(state.targetY-state.playerY)*Math.min(1,dt*(moving?8.5:11));
    state.playerX+=(state.targetLaneX-state.playerX)*Math.min(1,dt*(laneMoving?11:16));
    const seen=visionContainsPlayer();pad.classList.toggle('danger',seen);laneControls?.classList.toggle('danger',seen);
    if((moving||laneMoving)&&seen)lose();
  }else{
    pad.classList.remove('danger');laneControls?.classList.remove('danger');
  }
  broadcastPlayer(false);
  for(const [id,p] of state.remotePlayers)if(ts-p.t>4500)state.remotePlayers.delete(id);
}

function roundedRect(x,y,w,h,r,fill){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill()}
function drawSkyGround(){
  const horizon=H*.35;
  const g=ctx.createLinearGradient(0,0,0,horizon);g.addColorStop(0,'#8edcff');g.addColorStop(1,'#dbf6ff');ctx.fillStyle=g;ctx.fillRect(0,0,W,horizon);
  const gg=ctx.createLinearGradient(0,horizon,0,H);gg.addColorStop(0,'#f5d88f');gg.addColorStop(1,'#e7bd6d');ctx.fillStyle=gg;ctx.fillRect(0,horizon,W,H-horizon);
  ctx.fillStyle='#7da954';ctx.fillRect(0,horizon-8,W,13);
  ctx.beginPath();ctx.moveTo(W*.24,H);ctx.lineTo(W*.40,horizon);ctx.lineTo(W*.60,horizon);ctx.lineTo(W*.76,H);ctx.closePath();ctx.fillStyle='rgba(207,117,91,.56)';ctx.fill();
  drawLaneGuides(horizon);
  ctx.strokeStyle='rgba(255,255,255,.82)';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,H*.275);ctx.lineTo(W,H*.275);ctx.stroke();
}
function drawLaneGuides(horizon){
  const y0=H*.245,y1=H*.98;
  for(const frac of [.42,.58]){
    const topX=W*(.5+(frac-.5)*.52),bottomX=W*(.5+(frac-.5)*1.92);
    ctx.save();ctx.setLineDash([12,12]);ctx.strokeStyle='rgba(255,255,255,.34)';ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(topX,y0);ctx.lineTo(bottomX,y1);ctx.stroke();ctx.restore();
  }
}
function drawVisionCone(){
  if(!state.running)return;
  const b=bossWorld(),len=H*.79,a1=state.scanAngle-state.scanHalf,a2=state.scanAngle+state.scanHalf;
  const x1=b.x+Math.sin(a1)*len,y1=b.y+Math.cos(a1)*len,x2=b.x+Math.sin(a2)*len,y2=b.y+Math.cos(a2)*len;
  const grad=ctx.createRadialGradient(b.x,b.y,10,b.x,b.y,len);
  grad.addColorStop(0,'rgba(255,45,62,.35)');grad.addColorStop(.62,'rgba(255,40,56,.22)');grad.addColorStop(1,'rgba(255,40,56,.035)');
  ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(x1,y1);ctx.lineTo(x2,y2);ctx.closePath();ctx.fillStyle=grad;ctx.fill();
  ctx.strokeStyle='rgba(221,31,50,.38)';ctx.lineWidth=2.2;ctx.stroke();
}
function drawBoss(){
  const b=bossWorld(),s=Math.max(48,Math.min(W,H)*.085),cue=performance.now()<state.cueUntil;
  ctx.save();ctx.translate(b.x,b.y);
  if(cue){
    ctx.beginPath();ctx.arc(0,-s*.10,s*.72,0,Math.PI*2);ctx.fillStyle='rgba(255,62,76,.16)';ctx.fill();
  }
  ctx.fillStyle='#2f2830';ctx.beginPath();ctx.arc(-s*.48,-s*.14,s*.18,0,Math.PI*2);ctx.arc(s*.48,-s*.14,s*.18,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#ffd6b6';ctx.beginPath();ctx.arc(0,-s*.12,s*.44,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#30272c';ctx.beginPath();ctx.arc(0,-s*.25,s*.44,Math.PI,0);ctx.lineTo(s*.44,-s*.08);ctx.quadraticCurveTo(0,-s*.35,-s*.44,-s*.08);ctx.closePath();ctx.fill();
  const eyeShift=Math.sin(state.scanAngle)*s*.12;
  ctx.fillStyle=cue?'#ff2f45':'#20232a';ctx.beginPath();ctx.arc(-s*.16+eyeShift,-s*.10,cue?s*.067:s*.047,0,Math.PI*2);ctx.arc(s*.16+eyeShift,-s*.10,cue?s*.067:s*.047,0,Math.PI*2);ctx.fill();
  roundedRect(-s*.36,s*.27,s*.72,s*.75,s*.12,'#f0b52e');ctx.fillStyle='#ff6f8d';ctx.fillRect(-s*.30,s*.44,s*.60,s*.12);
  ctx.restore();
}
function obstacleWorld(o){
  const y=progressToY(o.progress)*H;
  return{x:LANE_X[o.lane]*W,y};
}
function drawObstacles(){
  for(const o of state.obstacles){
    const p=obstacleWorld(o),s=Math.max(20,Math.min(W,H)*.032);
    ctx.save();ctx.globalAlpha=o.used?.35:1;
    if(o.type==='cover'){
      ctx.beginPath();ctx.arc(p.x,p.y,s*.95,0,Math.PI*2);ctx.fillStyle='rgba(78,151,73,.22)';ctx.fill();
      ctx.font=Math.round(s*1.25)+'px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('🌳',p.x,p.y);
    }else if(o.type==='boost'){
      roundedRect(p.x-s*.78,p.y-s*.42,s*1.56,s*.84,s*.30,'rgba(255,218,67,.72)');
      ctx.font='900 '+Math.round(s*.78)+'px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#7a5a00';ctx.fillText('⚡',p.x,p.y+1);
    }else{
      ctx.beginPath();ctx.ellipse(p.x,p.y,s*.82,s*.34,0,0,Math.PI*2);ctx.fillStyle='rgba(123,82,44,.42)';ctx.fill();
      ctx.font=Math.round(s*.70)+'px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('💧',p.x,p.y-1);
    }
    ctx.restore();
  }
}
function drawNpc(n){
  const x=n.x*W,y=n.y*H,s=Math.max(36,Math.min(W,H)*.055);
  const now=performance.now(),mode=!n.alive?'fall':(now<n.movingUntil?'walk':'idle');
  if(drawSpriteCharacter(n.skin||'dog',x,y,s,mode,n.hitAt,n.alive?1:.82))return;
  const fs=Math.max(14,Math.min(W,H)*.021);
  ctx.save();ctx.translate(x,y);if(!n.alive)ctx.rotate(1.12+n.tilt);else ctx.rotate(n.tilt);ctx.globalAlpha=n.alive?1:.72;
  ctx.fillStyle='#f0c7a3';ctx.beginPath();ctx.arc(0,-fs*.75,fs*.44,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#3a3336';ctx.beginPath();ctx.arc(0,-fs*.84,fs*.44,Math.PI,0);ctx.fill();
  roundedRect(-fs*.38,-fs*.28,fs*.76,fs*.92,fs*.18,n.alive?n.color:'#6d6d73');
  ctx.strokeStyle='#283443';ctx.lineWidth=Math.max(2,fs*.10);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-fs*.20,fs*.60);ctx.lineTo(-fs*.21,fs*.96);ctx.moveTo(fs*.20,fs*.60);ctx.lineTo(fs*.21,fs*.96);ctx.stroke();
  ctx.restore();
}
function drawNpcs(){for(const n of state.npcs)drawNpc(n)}
function drawRemotePlayer(p){
  const x=LANE_X[p.lane]*W,y=progressToY(p.progress)*H;
  const now=performance.now(),mode=!p.alive?'fall':(now<p.movingUntil?'walk':'idle');
  const size=Math.max(45,Math.min(W,H)*.075);
  const usedSprite=drawSpriteCharacter(p.skin||skinFor(p.id,p.name),x,y,size,mode,p.hitAt,p.alive?1:.84);
  if(!usedSprite){
    const s=Math.max(18,Math.min(W,H)*.025);
    ctx.save();ctx.translate(x,y);if(!p.alive)ctx.rotate(1.05);ctx.globalAlpha=p.alive?1:.72;
    ctx.fillStyle='#f2c6a4';ctx.beginPath();ctx.arc(0,-s*.75,s*.45,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#343038';ctx.beginPath();ctx.arc(0,-s*.86,s*.46,Math.PI,0);ctx.fill();
    roundedRect(-s*.40,-s*.27,s*.80,s*.96,s*.18,p.alive?(p.won?'#f3b735':'#4b7ee8'):'#74747c');
    ctx.fillStyle='#fff';ctx.font='900 '+Math.round(s*.42)+'px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('●',0,s*.18);
    ctx.strokeStyle='#29384b';ctx.lineWidth=Math.max(2,s*.10);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-s*.20,s*.62);ctx.lineTo(-s*.22,s*.98);ctx.moveTo(s*.20,s*.62);ctx.lineTo(s*.22,s*.98);ctx.stroke();ctx.restore();
  }
  ctx.save();ctx.font='800 11px system-ui';ctx.textAlign='center';ctx.textBaseline='bottom';
  const text=p.name.slice(0,12),tw=ctx.measureText(text).width;
  roundedRect(x-tw/2-5,y-size*.72-18,tw+10,18,8,'rgba(255,255,255,.82)');
  ctx.fillStyle='#273248';ctx.fillText(text,x,y-size*.72-3);ctx.restore();
}
function drawRemotePlayers(){for(const p of state.remotePlayers.values())drawRemotePlayer(p)}
function drawPlayer(){
  const p=playerWorld(),danger=state.running&&state.alive&&visionContainsPlayer(),now=performance.now();
  const size=Math.max(58,Math.min(W,H)*.098);
  ctx.save();
  if(danger){ctx.beginPath();ctx.arc(p.x,p.y,size*.58,0,Math.PI*2);ctx.fillStyle='rgba(245,47,65,.18)';ctx.fill()}
  if(currentCover()){ctx.beginPath();ctx.arc(p.x,p.y,size*.56,0,Math.PI*2);ctx.strokeStyle='rgba(65,164,84,.72)';ctx.lineWidth=5;ctx.stroke()}
  ctx.restore();
  const moving=now<state.movingUntil||now<state.laneMovingUntil;
  const mode=!state.alive?'fall':(moving?'walk':'idle');
  if(drawSpriteCharacter(localSkin(),p.x,p.y,size,mode,state.hitAt,state.alive?1:.88))return;

  const s=Math.max(24,Math.min(W,H)*.035);
  ctx.save();ctx.translate(p.x,p.y);if(!state.alive)ctx.rotate(1.08);
  ctx.fillStyle='#ffd7b8';ctx.beginPath();ctx.arc(0,-s*.75,s*.48,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#3c2f2d';ctx.beginPath();ctx.arc(0,-s*.88,s*.49,Math.PI,0);ctx.fill();
  roundedRect(-s*.42,-s*.25,s*.84,s*1.0,s*.2,state.alive?(state.won?'#f3b735':'#2daea1'):'#6f747d');
  ctx.fillStyle='#fff';ctx.font='900 '+Math.round(s*.48)+'px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('S',0,s*.23);
  ctx.strokeStyle='#29384b';ctx.lineWidth=Math.max(3,s*.11);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-s*.23,s*.7);ctx.lineTo(-s*.25,s*1.10);ctx.moveTo(s*.23,s*.7);ctx.lineTo(s*.25,s*1.10);ctx.stroke();ctx.restore();
}
function drawFinish(){
  const y=H*.238;ctx.strokeStyle='rgba(242,66,77,.9)';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(W*.20,y);ctx.lineTo(W*.80,y);ctx.stroke();
}
function draw(){
  ctx.clearRect(0,0,W,H);
  drawSkyGround();drawFinish();drawVisionCone();drawObstacles();drawNpcs();drawRemotePlayers();drawBoss();drawPlayer();
  drawShotEffects(performance.now());
}
function loop(ts){update(ts);draw();if(state.running)requestAnimationFrame(loop)}

function wireNetwork(){
  const net=window.SRLNet;
  if(!net)return setTimeout(wireNetwork,50);
  net.onRoundStart=scheduleRound;
  net.onBossState=receiveBoss;
  net.onPlayerState=receivePlayer;
  net.onRoomReset=()=>{stopRound();resetRound()};
}
wireNetwork();
resetRound();
})();