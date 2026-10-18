/* 50 deterministic, offline, original Sunny spot-the-difference illustrations.
   Each scene has two independently rendered SVG pictures with 5–9 verified changes.
   Coordinates, art and answers share the same fixed 600×400 coordinate system.
*/
const W=600,H=400;
const T=[
 ["Vườn cổ tích",["Vườn cầu vồng","Khu vườn buổi sáng","Bữa tiệc hoa","Con đường bướm","Vườn xanh kỳ diệu"],["flower","butterfly","mushroom","apple","bee","rabbit"],["#d5f6ff","#a4e4b2","#69c896"]],
 ["Thế giới đại dương",["Rạn san hô nhỏ","Đàn cá vui đùa","Vịnh ngọc trai","Bờ biển xanh","Kho báu dưới nước"],["fish","shell","crab","turtle","star","boat"],["#c4f2ff","#7cdaed","#48abc8"]],
 ["Thành phố tí hon",["Phố xe nhiều màu","Quảng trường nhỏ","Ngày hội giao thông","Khu phố vui vẻ","Chuyến xe cuối tuần"],["car","house","balloon","tree","star","gift"],["#d6efff","#b6ded3","#8dbf90"]],
 ["Nông trại Sunny",["Ngày mùa bội thu","Vườn trái chín","Ngôi nhà nông trại","Bạn bè đồng quê","Cánh đồng ngập nắng"],["apple","duck","flower","tree","rabbit","mushroom"],["#e0f4ff","#bce5ac","#8cd09a"]],
 ["Không gian mơ ước",["Những vì sao sáng","Tàu bay khởi hành","Hành tinh ngọt ngào","Cuộc gặp người máy","Dải ngân hà lung linh"],["rocket","planet","star","robot","ufo","gift"],["#343b80","#283b72","#1f2d5b"]],
 ["Rừng thông tuyết",["Người tuyết vui vẻ","Chim cánh cụt nhỏ","Dấu chân trên tuyết","Rừng băng trắng","Lễ hội mùa đông"],["snowman","pine","penguin","star","gift","rabbit"],["#d7f3ff","#eaf9ff","#bddef4"]],
 ["Khu vui chơi",["Bóng bay bay cao","Hội chợ sắc màu","Công viên kẹo ngọt","Đoàn tàu đồ chơi","Ngày hội trẻ thơ"],["balloon","gift","star","car","flower","heart"],["#ffe7f1","#ffd3d3","#ecafa8"]],
 ["Vương quốc động vật",["Chú mèo tinh nghịch","Thỏ trắng và bạn","Cú mèo trong rừng","Bạn vịt đáng yêu","Khu rừng thân thiện"],["cat","owl","rabbit","duck","bee","butterfly"],["#d9f4e9","#a8e1bd","#69c794"]],
 ["Đảo nhiệt đới",["Hòn đảo mùa hè","Biển xanh cát vàng","Vườn cây nhiệt đới","Buổi chiều bên đảo","Cuộc dạo chơi trên biển"],["boat","fish","sun","tree","shell","flower"],["#bdeeff","#f7dd9a","#dfbc73"]],
 ["Khám phá kỳ diệu",["Thế giới đồ chơi","Bầu trời đầy ước mơ","Những món quà","Khu vườn bí mật","Chặng cuối Sunny"],["robot","rocket","balloon","heart","star","gift"],["#e5e2ff","#d4bfff","#a2a1dc"]]
];
const ITEMS=["#f486a7","#ffbc64","#8dbae9","#8cd8a4","#b79af5","#ffe081","#ff9d73","#73cad7"];
const esc=(n)=>Number(n).toFixed(1);
const circle=(x,y,r,color,stroke="none",sw=0)=>'<circle cx="'+esc(x)+'" cy="'+esc(y)+'" r="'+esc(r)+'" fill="'+color+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>';
const ellipse=(x,y,rx,ry,color)=>'<ellipse cx="'+esc(x)+'" cy="'+esc(y)+'" rx="'+esc(rx)+'" ry="'+esc(ry)+'" fill="'+color+'"/>';
const rect=(x,y,w,h,c,rx=0)=>'<rect x="'+esc(x)+'" y="'+esc(y)+'" width="'+esc(w)+'" height="'+esc(h)+'" rx="'+esc(rx)+'" fill="'+c+'"/>';
const path=(d,c,stroke="none",w=0)=>'<path d="'+d+'" fill="'+c+'" stroke="'+stroke+'" stroke-width="'+w+'" stroke-linejoin="round" stroke-linecap="round"/>';
const line=(x,y,xx,yy,c,w=3)=>path("M"+esc(x)+" "+esc(y)+"L"+esc(xx)+" "+esc(yy),"none",c,w);
function flower(c){let s=line(0,0,0,35,"#479c72",5);for(let k=0;k<6;k++){const a=k*Math.PI/3;s+=circle(15*Math.cos(a),15*Math.sin(a),10,c)}return s+circle(0,0,8,"#ffe18e")}
function star(c){let d="";for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?14:30;d+=(i?"L":"M")+esc(r*Math.cos(a))+" "+esc(r*Math.sin(a))}return path(d+"Z",c)}
function butterfly(c){return ellipse(-16,-10,17,19,c)+ellipse(16,-10,17,19,c)+ellipse(-12,12,13,14,c)+ellipse(12,12,13,14,c)+rect(-3,-22,6,47,"#725064",3)+circle(-18,-11,5,"#fff0c0")+circle(18,-11,5,"#fff0c0")}
function fish(c){return ellipse(0,0,26,16,c)+path("M-22 0L-41 -18L-41 18Z",c)+circle(13,-4,3,"#354a62")+path("M-3 -15L7 -30L15 -13Z",c)}
function animal(kind,c){
 let face=circle(0,0,23,c)+circle(-8,-3,3,"#363a51")+circle(8,-3,3,"#363a51")+path("M-7 9Q0 16 7 9","none","#764b5a",2);
 if(kind==="cat")face+=path("M-23 -10L-23 -33L-7 -22M23 -10L23 -33L7 -22Z",c,"#f4dfce",2);
 if(kind==="rabbit")face+=ellipse(-12,-34,9,24,c)+ellipse(12,-34,9,24,c)+ellipse(-12,-35,4,15,"#ffb9c7")+ellipse(12,-35,4,15,"#ffb9c7");
 if(kind==="owl")face+=circle(-9,-2,10,"white")+circle(9,-2,10,"white")+circle(-8,-1,4,"#2f4251")+circle(8,-1,4,"#2f4251")+path("M-5 11L5 11L0 20Z","#ffbb68");
 if(kind==="duck")face+=ellipse(-14,-25,13,11,c)+ellipse(13,-25,13,11,c)+path("M0 7L26 13L0 19Z","#e7a861");
 return face;
}
function sprite(kind,c){
 switch(kind){
 case "flower":return flower(c);
 case "butterfly":return butterfly(c);
 case "star":return star(c);
 case "sun":return circle(0,0,27,c)+Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;return line(34*Math.cos(a),34*Math.sin(a),42*Math.cos(a),42*Math.sin(a),c,4)}).join("");
 case "fish":return fish(c);
 case "rabbit":case "cat":case "owl":case "duck":return animal(kind,c);
 case "bee":return ellipse(0,0,24,17,c)+rect(-14,-16,7,31,"#604659")+rect(3,-16,7,31,"#604659")+ellipse(-10,-21,11,15,"#d6eeff")+ellipse(10,-21,11,15,"#d6eeff")+circle(17,-2,3,"#333");
 case "mushroom":return rect(-9,0,18,31,"#f5e8c9",4)+path("M-32 5Q-32 -31 0 -32Q32 -31 32 5Z",c)+circle(-14,-7,6,"#fff1dd")+circle(12,-15,5,"#fff1dd");
 case "apple":return circle(-7,0,21,c)+circle(10,0,21,c)+path("M0 -15Q-3 -37 6 -40","none","#735a4b",5)+ellipse(14,-34,12,6,"#6bc38c");
 case "heart":return path("M0 30Q-42 0 -25 -20Q-12 -31 0 -13Q13 -34 26 -21Q44 0 0 30Z",c);
 case "shell":return path("M-28 19Q-44 -10 -15 -27Q0 -39 15 -27Q44 -10 28 19Z",c)+[-17,0,17].map(x=>line(x,15,x*.5,-17,"#fff5e4",3)).join("");
 case "crab":return ellipse(0,12,22,15,c)+circle(-9,-10,7,"#fff")+circle(9,-10,7,"#fff")+circle(-9,-10,3,"#333")+circle(9,-10,3,"#333")+path("M-20 5L-40 -12L-31 -20M20 5L40 -12L31 -20","none",c,7);
 case "turtle":return ellipse(0,5,29,21,c)+circle(31,2,11,"#80bf8b")+ellipse(-20,28,9,8,"#80bf8b")+ellipse(19,28,9,8,"#80bf8b")+path("M-8 -11L-8 21M9 -10L9 21","none","#fff2d2",3);
 case "boat":return path("M-34 14L35 14L23 34H-19Z",c)+line(0,-35,0,14,"#865e56",4)+path("M-3 -31V7H-35Z","#fff2d0");
 case "tree":return rect(-7,0,14,37,"#af7955",3)+circle(0,-15,27,c)+circle(-17,-6,19,c)+circle(16,-5,19,c);
 case "house":return rect(-26,-9,52,42,c,5)+path("M-34 -8L0 -36L34 -8Z","#d56d83")+rect(-8,6,16,27,"#fff0d6",2)+rect(13,0,9,12,"#fff6d9");
 case "car":return rect(-33,2,66,24,c,7)+path("M-23 4L-14 -18H16L26 4Z",c)+circle(-21,28,9,"#535269")+circle(21,28,9,"#535269");
 case "rocket":return path("M-18 16Q-24 -8 0 -39Q25 -8 18 16Z",c)+circle(0,-8,10,"#d9f3ff")+path("M-11 16L0 42L11 16Z","#ffc25d");
 case "planet":return circle(0,0,25,c)+ellipse(0,0,43,13,"none")+path("M-40 12Q0 -18 40 -12","none","#fff3c2",7);
 case "robot":return rect(-27,-21,54,47,c,7)+rect(-16,26,12,14,c,3)+rect(5,26,12,14,c,3)+circle(-11,-6,6,"#fff")+circle(11,-6,6,"#fff")+rect(-11,12,22,4,"#fff",2)+line(0,-21,0,-32,c,3)+circle(0,-33,5,"#fff0a8");
 case "ufo":return ellipse(0,6,40,14,c)+ellipse(0,-7,24,20,"#b0e6fa")+circle(-22,7,4,"#fff8bb")+circle(21,7,4,"#fff8bb");
 case "pine":return path("M0 -40L-25 -6H-14L-32 19H-8V37H8V19H32L14 -6H25Z",c);
 case "snowman":return circle(0,15,26,"#fff")+circle(0,-23,19,"#fff")+circle(-6,-27,3,"#536278")+circle(6,-27,3,"#536278")+path("M0 -21L17 -16L0 -12Z","#faac64")+rect(-19,-46,38,7,c,3);
 case "penguin":return ellipse(0,0,23,37,c)+ellipse(0,5,16,27,"#fff")+circle(-8,-18,3,"#fff")+circle(8,-18,3,"#fff")+path("M-4 -13L4 -13L0 -7Z","#ffac62");
 case "balloon":return ellipse(0,-11,23,29,c)+path("M-5 18L5 18L0 25Z",c)+path("M0 25Q-7 37 0 43","none","#75657e",2);
 case "gift":return rect(-26,-8,52,46,c,5)+rect(-5,-8,10,46,"#fff3c8")+rect(-32,-13,64,12,c,3)+path("M0 -14Q-37 -17 -20 -33Q-6 -36 0 -14Q6 -37 20 -33Q37 -18 0 -14","none","#fff3c8",5);
 default:return star(c);
 }
}
function background(theme,variant){
const [light,middle,dark]=theme[3],key=theme[0];
let s='<defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="'+light+'"/><stop offset="1" stop-color="#fff8ec"/></linearGradient></defs>'+rect(0,0,W,H,"url(#sky)",15);
if(key==="Không gian mơ ước"){
s=rect(0,0,W,H,"#283363");
for(let i=0;i<35;i++){const x=(i*139+variant*71)%W,y=(i*73+variant*41)%H;s+=circle(x,y,i%4?2:4,"#fff3d9")}
s+=circle(535,72,38,"#ebc9e7")+ellipse(530,71,56,12,"none");
s+=path("M0 352Q130 327 300 354T600 345V400H0Z","#393d80");
}else if(key==="Thế giới đại dương"){
s=rect(0,0,W,H,"#8be3f3")+path("M0 70Q90 48 190 70T400 72T600 65","none","#dcfcff",8);
for(let i=0;i<11;i++)s+=circle((i*79+variant*53)%W,50+(i*37)%250,4+i%4,"#d9fbff");
s+=path("M0 348Q145 302 300 349T600 344V400H0Z","#d2c19a");
for(let i=0;i<5;i++)s+=path("M"+(i*140)+" 379q-12 -58 7 -91","none","#5acfa4",6);
}else if(key==="Rừng thông tuyết"){
s+=path("M0 254L100 124L200 252L310 137L410 260L500 156L600 250V400H0Z","#c2e0ee");
s+=path("M0 315Q170 266 303 314T600 315V400H0Z","#fff")+path("M0 367Q200 326 385 367T600 350V400H0Z","#e0f5ff");
}else{
s+=circle(511-variant*23,75+variant*5,27,"#ffe495");
s+=path("M0 285Q148 216 300 273T600 263V400H0Z",middle);
s+=path("M0 350Q143 310 300 355T600 334V400H0Z",dark);
for(let j=0;j<3;j++){const x=90+j*190+variant*11;s+=ellipse(x,390,78,9,"#ffffff44")}
if(key==="Đảo nhiệt đới")s+=path("M0 306Q150 296 300 309T600 300V400H0Z","#f4d8a3");
if(key==="Thành phố tí hon")s+=[0,1,2,3,4].map(i=>rect(42+i*129,215-(i%3)*29,70,94+(i%3)*29,"#ffffff77",5)).join("");
}
return s;
}
const SLOTS=[[85,108],[224,108],[374,108],[515,108],[85,205],[224,205],[374,205],[515,205],[85,317],[224,317],[374,317],[515,317]];
function shuffle(items,seed){
const a=items.slice();let state=seed>>>0;
for(let k=a.length-1;k>0;k--){state=(Math.imul(state,1664525)+1013904223)>>>0;const j=state%(k+1);[a[k],a[j]]=[a[j],a[k]]}
return a;
}
function meta(i){
if(i<0||i>=50||!Number.isInteger(i))throw Error("Màn chưa tồn tại: "+i);
const theme=T[i%10],stage=Math.floor(i/10),answers=5+stage;
const seed=(0xc0ffee+(i+1)*87337)>>>0;
const sites=shuffle(SLOTS.map((_,j)=>j),seed);
const positions=sites.slice(0,Math.min(12,10+Math.floor(stage/2)));
const differences=shuffle(positions,seed^0x9e3779b9).slice(0,answers);
const sceneId="extra-"+String(i+6).padStart(2,"0");
return {theme,stage,positions,differences,seed,title:theme[1][stage],id:sceneId,answers,desc:answers+" điểm khác nhau",emoji:["🌷","🐠","🚗","🐥","🚀","⛄","🎈","🐱","🏝️","⭐"][i%10]};
}
function artwork(i,alter=false){
const m=meta(i),theme=m.theme,pool=theme[2],s=m.stage;
let svg=background(theme,s);
for(let j=0;j<m.positions.length;j++){
const slot=m.positions[j],[x,y]=SLOTS[slot],seed=m.seed+j*101;
const orig=(j+Math.floor(i/10)+i)%pool.length;
const changed=alter&&m.differences.includes(slot),type=changed?pool[(orig+2)%pool.length]:pool[orig];
const color=ITEMS[(slot+i)%ITEMS.length];
const tint=changed?ITEMS[(slot+i+3)%ITEMS.length]:color;
const scale=1-(s*.07)+((slot%3)*.02);
svg+='<g transform="translate('+x+' '+y+') scale('+scale.toFixed(2)+')">';
svg+=circle(0,1,43,"#ffffffb3")+circle(0,1,40,"#fff9e5b3");
svg+=sprite(type,tint);
svg+='</g>';
}
return '<svg xmlns="http://www.w3.org/2000/svg" width="'+W+'" height="'+H+'" viewBox="0 0 600 400">'+svg+'</svg>';
}
export const EXTRA_LEVELS=Array.from({length:50},(_,i)=>{
 const m=meta(i);
 return {id:m.id,title:m.title,desc:m.desc,emoji:m.emoji,spots:m.differences.map(slot=>{
  const [x,y]=SLOTS[slot];return [x,y,Math.round(35-m.stage*1.5)];
 })};
});
export function extraScene(i){
 const m=meta(i);
 const level=EXTRA_LEVELS[i];
 const image=svg=>"data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg);
 return {id:m.id,title:m.title,iw:W,ih:H,diffs:level.spots.map(([x,y,r])=>({x,y,r})),
  original:image(artwork(i,false)),modified:image(artwork(i,true))};
}
