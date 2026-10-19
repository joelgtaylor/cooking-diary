/* Bakery 2's compact pogo sequence. All animation advances on simulation ticks. */
'use strict';
let myceliumState=null;
function relayLayout(){return bakery===2?currentVerticalLayout().relay:null;}
function resetMycelium(){myceliumState=relayLayout()?{progress:0,round:0,last:-1,discovered:false,clueKnown:false,dialogue:null,solved:false,bloom:0,pulse:0,wrong:0}:null;}
function syncMyceliumBloom(){
 const r=relayLayout();if(!r||!myceliumState?.solved)return;
 const [x,y,len]=r.bloom;for(let i=0;i<len;i++)map[y][x+i]='M';
 const [gx,gy,height]=r.gate;for(let i=0;i<height;i++)map[gy+i][gx]='.';
}
function recoverMycelium(){
 const s=myceliumState;if(!s)return;
 s.last=-1;s.pulse=0;s.wrong=0;s.dialogue=null;keys={};
 if(s.solved){s.bloom=0;syncMyceliumBloom();}else s.progress=0;
}
function myceliumLanding(pogo){
 const r=relayLayout(),s=myceliumState;
 if(!r||!s||!s.clueKnown||s.solved||!pogo||state!=='play')return;
 const foot=player.y+player.h,centre=player.x+player.w/2;
 const i=r.switches.findIndex(([x,y,len])=>Math.abs(foot-y*T)<.1&&centre>=x*T&&centre<(x+len)*T);
 if(i<0||i===s.last)return;
 s.last=i;s.pulse=40;
 if(i!==r.sequences[s.round][s.progress]){s.progress=0;s.wrong=65;AudioKit.effect('relayReset');return;}
 s.progress++;s.wrong=0;AudioKit.effect('relay'+s.progress);
 if(s.progress===3){
  if(s.round===0){s.round=1;s.progress=0;s.pulse=55;floater(43*T,29*T,'THE ROOTS ANSWER...','#e4edb9');AudioKit.effect('collect');}
  else{s.solved=true;s.bloom=45;floater(53*T,30*T,'THE ROOTS AWAKEN','#e4edb9');AudioKit.effect('collect');}
 }
}
function updateMycelium(){
 const s=myceliumState;if(!s||state!=='play')return;
 if(player.x>=33*T&&player.x<56*T&&player.y+player.h>=27*T&&player.y+player.h<=36*T)s.discovered=true;
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

const RELAY_ART={idle:[84,29,334,386],talk:[482,29,352,386],bud:[937,160,234,247],
 crescent:[25,478,384,256],fork:[442,478,378,256],spiral:[849,478,384,256],
 bloom:[15,818,470,399],closed:[485,760,349,448],open:[856,760,376,448]};
function relayArtReady(){const a=assets.myceliumAtlas;return a?.complete&&a.naturalWidth===1254&&a.naturalHeight===1254;}
function relaySprite(name,x,y,w,h){g.imageSmoothingEnabled=false;g.drawImage(assets.myceliumAtlas,...RELAY_ART[name],Math.round(x),Math.round(y),w,h);}
function nearSporekeeper(){
 const r=relayLayout();return !!r&&Math.abs(player.x+player.w/2-r.keeper[0]*T)<75&&Math.abs(player.y+player.h-r.keeper[1]*T)<60;
}
function talkMycelium(){
 const s=myceliumState;if(!s)return;
 if(state==='dialogue'){state='play';s.dialogue=null;keys={};player.buffer=0;prevJump=false;return;}
 if(state!=='play'||!nearSporekeeper())return;
 keys={};player.vx=0;player.buffer=0;
 s.dialogue=s.solved?'solved':!s.discovered?'meet':s.round===1?'echo':'clue';
 if(s.dialogue==='clue'){s.clueKnown=true;s.last=-1;}
 state='dialogue';AudioKit.effect('climb');
}
function syncMyceliumTalkButton(){
 const button=document.getElementById('talkBtn');
 button.style.display=(state==='dialogue'||state==='play'&&nearSporekeeper())?'':'none';
 button.textContent=state==='dialogue'?'Continue (E)':'Talk (E)';
}
function drawMycelium(){
 const r=relayLayout(),s=myceliumState;if(!r||!s||camera>1900||camera+W<880||cameraY>1280||cameraY+H<832)return;
 const reduced=typeof window.matchMedia==='function'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const root=s.solved?'#b8d798':'#42615b';
 for(const [x,y,len] of r.switches){const cx=(x+len/2)*T;rect(cx,y*T+40,3,1113-y*T-40,root);rect(cx,1110,1696-cx,3,root);}
 rect(1696,1034,3,80,root);
 if(s.pulse>0&&!reduced){const start=(r.switches[Math.max(0,s.last)][0]+1.5)*T;rect(start+(1696-start)*(1-Math.min(40,s.pulse)/40),1107,10,8,'#f4f0c5');}
 // The second phrase is discovered in the roots, never on the entrance tablet.
 if(s.round===1&&!s.solved){
  rect(1370,884,225,52,'#172d36');g.textAlign='center';g.font='10px monospace';g.fillStyle='#dbe8bd';g.fillText('THE ROOTS ANSWER',1482,898);
  r.sequences[1].forEach((kind,i)=>drawRelaySymbol(kind,1412+i*62,910,'#e9ecc1',3));
 }
 r.switches.forEach(([x,y,len],i)=>{
  const lit=s.solved||r.sequences[s.round].slice(0,s.progress).includes(i);
  if(relayArtReady()){
   relaySprite(['crescent','fork','spiral'][i],x*T,y*T,len*T,35*T-y*T);
   // Exact code runes preserve legibility when the generated medallion is tiny.
   rect(x*T+len*T/2-8,y*T+12,16,17,'#172b38');drawRelaySymbol(i,x*T+len*T/2-5,y*T+15,lit?'#fff3b3':'#dcebd8',2);
   if(lit)rect(x*T+8,y*T,len*T-16,2,'#fff3b3');
  }else drawRelayCap(x*T,y*T,len*T,i,lit,35*T);
 });
 const [bx,by,bw]=r.bloom,amount=s.solved?(reduced?1:1-s.bloom/45):0;
 if(relayArtReady()){
  if(amount===0)relaySprite('bud',bx*T+36,35*T-56,56,56);
  else{const h=Math.round(56+(35*T-by*T-56)*amount);relaySprite('bloom',bx*T,35*T-h,bw*T,h);}
  relaySprite(s.solved&&s.bloom===0?'open':'closed',55*T-48,28*T,128,7*T);
 }else{
  const top=Math.round(1090+(by*T-1090)*amount);drawRelayCap(bx*T,top,bw*T,3,s.solved,Math.max(35*T,top+34));
 }
 const [kx,ky]=r.keeper;
 if(relayArtReady())relaySprite(state==='dialogue'?'talk':'idle',kx*T-32,ky*T-74,64,74);
 else{rect(kx*T-16,ky*T-48,32,48,'#ba9a60');rect(kx*T-22,ky*T-54,44,12,'#6f608c');}
 if(nearSporekeeper()&&state==='play'){
  rect(kx*T-71,ky*T-101,142,20,'#142635');g.textAlign='center';g.font='11px monospace';g.fillStyle='#f8e4b3';g.fillText('SPOREKEEPER · E',kx*T,ky*T-87);
 }
 g.textAlign='left';
}
function drawMyceliumUI(){
 const s=myceliumState;if(!s)return;
 if(state==='dialogue'){
  g.save();g.translate(0,-223);
  rect(100,315,760,186,'#0d1928');rect(104,319,752,178,'#3c5756');rect(107,322,746,172,'#162732');
  g.textAlign='left';g.font='bold 18px monospace';g.fillStyle='#f2d598';g.fillText('THE SPOREKEEPER',128,350);
  const lines={
   meet:['A baker down here? Mind the sleepy roots above.', 'Find their sealed doorway, then come back to me.'],
   clue:['The roots remember: spiral, crescent, fork.', 'Pogo in order; hold jump for height. Watch for the reply.', 'Lower the mixer to pass a cap without waking it.', 'A second phrase will appear among the roots.'],
   echo:['You woke their memory! Now follow the root markings.', 'The second phrase waits inside the chamber.'],
   solved:['Beautifully risen! The old mycelium still remembers.', 'Your path into the cavern is open, baker.']
  }[s.dialogue]||[];
  g.font='15px monospace';g.fillStyle='#e2e7d5';lines.forEach((line,i)=>g.fillText(line,128,381+i*23));
  if(s.dialogue==='clue')relayLayout().sequences[0].forEach((kind,i)=>drawRelaySymbol(kind,650+i*46,340,'#efe6b5',3));
  g.font='12px monospace';g.fillStyle='#c7d4c3';g.fillText('E / Enter / Esc or Continue to return',128,477);g.restore();return;
 }
 if(state!=='play'||!s.discovered||camera>1900||camera+W<880)return;
 const hint=s.solved?'ROOT RELAY · The cavern path is open':!s.clueKnown?'SLEEPING ROOTS · Ask the Sporekeeper to the left':s.wrong?'ROOT RELAY · Listen again; no harm done':s.round===1?'ROOT RELAY · Follow the roots’ reply':'ROOT RELAY · Pogo the remembered order';
 rect(14,54,Math.min(620,hint.length*7+24),27,'#142735');g.font='12px monospace';g.textAlign='left';g.fillStyle='#e4e8c7';g.fillText(hint,24,72);
}
