/* Sunny Mouse fish challenge: levels 27–50, silent and offline, using original GCompris sprites. */
(function(root){
"use strict";
const images=["f01.webp","f02.webp","f03.webp","f04.webp","f05.webp","f06.webp","f07.webp","f08.webp","f09.webp","f10.webp","f11.webp","f12.webp","cichlid1.webp","discus2.webp","blueking2.webp"];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),rand=(a,b)=>a+Math.random()*(b-a);
function rules(level,mobile){
 if(!Number.isInteger(level)||level<27||level>50)throw new RangeError("Level 27–50 required");
 const expert=level>=41,k=level-(expert?41:27);
 const x=expert
  ? {level,expert,total:28+2*k,concurrent:Math.min(11,7+Math.floor(k/2)),
     width:38-k,speed:260+19*k,time:80-3.2*k,dodge:1,zigzag:1,burst:1,missPenalty:1+Math.floor(k/3)*.25}
  : {level,expert,total:18+Math.floor(k*.7),concurrent:Math.min(10,7+Math.floor(k/4)),
     width:57-Math.floor(k*1.35),speed:130+k*9,time:130-k*3.3,
     dodge:level>=35?.6:0,zigzag:level>=32?.5:0,burst:level>=38?.5:0,missPenalty:0};
 if(mobile){x.width=Math.max(33,x.width+5);x.speed=Math.round(x.speed*.77);x.time=Math.round(x.time*1.24)}
 // Double the original time limit on desktop and mobile alike.
 // Levels 1–26 have no timer and remain unlimited in the parent game.
 x.time*=2;
 return x;
}
function launch(args){
 const level=args.level,area=args.area,cfg=rules(level,!!args.mobile);
 let remaining=cfg.total,created=0,fish=[],ended=false,hidden=document.hidden,raf=0,last=0,left=cfg.time;
 let cursor={x:-9999,y:-9999,present:false};
 const count=document.createElement("strong"),timer=document.createElement("strong"),hud=document.createElement("div");
 hud.className="fish-challenge-hud";
 hud.style.cssText="position:absolute;top:10px;left:10px;right:10px;z-index:5;display:flex;justify-content:space-between;gap:10px;pointer-events:none";
 for(const t of [count,timer])t.style.cssText="background:#fffdf1ee;border-radius:22px;padding:7px 11px;font-size:clamp(12px,2vw,17px);font-variant-numeric:tabular-nums;color:#235a66;box-shadow:0 2px 6px #1734";
 hud.append(count,timer);area.append(hud);
 area.style.background='center / cover no-repeat url("'+args.resource("sea"+(1+(level-1)%6)+".webp")+'"),#145d81';
 const listeners=[],listen=(el,type,fn)=>{el.addEventListener(type,fn);listeners.push(()=>el.removeEventListener(type,fn))};
 const clock=seconds=>{const v=Math.max(0,Math.ceil(seconds));return String(Math.floor(v/60)).padStart(2,"0")+":"+String(v%60).padStart(2,"0")};
 function refresh(){count.textContent="🐟 Còn "+remaining+" / "+cfg.total;timer.textContent="⏳ "+clock(left);timer.style.color=left<=12?"#c3344a":"#235a66"}
 function finish(win){if(ended)return;ended=true;cancelAnimationFrame(raf);if(win)args.onWin();else args.onLose({remaining,total:cfg.total})}
 function place(w,h){
  const r=area.getBoundingClientRect(),mx=Math.max(0,r.width-w),my=Math.max(60,r.height-h);
  let p={x:rand(0,mx),y:rand(60,my)};
  for(let j=0;j<25;j++){
   const candidate={x:rand(0,mx),y:rand(60,my)};
   if(fish.every(f=>Math.hypot(candidate.x-f.x,candidate.y-f.y)>Math.max(w,f.w)*1.35)){p=candidate;break}
  }
  return p;
 }
 function spawn(){
  if(ended||created>=cfg.total)return;
  const w=cfg.width*rand(.94,1.06),h=w*.68,p=place(w,h),el=document.createElement("div");
  el.className="fish fish-expert";
  el.style.cssText="position:absolute;left:0;top:0;cursor:crosshair;touch-action:manipulation;will-change:transform;background-repeat:no-repeat;background-size:200% 100%;z-index:1";
  el.style.width=w+"px";el.style.height=h+"px";
  el.style.backgroundImage='url("'+args.resource(images[(created*7+level)%images.length])+'")';
  const speed=cfg.speed*rand(.83,1.17),dir=Math.random()<.5?-1:1;
  const f={el,x:p.x,y:p.y,w,h,vx:speed*dir,vy:rand(-.32,.32)*speed,seed:rand(0,Math.PI*2),phase:rand(0,5),frame:-1};
  el.style.transform="translate3d("+f.x+"px,"+f.y+"px,0)";
  listen(el,"pointerdown",e=>{
   if(ended||!el.isConnected)return;
   e.preventDefault();e.stopPropagation();
   el.remove();const i=fish.indexOf(f);if(i>=0)fish.splice(i,1);
   remaining--;args.onUpdate("Đã bắt "+(cfg.total-remaining)+" / "+cfg.total+" con cá.");
   if(!remaining){finish(true);return}
   spawn();refresh();
  });
  fish.push(f);area.append(el);created++;
 }
 listen(area,"pointermove",e=>{
  const r=area.getBoundingClientRect();cursor={x:e.clientX-r.left,y:e.clientY-r.top,present:e.pointerType==="mouse"||e.pointerType==="pen"}
 });
 listen(area,"pointerleave",()=>{cursor.present=false});
 listen(area,"pointerdown",e=>{
  if(ended||!cfg.missPenalty||e.target!==area)return;
  left=Math.max(0,left-cfg.missPenalty);args.onUpdate("Nhấp hụt! Bị trừ thời gian.");refresh();
  if(left<=0)finish(false);
 });
 listen(document,"visibilitychange",()=>{hidden=document.hidden;last=0});
 for(let i=0;i<Math.min(cfg.concurrent,cfg.total);i++)spawn();
 refresh();
 args.onUpdate(cfg.expert?"Thử thách người lớn: cá né chuột, đổi hướng nhanh; nhấp hụt bị trừ thời gian.":"Màn nâng cao: bắt hết cá trước khi hết giờ!");
 function tick(now){
  if(ended)return;
  if(hidden){last=0;raf=requestAnimationFrame(tick);return}
  const dt=last?clamp((now-last)/1000,0,.05):0;
  last=now;
  if(dt){
   left-=dt;if(left<=0){left=0;refresh();finish(false);return}
   const b=area.getBoundingClientRect(),t=now*.001;
   for(const f of fish){
    let vx=f.vx,vy=f.vy;
    if(cfg.zigzag)vy+=Math.sin(t*(2+cfg.zigzag)+f.seed)*cfg.speed*.55*dt;
    if(cfg.dodge&&cursor.present){
     const dx=f.x+f.w/2-cursor.x,dy=f.y+f.h/2-cursor.y,dist=Math.hypot(dx,dy);
     if(dist<115&&dist>1){
      const power=(1-dist/115)*cfg.speed*cfg.dodge;
      vx+=(dx/dist)*power*dt*3;vy+=(dy/dist)*power*dt*3;
     }
    }
    let dash=1;
    if(cfg.burst&&(t*.8+f.phase)%3.6<.37)dash+=.32*cfg.burst;
    f.vx=clamp(vx,-cfg.speed*1.15,cfg.speed*1.15);
    f.vy=clamp(vy,-cfg.speed*.8,cfg.speed*.8);
    f.x+=f.vx*dash*dt;f.y+=f.vy*dash*dt;
    const right=Math.max(0,b.width-f.w),top=Math.min(60,Math.max(0,b.height-f.h)),bottom=Math.max(top,b.height-f.h);
    if(f.x<0){f.x=0;f.vx=Math.abs(f.vx)}
    if(f.x>right){f.x=right;f.vx=-Math.abs(f.vx)}
    if(f.y<top){f.y=top;f.vy=Math.abs(f.vy)}
    if(f.y>bottom){f.y=bottom;f.vy=-Math.abs(f.vy)}
    f.el.style.transform="translate3d("+f.x.toFixed(1)+"px,"+f.y.toFixed(1)+"px,0) scaleX("+(f.vx<0?-1:1)+")";
    const frame=Math.floor(now/230+f.seed*10)%2;
    if(frame!==f.frame){f.el.style.backgroundPosition=frame?"100% 0":"0 0";f.frame=frame}
   }
   refresh();
  }
  raf=requestAnimationFrame(tick);
 }
 raf=requestAnimationFrame(tick);
 return function dispose(){
  ended=true;cancelAnimationFrame(raf);
  for(const off of listeners)off();
  for(const f of fish)f.el.remove();
  fish=[];hud.remove();
 };
}
root.SunnyFishChallenge={rules,launch,MIN_LEVEL:27,MAX_LEVEL:50};
})(window);
