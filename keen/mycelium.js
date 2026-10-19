/* Bakery 2's compact pogo sequence. All animation advances on simulation ticks. */
'use strict';
let myceliumState=null;
function relayLayout(){return bakery===2?currentVerticalLayout().relay:null;}
function resetMycelium(){myceliumState=relayLayout()?{progress:0,last:-1,solved:false,bloom:0,pulse:0,wrong:0}:null;}
function syncMyceliumBloom(){
 const r=relayLayout();if(!r||!myceliumState?.solved)return;
 const [x,y,len]=r.bloom;for(let i=0;i<len;i++)map[y][x+i]='M';
 const [gx,gy,height]=r.gate;for(let i=0;i<height;i++)map[gy+i][gx]='.';
}
function recoverMycelium(){
 const s=myceliumState;if(!s)return;
 s.last=-1;s.pulse=0;s.wrong=0;
 if(s.solved){s.bloom=0;syncMyceliumBloom();}else s.progress=0;
}
function myceliumLanding(pogo){
 const r=relayLayout(),s=myceliumState;
 if(!r||!s||s.solved||!pogo||state!=='play')return;
 const foot=player.y+player.h,centre=player.x+player.w/2;
 const i=r.switches.findIndex(([x,y,len])=>Math.abs(foot-y*T)<.1&&centre>=x*T&&centre<(x+len)*T);
 if(i<0||i===s.last)return;
 s.last=i;s.pulse=40;
 if(i!==r.sequence[s.progress]){s.progress=0;s.wrong=65;AudioKit.effect('relayReset');return;}
 s.progress++;s.wrong=0;AudioKit.effect('relay'+s.progress);
 if(s.progress===r.sequence.length){s.solved=true;s.bloom=45;floater(53*T,30*T,'THE ROOTS AWAKEN','#e4edb9');AudioKit.effect('collect');}
}
function updateMycelium(){
 const s=myceliumState;if(!s||state!=='play')return;
 if(s.pulse>0)s.pulse--;if(s.wrong>0)s.wrong--;
 if(s.bloom>0&&--s.bloom===0){syncMyceliumBloom();burst(53*T,31*T,'#d9ecc0',12);AudioKit.effect('climb');}
}
function drawRelaySymbol(kind,x,y,color,scale=2){
 const pixels=[['01110','11000','11000','11000','01110'],['10101','01110','00100','00100','00100'],['11111','10001','10101','10111','10000']][kind];
 for(let row=0;row<5;row++)for(let col=0;col<5;col++)if(pixels[row][col]==='1')rect(x+col*scale,y+row*scale,scale,scale,color);
}
function drawRelayCap(x,y,w,kind,lit,stemBottom){
 const shades=[['#224a60','#43898d','#9ad6bc'],['#393659','#78759d','#c6bddd'],['#514633','#9b8559','#e4cf97']][Math.min(kind,2)];
 rect(x+w*.41,y+24,w*.18,stemBottom-y-24,'#263d40');rect(x+w*.44,y+24,4,stemBottom-y-24,'#8dba99');
 // Flat luminous landing rim; the cap and gills sit below collision height.
 rect(x,y,w,4,'#172737');rect(x+3,y,w-6,2,lit?'#f6f4c4':shades[2]);
 for(let j=0;j<6;j++){const inset=j<3?0:(j-2)*5;rect(x+inset,y+4+j*4,w-inset*2,4,shades[j<2?2:j<4?1:0]);}
 for(let j=0;j<9;j++)rect(x+9+j*(w-18)/9,y+24,2,7,shades[2]);
 rect(x+w/2-10,y+5,20,19,'#172b38');if(kind<3)drawRelaySymbol(kind,x+w/2-7,y+7,lit?'#fff5c2':'#d9e5cd',3);
 else{rect(x+w/2-5,y+10,10,3,'#e9f2bb');rect(x+w/2-2,y+7,3,10,'#e9f2bb');}
 for(let j=0;j<8;j++)rect(x+7+j*(w-14)/8,y+7+(j%3)*3,2,2,shades[2]);
}
function drawMycelium(){
 const r=relayLayout(),s=myceliumState;if(!r||!s||camera>1850||camera+W<1024||cameraY>1160||cameraY+H<832)return;
 const reduced=typeof window.matchMedia==='function'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const root=s.solved?'#b8d798':'#42615b';
 for(const [x,y,len] of r.switches){const cx=(x+len/2)*T;rect(cx,1090,4,23,root);rect(cx,1110,1696-cx,4,root);}
 rect(1696,1034,4,80,root);
 if(s.pulse>0&&!reduced){const start=(r.switches[Math.max(0,s.last)][0]+1.5)*T;rect(start+(1696-start)*(1-s.pulse/40),1107,10,8,'#f4f0c5');}
 const [cx,cy]=r.clue;rect(cx,cy,318,87,'#101c2c');rect(cx+4,cy+4,310,79,'#46544d');rect(cx+8,cy+8,302,71,'#222f35');
 g.textAlign='center';g.font='12px monospace';g.fillStyle='#e5e7c6';g.fillText('WAKE THE ROOTS',cx+159,cy+24);
 r.sequence.forEach((kind,i)=>{drawRelaySymbol(kind,cx+55+i*85,cy+39,i<s.progress?'#fff2b3':'#b7c8bb',4);if(i<2){rect(cx+95+i*85,cy+47,19,3,'#8ca18f');rect(cx+108+i*85,cy+43,3,11,'#8ca18f');}});
 g.font='10px monospace';g.fillStyle=s.wrong?'#fff0bd':'#d7e6d2';g.fillText(s.solved?'THE WAY IS OPEN':s.wrong?'TRY THE SYMBOLS AGAIN':'POGO THE CAPS IN THE CARVED ORDER',cx+159,cy+73);
 r.switches.forEach(([x,y,len],i)=>drawRelayCap(x*T,y*T,len*T,i,r.sequence.slice(0,s.progress).includes(i),35*T));
 const [bx,by,bw]=r.bloom,amount=s.solved?(reduced?1:1-s.bloom/45):0,top=Math.round(1090+(by*T-1090)*amount);
 drawRelayCap(bx*T,top,bw*T,3,s.solved,Math.max(35*T,top+34));
 // Root doorway matches the solid gate exactly until the bloom finishes.
 if(!s.solved||s.bloom>0){const [gx,gy,height]=r.gate;for(let i=0;i<height;i++){rect(gx*T+7,(gy+i)*T,7,32,'#405951');rect(gx*T+18,(gy+i)*T,5,32,'#799379');rect(gx*T+7,(gy+i)*T+13,17,4,root);}}
 g.textAlign='left';
}
