(()=>{
'use strict';
const canvas=document.getElementById('canvas');
const ctx=canvas.getContext('2d');
const comboEl=document.getElementById('combo');
const pad=document.getElementById('gesturePad');
const startOverlay=document.getElementById('startOverlay');
const resultOverlay=document.getElementById('resultOverlay');
const resultIcon=document.getElementById('resultIcon');
const progressFill=document.getElementById('progressFill');
const DPR=Math.min(2,window.devicePixelRatio||1);

const INPUTS=['up','down','left','right','tap'];
const SYMBOL={up:'↑',down:'↓',left:'←',right:'→',tap:'●'};
const NPC_COLORS=['#ef6a7a','#5c82ff','#f0aa32','#7a63d5','#45b986','#e6763f','#4e9ac8','#d463aa'];
const state={
  running:false,alive:true,won:false,progress:0,combo:[],comboIndex:0,
  playerX:.5,playerY:.84,targetY:.84,movingUntil:0,lastTs:0,
  scanAngle:-.56,scanHalf:.20,scanHalfTarget:.20,scanPlan:[],scanIndex:0,
  scanSegmentStart:0,scanSegmentFrom:-.56,lastPattern:-1,npcs:[]
};
let W=0,H=0;
let pointer=null;

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
function resize(){
  W=Math.max(320,innerWidth);H=Math.max(520,innerHeight);
  canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);
  canvas.style.width=W+'px';canvas.style.height=H+'px';
  ctx.setTransform(DPR,0,0,DPR,0,0);
}
window.addEventListener('resize',resize,{passive:true});resize();

function comboLength(){return state.progress<.28?3:state.progress<.68?4:5}
function newCombo(){
  const n=comboLength();const arr=[];
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
    s.textContent=SYMBOL[v];comboEl.appendChild(s);
  });
}
function beep(freq=520,dur=.06,type='sine',gain=.035){
  try{
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
    beep.ac=beep.ac||new AC();const ac=beep.ac;if(ac.state==='suspended')ac.resume();
    const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=freq;g.gain.value=gain;
    o.connect(g);g.connect(ac.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+dur);o.stop(ac.currentTime+dur);
  }catch(e){}
}
function padClass(name){pad.classList.remove('good','bad');void pad.offsetWidth;pad.classList.add(name);setTimeout(()=>pad.classList.remove(name),150)}
function resetComboWrong(){state.comboIndex=0;renderCombo();padClass('bad');beep(150,.11,'sawtooth',.045)}

function playerWorld(){return{x:state.playerX*W,y:state.playerY*H}}
function bossWorld(){return{x:W*.5,y:H*.155}}
function pointInVision(px,py){
  const b=bossWorld();const dx=px-b.x,dy=py-b.y;
  if(dy<0)return false;
  const angle=Math.atan2(dx,dy);const d=Math.hypot(dx,dy);
  return d<H*.84&&Math.abs(normalizeAngle(angle-state.scanAngle))<=state.scanHalf;
}
function visionContainsPlayer(){const p=playerWorld();return pointInVision(p.x,p.y)}
function dangerousNow(){return state.running&&state.alive&&visionContainsPlayer()}

function inputGesture(kind){
  if(!state.running||!state.alive)return;
  if(dangerousNow())return lose();
  const expected=state.combo[state.comboIndex];
  if(kind!==expected)return resetComboWrong();
  state.comboIndex++;renderCombo();padClass('good');beep(720+state.comboIndex*65,.045,'sine',.025);
  if(state.comboIndex>=state.combo.length){
    state.comboIndex=0;
    const step=state.combo.length===3?.105:state.combo.length===4?.12:.135;
    state.progress=Math.min(1,state.progress+step);
    progressFill.style.width=(state.progress*100).toFixed(1)+'%';
    const finishY=.245;
    state.targetY=.84-(.84-finishY)*state.progress;
    state.movingUntil=performance.now()+460;
    beep(980,.08,'triangle',.035);
    if(state.progress>=1)setTimeout(()=>{if(state.alive)win()},480);else newCombo();
  }
}

function lose(){
  if(!state.alive)return;
  state.alive=false;state.running=false;pad.classList.remove('danger');
  beep(105,.3,'sawtooth',.065);resultIcon.textContent='💥';setTimeout(()=>resultOverlay.classList.add('show'),360);
}
function win(){
  if(!state.alive)return;
  state.won=true;state.running=false;beep(880,.15,'triangle',.05);setTimeout(()=>beep(1180,.18,'triangle',.05),100);
  resultIcon.textContent='🏁⭐';resultOverlay.classList.add('show');
}

function createNpcs(){
  const xs=[.19,.27,.35,.43,.57,.65,.73,.81,.23,.77];
  state.npcs=xs.map((x,i)=>({
    x:x+rand(-.018,.018),y:rand(.72,.92),targetY:0,alive:true,finished:false,
    movingUntil:0,nextMoveAt:performance.now()+rand(250,1400),reckless:Math.random()<.32,
    color:NPC_COLORS[i%NPC_COLORS.length],tilt:rand(-.08,.08),deadAt:0
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
      n.alive=false;n.deadAt=ts;n.movingUntil=0;beep(120,.06,'square',.018);continue;
    }
    if(ts>=n.nextMoveAt){
      const seen=npcSeen(n);
      const willRisk=n.reckless?Math.random()<.72:Math.random()<.18;
      if(!seen||willRisk){
        const stride=rand(.022,.052)*(1+state.progress*.12);
        n.targetY=Math.max(.265,n.y-stride);
        n.movingUntil=ts+rand(260,520);
        n.nextMoveAt=ts+rand(650,1450);
      }else{
        n.nextMoveAt=ts+rand(260,700);
      }
    }
  }
}

function difficulty(){return clamp(state.progress,0,1)}
function dur(base,min){return Math.max(min,base*(1-difficulty()*.34))}
function segment(to,ms,e='inout',width=null){return{to,ms,e,width}}
function hold(ms,width=null){return{hold:true,ms,width}}
function availablePatternIds(){
  if(state.progress<.23)return[0,1,3];
  if(state.progress<.55)return[0,1,2,3,5];
  return[0,1,2,3,4,5,6,7];
}
function choosePatternId(){
  const pool=availablePatternIds().filter(id=>id!==state.lastPattern);
  const id=rngItem(pool.length?pool:availablePatternIds());state.lastPattern=id;return id;
}
function buildScanPlan(){
  const b=.62;const id=choosePatternId();const d=difficulty();
  const slow=dur(rand(1550,2100),950),med=dur(rand(950,1350),650),fast=dur(rand(480,760),330);
  const shortPause=dur(rand(260,620),180),longPause=dur(rand(700,1250),430);
  const narrow=.17+d*.025,normal=.195+d*.035,wide=.22+d*.035;
  let p=[];
  if(id===0)p=[segment(-b,med,'inout',normal),hold(shortPause,normal),segment(b,slow,'inout',normal)];
  if(id===1)p=[segment(b,med,'out',normal),hold(longPause,wide),segment(-b,med,'inout',wide)];
  if(id===2)p=[segment(-b,fast,'snap',narrow),hold(shortPause,narrow),segment(.18,med,'out',normal),segment(-.20,fast*.58,'snap',wide),hold(shortPause*.75,wide),segment(b,med,'inout',normal)];
  if(id===3)p=[segment(b,fast,'snap',narrow),hold(shortPause*.55,narrow),segment(-b,fast,'snap',normal)];
  if(id===4)p=[segment(.05,med*.72,'out',normal),segment(b,med*.68,'in',wide),segment(.05,fast*.60,'snap',wide),hold(shortPause*.7,wide),segment(-b,med,'inout',normal)];
  if(id===5)p=[segment(-b,med,'out',normal),segment(0,med*.72,'inout',narrow),hold(longPause,narrow),segment(b,fast,'snap',wide)];
  if(id===6)p=[segment(-.28,med*.68,'inout',narrow),hold(shortPause*.8,narrow),segment(.22,fast*.72,'snap',wide),segment(-.08,fast*.55,'snap',wide),hold(shortPause*.6,normal),segment(b,med*.82,'out',normal)];
  if(id===7)p=[segment(b,slow,'in',normal),segment(.12,fast*.48,'snap',wide),hold(shortPause*.65,wide),segment(-b,fast*.88,'snap',narrow),hold(longPause*.6,narrow)];
  p.push(hold(dur(rand(180,420),140),normal));
  state.scanPlan=p;state.scanIndex=0;state.scanSegmentStart=0;state.scanSegmentFrom=state.scanAngle;
}
function updateScanner(ts,dt){
  if(!state.scanPlan.length||state.scanIndex>=state.scanPlan.length)buildScanPlan();
  const seg=state.scanPlan[state.scanIndex];
  if(!state.scanSegmentStart){state.scanSegmentStart=ts;state.scanSegmentFrom=state.scanAngle}
  const t=clamp((ts-state.scanSegmentStart)/seg.ms,0,1);
  if(seg.hold){state.scanAngle=state.scanSegmentFrom}else state.scanAngle=lerp(state.scanSegmentFrom,seg.to,ease(t,seg.e));
  const targetWidth=seg.width??(.195+difficulty()*.03);
  state.scanHalf+=(targetWidth-state.scanHalf)*Math.min(1,dt*4.5);
  if(t>=1){
    if(!seg.hold)state.scanAngle=seg.to;
    state.scanIndex++;state.scanSegmentStart=0;state.scanSegmentFrom=state.scanAngle;
    if(state.scanIndex>=state.scanPlan.length)buildScanPlan();
  }
}

function reset(){
  state.running=false;state.alive=true;state.won=false;state.progress=0;state.comboIndex=0;
  state.playerX=.5;state.playerY=.84;state.targetY=.84;state.movingUntil=0;state.lastTs=0;
  state.scanAngle=-.56;state.scanHalf=.20;state.scanPlan=[];state.scanIndex=0;state.scanSegmentStart=0;state.scanSegmentFrom=-.56;state.lastPattern=-1;
  progressFill.style.width='0%';resultOverlay.classList.remove('show');pad.classList.remove('danger','bad','good');
  createNpcs();newCombo();buildScanPlan();
}
function start(){reset();startOverlay.classList.remove('show');state.running=true;beep(620,.08,'triangle',.03);requestAnimationFrame(loop)}

document.getElementById('startBtn').addEventListener('click',start);
document.getElementById('restartBtn').addEventListener('click',start);

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

function update(ts){
  const dt=Math.min(.04,(ts-(state.lastTs||ts))/1000);state.lastTs=ts;
  if(!state.running)return;
  updateScanner(ts,dt);updateNpcs(ts,dt);
  const moving=ts<state.movingUntil;
  state.playerY+=(state.targetY-state.playerY)*Math.min(1,dt*(moving?8.5:11));
  const seen=visionContainsPlayer();pad.classList.toggle('danger',seen);
  if(moving&&seen)lose();
}

function roundedRect(x,y,w,h,r,fill){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill()}
function drawSkyGround(){
  const horizon=H*.35;
  const g=ctx.createLinearGradient(0,0,0,horizon);g.addColorStop(0,'#8edcff');g.addColorStop(1,'#dbf6ff');ctx.fillStyle=g;ctx.fillRect(0,0,W,horizon);
  const gg=ctx.createLinearGradient(0,horizon,0,H);gg.addColorStop(0,'#f5d88f');gg.addColorStop(1,'#e7bd6d');ctx.fillStyle=gg;ctx.fillRect(0,horizon,W,H-horizon);
  ctx.fillStyle='#7da954';ctx.fillRect(0,horizon-8,W,13);
  ctx.beginPath();ctx.moveTo(W*.31,H);ctx.lineTo(W*.43,horizon);ctx.lineTo(W*.57,horizon);ctx.lineTo(W*.69,H);ctx.closePath();ctx.fillStyle='rgba(207,117,91,.56)';ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.82)';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,H*.275);ctx.lineTo(W,H*.275);ctx.stroke();
}
function drawVisionCone(){
  if(!state.running||!state.alive)return;
  const b=bossWorld();const len=H*.79;const a1=state.scanAngle-state.scanHalf,a2=state.scanAngle+state.scanHalf;
  const x1=b.x+Math.sin(a1)*len,y1=b.y+Math.cos(a1)*len;const x2=b.x+Math.sin(a2)*len,y2=b.y+Math.cos(a2)*len;
  const grad=ctx.createRadialGradient(b.x,b.y,10,b.x,b.y,len);grad.addColorStop(0,'rgba(255,45,62,.38)');grad.addColorStop(.62,'rgba(255,40,56,.24)');grad.addColorStop(1,'rgba(255,40,56,.04)');
  ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(x1,y1);ctx.lineTo(x2,y2);ctx.closePath();ctx.fillStyle=grad;ctx.fill();
  ctx.strokeStyle='rgba(221,31,50,.42)';ctx.lineWidth=2.5;ctx.stroke();
}
function drawBoss(){
  const b=bossWorld();const s=Math.max(48,Math.min(W,H)*.085);
  ctx.save();ctx.translate(b.x,b.y);
  ctx.fillStyle='#2f2830';ctx.beginPath();ctx.arc(-s*.48,-s*.14,s*.18,0,Math.PI*2);ctx.arc(s*.48,-s*.14,s*.18,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#ffd6b6';ctx.beginPath();ctx.arc(0,-s*.12,s*.44,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#30272c';ctx.beginPath();ctx.arc(0,-s*.25,s*.44,Math.PI,0);ctx.lineTo(s*.44,-s*.08);ctx.quadraticCurveTo(0,-s*.35,-s*.44,-s*.08);ctx.closePath();ctx.fill();
  const eyeShift=Math.sin(state.scanAngle)*s*.12;
  ctx.fillStyle='#20232a';ctx.beginPath();ctx.arc(-s*.16+eyeShift,-s*.10,s*.047,0,Math.PI*2);ctx.arc(s*.16+eyeShift,-s*.10,s*.047,0,Math.PI*2);ctx.fill();
  roundedRect(-s*.36,s*.27,s*.72,s*.75,s*.12,'#f0b52e');ctx.fillStyle='#ff6f8d';ctx.fillRect(-s*.30,s*.44,s*.60,s*.12);
  ctx.restore();
}
function drawNpc(n){
  const x=n.x*W,y=n.y*H;const s=Math.max(14,Math.min(W,H)*.021);
  ctx.save();ctx.translate(x,y);if(!n.alive)ctx.rotate(1.12+n.tilt);else ctx.rotate(n.tilt);
  ctx.globalAlpha=n.alive?1:.72;
  ctx.fillStyle='#f0c7a3';ctx.beginPath();ctx.arc(0,-s*.75,s*.44,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#3a3336';ctx.beginPath();ctx.arc(0,-s*.84,s*.44,Math.PI,0);ctx.fill();
  roundedRect(-s*.38,-s*.28,s*.76,s*.92,s*.18,n.alive?n.color:'#6d6d73');
  ctx.strokeStyle='#283443';ctx.lineWidth=Math.max(2,s*.10);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-s*.20,s*.60);ctx.lineTo(-s*.21,s*.96);ctx.moveTo(s*.20,s*.60);ctx.lineTo(s*.21,s*.96);ctx.stroke();
  if(!n.alive){ctx.strokeStyle='rgba(180,30,45,.72)';ctx.lineWidth=Math.max(2,s*.08);ctx.beginPath();ctx.moveTo(s*.25,-s*.25);ctx.lineTo(s*.62,-s*.55);ctx.stroke()}
  ctx.restore();
}
function drawNpcs(){for(const n of state.npcs)drawNpc(n)}
function drawPlayer(){
  const p=playerWorld();const s=Math.max(24,Math.min(W,H)*.035);const danger=state.running&&visionContainsPlayer();
  ctx.save();ctx.translate(p.x,p.y);
  if(danger){ctx.beginPath();ctx.arc(0,0,s*1.65,0,Math.PI*2);ctx.fillStyle='rgba(245,47,65,.18)';ctx.fill()}
  ctx.fillStyle='#ffd7b8';ctx.beginPath();ctx.arc(0,-s*.75,s*.48,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#3c2f2d';ctx.beginPath();ctx.arc(0,-s*.88,s*.49,Math.PI,0);ctx.fill();
  roundedRect(-s*.42,-s*.25,s*.84,s*1.0,s*.2,'#2daea1');
  ctx.fillStyle='#fff';ctx.font='900 '+Math.round(s*.48)+'px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('S',0,s*.23);
  ctx.strokeStyle='#29384b';ctx.lineWidth=Math.max(3,s*.11);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-s*.23,s*.7);ctx.lineTo(-s*.25,s*1.10);ctx.moveTo(s*.23,s*.7);ctx.lineTo(s*.25,s*1.10);ctx.stroke();ctx.restore();
}
function drawFinish(){const y=H*.238;ctx.strokeStyle='rgba(242,66,77,.9)';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(W*.20,y);ctx.lineTo(W*.80,y);ctx.stroke()}
function draw(){ctx.clearRect(0,0,W,H);drawSkyGround();drawFinish();drawVisionCone();drawNpcs();drawBoss();drawPlayer()}
function loop(ts){update(ts);draw();if(state.running&&state.alive)requestAnimationFrame(loop);else draw()}

reset();draw();
})();