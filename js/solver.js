(function(){
'use strict';
function reconstruct(nodes,idx){var out=[];while(nodes[idx].parent!==-1){out.push(nodes[idx].move);idx=nodes[idx].parent;}return out.reverse();}
function solve(start,opts){opts=opts||{};var limit=opts.limit||12000,maxDepth=opts.maxDepth||55;if(SunnyRules.isSolved(start))return {solved:true,moves:[],nodes:0};
 var nodes=[{state:SunnyRules.cloneState(start),g:0,f:SunnyRules.heuristic(start),parent:-1,move:null}],open=[0],seen=new Map([[SunnyRules.hashState(start),0]]),expanded=0;
 while(open.length&&expanded<limit){
   var bestPos=0;for(var i=1;i<open.length;i++)if(nodes[open[i]].f<nodes[open[bestPos]].f)bestPos=i;
   var idx=open.splice(bestPos,1)[0],node=nodes[idx];expanded++;if(node.g>=maxDepth)continue;
   var legal=SunnyRules.getLegalMoves(node.state);
   for(var k=0;k<legal.length;k++){
     var mv=legal[k],ns=SunnyRules.movePiece(node.state,mv.from,mv.to),g=node.g+1,h=SunnyRules.heuristic(ns),key=SunnyRules.hashState(ns);if(seen.has(key)&&seen.get(key)<=g)continue;seen.set(key,g);var ni=nodes.length;nodes.push({state:ns,g:g,f:g+h*1.7,parent:idx,move:mv});if(SunnyRules.isSolved(ns))return {solved:true,moves:reconstruct(nodes,ni),nodes:expanded};open.push(ni);
   }
 }
 return {solved:false,moves:[],nodes:expanded};
}
function bestEffortMove(state){var legal=SunnyRules.getLegalMoves(state);if(!legal.length)return null;var scored=legal.map(function(m){var ns=SunnyRules.movePiece(state,m.from,m.to),score=SunnyRules.heuristic(ns);if(typeof m.to==='number'){var c=ns.columns[m.to];if(c.length===3&&new Set(c).size===1)score-=3;}return {m:m,s:score};}).sort((a,b)=>a.s-b.s);return scored[0].m;}
window.SunnySolver={solve:solve,bestEffortMove:bestEffortMove};
})();
