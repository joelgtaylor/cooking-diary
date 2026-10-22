/* Stationary dough thrower: visible wind-up, locked direction, slow straight shot. */
'use strict';
let enemyShots=[];
// Keep perception distances tied to the original actor footprint, rather than
// accidentally extending activation range when the collision body grows.
function throwerAimBody(e){
 return e.visualScale?{x:e.x+e.w/2-12.5,y:e.y+e.h-25,w:25,h:25}:e;
}
function throwerShot(e){
 if(e.visualScale)return {x:e.x+e.w/2+e.face*32-4.5,y:e.y+e.h-36.5,w:9,h:9,vx:e.face*2.3,life:150,owner:e};
 return {x:e.x+(e.face<0?-10:e.w+2),y:e.y+8,w:9,h:9,vx:e.face*2.3,life:150,owner:e};
}
function throwerCanSee(actor){
 const e=throwerAimBody(actor);
 const dx=player.x+player.w/2-e.x-e.w/2;
 if(Math.abs(dx)>256||Math.abs(player.y+player.h/2-e.y-e.h/2)>55)return false;
 if(e.x<camera+24||e.x+e.w>camera+W-24||e.y<cameraY+46||e.y+e.h>cameraY+H)return false;
 const from=e.x+e.w/2,to=player.x+player.w/2,y=actor.visualScale?throwerShot(actor).y+4.5:e.y+10;
 for(let x=Math.min(from,to);x<Math.max(from,to);x+=8)if(hit(x,y,3,3))return false;
 return true;
}
function updateThrower(e){
 const timing=fungalThrowerTiming();
 if(!throwerCanSee(e)){e.windup=0;e.attackT=Math.max(e.attackT,timing.ready);return;}
 if(e.windup>0){
  if(--e.windup===0){
   const shot=throwerShot(e);
   // An enlarged release arm must not put dough on the far side of a wall.
   let blocked=false;
   if(e.visualScale){
    const start=e.x+e.w/2-shot.w/2,steps=Math.ceil(Math.abs(shot.x-start));
    for(let i=0;i<=steps;i++)if(hit(start+(shot.x-start)*(steps?i/steps:0),shot.y,shot.w,shot.h)){blocked=true;break;}
   }
   if(!blocked)enemyShots.push(shot);
   rememberSlingerRelease(e);rememberFungalRelease(e);rememberClockworkRelease(e);e.attackT=timing.recovery;
  }
 }else if(--e.attackT<=0){e.face=player.x<e.x?-1:1;e.windup=timing.windup;}
}
function updateEnemyShots(){
 for(const s of enemyShots){
  if(!s.owner.alive){s.dead=true;continue;}
  s.x+=s.vx;s.life--;
  if(hit(s.x,s.y,s.w,s.h)||s.life<=0||s.x<0||s.x>world){s.dead=true;continue;}
  if(collide(s,player)){damage();s.dead=true;}
 }
 enemyShots=enemyShots.filter(s=>!s.dead);
}
function drawThrowerCue(e){
 g.save();
 const handX=Math.round(e.x+(e.face<0?-4:e.w-2));
 rect(e.x+4,e.y+16,17,4,'#6d8fae');rect(e.x+6,e.y+17,13,1,'#d2e4ed');
 if(e.windup>0){
  rect(handX,e.y-10,9,8,'#8d553a');rect(handX+1,e.y-12,7,7,'#f4d29a');rect(handX+2,e.y-12,4,2,'#fff0c4');
  rect(e.x-5,e.y-26,35,11,'#151e30');
  g.textAlign='center';g.font='bold 10px monospace';g.fillStyle='#ffe3a1';g.fillText('!',e.x+12,e.y-17);
  rect(e.x-5,e.y-14,Math.ceil((36-e.windup)/36*35),2,'#e5b36e');
 }
 g.restore();
}
function drawEnemyShots(){
 for(const s of enemyShots){
  if(drawClockworkEnemyShot(s)||drawFungalShot(s))continue;
  rect(s.x-1,s.y+2,11,6,'#593828');rect(s.x,s.y,9,8,'#bf884e');rect(s.x+1,s.y,6,3,'#ffe0a1');
  rect(s.x+3,s.y+3,2,2,'#765039');
 }
}

// Approved Moonlit slinger artwork. AI and projectiles above remain authoritative.
let slingerArt=null;
const slingerReleases=new WeakMap();
const SLINGER_SPRITES=[{"crop":[29,176,489,412],"w":41.54,"h":35.0},{"crop":[573,177,502,411],"w":42.65,"h":34.92},{"crop":[1138,176,536,412],"w":45.53,"h":35.0},{"crop":[1724,176,408,412],"w":34.66,"h":35.0}];
function slingerPilotEnabled(){return bakery===1&&visualIndicatorEnabled('slinger');}
function slingerPilotEnemy(e){return e.type==='thrower';}
function rememberSlingerRelease(e){if(slingerPilotEnabled()&&slingerPilotEnemy(e))slingerReleases.set(e,tick);}
function slingerPose(e){
 if(e.windup>0)return 1;
 const fired=slingerReleases.get(e),age=tick-fired;
 if(fired!==undefined&&age>=0&&age<6)return 2;
 if(fired!==undefined&&age>=6&&age<24)return 3;
 return 0;
}
function drawDoughSlinger(e){
 if(!slingerPilotEnabled()||!slingerPilotEnemy(e))return false;
 if(!slingerArt){slingerArt=new Image();slingerArt.src='art/moonlit-dough-slinger.png';}
 if(!slingerArt.complete||slingerArt.naturalWidth!==2172||slingerArt.naturalHeight!==724)return false;
 const sprite=SLINGER_SPRITES[slingerPose(e)];if(!sprite)return false;
 if(contactSurface(e)!==null)drawContactShadow(e,22);
 g.save();g.imageSmoothingEnabled=false;g.translate(Math.round(e.x+e.w/2),Math.round(e.y+e.h));g.scale(e.face<0?-1:1,1);
 const scale=e.visualScale||1,w=sprite.w*scale,h=sprite.h*scale;
 g.drawImage(slingerArt,...sprite.crop,-w/2,-h,w,h);g.restore();
 if(e.windup>0){
  const cx=Math.round(e.x+e.w/2),top=Math.round(e.y+e.h-(e.visualScale?82:62));
  g.save();g.fillStyle='#101826';g.strokeStyle='#ffe3a1';g.lineWidth=2;
  g.beginPath();g.moveTo(cx,top);g.lineTo(cx+8,top+14);g.lineTo(cx-8,top+14);g.closePath();g.fill();g.stroke();
  g.fillStyle='#fff0c4';g.fillRect(cx-1,top+4,2,5);g.fillRect(cx-1,top+10,2,2);
  g.fillStyle='#101826';g.fillRect(cx-17,top+18,35,3);g.fillStyle='#ffe3a1';g.fillRect(cx-17,top+18,Math.ceil((36-e.windup)/36*35),2);g.restore();
 }
 return true;
}
