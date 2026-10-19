/* Non-colliding interior backing; all solid geometry is authored in the layout. */
'use strict';
function drawBakeryArchitecture(){
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
}
