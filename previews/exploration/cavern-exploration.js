/* Optional Bakery 2 districts, relic collection and a repaired freight lift.
 * No mandatory cultures, combat rules or movement constants live here. */
'use strict';
let cavernExploration=null;
const CAVERN_DISCOVERY_KEY='crustQuestCavernRelics';
function cavernDiscoveryLayout(){return bakery===2?currentVerticalLayout().exploration:null;}
function readCavernRelics(){
 try{const value=JSON.parse(localStorage.getItem(CAVERN_DISCOVERY_KEY)||'[]');return new Set(Array.isArray(value)?value.filter(x=>['cellar-pin','hollow-compass','freight-token'].includes(x)):[]);}catch{return new Set();}
}
function resetCavernExploration(){
 const d=cavernDiscoveryLayout();
 cavernExploration=d?{found:readCavernRelics(),collected:new Set(),visited:new Set(),opened:new Set(),repaired:false,liftY:d.lift.bottom*T,ride:null}:null;
}
function recoverCavernExploration(){
 const s=cavernExploration,d=cavernDiscoveryLayout();if(!s||!d)return;
 s.ride=null;s.liftY=d.lift.bottom*T;
}
function cavernNear(x,y,dx=54,dy=48){return Math.abs(player.x+player.w/2-x*T)<dx&&Math.abs(player.y+player.h-y*T)<dy;}
function cavernExploreAction(){
 const s=cavernExploration,d=cavernDiscoveryLayout();if(!s||!d||state!=='play'||s.ride)return null;
 for(let i=0;i<d.cellar.mouths.length;i++){const [x,y,w]=d.cellar.mouths[i];if(!s.opened.has(i)&&cavernNear(x+w/2,y,40,14)&&player.ground)return 'cellar-'+i;}
 if(!s.repaired&&cavernNear(...d.lift.repair))return 'repair';
 if(cavernNear(d.lift.x,s.liftY/T,48,12)&&player.ground)return s.repaired?'ride':'broken';
 // Call the empty lift from either terminal. This also handles leaving it midway.
 if(s.repaired&&[d.lift.top,d.lift.bottom].some(y=>cavernNear(d.lift.x,y,48,12))&&player.ground)return 'call';
 return null;
}
function interactCavernExploration(){
 const s=cavernExploration,d=cavernDiscoveryLayout(),action=cavernExploreAction();if(!action)return false;
 if(action.startsWith('cellar-')){
  const i=Number(action.slice(7)),[x,y,w]=d.cellar.mouths[i];s.opened.add(i);for(let j=0;j<w;j++)map[y][x+j]='.';
  floater(player.x,player.y-18,'A STAIRWAY BELOW...','#e2d3ad');AudioKit.effect('climb');
 }else if(action==='repair'){
  s.repaired=true;player.score+=250;floater(player.x,player.y-20,'FREIGHT LIFT RESTORED','#ffe2a4');AudioKit.effect('climb');
 }else if(action==='broken')floater(player.x,player.y-20,'FOLLOW THE CABLE INTO THE HOLLOW','#ffe2a4');
 else if(action==='call'){
  s.liftY=(cavernNear(d.lift.x,d.lift.top,48,12)?d.lift.top:d.lift.bottom)*T;
  floater(player.x,player.y-20,'LIFT READY','#ffe2a4');AudioKit.effect('climb');
 }else{
  s.ride={target:(s.liftY/T>(d.lift.top+d.lift.bottom)/2?d.lift.top:d.lift.bottom)*T};
  pogoOn=false;player.hang=null;player.vx=0;player.vy=0;player.buffer=0;keys={};prevJump=false;
  document.getElementById('pogoBtn').textContent='Mixer OFF';AudioKit.effect('climb');
 }
 return true;
}
function updateCavernLiftRide(){
 const s=cavernExploration,d=cavernDiscoveryLayout();if(!s?.ride||!d||state!=='play')return false;
 const jump=keys.jump||keys[' ']||keys.ArrowUp||keys.w;
 if(jump){s.ride=null;player.ground=false;player.vy=-10.7;player.buffer=0;player.coyote=0;prevJump=true;AudioKit.effect('jump');return false;}
 const delta=s.ride.target-s.liftY,step=Math.sign(delta)*Math.min(2.4,Math.abs(delta));
 const x=d.lift.x*T-player.w/2,y=s.liftY+step-player.h;
 // Only one-way shelves intersect this shaft. Solid geometry always wins.
 if(hit(x,y,player.w,player.h)){s.ride=null;return false;}
 s.liftY+=step;player.x=x;player.y=s.liftY-player.h;player.vx=0;player.vy=0;player.ground=true;player.hang=null;
 if(Math.abs(delta)<=2.4){s.ride=null;AudioKit.effect('climb');}
 return true;
}
function updateCavernExploration(){
 const s=cavernExploration,d=cavernDiscoveryLayout();if(!s||!d||state!=='play')return;
 // The stationary car is a real support surface, even between map shelves.
 if(!s.ride&&Math.abs(player.x+player.w/2-d.lift.x*T)<29&&player.vy>=0){
  const foot=player.y+player.h;
  if(foot>=s.liftY&&foot-player.vy<=s.liftY+1.3){player.y=s.liftY-player.h;player.vy=0;player.ground=true;}
 }
 for(const [id,name,[x0,y0,x1,y1]] of [
  ['cellar','FORGOTTEN STARTER CELLAR',d.cellar.bounds],['hollow',"GIANT'S HOLLOW",d.hollow.bounds]]){
  if(!s.visited.has(id)&&player.x>=x0*T&&player.x<x1*T&&player.y>=y0*T&&player.y<y1*T){s.visited.add(id);floater(player.x,player.y-22,name,'#bde5d4');}
 }
 for(const r of d.relics)if(!s.collected.has(r.id)&&cavernNear(r.x,r.y+1,28,38)){
  s.collected.add(r.id);s.found.add(r.id);player.score+=750;player.ammo+=10;
  try{localStorage.setItem(CAVERN_DISCOVERY_KEY,JSON.stringify([...s.found]));}catch{}
  burst(r.x*T,r.y*T,'#ffe2a4',12);floater(r.x*T,r.y*T-22,r.name.toUpperCase(),'#ffe2a4');AudioKit.effect('collect');
 }
}
function syncCavernExploreButton(){
 const b=document.getElementById('exploreBtn'),action=cavernExploreAction();
 b.style.display=action?'':'none';b.textContent=action?.startsWith('cellar-')?'Open cellar (E)':({repair:'Repair lift (E)',ride:'Ride lift (E)',call:'Call lift (E)',broken:'Inspect lift (E)'})[action]||'Explore (E)';
}
function cavernVisible(x,y,w,h){return x+w>=camera&&x<=camera+W&&y+h>=cameraY&&y<=cameraY+H;}
function cavernPlaque(x,y,text,color='#e6cb98'){
 g.save();g.font='bold 10px monospace';g.textAlign='center';
 rect(x-95,y-14,190,24,'#18202d');rect(x-92,y+9,184,2,color);g.fillStyle=color;g.fillText(text,x,y+2);g.restore();
}
function drawCavernDiscoveryBackdrop(){
 const d=cavernDiscoveryLayout();if(!d)return;
 const [x0,y0,x1,y1]=d.cellar.bounds;
 if(cavernVisible(x0*T,y0*T,(x1-x0)*T,(y1-y0)*T)){
  rect(x0*T,y0*T,(x1-x0)*T,(y1-y0)*T,'#191c2a');
  for(let y=y0;y<y1;y+=2)for(let x=x0;x<x1;x+=3){rect(x*T+4,y*T+3,78,3,'#35303d');rect(x*T+6,y*T+7,3,48,'#282635');}
  // Shelved starter jars establish this as an abandoned working bakery.
  for(const [x,y]of [[6,59],[8,59],[19,59],[21,59],[7,67],[19,67],[21,67]]){
   rect(x*T-9,y*T-24,18,22,'#54726d');rect(x*T-7,y*T-17,14,12,'#92aa89');rect(x*T-10,y*T-26,20,5,'#b7a181');rect(x*T-14,y*T+1,28,4,'#876449');
  }
  // A lit rear window teases the rolling pin before reaching its floor.
  rect(7*T,66*T,3*T,2*T,'#514238');rect(7*T+5,66*T+5,3*T-10,2*T-10,'#8c7451');
  cavernPlaque(13*T,56*T,'FORGOTTEN STARTER CELLAR');
 }
 const h=d.hollow.bounds;
 if(cavernVisible(h[0]*T,43*T,7*T,11*T)){
  // Dark cutaway reads as an interior; only authored bright rims are landings.
  rect(69*T,44*T,7*T,10*T,'#182b31');
  for(let x=69;x<=75;x+=2){rect(x*T+4,44*T,7,10*T,'#34534b');rect(x*T+11,44*T,3,10*T,'#476354');}
  for(const y of [45,48,51]){rect(74*T,y*T,38,26,'#32677b');rect(74*T+4,y*T+4,30,18,'#72b4b7');}
  cavernPlaque(72.5*T,45.5*T,"GIANT'S HOLLOW",'#a8ddd0');
 }
}
function drawCavernRelic(r,found){
 const x=r.x*T,y=r.y*T+Math.sin(tick*.055)*2;
 // Dotted gold frame distinguishes optional relics from mandatory cultures.
 for(const [dx,dy]of [[-17,-17],[14,-17],[-17,14],[14,14]])rect(x+dx,y+dy,4,4,found?'#93b8aa':'#ffe4a0');
 if(r.kind==='pin'){rect(x-16,y-3,32,6,'#ad7144');rect(x-10,y-7,20,14,'#e3bf83');rect(x-8,y-6,4,12,'#fbe4ad');}
 else if(r.kind==='compass'){
  rect(x-10,y-11,20,22,'#d1ad6a');rect(x-7,y-8,14,16,'#253b42');rect(x-2,y-7,4,14,'#f5e6be');rect(x-6,y-2,12,4,'#78cbc3');
 }else{rect(x-10,y-11,20,22,'#9d7148');rect(x-8,y-9,16,18,'#e3c582');rect(x-3,y-6,6,12,'#66543e');}
}
function drawCavernExploration(){
 const d=cavernDiscoveryLayout(),s=cavernExploration;if(!d||!s)return;
 const l=d.lift,x=l.x*T;
 if(cavernVisible(x-40,l.top*T-40,80,(l.bottom-l.top)*T+60)){
  // Shaft rails and car match the live platform anchor; no decorative floor.
  for(const dx of [-30,28])rect(x+dx,l.top*T,3,(l.bottom-l.top)*T,'#675b4c');
  for(let y=Math.max(l.top,Math.floor(cameraY/T));y<Math.min(l.bottom,Math.ceil((cameraY+H)/T));y+=2){rect(x-32,y*T,7,5,'#b29a70');rect(x+26,y*T,7,5,'#b29a70');}
  rect(x-27,s.liftY,54,8,'#463b36');rect(x-26,s.liftY,52,3,s.repaired?'#e7d29d':'#9c8770');
  rect(x-32,s.liftY-14,5,20,'#796649');rect(x+27,s.liftY-14,5,20,'#796649');
  if(cavernVisible(x-95,53*T,190,32))cavernPlaque(79*T,53*T,s.repaired?'OLD FREIGHT LIFT':'LIFT · CABLE SEVERED');
 }
 // The cable visibly leads from the shaft to the repair mechanism inside.
 if(cavernVisible(71*T,50*T,12*T,4*T)){
  rect(71*T,50*T+18,12*T,3,s.repaired?'#b6bb82':'#6b6953');
  rect(71*T-15,50*T-29,30,29,'#373843');rect(71*T-11,50*T-25,22,20,'#8f7959');
  rect(71*T-3,50*T-21,6,14,s.repaired?'#9ae5c0':'#e4b975');
 }
 for(const r of d.relics)if(!s.collected.has(r.id)&&cavernVisible(r.x*T-20,r.y*T-20,40,40))drawCavernRelic(r,s.found.has(r.id));
 // Entrances are marked with a tiny jar/arrow motif rather than generic loot.
 for(const [i,[mx,my,mw]]of d.cellar.mouths.entries())if(cavernVisible(mx*T,my*T-50,mw*T,60)){
  if(!s.opened.has(i)){rect(mx*T,my*T,mw*T,5,'#b39568');rect((mx+mw/2)*T-6,my*T+2,12,6,'#e9ce96');}
  rect((mx+.5)*T,my*T-28,10,15,'#a2c1a2');rect((mx+.5)*T-2,my*T-31,14,4,'#c6a77b');
  rect((mx+1)*T,my*T-10,3,9,'#e7cb95');rect((mx+1)*T-3,my*T-5,9,3,'#e7cb95');
 }
}
function drawCavernDiscoveryUI(){
 const s=cavernExploration;if(!s)return;
 g.save();g.font='11px monospace';g.textAlign='right';g.fillStyle='#ead8ad';g.fillText('RELICS '+s.found.size+'/3',W-14,H-13);
 if(s.ride){g.textAlign='center';g.fillText('FREIGHT LIFT · JUMP TO LEAVE',W/2,H-13);}g.restore();
}

function drawCavernDistrictMap(ctx,sy,offset){
 const s=cavernExploration,d=cavernDiscoveryLayout();if(!s||!d)return;
 ctx.save();ctx.strokeStyle='#e3c98e';ctx.fillStyle='#fff0c9';ctx.font='bold 11px monospace';ctx.textAlign='left';ctx.lineWidth=1;
 for(const [id,label,b] of [['cellar','STARTER CELLAR',d.cellar.bounds],['hollow',"GIANT'S HOLLOW",d.hollow.bounds]])if(s.visited.has(id)){
  const [x,y,x1,y1]=b;ctx.strokeRect(x*10,y*sy+offset,(x1-x)*10,(y1-y)*sy);ctx.fillText(label,x*10+4,y*sy+offset+12);
 }
 if(s.repaired){ctx.beginPath();ctx.moveTo(d.lift.x*10,d.lift.top*sy+offset);ctx.lineTo(d.lift.x*10,d.lift.bottom*sy+offset);ctx.stroke();ctx.fillText('LIFT',d.lift.x*10+6,40*sy+offset);}
 ctx.restore();
}
