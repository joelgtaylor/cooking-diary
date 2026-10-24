const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const F=require('./full-fight.js'),B=require('./master-of-deep.js'),{previewGame}=require('../sunken/test-harness.cjs');
const player=()=>({x:245,y:80,w:58,h:26,health:4,inv:0,vx:0,vy:0});
test('schedule teaches two clear tool pairs, adds ink every other attack, then inks every attack',()=>{
 assert.deepEqual(Array.from({length:10},(_,i)=>F.plan(i)),[
  {battleStage:'opening',attack:'lame',ink:false},{battleStage:'opening',attack:'scraper',ink:false},
  {battleStage:'opening',attack:'lame',ink:false},{battleStage:'opening',attack:'scraper',ink:false},
  {battleStage:'escalation',attack:'lame',ink:false},{battleStage:'escalation',attack:'scraper',ink:true},
  {battleStage:'fury',attack:'lame',ink:true},{battleStage:'fury',attack:'scraper',ink:true},
  {battleStage:'fury',attack:'lame',ink:true},{battleStage:'fury',attack:'scraper',ink:true}]);
});
test('live controller follows the schedule without overlapping tools or shortening approved warnings/recovery',()=>{
 const e=F.create(),p=player(),attacks=[];let previous=e.phase,lastInk=0,inkThisRound=false;
 for(let i=0;i<5000&&e.completed<10;i++){
  if(e.completed<4)assert.equal(e.ink,null);
  F.update(e,p);
  if(e.inkCycles>lastInk){lastInk=e.inkCycles;inkThisRound=true;assert.equal(e.wave,null);}
  if(e.phase==='prepare'&&previous!=='prepare'){
   assert.equal(e.timer,e.attack==='lame'?60:72);attacks.push({battleStage:e.battleStage,attack:e.attack,ink:inkThisRound});inkThisRound=false;
  }
  if(e.phase==='recover'&&previous!=='recover')assert.equal(e.timer,e.attack==='lame'?100:112);
  previous=e.phase;
 }
 assert.equal(e.completed,10);assert.deepEqual(attacks,Array.from({length:10},(_,i)=>F.plan(i)));assert.equal(p.health,4);
});
test('combined fight retains ordinary hits, 24-tick hit immunity and immediate defeat cleanup',()=>{
 const e=F.create(),p=player();Object.assign(e,{phase:'recover',timer:100});
 assert.equal(F.shot(e,{x:730,y:250,w:10,h:6}),'hit');assert.equal(e.hp,35);assert.equal(e.inv,24);
 assert.equal(F.shot(e,{x:730,y:250,w:10,h:6}),'guard');
 Object.assign(e,{hp:1,inv:0,ink:{age:100},wave:{x:300},phase:'recover'});
 assert.equal(F.shot(e,{x:730,y:250,w:10,h:6}),'defeat');assert.equal(e.ink,null);assert.equal(e.wave,null);
 for(let i=0;i<B.DEFEAT_DURATION;i++)F.update(e,p);assert.equal(e.deathT,0);assert.equal(B.defeatPose(e).frame,5);
});
const game=()=>previewGame({htmlPath:path.resolve(__dirname,'index.html'),search:'?attack=full'});
test('both heroes enter full fight, render every stage and retry restores the clear opening',()=>{
 for(const hero of ['loafy','vance-wick']){const a=game();a.click('shellResume');a.run(`selectCharacter('${hero}');init();draw()`);
 assert.equal(a.run('deepArena.boss.fullFight'),true);assert.equal(a.run('deepArena.boss.ink'),null);
 a.run("Object.assign(deepArena.boss,{completed:6,battleStage:'fury',phase:'ink-inhale',timer:30});draw();respawnCheckpoint();draw()");
 assert.equal(a.run('deepArena.boss.completed'),0);assert.equal(a.run('deepArena.boss.hp'),36);assert.equal(a.run('player.health'),4);}
});
test('real swim/fire play reaches every stage and earns the full defeat without taking damage',()=>{
 const a=game();a.click('shellResume');a.run(`window.stageVisits=new Set();for(let i=0;i<7000&&!deepArena.victory;i++){
  const e=deepArena.boss;stageVisits.add(e.battleStage);let target=270;
  if(e.attack==='scraper'){if(e.phase==='prepare'||e.phase==='shove'||e.wave&&e.wave.x>player.x-80)target=185;}
  else if(e.phase==='prepare'&&e.locked||e.phase==='sweep')target=e.lane+90;
  const dy=target-player.y-player.h/2;keys={up:dy<-3,down:dy>3,shoot:true};simulationStep();
 }`);assert.equal(a.run('deepArena.victory'),true);assert.equal(a.run('player.health'),4);
 assert.deepEqual(Array.from(a.run('Array.from(stageVisits)')),['opening','escalation','fury']);assert.ok(a.run('deepArena.boss.completed')>=7);
 assert.equal(a.storage.has('crustQuestCodex'),false);
});
