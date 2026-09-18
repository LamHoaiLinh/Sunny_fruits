(function(){
'use strict';
var LEVELS=[
{cols:5,steps:24,minMix:3},{cols:5,steps:36,minMix:4},{cols:6,steps:44,minMix:4},{cols:6,steps:60,minMix:5},{cols:7,steps:72,minMix:5},{cols:7,steps:90,minMix:6},{cols:8,steps:105,minMix:6},{cols:8,steps:125,minMix:7},{cols:9,steps:145,minMix:8},{cols:10,steps:175,minMix:9}
];
function seedToInt(seed){var h=2166136261>>>0;for(var i=0;i<seed.length;i++){h^=seed.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function rngFactory(seed){var x=seedToInt(seed)||123456789;return function(){x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};}
function pick(arr,rng){return arr[Math.floor(rng()*arr.length)];}
var PUZZLES_PER_LEVEL=20;
function freshSeed(level){return 'SUNNY-L'+String(level).padStart(2,'0')+'-'+Math.floor(100000+Math.random()*900000);}
function presetSeed(level,puzzleIndex){
  level=Math.max(1,Math.min(10,level|0));
  puzzleIndex=((puzzleIndex|0)%PUZZLES_PER_LEVEL+PUZZLES_PER_LEVEL)%PUZZLES_PER_LEVEL;
  return 'SUNNY-L'+String(level).padStart(2,'0')+'-P'+String(puzzleIndex+1).padStart(2,'0');
}
function makeSolved(ids){return {columns:ids.map(id=>[id,id,id]),left:null,right:null};}
function inverse(m){return {from:m.to,to:m.from};}
function generateLevel(level,seed){level=Math.max(1,Math.min(10,level|0));seed=seed||freshSeed(level);var cfg=LEVELS[level-1],rng=rngFactory(seed);var pool=window.SunnyFruitsData.slice();for(var i=pool.length-1;i>0;i--){var j=Math.floor(rng()*(i+1)),t=pool[i];pool[i]=pool[j];pool[j]=t;}var ids=pool.slice(0,cfg.cols).map(f=>f.id),best=null;
for(var attempt=0;attempt<20;attempt++){
 var state=makeSolved(ids),history=[],last=null,blockerMoves=0;
 var target=cfg.steps+Math.floor(rng()*Math.max(6,cfg.steps*.18));
 for(var s=0;s<target;s++){
   var legal=SunnyRules.getLegalMoves(state).filter(function(m){return !(last&&m.from===last.to&&m.to===last.from);});
   if(!legal.length)break;
   var weighted=[];legal.forEach(function(m){var w=1;var ns=SunnyRules.movePiece(state,m.from,m.to);if(typeof m.to==='number'&&ns.columns[m.to].length===4)w+=3;if(m.to==='L'||m.to==='R')w+=2;if(typeof m.to==='number'&&new Set(ns.columns[m.to]).size>1)w+=2;for(var q=0;q<w;q++)weighted.push(m);});
   var mv=pick(weighted,rng),next=SunnyRules.movePiece(state,mv.from,mv.to);if(typeof mv.to==='number'&&next.columns[mv.to].length===4)blockerMoves++;state=next;history.push(mv);last=mv;
 }
 var mix=SunnyRules.countMixedColumns(state),score=mix*10+history.length+blockerMoves*2;
 if(!SunnyRules.isSolved(state)&&mix>=cfg.minMix){best={state:state,history:history,score:score};break;}
 if(!best||score>best.score)best={state:state,history:history,score:score};
}
var initial=best.state,solution=best.history.slice().reverse().map(inverse);return {level:level,seed:seed,fruitIds:ids,initial:SunnyRules.cloneState(initial),state:SunnyRules.cloneState(initial),solution:solution,shuffleMoves:best.history.length};
}
window.SunnyGenerator={LEVELS:LEVELS,PUZZLES_PER_LEVEL:PUZZLES_PER_LEVEL,freshSeed:freshSeed,presetSeed:presetSeed,generateLevel:generateLevel,rngFactory:rngFactory};
})();
