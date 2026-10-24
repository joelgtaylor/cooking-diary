const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const rider=require('./current-rider.js'),{previewGame}=require('../sunken/test-harness.cjs');
const enemy=()=>rider.create({x:650,y:900});
const hero=()=>({x:390,y:890,w:58,h:26,vx:0,vy:0,swimming:true,health:3,inv:0});
test('rider telegraphs 44 ticks and locks for 20 before committing a straight dash',()=>{
 const e=enemy(),p=hero();for(let i=0;i<24;i++)rider.update(e,p);
 assert.equal(e.phase,'coil');assert.equal(e.timer,44);
 for(let i=0;i<24;i++)rider.update(e,p);assert.equal(e.locked,true);const aim=e.aim;
 p.y+=150;for(let i=0;i<19;i++)rider.update(e,p);assert.equal(e.aim,aim);assert.equal(e.phase,'coil');
 rider.update(e,p);assert.equal(e.phase,'dash');const x=e.x,y=e.y;
 rider.update(e,p);assert.ok(Math.abs(e.x-x-Math.cos(aim)*9.2)<.001);assert.ok(Math.abs(e.y-y-Math.sin(aim)*9.2)<.001);assert.equal(e.aim,aim);
});
test('dash sweeps player and walls; one damage window and a longer wall stun',()=>{
 const e=enemy(),p=hero();e.phase='dash';e.aim=0;e.timer=34;
 p.x=e.x+e.w+2;p.y=e.y;p.w=2;p.h=2;
 rider.update(e,p);assert.equal(p.health,2);rider.update(e,p);assert.equal(p.health,2);
 const wall=enemy();wall.phase='dash';wall.aim=0;wall.timer=34;
 const start=wall.x;
 rider.update(wall,hero(),(x,y,w)=>x+w>start+68);
 assert.equal(wall.phase,'recover');assert.equal(wall.wallStun,true);assert.equal(wall.timer,66);assert.ok(wall.x+wall.w<=start+68);
 for(let i=0;i<66;i++)rider.update(wall,hero());assert.equal(wall.phase,'stalk');
});
test('three hits defeat without changing collision; no post-defeat dash or contact',()=>{
 const e=enemy();e.phase='dash';e.timer=34;
 for(let n=0;n<3;n++){
  e.inv=0;assert.equal(rider.shot(e,{x:e.x+10,y:e.y+10,w:10,h:6}),n===2?'defeat':'hit');
  if(n<2){assert.equal(rider.shot(e,{x:e.x+10,y:e.y+10,w:10,h:6}),'guard');assert.equal(e.hp,2-n);}
 }
 assert.equal(e.alive,false);assert.equal(e.wake.length,0);
 const p=hero();p.x=e.x;p.y=e.y;assert.equal(rider.contact(e,p),false);
 const x=e.x;for(let i=0;i<48;i++)rider.update(e,p);assert.equal(e.deathT,0);assert.equal(e.x,x);assert.equal(e.w,64);assert.equal(e.h,32);
});
test('offscreen, dry and occluded players cannot trigger attacks; wakes and dash stay bounded',()=>{
 for(const mode of ['dry','far','wall']){
  const e=enemy(),p=hero();if(mode==='dry')p.swimming=false;if(mode==='far')p.x=-500;
  for(let i=0;i<500;i++)rider.update(e,p,()=>mode==='wall');assert.equal(e.dashes,0);
 }
 const e=enemy(),p=hero();for(let i=0;i<2400;i++){rider.update(e,p);assert.ok(e.wake.length<=8);assert.ok(e.x>=e.left&&e.x+e.w<=e.right);assert.ok(e.y>=e.top&&e.y+e.h<=e.bottom);}
 assert.ok(e.dashes>=10);
});
function arena(){return previewGame({htmlPath:path.resolve(__dirname,'index.html')});}
test('isolated arena starts wet, renders both heroes and retries without campaign saves',()=>{
 const a=arena();a.click('shellResume');assert.equal(a.run('player.swimming'),true);
 a.run("selectCharacter('loafy');draw();selectCharacter('vance-wick');draw()");
 a.run('riderEncounter.enemy.phase="dash";riderEncounter.enemy.wake.push({x:500,y:900,life:20});respawnCheckpoint()');
 assert.equal(a.run('riderEncounter.enemy.phase'),'stalk');assert.equal(a.run('riderEncounter.enemy.wake.length'),0);assert.equal(a.run('player.health'),3);
 assert.equal(a.storage.has('crustQuestBest'),false);assert.equal(a.storage.has('crustQuestCodex'),false);
});
test('real projectile sweep hits rider and collision remains on the visible oven plinth',()=>{
 const a=arena();a.click('shellResume');
 a.run('riderEncounter.enemy.x=600;riderEncounter.enemy.y=850;riderEncounter.enemy.timer=100;shots=[{x:580,y:860,w:10,h:6,vx:30,vy:0,life:30}];updateCombat(false,false)');
 assert.equal(a.run('riderEncounter.enemy.hp'),2);assert.equal(a.run('tile(18,33)'),'#');
 a.run('player.health=0;updateCombat(false,false)');assert.equal(a.run('player.health'),3);assert.equal(a.run('riderEncounter.enemy.hp'),3);
});
