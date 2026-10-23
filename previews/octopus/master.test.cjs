const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const B=require('./master-of-deep.js'),{previewGame}=require('../sunken/test-harness.cjs');
const player=()=>({x:260,y:280,w:58,h:26,health:4,inv:0,vx:0,vy:0});
test('full warning precedes damage and lane is locked for the final half second',()=>{
 const e=B.create(),p=player();for(let i=0;i<90;i++)B.update(e,p);assert.equal(e.phase,'prepare');
 for(let i=0;i<31;i++)B.update(e,p);assert.equal(e.locked,true);const lane=e.lane;p.y=420;
 for(let i=0;i<29;i++)B.update(e,p);assert.equal(e.phase,'sweep');assert.equal(e.lane,lane);assert.equal(p.health,4);
});
test('swept razor hits between endpoints while above and below the warning remain safe',()=>{
 for(const offset of [0,-70,70]){
  const e=B.create(),p=player();Object.assign(e,{phase:'sweep',timer:8,lane:293});p.y+=offset;
  for(let i=0;i<8;i++)B.update(e,p);assert.equal(p.health,offset===0?3:4);
 }
});
test('decorative tentacles and body have no hidden contact damage',()=>{
 const e=B.create(),p=player();Object.assign(p,{x:730,y:270});for(let i=0;i<90;i++)B.update(e,p);assert.equal(p.health,4);
});
test('only recovery exposes mantle and invulnerability bounds the damage rate',()=>{
 const e=B.create(),s=()=>({x:730,y:250,w:10,h:6});assert.equal(B.shot(e,s()),'guard');assert.equal(e.hp,8);
 Object.assign(e,{phase:'recover',timer:100});assert.equal(B.shot(e,s()),'hit');assert.equal(B.shot(e,s()),'guard');assert.equal(e.hp,7);
 for(let i=0;i<24;i++)B.update(e,player());assert.equal(B.shot(e,s()),'hit');assert.equal(e.hp,6);
});
test('defeat immediately disarms the razor and finishes a bounded theatrical recovery',()=>{
 const e=B.create(),p=player();Object.assign(e,{hp:1,phase:'recover'});assert.equal(B.shot(e,{x:730,y:250,w:10,h:6}),'defeat');
 for(let i=0;i<150;i++)B.update(e,p);assert.equal(e.deathT,0);assert.equal(p.health,4);assert.equal(B.vulnerable(e),false);
});
const game=()=>previewGame({htmlPath:path.resolve(__dirname,'index.html')});
test('both heroes spawn underwater in fixed-camera arena, pause and retry reset safely',()=>{
 for(const hero of ['loafy','vance-wick']){const a=game();a.click('shellResume');a.run(`selectCharacter('${hero}');init();draw();updateViewCamera()`);
 assert.equal(a.run('player.swimming'),true);assert.equal(a.run('hit(player.x,player.y,player.w,player.h)'),false);assert.equal(a.run('camera+cameraY'),0);
 a.run('deepArena.boss.hp=1;respawnCheckpoint();draw()');assert.equal(a.run('deepArena.boss.hp'),8);assert.equal(a.run('player.health'),4);
 a.run("shellPause('manual')");assert.equal(a.run('state'),'shell-menu');}
});
test('stationary firing cannot skip the damage windows and repeated sweeps punish standing still',()=>{
 const a=game();a.click('shellResume');a.run('keys={shoot:true};for(let i=0;i<600;i++)simulationStep()');assert.ok(a.run('deepArena.boss.hits')>0);assert.ok(a.run('deepArena.boss.hp')>0);
});
test('real swimming and shooting can beat the isolated attack without damage',()=>{
 const a=game();a.click('shellResume');a.run(`for(let i=0;i<2200&&!deepArena.victory;i++){
  const e=deepArena.boss,target=e.phase==='prepare'&&e.locked||e.phase==='sweep'?e.lane+90:270;
  const dy=target-player.y-player.h/2;keys={up:dy<-3,down:dy>3,shoot:true};simulationStep();
 }`);assert.equal(a.run('deepArena.victory'),true);assert.equal(a.run('player.health'),4);
});
