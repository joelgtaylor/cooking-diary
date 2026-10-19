/* Illustration-space atmosphere, always behind terrain and actors. */
(function(){
'use strict';
const chimneys=[[42,181],[226,265],[410,266],[636,209],[722,153]];
const windows=[[102,183,5,11],[208,208,5,9],[279,237,5,7],[331,235,4,8],[348,234,4,8],[546,208,5,10],[569,214,4,8]];
function renderMoonlit(g,{x,y,width,height,time=0,reduced=false}){
 const sx=width/768,sy=height/432;
 const pixel=(px,py,w,h)=>g.fillRect(Math.round(x+px*sx),Math.round(y+py*sy),Math.max(1,Math.round(w*sx)),Math.max(1,Math.round(h*sy)));
 g.save();
 // Tiny light changes stay within existing distant window panes.
 for(let i=0;i<windows.length;i++){
  const [wx,wy,w,h]=windows[i];
  g.globalAlpha=reduced?.06:.06+.035*Math.sin(time*.7+i*1.8);
  g.fillStyle='#ffd39a';pixel(wx,wy,w,h);
 }
 // Existing painted plumes remain the still image in reduced-motion mode.
 if(!reduced)for(let i=0;i<chimneys.length;i++){
  const [cx,cy]=chimneys[i];
  for(let k=0;k<4;k++){
   const p=((time/7+k/4+i*.17)%1+1)%1;
   const dx=Math.sin(p*3+i)*p*8,dy=p*39,size=3+Math.floor(p*7);
   g.globalAlpha=.115*Math.sin(p*Math.PI);g.fillStyle='#9babc9';
   pixel(cx+dx-size/2,cy-dy-size,size,size);
   pixel(cx+dx-size/2+2,cy-dy-size-2,size-1,size+1);
  }
 }
 // Thin depth bands, occluded by the nearer illustration and gameplay.
 for(let i=0;i<3;i++){
  const drift=reduced?0:Math.sin(time*.08+i)*9;
  g.globalAlpha=.018;g.fillStyle='#9daaca';
  pixel(0,306+i*32+drift,768,7+i*3);
 }
 g.restore();
}
window.CrustAtmosphere={renderMoonlit};
})();
