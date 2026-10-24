/* Approved enemy presentation reused by the full-route preview. */
'use strict';
function drawSunkenActor(kind,e,images){
 if(!e.alive&&!e.deathT)return;
 if(kind==='puffer'){
  for(const b of e.bubbles)if(!b.dead){g.fillStyle='#87a6d344';g.strokeStyle='#eef5e5';g.lineWidth=2;g.beginPath();g.arc(b.x+10,b.y+10,10,0,7);g.fill();g.stroke();g.fillStyle='#fff7d8';g.fillRect(b.x+5,b.y+4,4,3);}
  for(const p of e.pops){g.strokeStyle='#dbeed8';g.beginPath();g.arc(p.x,p.y,16-p.t/2,0,7);g.stroke();}
  const frame=!e.alive?3:e.phase==='inflate'?1:e.phase==='burst'?2:e.phase==='recover'?3:0;
  g.save();g.translate(Math.round(e.x+30),Math.round(e.y+28));g.scale(e.face,1);
  if(!e.alive){g.globalAlpha=e.deathT/48;g.rotate((48-e.deathT)*.025);}
  const inflate=e.phase==='inflate'?1+(48-e.timer)/480:1;g.scale(inflate,inflate);
  g.drawImage(images.puffer,frame*543,0,543,724,-55,-73,110,146);g.restore();
  if(e.alive&&e.phase==='inflate'){g.strokeStyle='#fff0bc';g.lineWidth=3;g.beginPath();g.arc(e.x+30,e.y+28,49,-Math.PI/2,-Math.PI/2+Math.PI*2*(48-e.timer)/48);g.stroke();
   if(e.locked){g.save();g.setLineDash([5,7]);g.strokeStyle='#f8eac799';g.lineWidth=2;for(const a of [e.aim-.34,e.aim,e.aim+.34]){g.beginPath();g.moveTo(e.x+30+Math.cos(a)*44,e.y+28+Math.sin(a)*44);g.lineTo(e.x+30+Math.cos(a)*120,e.y+28+Math.sin(a)*120);g.stroke();}g.restore();}}
 }else if(kind==='rider'){
  for(const t of e.wake){g.globalAlpha=t.life/36;g.strokeStyle='#d9e9e5';g.beginPath();g.arc(t.x,t.y,8,0,7);g.stroke();}g.globalAlpha=1;
  if(e.phase==='coil'){g.save();g.setLineDash([7,8]);g.lineWidth=e.locked?3:2;g.strokeStyle=e.locked?'#fff0bc':'#d0e7e28c';g.beginPath();g.moveTo(e.x+32,e.y+16);g.lineTo(e.x+32+Math.cos(e.aim)*313,e.y+16+Math.sin(e.aim)*313);g.stroke();g.restore();g.strokeStyle='#fff0bc';g.lineWidth=3;g.beginPath();g.arc(e.x+32,e.y+16,44,-Math.PI/2,-Math.PI/2+Math.PI*2*(44-e.timer)/44);g.stroke();}
  const frame=!e.alive?3:e.phase==='coil'?1:e.phase==='dash'?2:e.phase==='recover'?3:0;
  const crops=[[55,145,505,470,245,265],[600,115,440,500,220,310],[1040,245,620,295,350,195],[1654,210,518,420,246,225]],c=crops[frame];
  g.save();g.translate(Math.round(e.x+32),Math.round(e.y+16));if(e.phase==='dash'||e.phase==='coil')g.rotate(e.aim+(e.face<0?-Math.PI:0));g.scale(e.face,1);if(!e.alive){g.globalAlpha=e.deathT/48;g.rotate((48-e.deathT)*.03);}g.drawImage(images.rider,...c.slice(0,4),-c[4]*.22,-c[5]*.22,c[2]*.22,c[3]*.22);g.restore();
  if(e.wallStun){g.strokeStyle='#fff0bc';for(let i=0;i<3;i++){g.beginPath();g.arc(e.x+18+i*14,e.y-16,3,0,7);g.stroke();}}
 }else if(kind==='crab'){
  const frame=!e.alive?3:e.phase==='open'?2:e.phase==='rattle'||e.phase==='tuck'?1:0,claw=CrustCrabClaws.pose(e);
  g.save();g.translate(e.x+48,e.y);if(!e.alive){g.globalAlpha=e.deathT/48;g.translate((48-e.deathT)*1.5,(48-e.deathT)*.3);}
  if(claw){g.beginPath();g.rect(-100,-50,200,200);for(const s of [-1,1]){g.moveTo(s*58,65);g.lineTo(s*18,67);g.lineTo(s*12,101);g.lineTo(s*62,101);g.closePath();}g.clip('evenodd');}
  g.drawImage(images.crab,frame*543,140,543,460,-72,-12,144,122);g.restore();
  if(claw){const crop=[[74,140,648,420],[776,140,626,420],[1478,140,613,420]][claw.frame];for(const d of [-1,1]){g.save();g.translate(e.x+48+d*34,e.y+56);g.scale(d,1);g.drawImage(images.claws,...crop,claw.reach-60,-27.4,74,48);g.restore();}}
  if(e.alive){g.strokeStyle=e.phase==='open'?'#fff0bc':'#9fb7c1';g.lineWidth=2;g.strokeRect(e.x+1,e.y+1,94,94);if(e.phase==='rattle'){g.beginPath();g.arc(e.x+48,e.y+16,27,-Math.PI*.8,-Math.PI*.2);g.stroke();}if(e.clang){g.beginPath();g.moveTo(e.x-6,e.y+42);g.lineTo(e.x-14,e.y+32);g.stroke();}}
 }else{
  const frame=e.phase==='turn'?3:Math.floor(e.age/9)%3,c=[[37,184,508,403],[609,184,469,403],[1129,184,499,406],[1730,184,413,374]][frame];
  g.save();g.translate(Math.round(e.x+24),Math.round(e.y+20));g.scale(e.face,1);if(!e.alive){g.globalAlpha=e.deathT/36;g.rotate((36-e.deathT)*.025);}g.drawImage(images.reef,...c,38-c[2]*.15,-36,c[2]*.15,c[3]*.15);g.restore();
  if(e.phase==='turn'){g.strokeStyle='#d7e8c1';g.beginPath();g.moveTo(e.x+20,e.y-9);g.lineTo(e.x+25,e.y-15);g.lineTo(e.x+30,e.y-9);g.stroke();}
 }
 if(kind!=='reef'&&e.alive)for(let i=0;i<e.maxHp;i++){g.fillStyle=i<e.hp?'#fff0b5':'#384e60';g.fillRect(e.x+e.w/2-e.maxHp*6+i*12,e.y-25,8,5);}
}
