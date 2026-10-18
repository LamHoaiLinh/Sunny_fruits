/* Sunny Mouse: five original, ready-to-play SVG picture pairs.
   No AI/network required. Answer coordinates belong to explicit changed objects. */
const W=600,H=400;
const tag=(name,attrs,body="")=>"<"+name+" "+Object.entries(attrs).map(([k,v])=>k+'="'+v+'"').join(" ")+">"+body+"</"+name+">";
const rect=(x,y,w,h,fill,rx=0)=>tag("rect",{x,y,width:w,height:h,rx,fill});
const circle=(x,y,r,fill)=>tag("circle",{cx:x,cy:y,r,fill});
const ellipse=(x,y,rx,ry,fill)=>tag("ellipse",{cx:x,cy:y,rx,ry,fill});
const line=(x,y,u,v,stroke="#fff",width=4)=>tag("line",{x1:x,y1:y,x2:u,y2:v,stroke,"stroke-width":width,"stroke-linecap":"round"});
const path=(d,fill,stroke="none",w=0)=>tag("path",{d,fill,stroke,"stroke-width":w,"stroke-linecap":"round","stroke-linejoin":"round"});
const wrap=(content,color)=>'<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">'+
tag("defs",{},'<linearGradient id="bg" x2="0" y2="1"><stop stop-color="'+color+'"/><stop offset="1" stop-color="#ffffff"/></linearGradient>')+rect(0,0,600,400,"url(#bg)",18)+content+"</svg>";
const encode=svg=>"data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg);
const cloud=(x,y)=>ellipse(x,y,39,14,"#fff")+circle(x-22,y-8,20,"#fff")+circle(x+13,y-12,24,"#fff");
const sun=(x,y,color)=>[0,1,2,3,4,5,6,7].map(i=>{
const a=i*Math.PI/4;return line(x+37*Math.cos(a),y+37*Math.sin(a),x+50*Math.cos(a),y+50*Math.sin(a),color,6);
}).join("")+circle(x,y,31,color)+circle(x-10,y-3,3,"#725147")+circle(x+10,y-3,3,"#725147")+path("M"+(x-10)+" "+(y+10)+"Q"+x+" "+(y+20)+" "+(x+10)+" "+(y+10),"none","#725147",3);
const hill=()=>path("M0 270Q120 218 250 262Q420 216 600 270V400H0Z","#a3deac")+
path("M0 337Q130 292 300 337Q447 299 600 330V400H0Z","#74cfa0");
const flower=(x,y,color)=>line(x,y+8,x,y+50,"#4e9c6e",5)+
[0,1,2,3,4,5].map(i=>circle(x+Math.cos(i*Math.PI/3)*18,y+Math.sin(i*Math.PI/3)*18,12,color)).join("")+circle(x,y,10,"#ffd36b");
const tree=(x,y)=>rect(x-12,y,24,100,"#ae785a",5)+circle(x,y-25,52,"#6ac68b")+circle(x-36,y-5,34,"#81d699")+circle(x+37,y-3,35,"#64c985");
const butterfly=(x,y,color)=>ellipse(x-17,y-10,21,16,color)+ellipse(x+17,y-10,21,16,color)+ellipse(x-11,y+14,13,12,color)+ellipse(x+11,y+14,13,12,color)+rect(x-3,y-25,6,49,"#714c66",3)+circle(x-12,y-12,5,"#ffe7ad")+circle(x+12,y-12,5,"#ffe7ad");
function garden(b){
let s=cloud(265,80)+cloud(386,60)+sun(110,90,b?"#ffaf55":"#ffe365")+hill()+tree(520,196);
s+=ellipse(280,340,85,24,"#67b982")+ellipse(272,313,42,49,"#f8e4ce")+ellipse(254,274,12,47,"#f8e4ce")+ellipse(290,274,12,47,"#f8e4ce");
s+=circle(257,305,4,"#70575b")+circle(285,305,4,"#70575b")+circle(271,318,6,"#eda5a5");
s+=flower(441,289,b?"#ad86ef":"#f276af")+flower(105,339,"#f3ce71")+flower(354,336,"#f8b37b")+butterfly(208,143,"#98b5fa");
return wrap(s,"#d1f2ff");
}
function sea(b){
let s=cloud(196,65)+sun(476,86,b?"#ffb65b":"#fff080")+rect(0,201,600,199,"#8ad9f0");
s+=path("M0 212Q100 194 200 211T400 211T600 210","none","#fff",6);
s+=path("M0 326Q140 284 280 326T600 319V400H0Z","#ffe0a5")+path("M0 375Q240 348 600 376V400H0Z","#ffd394");
s+=path("M301 203L364 203L348 226L319 226Z","#b97d54")+rect(335,117,5,87,"#866049")+path("M333 122L333 192L268 192Z",b?"#ae88ec":"#f99b77","#fff",3);
s+=path("M143 293L151 308L170 310L156 323L161 341L142 332L123 341L129 322L114 309L133 308Z",b?"#ed7d95":"#ffc262");
s+=ellipse(439,346,23,13,"#f2ad97")+path("M429 341L438 335L450 343","none","#fff0de",4);
s+=ellipse(91,247,39,20,"#f1fcfe")+circle(105,245,4,"#53737b")+path("M55 247L40 229V264Z","#effbfc");
return wrap(s,"#c4efff");
}
function farm(b){
let s=cloud(140,71)+cloud(438,61)+sun(532,86,"#ffe56c")+hill();
s+=rect(225,147,178,149,"#f5a56b",9)+path("M208 156L313 90L425 156Z","#ce6266")+rect(278,214,69,81,b?"#f5cf67":"#936bb1",5);
s+=line(313,217,313,295,"#fff3d4",4)+rect(250,171,39,39,"#ffefc9",4)+line(270,171,270,210,"#dfa077",3);
s+=ellipse(486,300,75,37,"#fff2e2")+ellipse(527,270,30,29,"#fff2e2")+ellipse(540,264,11,10,"#f4b5a9");
s+=ellipse(480,291,b?5:25,17,"#716057")+ellipse(521,304,13,17,"#716057")+rect(454,326,13,40,"#fff2de",3)+rect(513,328,13,39,"#fff2de",3);
s+=circle(537,267,3,"#473c3a")+ellipse(508,254,16,9,"#fff2e2");
s+=ellipse(113,334,43,34,"#fff1da")+circle(139,317,19,"#fff1da")+path("M132 296L142 281L151 297Z",b?"#ffb75a":"#dd707b")+path("M153 320L171 328L153 335Z","#e9b957")+circle(142,316,3,"#514748");
s+=flower(183,337,"#ea95ad");
return wrap(s,"#e1f5ff");
}
function forest(b){
let s=cloud(319,63)+sun(510,82,"#ffda61")+hill()+tree(80,180)+tree(545,182);
s+=rect(183,99,30,146,"#996d52",11)+circle(199,137,46,"#ad8967")+circle(199,136,34,"#f6d8a8");
s+=circle(185,136,11,"#fff")+circle(214,136,11,"#fff")+circle(185,136,5,"#4e4140")+circle(214,136,5,"#4e4140");
s+=path("M190 158L210 158L200 173Z","#dea15a")+path("M170 110Q200 79 230 110","none",b?"#a184e1":"#83b1d9",6);
s+=ellipse(430,332,54,35,b?"#9dcaec":"#93d2a1")+circle(416,310,9,"#fff")+circle(445,310,9,"#fff")+circle(416,311,3,"#4a6456")+circle(445,311,3,"#4a6456")+path("M415 337Q430 347 447 338","none","#557567",3);
s+=rect(124,309,10,38,"#f7e7d0",3)+path("M113 310Q132 270 154 310Z",b?"#b397e9":"#ed7e75")+circle(126,299,4,"#fff");
s+=butterfly(488,156,b?"#ffd875":"#a690f5")+flower(322,335,"#f7bbd1")+flower(360,337,"#fbe58f");
return wrap(s,"#d3f0e6");
}
function space(b){
let s=rect(0,0,600,400,"#25335f");
s+=[[39,43],[224,60],[306,180],[570,263],[64,352],[528,37],[413,42],[216,343],[358,329],[90,216],[471,215]].map(([x,y],i)=>circle(x,y,i%3===0?4:2,"#fff6d4")).join("");
s+=circle(108,105,50,b?"#bd9bef":"#ffb977")+path("M41 111Q109 136 175 105","none","#f9dfab",7);
s+=path("M285 68L294 89L317 92L299 106L304 128L284 115L265 127L269 106L253 92L275 89Z",b?"#fff1a3":"#ee80a0");
s+=ellipse(474,161,77,24,"#b7c9dc")+ellipse(475,145,49,35,"#a4e2f4")+circle(475,142,17,b?"#f27c72":"#8bd29c")+ellipse(475,173,58,11,"#7493bd");
s+=path("M357 248L380 282L357 333L334 282Z","#f2ecea")+ellipse(357,272,12,13,"#addbec")+path("M341 326L357 371L373 326Z",b?"#baa3f3":"#ffba68");
s+=ellipse(164,320,57,42,"#a7dd9c")+ellipse(145,296,16,29,"#a7dd9c")+ellipse(181,296,16,29,"#a7dd9c");
s+=circle(145,315,b?4:9,"#fff")+circle(181,315,9,"#fff")+circle(145,315,3,"#4c5f5b")+circle(181,315,3,"#4c5f5b")+path("M145 336Q164 347 182 336","none","#4c685b",3);
s+=circle(425,363,17,"#727caa")+circle(528,339,24,"#9296c5");
return wrap(s,"#25335f");
}
const LEVELS=[
{id:"garden",title:"Vườn hoa của thỏ",desc:"2 điểm rất dễ",spots:[[110,90,46],[441,289,44]],art:garden},
{id:"sea",title:"Bãi biển vui vẻ",desc:"3 điểm dễ",spots:[[476,86,46],[322,161,52],[143,319,44]],art:sea},
{id:"farm",title:"Nông trại đáng yêu",desc:"3 điểm dễ",spots:[[313,253,46],[480,291,44],[142,292,44]],art:farm},
{id:"forest",title:"Rừng xanh kỳ diệu",desc:"4 điểm vừa",spots:[[199,111,42],[430,331,43],[132,304,42],[488,156,43]],art:forest},
{id:"space",title:"Du hành vũ trụ",desc:"5 điểm vừa",spots:[[108,105,49],[285,97,41],[475,142,42],[357,332,43],[145,315,42]],art:space}
];
export const PRESET_LEVELS=LEVELS.map(({id,title,desc,spots})=>({id,title,desc,spots}));
export function presetScene(i){
 const level=LEVELS[i];if(!level)throw Error("Không tồn tại màn: "+i);
 return {iw:W,ih:H,diffs:level.spots.map(([x,y,r])=>({x,y,r})),
  original:encode(level.art(false)),modified:encode(level.art(true)),title:level.title,id:level.id};
}
