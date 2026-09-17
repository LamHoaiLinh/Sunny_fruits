(function(){
'use strict';var KEY='sunny_fruits_save_v1';
function defaults(){return {level:1,wins:0,sound:true,tutorialCompleted:false,map:null,state:null,history:[],moves:0};}
function load(){try{var x=JSON.parse(localStorage.getItem(KEY)||'null');return Object.assign(defaults(),x||{});}catch(e){return defaults();}}
function save(data){try{localStorage.setItem(KEY,JSON.stringify(data));}catch(e){}}
function clear(){try{localStorage.removeItem(KEY);}catch(e){}}
window.SunnyStorage={load:load,save:save,clear:clear,defaults:defaults};
})();
