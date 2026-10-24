/* Render-only completion vignette. No timers, rewards or progression changes. */
'use strict';
const bakeRevealClocks=new WeakMap();
let presentationNow=0;
function bakeRevealProgress(){
 let clock=bakeRevealClocks.get(player);
 if(!clock){clock={};bakeRevealClocks.set(player,clock);}
 if(clock[state]===undefined)clock[state]=presentationNow;
 const reduced=typeof window.matchMedia==='function'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 return {age:reduced?2400:Math.max(0,presentationNow-clock[state]),reduced};
}
function drawBakeCelebration(){
 const {age,reduced}=bakeRevealProgress();
 const themes=[
  {name:'MOONLIT BAKERY',stone:'#3d465d',trim:'#a7b1ca',glow:'#e9ae59',caption:'A golden crust beneath the moon.'},
  {name:'FUNGAL CAVERNS',stone:'#303d48',trim:'#86b8b4',glow:'#b0d4a0',caption:'Wild cultures. A beautifully patient rise.'},
  {name:'CLOCKWORK OVENS',stone:'#433b3e',trim:'#c49160',glow:'#ffc26d',caption:'Forged in fire. Baked to perfection.'},
  {name:'THE SUNKEN PATISSERIE',stone:'#204550',trim:'#91c9bd',glow:'#d7dca1',caption:'From the depths, a final rise.'}
 ];
 const th=themes[bakery-1],rise=Math.min(1,age/900),card=Math.min(1,Math.max(0,(age-650)/500));
 g.save();g.textAlign='center';
 rect(162,62,636,411,'#080e19');rect(166,66,628,403,'#182333');
 rect(166,66,628,3,th.trim);rect(166,466,628,3,th.trim);
 g.font='12px monospace';g.fillStyle=th.trim;g.fillText(state==='win'?(MAXBAKERY===3?'THE THREE BAKERIES · COMPLETE':'THE FOUR BAKERIES · COMPLETE'):th.name,W/2,90);
 g.font='bold 32px monospace';g.fillStyle='#fff0cd';g.fillText(state==='win'?'CRUST MASTER!':'BAKED TO PERFECTION',W/2,129);
 // Stepped masonry arch and a tightly contained oven glow.
 rect(343,184,274,119,th.stone);rect(361,164,238,20,th.stone);rect(385,150,190,14,th.stone);
 rect(361,193,238,108,'#080e17');rect(379,178,202,15,'#080e17');
 for(let i=0;i<5;i++){
  g.globalAlpha=(.04+i*.015)*rise;
  rect(365+i*12,186+i*12,230-i*24,114-i*14,th.glow);
 }
 g.globalAlpha=1;rect(344,299,272,6,th.trim);rect(353,305,254,5,'#080e17');
 // Bake the same pixel loaf used by the world oven, at an integer scale.
 g.save();g.translate(480,Math.round(291-rise*15));g.scale(6,6);ovenLoaf(0,0,28);g.restore();
 if(!reduced){
  for(let k=0;k<3;k++){
   const phase=(age/1700+k/3)%1,x=442+k*36+Math.round(Math.sin(phase*6+k)*5),y=221-Math.round(phase*57);
   g.globalAlpha=.42*(1-phase)*rise;
   rect(x,y,4,9,'#f6e8ce');rect(x+4,y-7,4,7,'#f6e8ce');
  }
 }
 g.globalAlpha=1;g.fillStyle='#cfbd9d';g.font='12px monospace';g.fillText(th.caption,480,330);
 g.save();g.globalAlpha=card;
 rect(214,349,532,102,'#090e18');rect(208,343,532,102,'#ecdfbd');rect(208,343,7,102,'#c8b284');
 // Sparse deterministic flour flecks; no simulation randomness.
 for(let i=0;i<26;i++)rect(220+(i*67)%506,351+(i*31)%84,2,2,'#f9f1dc');
 g.fillStyle='#725736';g.font='bold 11px monospace';g.fillText(state==='win'?'RECIPE CODEX COMPLETE':'RECIPE UNLOCKED',480,366);
 g.fillStyle='#392d22';g.font='bold 19px monospace';g.fillText(state==='win'?(MAXBAKERY===3?'Three bakeries. Three recipes.':'Four bakeries. Four recipes.'):RECIPES[bakery-1].name,480,395,490);
 g.font='12px monospace';g.fillStyle='#725736';g.fillText(state==='win'?'BEST SCORE '+best:'Saved in your recipe codex · T to open',480,424);
 g.restore();
 g.font='13px monospace';g.fillStyle='#f3e4c5';
 g.fillText(state==='win'?'T · Explore your recipes     R · Bake again':bakery<MAXBAKERY?'TAP / ENTER · Next: '+themes[bakery].name:'TAP / ENTER · The final rise',480,499);
 g.restore();
}
