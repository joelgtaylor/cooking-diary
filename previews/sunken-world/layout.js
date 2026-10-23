/* Authored route prototype, not production campaign metadata. Tile coordinates. */
(function(root){
'use strict';
const sections=[{name:'The Flooded Entrance',from:0,to:27},{name:'Coral Proofing Gardens',from:27,to:52},{name:'The Pressure Kitchens',from:52,to:80},{name:'The Abyssal Patisserie',from:80,to:105}];
const cultures=[[20,31],[44,48],[60,30],[84,43],[96,49]];
const checkpoints=[{x:4,y:22-38/32,wet:false,ground:22},{x:48,y:48,wet:true,ground:50},{x:57,y:32-38/32,wet:false,ground:32},{x:82,y:34,wet:true,ground:36},{x:97,y:22-38/32,wet:false,ground:22}];
const water=[{x:10,y:22,w:44,h:33},{x:54,y:32,w:10,h:23},{x:64,y:22,w:40,h:33}];
const pump={x:55,y:48};
const supplies=[{x:36,y:27,kind:'rye'},{x:41,y:28,kind:'kefir'},{x:61,y:49,kind:'cache'},{x:92,y:30,kind:'rye'}];
function create(){
 const rows=56,cols=105,map=Array.from({length:rows},()=>Array(cols).fill('.'));
 function block(x,y,w,h){for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)map[yy][xx]='#';}
 function clear(x,y,w,h){for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)map[yy][xx]='.';}
 block(0,0,105,2);block(0,55,105,1);block(0,0,1,56);block(104,0,1,56);
 block(1,22,9,33);block(10,35,17,20);
 block(25,2,2,53);clear(25,30,2,5);
 // Coral rotunda: enter high, leave deep. Broad optional upper supply loft.
 block(50,2,2,53);clear(50,46,2,5);
 block(33,29,11,2);block(28,39,11,2);block(42,42,8,2);block(47,50,3,1);
 // Pressure Kitchens: loop around the long baffle and climb the Rider shaft.
 block(52,36,15,2);block(54,32,10,2);block(54,22,10,1);
 block(77,2,3,53);clear(77,28,3,3); // Sole passage is the solid 96×96 crab.
 // Abyssal oven nave: descend left, cross the bottom, rise on the far right.
 block(87,38,10,2);block(81,36,3,1);block(95,22,9,2);
 return {rows,cols,map,sections,cultures,checkpoints,water,pump,supplies,
  reef:[{x:16,y:31,left:12,right:23},{x:33,y:45,left:28,right:39},{x:87,y:48,left:85,right:93}],
  puffers:[{x:42,y:36,left:39,right:49,top:32,bottom:42},{x:90,y:44,left:85,right:97,top:41,bottom:54}],
  rider:{x:71,y:44,left:67,right:77,top:38,bottom:51},crab:{x:77,y:28},finish:{x:99,y:20},
  mainRoute:[[4,20],[11,20],[13,30],[20,31],[26,32],[44,34],[44,37],[40,38],[40,45],[44,48],[51,48],[70,46],[70,29],[60,30],[73,29],[79,29],[84,43],[96,49],[100,43],[100,32],[93,27],[94,20],[99,20]]};
}
const api={create};root.SunkenRoute=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
