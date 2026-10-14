// Sunny Maze: 30 màn tăng dần độ khó, mê cung sinh ngẫu nhiên và điều khiển vuốt.
(function(){
'use strict';
var LEVELS=[
 {n:3,t:'Rất dễ',hint:'Màn đầu tiên: chỉ vài bước ngắn'},
 {n:3,t:'Rất dễ',hint:'Vuốt nhẹ theo lối đi đơn giản'},
 {n:3,t:'Rất dễ',hint:'Tìm ngôi sao ngay trước mắt'},
 {n:4,t:'Rất dễ',hint:'Mê cung nhỏ để làm quen'},
 {n:4,t:'Rất dễ',hint:'Đi từng ô một thật chậm'},
 {n:4,t:'Rất dễ',hint:'Quan sát lối đi ngắn'},
 {n:5,t:'Rất dễ',hint:'Thử tìm đường qua một ngã rẽ'},
 {n:5,t:'Rất dễ',hint:'Theo hành lang đến ngôi sao'},
 {n:5,t:'Rất dễ',hint:'Có thêm một vài đoạn rẽ'},
 {n:5,t:'Rất dễ',hint:'Hoàn thành 10 màn khởi động'},
 {n:5,t:'Dễ',hint:'Mê cung nhỏ với vài ngã rẽ'},
 {n:5,t:'Dễ',hint:'Chú ý các góc rẽ'},
 {n:7,t:'Dễ',hint:'Đường đi dài hơn một chút'},
 {n:7,t:'Dễ',hint:'Quan sát trước khi rẽ'},
 {n:7,t:'Dễ',hint:'Thử nhớ lối vừa đi qua'},
 {n:7,t:'Dễ',hint:'Tìm đường qua các hành lang'},
 {n:9,t:'Dễ',hint:'Mê cung rộng hơn một chút'},
 {n:9,t:'Dễ',hint:'Cẩn thận các lối cụt'},
 {n:9,t:'Dễ',hint:'Kiên nhẫn tìm đường đến đích'},
 {n:9,t:'Dễ',hint:'Hoàn thành nhóm 10 màn dễ'},
 
 {n:5,t:'Rất dễ',hint:'Mê cung nhỏ, làm quen cách vuốt'},
 {n:5,t:'Rất dễ',hint:'Tìm đường trong mê cung nhỏ'},
 {n:7,t:'Rất dễ',hint:'Thêm vài ngã rẽ'},
 {n:7,t:'Rất dễ',hint:'Quan sát các lối đi'},
 {n:7,t:'Dễ',hint:'Bắt đầu có đường cụt'},
 {n:9,t:'Dễ',hint:'Thử nhớ đường đã đi'},
 {n:9,t:'Dễ',hint:'Đi qua nhiều ngã rẽ hơn'},
 {n:9,t:'Dễ',hint:'Chú ý hướng đi ở mỗi góc'},
 {n:11,t:'Dễ',hint:'Mê cung rộng hơn một chút'},
 {n:11,t:'Dễ',hint:'Kiên nhẫn tìm lối ra'},
 {n:11,t:'Trung bình',hint:'Có nhiều đường cụt hơn'},
 {n:13,t:'Trung bình',hint:'Quan sát kỹ trước khi rẽ'},
 {n:13,t:'Trung bình',hint:'Đừng ngại quay lại'},
 {n:13,t:'Trung bình',hint:'Lập kế hoạch qua các ngã rẽ'},
 {n:15,t:'Trung bình',hint:'Mê cung lớn hơn'},
 {n:15,t:'Trung bình',hint:'Tìm đường qua nhiều nhánh'},
 {n:15,t:'Khá khó',hint:'Cẩn thận các lối rẽ gần nhau'},
 {n:17,t:'Khá khó',hint:'Nhìn xa hơn trước khi đi'},
 {n:17,t:'Khá khó',hint:'Có nhiều đoạn quanh co'},
 {n:17,t:'Khá khó',hint:'Đường đi dài hơn'},
 {n:19,t:'Khó',hint:'Cần quan sát và kiên nhẫn'},
 {n:19,t:'Khó',hint:'Nhiều nhánh để lựa chọn'},
 {n:21,t:'Khó',hint:'Mê cung rộng, hãy đi từng đoạn'},
 {n:21,t:'Khó',hint:'Tìm lối nối đến khu vực tiếp theo'},
 {n:23,t:'Khó',hint:'Đừng để các ngã rẽ đánh lừa'},
 {n:23,t:'Rất khó',hint:'Đường đi dài và nhiều nhánh'},
 {n:25,t:'Rất khó',hint:'Quan sát thật kỹ từng lối'},
 {n:25,t:'Rất khó',hint:'Mê cung lớn dành cho người kiên trì'},
 {n:27,t:'Thử thách',hint:'Màn lớn với nhiều lựa chọn'},
 {n:29,t:'Thử thách',hint:'Mê cung lớn nhất trong bộ 30 màn'}
];
var canvas=document.getElementById('maze'),ctx=canvas.getContext('2d');
var statusEl=document.getElementById('status'),stepsEl=document.getElementById('steps'),winEl=document.getElementById('win');
var select=document.getElementById('levelSelect'),desc=document.getElementById('levelDescription'),progressEl=document.getElementById('progress'),progressBar=document.getElementById('progressBar');
var STATE_KEY='sunnyMazeStateV2',restored=false;
var level=0,n=5,cells=[],start=[0,0],goal=[4,4],trail=[],dpr=1,cellSize=1,dragging=false,pointerId=null,won=false,lastCell=null,completed=loadCompleted();
for(var li=20;li<LEVELS.length;li++){var sz=LEVELS[li].n;LEVELS[li].t=sz<=7?'Dễ':sz<=13?'Trung bình':sz<=19?'Khá khó':sz<=23?'Khó':'Rất khó';}
function same(a,b){return !!a&&!!b&&a[0]===b[0]&&a[1]===b[1];}
function loadCompleted(){try{var saved=localStorage.getItem(STATE_KEY);if(saved){var s=JSON.parse(saved);return Array.isArray(s.completed)?s.completed.filter(function(x){return Number.isInteger(x)&&x>=0&&x<LEVELS.length;}):[];}var old=JSON.parse(localStorage.getItem('sunnyMazeCompleted')||'[]');return old.filter(function(x){return Number.isInteger(x)&&x>=0&&x<30;}).map(function(x){return x+20;});}catch(e){return [];}}
function saveCompleted(){saveState();}
function saveState(){try{localStorage.setItem(STATE_KEY,JSON.stringify({level:level,completed:completed,n:n,cells:cells,start:start,goal:goal,trail:trail,won:won}));}catch(e){}}
function restoreState(){try{var raw=localStorage.getItem(STATE_KEY);if(!raw)return false;var s=JSON.parse(raw);if(!s||!Number.isInteger(s.level)||s.level<0||s.level>=LEVELS.length||!Array.isArray(s.cells)||!s.cells.length)return false;level=s.level;n=LEVELS[level].n;if(s.n!==n||s.cells.length!==n||!Array.isArray(s.start)||!Array.isArray(s.goal))return false;cells=s.cells;start=s.start;goal=s.goal;trail=Array.isArray(s.trail)?s.trail:[];won=!!s.won;dragging=false;pointerId=null;lastCell=null;restored=true;winEl.classList.toggle('hidden',!won);if(won){document.getElementById('winText').textContent='Sunny đã hoàn thành màn '+(level+1)+' ('+LEVELS[level].t+').';document.getElementById('continue').style.display=level===LEVELS.length-1?'none':'block';statusEl.textContent='Đã đến đích!';}else{statusEl.textContent='Đã khôi phục màn đang chơi. Vuốt từ bi xanh để tiếp tục.';}desc.textContent='Màn '+(level+1)+' • '+LEVELS[level].t;select.value=String(level);return true;}catch(e){return false;}}
function updateProgress(){progressEl.textContent='Đã hoàn thành '+completed.length+'/'+LEVELS.length;progressBar.style.width=(completed.length/LEVELS.length*100)+'%';saveState();}
function buildSelect(){var groups=[{label:'Màn 1–10 • Rất dễ',a:0,b:10},{label:'Màn 11–20 • Dễ',a:10,b:20},{label:'Màn 21–30 • Dễ',a:20,b:30},{label:'Màn 31–40 • Trung bình đến khá khó',a:30,b:40},{label:'Màn 41–50 • Khó đến rất khó',a:40,b:50}];groups.forEach(function(g){var og=document.createElement('optgroup');og.label=g.label;for(var i=g.a;i<g.b;i++){var o=document.createElement('option');o.value=i;o.textContent='Màn '+(i+1)+' — '+LEVELS[i].t;og.appendChild(o);}select.appendChild(og);});}
function resize(){var r=canvas.getBoundingClientRect();dpr=Math.max(1,Math.min(3,window.devicePixelRatio||1));canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);draw();}
function generate(){
 n=LEVELS[level].n;cells=[];for(var x=0;x<n;x++){cells[x]=[];for(var y=0;y<n;y++)cells[x][y]={open:0,seen:false};}
 // Randomized depth-first search: every cell is reachable and there are no broken walls.
 var stack=[[0,0]];cells[0][0].seen=true;
 while(stack.length){var p=stack[stack.length-1],x=p[0],y=p[1],opts=[];
 [[0,-1,4,8],[1,0,2,1],[0,1,8,4],[-1,0,1,2]].forEach(function(d){var xx=x+d[0],yy=y+d[1];if(xx>=0&&yy>=0&&xx<n&&yy<n&&!cells[xx][yy].seen)opts.push([xx,yy,d[2],d[3]]);});
 if(!opts.length){stack.pop();continue;}var d=opts[(Math.random()*opts.length)|0];cells[x][y].open|=d[2];cells[d[0]][d[1]].open|=d[3];cells[d[0]][d[1]].seen=true;stack.push([d[0],d[1]]);
 }
 start=[0,0];goal=[n-1,n-1];trail=[];won=false;dragging=false;pointerId=null;lastCell=null;winEl.classList.add('hidden');
 statusEl.textContent='Chạm vào bi xanh để bắt đầu';desc.textContent='Màn '+(level+1)+' • '+LEVELS[level].t;select.value=String(level);draw();saveState();
}
function draw(){
 var r=canvas.getBoundingClientRect(),w=r.width,h=r.height;if(!w||!h)return;
 var side=Math.min(w,h),ox=(w-side)/2,oy=(h-side)/2;cellSize=side/n;
 ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);ctx.fillStyle='#fffdf8';ctx.fillRect(0,0,w,h);
 ctx.save();ctx.translate(ox,oy);
 // Very light corridor cells and distinct walls make the route easier for young children to see.
 ctx.fillStyle='#fffaf0';ctx.fillRect(0,0,side,side);
 ctx.strokeStyle='#8c657b';ctx.lineWidth=Math.max(1.5,cellSize*.095);ctx.lineCap='round';ctx.lineJoin='round';
 ctx.beginPath();
 for(var x=0;x<n;x++)for(var y=0;y<n;y++){
  var c=cells[x][y],x0=x*cellSize,y0=y*cellSize,x1=x0+cellSize,y1=y0+cellSize;
  if(!(c.open&4)){ctx.moveTo(x0,y0);ctx.lineTo(x1,y0);}
  if(!(c.open&1)){ctx.moveTo(x0,y0);ctx.lineTo(x0,y1);}
  if(x===n-1){ctx.moveTo(x1,y0);ctx.lineTo(x1,y1);}
  if(y===n-1){ctx.moveTo(x0,y1);ctx.lineTo(x1,y1);}
 }
 ctx.stroke();
 // Highlight route taken so far.
 if(trail.length){ctx.strokeStyle='#ff9fc7';ctx.lineWidth=Math.max(2.5,cellSize*.32);ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo((trail[0][0]+.5)*cellSize,(trail[0][1]+.5)*cellSize);for(var j=1;j<trail.length;j++)ctx.lineTo((trail[j][0]+.5)*cellSize,(trail[j][1]+.5)*cellSize);ctx.lineTo((start[0]+.5)*cellSize,(start[1]+.5)*cellSize);ctx.stroke();}
 // Goal marker.
 ctx.fillStyle='#40c982';ctx.strokeStyle='#13794a';ctx.lineWidth=Math.max(1,cellSize*.06);ctx.beginPath();for(var k=0;k<10;k++){var rr=k%2?cellSize*.19:cellSize*.38,a=-Math.PI/2+k*Math.PI/5,px=(goal[0]+.5)*cellSize+Math.cos(a)*rr,py=(goal[1]+.5)*cellSize+Math.sin(a)*rr;if(k===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}ctx.closePath();ctx.fill();ctx.stroke();
 // Start/current marker.
 ctx.beginPath();ctx.arc((start[0]+.5)*cellSize,(start[1]+.5)*cellSize,Math.max(3,cellSize*.3),0,Math.PI*2);ctx.fillStyle='#6ba5e8';ctx.fill();ctx.lineWidth=Math.max(1,cellSize*.07);ctx.strokeStyle='#245b99';ctx.stroke();
 ctx.restore();stepsEl.textContent=trail.length+' bước';
}
function maskFor(dx,dy){if(dx===-1&&dy===0)return 1;if(dx===1&&dy===0)return 2;if(dx===0&&dy===-1)return 4;if(dx===0&&dy===1)return 8;return 0;}
function moveTo(x,y){if(won||x<0||y<0||x>=n||y>=n)return false;var dx=x-start[0],dy=y-start[1];if(Math.abs(dx)+Math.abs(dy)!==1)return false;if(!(cells[start[0]][start[1]].open&maskFor(dx,dy)))return false;
 if(trail.length&&same([x,y],trail[trail.length-1]))trail.pop();else trail.push(start.slice());start=[x,y];draw();
 if(same(start,goal)){won=true;dragging=false;if(completed.indexOf(level)<0){completed.push(level);}saveCompleted();updateProgress();statusEl.textContent='Đã đến đích!';document.getElementById('winText').textContent='Sunny đã hoàn thành màn '+(level+1)+' ('+LEVELS[level].t+').';document.getElementById('continue').style.display=level===LEVELS.length-1?'none':'block';winEl.classList.remove('hidden');}
 return true;
}
function pointToCell(e){var r=canvas.getBoundingClientRect(),side=Math.min(r.width,r.height),ox=(r.width-side)/2,oy=(r.height-side)/2;return [Math.floor((e.clientX-r.left-ox)/side*n),Math.floor((e.clientY-r.top-oy)/side*n)];}
function traceTo(target){if(!target||target[0]<0||target[1]<0||target[0]>=n||target[1]>=n)return;var dx=target[0]-start[0],dy=target[1]-start[1];if(!dx&&!dy)return;
 // Step along the swipe one adjacent cell at a time; every move is checked against a corridor.
 var ax=Math.abs(dx),ay=Math.abs(dy),sx=Math.sign(dx),sy=Math.sign(dy),err=ax-ay,x=start[0],y=start[1],guard=n*2;
 while((x!==target[0]||y!==target[1])&&guard-->0&&!won){var e2=2*err,nx=x,ny=y;if(e2>-ay&&x!==target[0]){err-=ay;nx+=sx;}else if(y!==target[1]){err+=ax;ny+=sy;}if(nx===x&&ny===y)break;if(!moveTo(nx,ny))break;x=start[0];y=start[1];}
}
function down(e){if(won)return;var c=pointToCell(e);if(!same(c,start)){statusEl.textContent='Hãy chạm đúng vào bi xanh để bắt đầu';return;}dragging=true;pointerId=e.pointerId;lastCell=c;try{canvas.setPointerCapture(e.pointerId);}catch(_){}statusEl.textContent='Đang tô đường…';e.preventDefault();}
function move(e){if(!dragging||e.pointerId!==pointerId||won)return;var c=pointToCell(e);if(!same(c,lastCell)){traceTo(c);lastCell=c;}e.preventDefault();}
function up(e){if(!dragging||e.pointerId!==pointerId)return;dragging=false;pointerId=null;if(!won)statusEl.textContent='Vuốt tiếp từ bi xanh để tìm đường';}
function setLevel(i){level=Math.max(0,Math.min(LEVELS.length-1,i));saveState();generate();}
buildSelect();select.addEventListener('change',function(){setLevel(Number(select.value));});document.getElementById('prevLevel').addEventListener('click',function(){setLevel(level-1);});document.getElementById('nextLevel').addEventListener('click',function(){setLevel(level+1);});document.getElementById('newMaze').addEventListener('click',generate);document.getElementById('playAgain').addEventListener('click',generate);document.getElementById('continue').addEventListener('click',function(){setLevel(level+1);});canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);window.addEventListener('resize',resize);window.addEventListener('orientationchange',function(){setTimeout(resize,80);});if(!restoreState())generate();else{draw();}updateProgress();resize();
window.addEventListener('pagehide',saveState);window.addEventListener('beforeunload',saveState);document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden')saveState();});
var edgeTouch=null;document.addEventListener('touchstart',function(e){if(e.touches&&e.touches.length===1){var t=e.touches[0];edgeTouch={x:t.clientX,y:t.clientY,edge:t.clientX<28||t.clientX>window.innerWidth-28};}}, {passive:true,capture:true});document.addEventListener('touchmove',function(e){if(!edgeTouch||!edgeTouch.edge||!e.touches||!e.touches.length)return;var t=e.touches[0],dx=t.clientX-edgeTouch.x,dy=t.clientY-edgeTouch.y;if(Math.abs(dx)>Math.abs(dy)&&Math.abs(dx)>6)e.preventDefault();},{passive:false,capture:true});document.addEventListener('touchend',function(){edgeTouch=null;},{passive:true,capture:true});document.addEventListener('touchcancel',function(){edgeTouch=null;},{passive:true,capture:true});
})();