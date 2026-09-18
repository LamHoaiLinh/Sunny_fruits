(function(){
'use strict';
function cloneState(s){return {columns:s.columns.map(c=>c.slice()),left:s.left||null,right:s.right||null};}
function sourceToken(state,pos){if(pos==='L')return state.left;if(pos==='R')return state.right;var c=state.columns[pos];return c&&c.length?c[c.length-1]:null;}
function destHasSpace(state,pos){if(pos==='L')return !state.left;if(pos==='R')return !state.right;return state.columns[pos].length<4;}
function posCoord(pos,n){if(pos==='L')return -1;if(pos==='R')return n;return pos;}
function blockingColumns(state,from,to){var n=state.columns.length,a=posCoord(from,n),b=posCoord(to,n),out=[];if(a===b)return out;var lo=Math.min(a,b),hi=Math.max(a,b);for(var i=0;i<n;i++){if(i>lo&&i<hi&&state.columns[i].length===4)out.push(i);}return out;}
function isPathBlocked(state,from,to){return blockingColumns(state,from,to).length>0;}
function canMove(state,from,to){if(from===to)return {ok:false,reason:'same'};var token=sourceToken(state,from);if(!token)return {ok:false,reason:'empty'};if(!destHasSpace(state,to))return {ok:false,reason:'full'};var blockers=blockingColumns(state,from,to);if(blockers.length)return {ok:false,reason:'blocked',blockers:blockers};return {ok:true,token:token};}
function movePiece(state,from,to){var check=canMove(state,from,to);if(!check.ok)return null;var ns=cloneState(state),token;if(from==='L'){token=ns.left;ns.left=null;}else if(from==='R'){token=ns.right;ns.right=null;}else token=ns.columns[from].pop();if(to==='L')ns.left=token;else if(to==='R')ns.right=token;else ns.columns[to].push(token);return ns;}
function getPositions(state){var arr=['L'];for(var i=0;i<state.columns.length;i++)arr.push(i);arr.push('R');return arr;}
function getLegalMoves(state){var p=getPositions(state),out=[];for(var i=0;i<p.length;i++){if(!sourceToken(state,p[i]))continue;for(var j=0;j<p.length;j++){if(canMove(state,p[i],p[j]).ok)out.push({from:p[i],to:p[j]});}}return out;}
function isSolved(state){if(state.left||state.right)return false;for(var i=0;i<state.columns.length;i++){var c=state.columns[i];if(c.length!==3||c[0]!==c[1]||c[1]!==c[2])return false;}return true;}
function isDeadlocked(state){return !isSolved(state)&&getLegalMoves(state).length===0;}
function serializeState(state){return JSON.stringify(state);}
function hashState(state){return (state.left||'_')+'|'+state.columns.map(c=>c.join(',')).join('/')+'|'+(state.right||'_');}
function countMixedColumns(state){var m=0;state.columns.forEach(function(c){if(c.length>1&&new Set(c).size>1)m++;});return m;}
function heuristic(state){var h=0;if(state.left)h+=1;if(state.right)h+=1;state.columns.forEach(function(c){if(!c.length){h+=1;return;}var counts={};c.forEach(x=>counts[x]=(counts[x]||0)+1);var max=0;Object.keys(counts).forEach(k=>max=Math.max(max,counts[k]));h+=(3-max)+Math.abs(3-c.length)*.5;if(c.length===4)h+=.35;});return h;}
window.SunnyRules={cloneState,sourceToken,destHasSpace,blockingColumns,isPathBlocked,canMove,movePiece,getLegalMoves,isSolved,isDeadlocked,serializeState,hashState,countMixedColumns,heuristic};
})();
