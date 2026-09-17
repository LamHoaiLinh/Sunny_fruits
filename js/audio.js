(function(){
'use strict';var ctx=null,enabled=true;function init(){if(!ctx){try{ctx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){}}if(ctx&&ctx.state==='suspended')ctx.resume();}
function tone(freq,dur,type,vol){if(!enabled)return;init();if(!ctx)return;var o=ctx.createOscillator(),g=ctx.createGain();o.type=type||'sine';o.frequency.value=freq;g.gain.value=vol||.03;o.connect(g);g.connect(ctx.destination);var t=ctx.currentTime;g.gain.setValueAtTime(vol||.03,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.start(t);o.stop(t+dur);}
function play(name){if(name==='pick')tone(620,.07,'sine',.025);else if(name==='drop')tone(430,.10,'triangle',.03);else if(name==='bad')tone(180,.13,'square',.018);else if(name==='complete'){tone(760,.12);setTimeout(()=>tone(980,.15),90);}else if(name==='win'){tone(660,.12);setTimeout(()=>tone(880,.14),120);setTimeout(()=>tone(1180,.18),250);}else if(name==='level'){tone(520,.10);setTimeout(()=>tone(780,.13),100);setTimeout(()=>tone(1040,.20),220);}}
window.SunnyAudio={setEnabled:function(v){enabled=!!v;},getEnabled:function(){return enabled;},play:play,init:init};
})();
