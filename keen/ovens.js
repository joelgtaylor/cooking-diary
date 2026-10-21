/* Goal artwork only. Completion/progression remains in world.js. */
'use strict';
const OVEN_MOUTHS=[
 {x:24,y:112,w:42,h:37,emblemX:45,emblemY:91},
 {x:26,y:111,w:41,h:38,emblemX:47,emblemY:91},
 {x:27,y:112,w:42,h:37,emblemX:49,emblemY:91}
];
function ovenMouthPath(m){
 g.beginPath();g.moveTo(m.x,m.y+m.h);g.lineTo(m.x,m.y+15);
 g.lineTo(m.x+6,m.y+6);g.lineTo(m.x+m.w/2,m.y);
 g.lineTo(m.x+m.w-6,m.y+6);g.lineTo(m.x+m.w,m.y+15);
 g.lineTo(m.x+m.w,m.y+m.h);g.closePath();
}
function ovenLoaf(cx,base,width){
 const half=Math.floor(width/2);
 g.fillStyle='#713525';g.fillRect(cx-half,base-5,width,5);
 g.fillStyle='#d88a38';g.fillRect(cx-half+1,base-8,width-2,6);
 g.fillStyle='#ffd077';g.fillRect(cx-half+3,base-10,width-6,4);
 g.fillStyle='#8d4a28';
 for(let k=-1;k<=1;k++){g.fillRect(cx+k*4-1,base-8,2,3);g.fillRect(cx+k*4,base-5,1,2);}
}
function drawOvenFire(m,ready){
 const base=m.y+m.h-1,cx=Math.round(m.x+m.w/2);
 g.save();ovenMouthPath(m);g.clip();
 if(ready){
  g.fillStyle='#59251e';g.fillRect(m.x,m.y,m.w,m.h);
  const phase=Math.floor(tick/8)%3;
  for(let k=0;k<3;k++){
   const x=m.x+8+k*12,h=20+(k===1?10:0)+(phase===k?3:0);
   g.fillStyle='#e75a22';g.beginPath();g.moveTo(x-9,base);g.lineTo(x-7,base-10);
   g.lineTo(x-3,base-h+7);g.lineTo(x,base-h);g.lineTo(x+2,base-h+10);
   g.lineTo(x+7,base-12);g.lineTo(x+9,base);g.closePath();g.fill();
   g.fillStyle='#ffbb49';g.beginPath();g.moveTo(x-5,base);g.lineTo(x-3,base-10);
   g.lineTo(x+1,base-h+8);g.lineTo(x+4,base-7);g.lineTo(x+5,base);g.closePath();g.fill();
   g.fillStyle='#ffe8a1';g.fillRect(x-1,base-7,3,6);
  }
  ovenLoaf(cx,base,22);
 }else{
  g.fillStyle='#a34329';
  for(let k=0;k<5;k++)g.fillRect(m.x+5+k*7,base-1-(k%2),2,1);
 }
 g.restore();
 if(ready){
  // A compact golden loaf provides the same readiness cue in every world.
  g.save();g.globalAlpha=.8;ovenLoaf(m.emblemX,m.emblemY+6,18);g.restore();
 }
}
let ovenGoalArt=null;
const OVEN_GOAL_FRAMES=[[30,32,1194,280],[30,338,1194,290],[30,652,1194,264]];
const OVEN_GOAL_ICONS=[[48,934,228,290],[364,934,212,290],[630,930,290,296],[942,930,296,296]];
function ovenGoalIndicatorReady(){
 if(!visualIndicatorEnabled('goals'))return false;
 if(bakery===3&&!devourerState?.finishOven?.landed)return false;
 if(!ovenGoalArt){ovenGoalArt=new Image();ovenGoalArt.src='art/oven-goal-indicators.png';}
 return ovenGoalArt.complete&&ovenGoalArt.naturalWidth===1254&&ovenGoalArt.naturalHeight===1254;
}
function drawOvenGoalIndicator(placement){
 if(!ovenGoalIndicatorReady())return false;
 const target=currentVerticalLayout().oven;
 const cx=placement?placement.x:target.x*T+24.5;
 const foot=placement?placement.foot:checkpointSupportRow(target.x,target.y)*T;
 const top=foot-158,ready=collected===5&&foremanOvenReady()&&bloomrotOvenReady()&&devourerOvenReady();
 g.save();g.imageSmoothingEnabled=false;
 g.drawImage(ovenGoalArt,...OVEN_GOAL_FRAMES[bakery-1],cx-56,top,112,36);
 for(let i=0;i<5;i++)g.drawImage(ovenGoalArt,...OVEN_GOAL_ICONS[i<collected?0:1],cx-44+i*13,top+9,11,18);
 g.drawImage(ovenGoalArt,...OVEN_GOAL_ICONS[ready?3:2],cx+26,top+6,24,24);
 g.restore();return true;
}
// Explicit, isolated review scenes; normal starts and progression are unchanged.
function prepareOvenPreview(search){
 const scene=search.match(/(?:^|[?&])scene=oven-(missing|locked|ready)-([123])(?:&|$)/);
 if(!scene||!/(?:^|[?&])goals=(?:pilot|off)(?:&|$)/.test(search))return false;
 const stage=Number(scene[2]),state=scene[1];init(stage);
 collected=state==='missing'?3:5;
 gems.forEach((gem,i)=>gem.got=i<collected);checkpointState.current=3;player.ammo=65;
 if(state!=='locked'){
  const boss=stage===1?foremanState:stage===2?bloomrotState:devourerState;
  boss.health=0;boss.phase='defeated';boss.timer=0;boss.defeatImpact=true;
  if(stage===2){const a=bloomrotArena();bloomrotGate(a.entry,false);bloomrotGate(a.exit,false);}
  if(stage===3){boss.defeatAge=90;releaseDevourerOven(boss);for(let i=0;i<48;i++)updateReleasedOven(boss);devourerGate(false);}
 }
 player.x=(stage===3?(state==='locked'?103:85.5):stage===2?100:99)*T;
 player.y=54*T-player.h;player.ground=true;camera=world-W;cameraY=rows*T-H;
 return true;
}
function drawGrandOven(placement){
 const art=assets.grandOvens;
 if(!art||!art.complete||art.naturalWidth!==288||art.naturalHeight!==176){drawOvenFallback(placement);drawOvenGoalIndicator(placement);return;}
 const target=currentVerticalLayout().oven;
 const x=placement?placement.x-32.5:target.x*T-8,base=placement?placement.foot:checkpointSupportRow(target.x,target.y)*T;
 g.save();g.translate(x,base-115);g.scale(65/96,115/176);
 g.imageSmoothingEnabled=false;
 g.drawImage(art,(bakery-1)*96,0,96,176,0,0,96,176);
 drawOvenFire(OVEN_MOUTHS[bakery-1],placement?placement.ready:(foremanOvenReady()&&bloomrotOvenReady()));
 g.restore();drawOvenGoalIndicator(placement);
}
function drawOvenFallback(placement){
const ex=placement?placement.x-24.5:currentVerticalLayout().oven.x*T,y=placement?placement.foot-115:currentVerticalLayout().oven.y*T;
rect(ex-8,y,65,115,'#6b4945');rect(ex-3,y+6,55,106,'#c0aaa0');rect(ex+3,y+23,43,70,'#523a3c');
rect(ex+7,y+27,35,62,(placement?placement.ready:(foremanOvenReady()&&bloomrotOvenReady()))?'#ffb54e':'#7a5252');
rect(ex+13,y+49,23,15,'#b46c36');rect(ex+17,y+46,15,6,'#f2cd8c');rect(ex+1,y+9,47,8,'#fff0cd');
}
