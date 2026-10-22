/* Approved mechanical identities; pilot art only, original combat remains authoritative. */
'use strict';
function clockworkEnemyEnabled(){return bakery===3&&!/(?:^|[?&])clockwork=off(?:&|$)/.test(window.location&&window.location.search||'');}
let clockworkEnemyArt=null;
const clockworkReleases=new WeakMap();
function rememberClockworkRelease(e){if(clockworkEnemyEnabled())clockworkReleases.set(e,tick);}
function clockworkEnemyPose(e){
 if(e.type==='walker')return Math.floor(tick/9)%4;
 if(e.type==='hopper'){
  if(contactSurface(e)!==null&&Math.abs(e.vy||0)<=1)return e.hopT>0&&e.hopT<=10?1:0;
  return e.vy < -2?2:3;
 }
 if(e.windup>0)return 1;
 const fired=clockworkReleases.get(e),age=tick-fired;
 return fired!==undefined&&age>=0&&age<6?2:fired!==undefined&&age>=6&&age<24?3:0;
}
function drawClockworkEnemy(e){
 if(!clockworkEnemyEnabled())return false;
 const role={walker:0,hopper:1,thrower:2}[e.type];if(role===undefined)return false;
 if(!clockworkEnemyArt){clockworkEnemyArt=new Image();clockworkEnemyArt.src='art/clockwork-enemies.png';}
 if(!clockworkEnemyArt.complete||clockworkEnemyArt.naturalWidth!==1536||clockworkEnemyArt.naturalHeight!==1024)return false;
 const pose=clockworkEnemyPose(e),crop=CLOCKWORK_ENEMY_CROPS[role][pose];
 const scale=CLOCKWORK_ENEMY_SCALES[role]*(e.visualScale||1),w=crop[2]*scale,h=crop[3]*scale;
 if(contactSurface(e)!==null)drawContactShadow(e,22);
 g.save();g.imageSmoothingEnabled=false;g.translate(Math.round(e.x+e.w/2),Math.round(e.y+e.h));g.scale((e.type==='thrower'?e.face:e.vx)<0?-1:1,1);
 g.drawImage(clockworkEnemyArt,...crop,-w/2,-h,w,h);g.restore();
 if(e.type==='thrower'&&e.windup>0){
  const x=Math.round(e.x+e.w/2),y=Math.round(e.y-24);
  g.save();g.fillStyle='#101826';g.strokeStyle='#fff0c4';g.lineWidth=2;
  g.beginPath();g.moveTo(x,y-12);g.lineTo(x+7,y);g.lineTo(x-7,y);g.closePath();g.fill();g.stroke();
  rect(x-1,y-8,2,4,'#fff0c4');rect(x-1,y-3,2,2,'#fff0c4');
  rect(x-15,y+4,30,3,'#101826');rect(x-15,y+4,Math.ceil(30*(36-e.windup)/36),2,'#fff0c4');g.restore();
 }
 return true;
}
function drawClockworkEnemyShot(s){
 if(!clockworkEnemyEnabled())return false;
 rect(s.x-1,s.y-1,11,11,'#211b25');rect(s.x,s.y,9,9,'#e49b4d');rect(s.x+1,s.y+1,5,5,'#ffe7b5');rect(s.x+2,s.y+2,2,2,'#fff8df');return true;
}
const CLOCKWORK_ENEMY_CROPS=[
 [[48,62,332,250],[431,60,315,253],[815,60,346,250],[1200,60,306,249]],
 [[118,342,183,315],[501,483,214,165],[890,339,185,315],[1276,378,165,234]],
 [[60,714,324,251],[435,678,300,287],[797,746,357,219],[1210,743,271,222]]
];
const CLOCKWORK_ENEMY_SCALES=[40/332,42/315,33/251];
