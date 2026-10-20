/* Non-colliding interior backing; all solid geometry is authored in the layout. */
'use strict';
function drawBakeryArchitecture(){
 if(bakery===3){drawFactoryEntrance();return;}
 if(bakery===2){drawCavernFoothills();return;}
 if(bakery!==1||!currentVerticalLayout().workshop)return;
 const {x,y,w,h}=currentVerticalLayout().workshop,px=x*T,py=y*T;
 g.save();
 rect(px+T,py+T,(w-2)*T,(h-1)*T,'#202536');
 for(let row=1;row<h;row++){
  rect(px+T,py+row*T,(w-2)*T,2,'#37394b');
  for(let col=1;col<w-1;col++)rect(px+col*T+(row%2?16:0),py+row*T,1,T,'#303446');
 }
 // Back-wall windows and a workbench remain scenery, with no hidden collision.
 for(const wx of [13,17]){
  rect(wx*T,py+T+15,25,38,'#111b30');rect(wx*T+3,py+T+18,19,30,'#c59054');
  rect(wx*T+11,py+T+18,3,30,'#584349');rect(wx*T+3,py+T+32,19,3,'#584349');
 }
 rect(12*T,53*T+8,2*T,6,'#8a6450');rect(12*T+4,53*T+14,4,18,'#4e3e3f');rect(14*T-8,53*T+14,4,18,'#4e3e3f');
 g.font='bold 11px monospace';g.textAlign='center';g.fillStyle='#e2c69a';
 g.fillText('STARTER WORKSHOP',16*T+16,49*T+10);
 // Lintel trim is contained within the solid wall above each open doorway.
 for(const dx of [11,21]){rect(dx*T,51*T-5,T,5,'#b3936a');rect(dx*T+3,51*T-5,T-6,2,'#ecd3a0');}
 g.restore();
 const room=currentVerticalLayout().ascension?.room;
 if(room){
  const rx=room.x*T,ry=room.y*T;
  g.save();rect(rx+T,ry+T,(room.w-2)*T,(room.h-1)*T,'#242839');
  for(let row=1;row<room.h;row++){
   rect(rx+T,ry+row*T,(room.w-2)*T,2,'#3b3e50');
   for(let col=1;col<room.w-1;col++)rect(rx+col*T+(row%2?16:0),ry+row*T,1,T,'#343749');
  }
  for(const wx of [37,41]){
   rect(wx*T,ry+T+18,25,38,'#141c2a');rect(wx*T+3,ry+T+21,19,31,'#be8f54');
   rect(wx*T+11,ry+T+21,3,31,'#584449');rect(wx*T+3,ry+T+36,19,3,'#584449');
  }
  g.textAlign='center';g.font='bold 11px monospace';g.fillStyle='#e6cba1';g.fillText('PROOFING HALL',40*T,ry+T+11);
  for(const dx of [35,44]){rect(dx*T,35*T-5,T,5,'#ba9b70');rect(dx*T+3,35*T-5,T-6,2,'#eddbad');}
  g.restore();
 }
}

// Riveted backing sits behind actors and collision tiles. The solid roof and
// open doorways come from the layout; pipes and signs never add collision.
function drawFactoryEntrance(){
 const e=currentVerticalLayout().entrance;
 if(!e||camera>26*T||cameraY+H<43*T)return;
 const r=e.room,x=r.x*T,y=r.y*T,w=r.w*T;
 g.save();
 rect(x+T,y+T,w-2*T,4*T,'#18232c');
 for(let col=1;col<r.w-1;col++){
  const px=x+col*T;
  rect(px,y+T,2,4*T,'#47505a');rect(px+2,y+T,1,4*T,'#0e1822');
  for(const ry of [y+T+7,y+5*T-8]){rect(px+6,ry,3,3,'#9a8a6a');rect(px+23,ry,3,3,'#626975');}
 }
 // Recessed pipes and gauges, with restrained warm highlights.
 rect(x+T+8,y+T+30,w-2*T-16,9,'#101820');
 rect(x+T+8,y+T+31,w-2*T-16,3,'#8e6f48');
 for(const px of [11*T,17*T]){
  rect(px,y+T+24,10,22,'#302b28');rect(px+2,y+T+26,6,18,'#be925b');
  rect(px+3,y+T+27,2,9,'#ead4a1');
 }
 for(const dx of [9,19]){
  rect(dx*T,51*T-6,T,6,'#ad8752');rect(dx*T+3,51*T-6,T-6,2,'#f4d5a0');
 }
 g.textAlign='center';g.font='bold 10px monospace';g.fillStyle='#e8d6b5';
 g.fillText('MAINTENANCE / KEFIR RESERVE',14.5*T,50*T+15);
 // A permanent control cue works for both keyboard and the existing touch UI.
 rect(10*T+8,52*T-4,8*T-16,22,'#101a26');g.fillStyle='#d7e9ec';
 g.fillText('STORE NOW · V / KEFIR TO DASH',14*T,52*T+10);
 g.fillStyle='#e8d6b5';g.fillText('SUPPLIES ↑',17*T,48*T-20);
 // Exit wayfinding sits outside the combat silhouettes.
 rect(21*T,44*T+7,4*T,20,'#15202a');g.fillStyle='#f4d5a0';
 g.fillText('LIFT SHAFT ↑',23*T,44*T+21);
 g.restore();
}

// Visual trim stays inside the authored solid balcony and root lintel.
function drawCavernFoothills(){
 const f=currentVerticalLayout().foothills;if(!f||camera>1050||cameraY+H<1200)return;
 const {x,y,w}=f.balcony;
 // Dark recess under the balcony gives the lower route a sheltered silhouette.
 g.save();g.globalAlpha=.32;
 rect((x+.1)*T,(y+1)*T,(w-.2)*T,4*T,'#182535');g.restore();
 for(let i=0;i<6;i++){
  rect((x+i)*T+5,(y+1)*T,3,13+(i%3)*6,'#3f655d');
  rect((x+i)*T+5,(y+1)*T+10,7,3,'#739681');
 }
}
function drawCavernFoothillsTrim(){
 const f=currentVerticalLayout().foothills;if(!f||camera>1050||cameraY+H<1200)return;
 const dx=f.door.x*T,dy=(f.door.opening-1)*T;
 rect(dx+3,dy+23,26,5,'#527e70');rect(dx+5,dy+24,22,2,'#abd2ab');
 // Small spore nodes mark the passage without implying another rune switch.
 for(const nx of [dx+7,dx+24]){rect(nx,dy+27,2,3,'#91d8ca');}
}

// A permanent fork sign distinguishes mandatory cultures from optional combat.
function drawPlungeWayfinding(){
 const p=currentVerticalLayout().plunge;if(!p||camera>2600||camera+W<1750||cameraY>1150)return;
 const [x,y]=p.fork,px=x*T,py=y*T;
 rect(px-2,py-160,4,160,'#6b7560');
 rect(px-85,py-172,170,30,'#162c37');rect(px-83,py-170,166,2,'#b4d2bd');
 rect(px-85,py-138,170,30,'#272735');rect(px-83,py-136,166,2,'#d5b487');
 g.textAlign='center';g.font='bold 11px monospace';g.fillStyle='#d4f2d2';g.fillText('MAIN DESCENT  ↓',px,py-152);
 g.fillStyle='#f1d2a1';g.fillText('BONUS / DANGER  ↑',px,py-118);
 g.textAlign='left';
}
