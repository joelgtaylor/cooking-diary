/* Illustration-space atmosphere, always behind terrain and actors. */
(function(){
'use strict';
const chimneys=[[42,181],[226,265],[410,266],[636,209],[722,153]];
const windows=[[102,183,5,11],[208,208,5,9],[279,237,5,7],[331,235,4,8],[348,234,4,8],[546,208,5,10],[569,214,4,8]];
function renderMoonlit(g,{x,y,width,height,time=0,reduced=false,layer='mid'}){
 const sx=width/768,sy=height/432;
 const pixel=(px,py,w,h)=>g.fillRect(Math.round(x+px*sx),Math.round(y+py*sy),Math.max(1,Math.round(w*sx)),Math.max(1,Math.round(h*sy)));
 g.save();
 // Tiny light changes stay within existing distant window panes.
 if(layer==='mid')for(let i=0;i<windows.length;i++){
  const [wx,wy,w,h]=windows[i];
  g.globalAlpha=reduced?.06:.06+.035*Math.sin(time*.7+i*1.8);
  g.fillStyle='#ffd39a';pixel(wx,wy,w,h);
 }
 // Existing painted plumes remain the still image in reduced-motion mode.
 const sources=layer==='near'?[[62,67],[202,213],[520,178],[740,37]]:chimneys;
 if(!reduced)for(let i=0;i<sources.length;i++){
  const [cx,cy]=sources[i];
  for(let k=0;k<4;k++){
   const p=((time/4.5+k/4+i*.17)%1+1)%1;
   // The left-hand painted plumes lean into the wind.
   const leftward=layer==='near'?i<2:i===0;
   const dx=leftward?-p*14+Math.sin(p*5)*p*2:Math.sin(p*3+i)*p*12;
   const dy=p*55,size=5+Math.floor(p*10);
   g.globalAlpha=(layer==='near'?.34:.19)*Math.sin(p*Math.PI);g.fillStyle='#b4bfd7';
   pixel(cx+dx-size/2,cy-dy-size,size,size);
   pixel(cx+dx-size/2+2,cy-dy-size-2,size-1,size+1);
  }
 }
 // Thin depth bands, occluded by the nearer illustration and gameplay.
 if(layer==='mid')for(let i=0;i<3;i++){
  const drift=reduced?0:Math.sin(time*.08+i)*9;
  g.globalAlpha=.018;g.fillStyle='#9daaca';
  pixel(0,306+i*32+drift,768,7+i*3);
 }
 g.restore();
}
function renderFungal(g,{x,y,width,height,time=0,reduced=false,layer='mid'}){
 const sx=width/1200,sy=height/676;
 const caps=layer==='near'?[[168,214,160,35],[1050,226,145,37],[151,345,75,17],[1000,399,79,20]]:
  [[410,252,92,22],[580,288,55,16],[851,248,46,14],[1054,249,77,20],[292,334,44,12],[891,450,46,14]];
 g.save();
 // Pulses follow the gills of the painted caps rather than covering the scene.
 for(let i=0;i<caps.length;i++){
  const [cx,cy,rx,ry]=caps[i],pulse=reduced?.5:(1+Math.sin(time*1.45+i*1.6))/2;
  for(let ring=2;ring>=0;ring--){
   g.globalAlpha=(reduced?.10:.035+pulse*.28)*(1-ring*.2);
   g.fillStyle=i%2?'#bcfaff':'#f1b6ff';g.beginPath();
   g.ellipse(Math.round(x+cx*sx),Math.round(y+cy*sy),rx*sx*(1+ring*.12),ry*sy*(1+ring*.12),0,0,Math.PI*2);g.fill();
  }
 }
 if(!reduced)for(let i=0;i<(layer==='near'?14:20);i++){
  const phase=((time/(6+i%3)+i*.381)%1+1)%1;
  const px=90+(i*157)%1020+Math.sin(time*.5+i)*20,py=570-phase*370;
  const size=i%4===0?4:3;
  g.globalAlpha=(layer==='near'?.85:.65)*Math.sin(phase*Math.PI);
  g.fillStyle=i%3?'#b3f3ed':'#e9ceff';
  g.fillRect(Math.round(x+px*sx),Math.round(y+py*sy),size,size);
 }
 g.restore();
}
window.CrustAtmosphere={renderMoonlit,renderFungal};
})();
