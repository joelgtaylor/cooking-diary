/* Stationary dough thrower: visible wind-up, locked direction, slow straight shot. */
'use strict';
let enemyShots=[];
function throwerCanSee(e){
 const dx=player.x+player.w/2-e.x-e.w/2;
 if(Math.abs(dx)>256||Math.abs(player.y+player.h/2-e.y-e.h/2)>55)return false;
 if(e.x<camera+24||e.x+e.w>camera+W-24||e.y<cameraY+46||e.y+e.h>cameraY+H)return false;
 const from=e.x+e.w/2,to=player.x+player.w/2,y=e.y+10;
 for(let x=Math.min(from,to);x<Math.max(from,to);x+=8)if(hit(x,y,3,3))return false;
 return true;
}
function updateThrower(e){
 if(!throwerCanSee(e)){e.windup=0;e.attackT=Math.max(e.attackT,90);return;}
 if(e.windup>0){
  if(--e.windup===0){
   enemyShots.push({x:e.x+(e.face<0?-10:e.w+2),y:e.y+8,w:9,h:9,vx:e.face*2.3,life:150,owner:e});
   e.attackT=150;
  }
 }else if(--e.attackT<=0){e.face=player.x<e.x?-1:1;e.windup=36;}
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
  rect(s.x-1,s.y+2,11,6,'#593828');rect(s.x,s.y,9,8,'#bf884e');rect(s.x+1,s.y,6,3,'#ffe0a1');
  rect(s.x+3,s.y+3,2,2,'#765039');
 }
}
