/* Input ownership is independent of DOM, frame rate and the game simulation. */
(function(root){
'use strict';
function createShellInput(){
 const sources=new Map();
 return {
  set(id,action){if(action)sources.set(id,action);else sources.delete(id);},
  release(id){sources.delete(id);},
  clear(){sources.clear();},
  snapshot(){const out={};for(const action of sources.values())out[action]=true;return out;},
  size(){return sources.size;}
 };
}
root.createShellInput=createShellInput;
if(typeof module!=='undefined')module.exports={createShellInput};
})(typeof globalThis!=='undefined'?globalThis:this);
