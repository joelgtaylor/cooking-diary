/* Approved grungy baker and piping bag audition; rendering only. */
'use strict';
let bakerPilotArt=null;
const bakerShotVisuals=new WeakMap();
const BAKER_PILOT_SPRITES=[[{"crop":[51,9,120,192],"w":47.5,"h":76.0},{"crop":[271,9,115,192],"w":45.52,"h":76.0},{"crop":[490,9,119,192],"w":47.1,"h":76.0},{"crop":[715,9,118,192],"w":46.71,"h":76.0}],[{"crop":[40,215,143,189],"w":56.6,"h":74.81},{"crop":[258,214,153,194],"w":60.56,"h":76.79},{"crop":[471,218,162,192],"w":64.12,"h":76.0},{"crop":[703,216,147,194],"w":58.19,"h":76.79}],[{"crop":[41,413,143,212],"w":56.6,"h":83.92},{"crop":[261,413,136,212],"w":53.83,"h":83.92},{"crop":[476,420,171,196],"w":67.69,"h":77.58},{"crop":[707,427,161,195],"w":63.73,"h":77.19}],[{"crop":[34,637,133,192],"w":52.65,"h":76.0},{"crop":[262,637,126,192],"w":49.88,"h":76.0},{"crop":[485,637,127,201],"w":50.27,"h":79.56},{"crop":[709,637,126,206],"w":49.88,"h":81.54}],[{"crop":[30,852,129,220],"w":51.06,"h":87.08},{"crop":[261,854,125,218],"w":49.48,"h":86.29},{"crop":[482,847,123,225],"w":48.69,"h":89.06},{"crop":[710,868,127,202],"w":50.27,"h":79.96}],[{"crop":[29,1093,166,196],"w":65.71,"h":77.58},{"crop":[252,1096,173,193],"w":68.48,"h":76.4},{"crop":[483,1087,173,194],"w":68.48,"h":76.79},{"crop":[694,1090,171,190],"w":67.69,"h":75.21}],[{"crop":[37,1299,131,234],"w":51.85,"h":92.62},{"crop":[263,1299,125,234],"w":49.48,"h":92.62},{"crop":[482,1292,134,232],"w":53.04,"h":91.83},{"crop":[687,1292,142,238],"w":56.21,"h":94.21}],[{"crop":[27,1558,194,195],"w":76.79,"h":77.19},{"crop":[251,1558,187,197],"w":74.02,"h":77.98},{"crop":[497,1536,141,211],"w":55.81,"h":83.52},{"crop":[716,1536,149,219],"w":58.98,"h":86.69}]];
function bakerPilotEnabled(){return visualIndicatorEnabled('baker');}
function rememberBakerShot(aimUp){
 if(bakerPilotEnabled())bakerShotVisuals.set(player,{tick,aimUp});
}
function clearBakerShot(){bakerShotVisuals.delete(player);}
function bakerPilotFrame(){
 const speed=Math.abs(player.vx),shot=bakerShotVisuals.get(player);
 const firing=shot&&tick>=shot.tick&&tick-shot.tick<7;
 if(player.hang)return {row:3,frame:Math.floor(actorAnimation(player,'baker-hang')/10)%4};
 if(pogoOn)return {row:4,frame:Math.floor(actorAnimation(player,'baker-pogo')/7)%3};
 if(firing){
  const squeeze=tick-shot.tick<3?1:0;
  if(player.ground&&speed>.45)return {row:7,frame:(shot.aimUp?2:0)+Math.floor(actorAnimation(player,'baker-shoot-run')/4)%2};
  return {row:shot.aimUp?6:5,frame:(player.ground?0:2)+squeeze};
 }
 if(!player.ground)return {row:2,frame:(player.vy<0?0:2)+Math.min(1,Math.floor(actorAnimation(player,player.vy<0?'baker-rise':'baker-fall')/6))};
 if(player.climb>0)return {row:4,frame:3};
 if(speed>.45)return {row:1,frame:Math.floor(actorAnimation(player,'baker-run')/Math.max(3,Math.round(8-speed*.5)))%4};
 return {row:0,frame:Math.floor(actorAnimation(player,'baker-idle')/14)%4};
}
function drawBakerPilot(){
 if(!bakerPilotEnabled())return false;
 if(!bakerPilotArt){bakerPilotArt=new Image();bakerPilotArt.src='art/baker-grunge-actions.png';}
 if(!bakerPilotArt.complete||bakerPilotArt.naturalWidth!==887||bakerPilotArt.naturalHeight!==1774)return false;
 const {row,frame}=bakerPilotFrame();
 let art=bakerPilotArt,sprite=BAKER_PILOT_SPRITES[row]?.[frame];
 if(typeof vanceWickSelected==='function'&&vanceWickSelected()){
  if(!vanceWickArt){vanceWickArt=new Image();vanceWickArt.src='../previews/characters/vance-wick-actions.webp';}
  if(vanceWickArt.complete&&vanceWickArt.naturalWidth===1024&&vanceWickArt.naturalHeight===2048){art=vanceWickArt;sprite=VANCE_WICK_SPRITES[row]?.[frame];}
 }
 if(!sprite)return false;
 if(player.inv&&tick%8>=4)return true;
 if(player.ground&&!player.hang&&!pogoOn)drawContactShadow(player,25);
 const foot=Math.round(player.y+player.h),cx=Math.round(player.x+player.w/2);
 const shot=bakerShotVisuals.get(player),squeeze=shot&&tick>=shot.tick&&tick-shot.tick<3;
 const recoil=squeeze&&!player.hang&&!pogoOn?-1:0;
 const top=player.hang?player.hang.top-2-foot:-sprite.h;
 g.save();g.imageSmoothingEnabled=false;g.translate(cx,foot);g.scale(player.face,1);
 g.drawImage(art,...sprite.crop,(sprite.left??-sprite.w/2)+recoil,top,sprite.w,sprite.h);g.restore();return true;
}
function drawDoughShot(s){
 if(!bakerPilotEnabled())return false;
 // Same projectile rectangle and center; appearance does not alter collision.
 const cx=s.x+s.w/2,cy=s.y+s.h/2,rx=s.w/2,ry=s.h/2;
 g.save();g.fillStyle='#70432e';g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);g.fill();
 g.fillStyle='#e8bd7d';g.beginPath();g.ellipse(cx,cy-1,Math.max(1,rx-1),Math.max(1,ry-1),0,0,Math.PI*2);g.fill();
 g.fillStyle='#fff0c4';g.fillRect(Math.round(cx-1),Math.round(cy-2),2,1);g.restore();return true;
}
