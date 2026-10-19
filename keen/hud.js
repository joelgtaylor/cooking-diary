/* Screen-space HUD, codex, map, diagnostic overlay and button presentation.
 * Input bindings and world progression live in their own scripts.
 */
'use strict';
function drawCodex(){const px=230,py=64,pw=500,ph=412;g.fillStyle='#3a2c18';g.fillRect(px-6,py-6,pw+12,ph+12);g.fillStyle='#f5e9c8';g.fillRect(px,py,pw,ph);g.fillStyle='#e8d5a0';g.fillRect(px,py,14,ph);g.fillStyle='#8a6d3b';g.fillRect(px+16,py,2,ph);const cx=px+pw/2,ink='#4a3520',r=RECIPES[codexPage],un=unlocked.includes(codexPage);g.textAlign='center';g.font='bold 15px monospace';g.fillStyle='#8a6d3b';g.fillText('\u{1F4D6} RECIPE CODEX',cx,py+30);if(un){g.fillStyle=ink;g.font='bold 22px monospace';g.fillText(r.name,cx,py+62);g.font='13px monospace';g.fillStyle='#7a5f36';g.fillText(r.sub,cx,py+84);g.fillStyle='#b89b5e';g.fillRect(px+40,py+98,pw-80,2);g.textAlign='left';let y=py+126;g.font='bold 14px monospace';g.fillStyle='#8a6d3b';g.fillText('INGREDIENTS',px+44,y);y+=22;g.font='14px monospace';g.fillStyle=ink;r.ing.forEach(s=>{g.fillText('\u2022 '+s,px+44,y);y+=19});y+=10;g.font='bold 14px monospace';g.fillStyle='#8a6d3b';g.fillText('METHOD',px+44,y);y+=22;g.font='14px monospace';g.fillStyle=ink;r.steps.forEach((s,i)=>{g.fillText((i+1)+'. '+s,px+44,y);y+=19})}else{g.fillStyle=ink;g.font='bold 44px monospace';g.fillText('\u{1F512}',cx,py+150);g.font='bold 20px monospace';g.fillText('RECIPE LOCKED',cx,py+195);g.font='14px monospace';g.fillStyle='#7a5f36';g.fillText('Clear Bakery '+(codexPage+1)+' to unlock',cx,py+225);g.fillText('this page of the codex.',cx,py+247)}g.textAlign='center';g.font='bold 15px monospace';g.fillStyle='#8a6d3b';g.fillText('\u25C0  Page '+(codexPage+1)+' of '+RECIPES.length+'  \u25B6',cx,py+ph-18);g.font='bold 40px monospace';g.fillStyle='#ffd75e';g.fillText('\u25C0',150,H/2);g.fillText('\u25B6',810,H/2);g.font='14px monospace';g.fillStyle='#fff';g.fillText('\u2190 \u2192 / tap edges: turn page \u00B7 T / tap page: close',W/2,H-24)}

function drawHUD(){
g.save();
rect(0,0,W,46,'#101827');rect(0,44,W,2,'#a88a54');
const cells=[['HEALTH','♥ '.repeat(Math.max(0,player.health))+(player.shield?' ◈':''),18,160],['YEAST',collected+'/5',190,140],['AMMO','✦ '+player.ammo,360,110],['SCORE',String(player.score),500,160],['BEST',String(best),690,120],['BAKERY',bakery+'/3',845,110]];
for(const [label,value,x,width] of cells){
 g.textAlign='left';g.font='10px monospace';g.fillStyle='#aebdd1';g.fillText(label,x,13);
 g.font='bold 19px monospace';g.fillStyle=label==='YEAST'&&collected>=5?'#ffe1a1':'#f6e8ca';g.fillText(value,x,35,width);
 if(x>18)rect(x-16,10,1,26,'#39475c');
}
g.restore();g.font='bold 16px monospace';g.fillStyle='#fff0cc';if(combo>1&&comboT>0){g.fillStyle='#efff8b';g.fillText('COMBO x'+combo,18,62);g.fillStyle='#fff'}if(player.speedT>0)g.fillText('⚡'+Math.ceil(player.speedT/60)+'s',190,62);if(state!=='play'){rect(0,0,W,H,'#090c22dd');g.textAlign='center';g.fillStyle='#fff';if(state==='codex'){drawCodex()}else if(state==='clear'||state==='win'){drawBakeCelebration()}else{g.font='bold 52px monospace';g.fillText('PAUSED',W/2,H/2-60);g.font='22px monospace';g.fillText('Press P to resume - T for recipes',W/2,H/2+10)}g.textAlign='left'}
}

function drawPhase3Map(){
 if(minimap.style.display==='none')return;
 const g=minimap.getContext('2d');
 g.fillStyle='#111a2a';g.fillRect(0,0,1050,360);
 g.font='bold 14px monospace';g.textAlign='left';g.fillStyle='#dbffdf';
 g.fillText('BAKERY '+bakery+' · GREEN checkpoints · GOLD jars · PINK spikes · CYAN baker · ORANGE oven',12,17);
 const sy=6.0,offset=22;
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
   const v=map[y][x];
   if(v==='.'){continue;}g.fillStyle=v==='#'?'#706f9b':'#fa79a6';
   g.fillRect(x*10,y*sy+offset,10,Math.ceil(sy));
 }
 for(const gem of gems)if(!gem.got){g.fillStyle='#ffe689';g.fillRect(Math.floor(gem.x/T)*10,Math.floor(gem.y/T)*sy+offset,9,8)}
 for(let i=0;i<currentVerticalLayout().checkpoints.length;i++){
  const [x,y]=currentVerticalLayout().checkpoints[i];
  g.fillStyle=i<=checkpointState.current?'#82ffbf':'#5ba887';g.fillRect(x*10,y*sy+offset,10,9);
 }
 g.fillStyle='#ff985e';g.fillRect(currentVerticalLayout().oven.x*10,currentVerticalLayout().oven.y*sy+offset,16,12);
 g.fillStyle='#56f4f3';g.fillRect(Math.floor(player.x/T)*10,Math.floor(player.y/T)*sy+offset,10,10);
 g.strokeStyle='#c2fff4';g.lineWidth=2;
 g.strokeRect(camera/T*10,cameraY/T*sy+offset,W/T*10,H/T*sy);
}


function diagnosticOverlay(){
 if(!window.__crustCameraDebug)return;
 g.save();g.setTransform(1,0,0,1,0,0);
 g.lineWidth=1;g.strokeStyle='rgba(181,255,231,.18)';
 for(let x=Math.ceil(camera/T)*T;x<camera+W;x+=T){
  const sx=Math.round(x-camera)+.5;
  g.beginPath();g.moveTo(sx,0);g.lineTo(sx,H);g.stroke();
 }
 for(let y=Math.ceil(cameraY/T)*T;y<cameraY+H;y+=T){
  const sy=Math.round(y-cameraY)+.5;
  g.beginPath();g.moveTo(0,sy);g.lineTo(W,sy);g.stroke();
 }
 g.fillStyle='#ddffe4';g.font='bold 14px monospace';
 g.fillText('CLOCKWORK CAMERA · '+Math.round(cameraY)+' px altitude scroll',18,H-24);
 g.restore();
}
