const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const S=require('./bench-scraper.js'),B=require('./master-of-deep.js'),{previewGame}=require('../sunken/test-harness.cjs');
const player=()=>({x:245,y:287,w:58,h:26,health:4,inv:0,vx:0,vy:0});
test('scraper gives 72 warning ticks then a distinct committed shove before releasing one wave',()=>{
 const e=S.create(),p=player();for(let i=0;i<90;i++)S.update(e,p);assert.equal(e.phase,'prepare');
 for(let i=0;i<72;i++){assert.equal(e.wave,null);S.update(e,p);}assert.equal(e.phase,'shove');
 for(let i=0;i<8;i++)S.update(e,p);assert.equal(e.wave,null);S.update(e,p);assert.ok(e.wave);assert.equal(e.swipes,1);
 assert.equal(e.lane,300);p.y=400;for(let i=0;i<19;i++)S.update(e,p);assert.equal(e.phase,'recover');assert.equal(e.lane,300);
});
test('wave damage follows the crescent rather than its empty corners, and hits once per wave',()=>{
 const e=S.create(),p=player();e.wave={x:245,y:228,w:64,h:144,hit:false};
 assert.equal(S.overlapsWave(e.wave,{x:225,y:228,w:20,h:5}),false);
 assert.equal(S.contact(e,p),true);assert.equal(p.health,3);assert.deepEqual(p.waterPush,{vx:-3.2,frames:20});
 p.inv=0;assert.equal(S.contact(e,p),false);assert.equal(p.health,3);
 for(const y of [160,390]){e.wave.hit=false;p.y=y;assert.equal(S.contact(e,p),false);}
});
test('push is bounded, swept against walls, and does not embed the swimming body',()=>{
 const p=player();p.waterPush={vx:-3.2,frames:20};for(let i=0;i<20;i++)S.applyPush(p,()=>false);
 assert.ok(Math.abs(p.x-(245-64))<1e-9);assert.equal(p.waterPush,null);
 Object.assign(p,{x:35,waterPush:{vx:-3.2,frames:20}});S.applyPush(p,x=>x<32);assert.ok(p.x>=32);assert.equal(p.waterPush,null);
});
test('defeat clears the wave and movement impulse, and preserves the approved bow sequence',()=>{
 const e=S.create(),p=player();Object.assign(e,{phase:'recover',hp:1,wave:{x:250,y:228,w:64,h:144}});p.waterPush={vx:-3.2,frames:20};
 assert.equal(S.shot(e,{x:730,y:250,w:10,h:6}),'defeat');assert.equal(e.wave,null);S.update(e,p);assert.equal(p.waterPush,null);
 for(let i=1;i<B.DEFEAT_DURATION;i++)S.update(e,p);assert.equal(B.defeatPose(e).frame,5);assert.equal(e.deathT,0);
});
const game=()=>previewGame({htmlPath:path.resolve(__dirname,'index.html'),search:'?attack=scraper'});
test('isolated scraper mode works for both heroes and retry clears all attack state',()=>{
 for(const hero of ['loafy','vance-wick']){const a=game();a.click('shellResume');a.run(`selectCharacter('${hero}');init();draw()`);
 assert.equal(a.run('deepArena.boss.attack'),'scraper');a.run('for(let i=0;i<260;i++)simulationStep();draw()');
 assert.ok(a.run('deepArena.boss.hits')>0);a.run('respawnCheckpoint();draw()');assert.equal(a.run('deepArena.boss.wave'),null);assert.equal(a.run('player.waterPush'),undefined);assert.equal(a.run('player.health'),4);}
});
test('actual swimming and shooting can beat the broad shove without taking damage',()=>{
 const a=game();a.click('shellResume');a.run(`for(let i=0;i<2800&&!deepArena.victory;i++){
  const e=deepArena.boss,danger=e.phase==='prepare'||e.phase==='shove'||e.wave&&e.wave.x>player.x-80;
  const target=danger?185:270,dy=target-player.y-player.h/2;keys={up:dy<-3,down:dy>3,shoot:true};simulationStep();
 }`);assert.equal(a.run('deepArena.victory'),true);assert.equal(a.run('player.health'),4);
});
