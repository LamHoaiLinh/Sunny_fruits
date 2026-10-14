// Sunny Maze — giữ nguyên bộ sinh mê cung Randomized Prim của AMAZE.
(function(){
'use strict';
var dimensions=35,cells=[],start=[0,0],end=[0,0],path=[],canvas=document.getElementById('maze'),ctx=canvas.getContext('2d');
var statusEl=document.getElementById('status'),stepsEl=document.getElementById('steps'),winEl=document.getElementById('win');
var cellSize=1,boardSize=1,dpr=1,dragging=false,pointerId=null,won=false,lastCell=null;
function round(v){return (v+0.5)|0;}
function same(a,b){return a&&b&&a[0]===b[0]&&a[1]===b[1];}
function resize(){
 var rect=canvas.getBoundingClientRect();dpr=Math.max(1,Math.min(3,window.devicePixelRatio||1));
 boardSize=Math.min(rect.width,rect.height);canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);
 ctx.setTransform(dpr,0,0,dpr,0,0);draw();
}
function draw(){
 var rect=canvas.getBoundingClientRect(),w=rect.width,h=rect.height;boardSize=Math.min(w,h);cellSize=boardSize/dimensions;
 ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);ctx.fillStyle='#27262d';ctx.fillRect(0,0,w,h);
 // Corridor lines and walls retain the original AMAZE cell-mask representation.
 ctx.save();ctx.translate((w-boardSize)/2,(h-boardSize)/2);ctx.strokeStyle='#fffafc';ctx.lineCap='square';ctx.lineJoin='miter';ctx.lineWidth=Math.max(.7,cellSize*.075);
 cells.forEach(function(col,x){col.forEach(function(mask,y){ctx.beginPath();if(mask&1)ctx.moveTo((x+.5)*cellSize,(y+.5)*cellSize),ctx.lineTo((x-.5)*cellSize,(y+.5)*cellSize);if(mask&2)ctx.moveTo((x+.5)*cellSize,(y+.5)*cellSize),ctx.lineTo((x+1.5)*cellSize,(y+.5)*cellSize);if(mask&4)ctx.moveTo((x+.5)*cellSize,(y+.5)*cellSize),ctx.lineTo((x+.5)*cellSize,(y-.5)*cellSize);if(mask&8)ctx.moveTo((x+.5)*cellSize,(y+.5)*cellSize),ctx.lineTo((x+.5)*cellSize,(y+1.5)*cellSize);ctx.stroke();});});
 // Show a soft, thick trace of every valid step.
 if(path.length){ctx.strokeStyle='#ff9fc6';ctx.lineWidth=Math.max(2,cellSize*.28);ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo((path[0][0]+.5)*cellSize,(path[0][1]+.5)*cellSize);path.forEach(function(p){ctx.lineTo((p[0]+.5)*cellSize,(p[1]+.5)*cellSize);});ctx.lineTo((start[0]+.5)*cellSize,(start[1]+.5)*cellSize);ctx.stroke();}
 // Goal star.
 ctx.fillStyle='#48d18a';ctx.strokeStyle='#147c4a';ctx.lineWidth=Math.max(1,cellSize*.06);ctx.beginPath();for(var i=0;i<10;i++){var r=i%2?cellSize*.18:cellSize*.36,a=-Math.PI/2+i*Math.PI/5,x=(end[0]+.5)*cellSize+Math.cos(a)*r,y=(end[1]+.5)*cellSize+Math.sin(a)*r;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.closePath();ctx.fill();ctx.stroke();
 // Start marker.
 ctx.beginPath();ctx.arc((start[0]+.5)*cellSize,(start[1]+.5)*cellSize,cellSize*.29,0,Math.PI*2);ctx.fillStyle='#6ba5e8';ctx.fill();ctx.lineWidth=Math.max(1,cellSize*.07);ctx.strokeStyle='#174e91';ctx.stroke();
 ctx.restore();
 stepsEl.textContent=path.length+' bước';
}
function getWalls(x,y){var walls=[];[[x-1,y,1],[x+1,y,2],[x,y-1,4],[x,y+1,8]].forEach(function(n){if(n[0]>-1&&n[0]<dimensions&&n[1]>-1&&n[1]<dimensions&&cells[n[0]][n[1]]===0)walls.push([[x,y],n]);});return walls;}
function reset(){
 cells=[];for(var x=0;x<dimensions;x++){cells.push([]);for(var y=0;y<dimensions;y++)cells[x].push(0);}
 var walls=getWalls(round(Math.random()*(dimensions-1)),round(Math.random()*(dimensions-1)));
 while(walls.length){var index=(Math.random()*walls.length)|0,from=walls[index][0],to=walls[index][1];walls.splice(index,1);if(cells[to[0]][to[1]]===0){cells[from[0]][from[1]]|=to[2];cells[to[0]][to[1]]|=(to[2]+1)%3===0?to[2]>>1:to[2]<<1;walls=walls.concat(getWalls(to[0],to[1]));}}
 if(round(Math.random())){start=[round(Math.random())*(dimensions-1),round(Math.random()*(dimensions-1))];end=[start[0]?0:dimensions-1,round(Math.random()*(dimensions-1))];}
 else{start=[round(Math.random()*(dimensions-1)),round(Math.random())*(dimensions-1)];end=[round(Math.random()*(dimensions-1)),start[1]?0:dimensions-1];}
 path=[];won=false;dragging=false;lastCell=null;winEl.classList.add('hidden');statusEl.textContent='Đặt tay lên bi xanh để bắt đầu';draw();
}
function neighborMask(dx,dy){if(dx===-1&&dy===0)return 1;if(dx===1&&dy===0)return 2;if(dx===0&&dy===-1)return 4;if(dx===0&&dy===1)return 8;return 0;}
function stepTo(x,y){
 if(won||x<0||y<0||x>=dimensions||y>=dimensions)return false;
 var dx=x-start[0],dy=y-start[1];if(Math.abs(dx)+Math.abs(dy)!==1)return false;
 var mask=neighborMask(dx,dy);if(!(cells[start[0]][start[1]]&mask))return false;
 if(path.length&&same([x,y],path[path.length-1]))path.pop();else path.push(start.slice());
 start=[x,y];draw();
 if(same(start,end)){won=true;dragging=false;statusEl.textContent='Đã đến đích!';winEl.classList.remove('hidden');}
 return true;
}
function pointToCell(e){var r=canvas.getBoundingClientRect(),side=Math.min(r.width,r.height),ox=(r.width-side)/2,oy=(r.height-side)/2;var x=(e.clientX-r.left-ox)/side*dimensions,y=(e.clientY-r.top-oy)/side*dimensions;return [Math.floor(x),Math.floor(y)];}
// Walk every grid cell crossed by a quick swipe, validating each adjacent step.
function traceTo(target){
 if(!target||target[0]<0||target[1]<0||target[0]>=dimensions||target[1]>=dimensions)return;
 var dx=target[0]-start[0],dy=target[1]-start[1];if(dx===0&&dy===0)return;
 // When a pointer jumps across multiple cells, follow the dominant swipe axis first;
 // this avoids skipping cells or crossing a wall in a single event.
 var ax=Math.abs(dx),ay=Math.abs(dy),sx=Math.sign(dx),sy=Math.sign(dy),x=start[0],y=start[1],err=ax-ay;
 var guard=dimensions*2;
 while((x!==target[0]||y!==target[1])&&guard-->0&&!won){
  var e2=2*err,nx=x,ny=y;
  if(e2>-ay&&x!==target[0]){err-=ay;nx+=sx;}
  else if(y!==target[1]){err+=ax;ny+=sy;}
  if(nx===x&&ny===y)break;
  if(!stepTo(nx,ny))break;x=nx;y=ny;
 }
}
function onDown(e){
 if(won)return;var c=pointToCell(e);
 // Require the first touch to be on or very near the current blue marker.
 if(c[0]!==start[0]||c[1]!==start[1]){statusEl.textContent='Hãy chạm đúng vào bi xanh để kéo đường đi';return;}
 dragging=true;pointerId=e.pointerId;lastCell=c;canvas.setPointerCapture(e.pointerId);statusEl.textContent='Đang tô đường…';e.preventDefault();
}
function onMove(e){if(!dragging||e.pointerId!==pointerId||won)return;var c=pointToCell(e);if(!same(c,lastCell)){traceTo(c);lastCell=c;}e.preventDefault();}
function onUp(e){if(!dragging||e.pointerId!==pointerId)return;dragging=false;pointerId=null;if(!won)statusEl.textContent='Vuốt tiếp từ bi xanh để tìm đường';try{if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);}catch(_){}}
canvas.addEventListener('pointerdown',onDown);canvas.addEventListener('pointermove',onMove);canvas.addEventListener('pointerup',onUp);canvas.addEventListener('pointercancel',onUp);
document.getElementById('newMaze').addEventListener('click',reset);document.getElementById('playAgain').addEventListener('click',reset);
window.addEventListener('resize',resize);window.addEventListener('orientationchange',function(){setTimeout(resize,80);});
reset();resize();
})();