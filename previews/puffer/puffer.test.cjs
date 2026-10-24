const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const puffer=require('./bubble-puffer.js');
const {previewGame}=require('../sunken/test-harness.cjs');
const enemy=()=>puffer.create({x:500,y:800});
const hero=()=>({x:360,y:805,w:58,h:26,vx:0,vy:0,swimming:true,health:3,inv:0});
test('puffer chases in two axes, warns for 48 ticks and locks aim before two bounded volleys',()=>{
 const e=enemy(),p=hero();p.y=740;const start=e.x;
 for(let i=0;i<24;i++)puffer.update(e,p);
 assert.ok(e.x<start);assert.equal(e.phase,'inflate');assert.equal(e.timer,48);
 for(let i=0;i<34;i++)puffer.update(e,p);
 assert.equal(e.bubbles.length,0);assert.equal(e.locked,true);const aim=e.aim;
 p.y=1030;for(let i=0;i<13;i++)puffer.update(e,p);
 assert.equal(e.aim,aim);assert.equal(e.bubbles.length,0);
 puffer.update(e,p);assert.equal(e.phase,'burst');assert.equal(e.bubbles.length,3);
 for(let i=0;i<14;i++)puffer.update(e,p);assert.equal(e.bubbles.length,6);
 for(let i=0;i<14;i++)puffer.update(e,p);assert.equal(e.phase,'recover');
 for(let i=0;i<38;i++)puffer.update(e,p);assert.equal(e.phase,'stalk');
 assert.equal(e.w,60);assert.equal(e.h,56);
});
test('bubbles can be shot, body has four hits, invulnerability prevents shotgun damage, defeat clears hazards',()=>{
 const e=enemy();e.bubbles=[{x:350,y:800,w:20,h:20}];
 assert.equal(puffer.shot(e,{x:352,y:802,w:10,h:6}),'pop');assert.equal(e.hp,4);
 for(let n=0;n<4;n++){
  e.inv=0;assert.equal(puffer.shot(e,{x:e.x+10,y:e.y+10,w:10,h:6}),n===3?'defeat':'hit');
  if(n<3){assert.equal(puffer.shot(e,{x:e.x+10,y:e.y+10,w:10,h:6}),'guard');assert.equal(e.hp,3-n);}
 }
 assert.equal(e.alive,false);assert.equal(e.bubbles.length,0);
 const p=hero();p.x=e.x;p.y=e.y;assert.equal(puffer.contact(e,p),false);
 for(let i=0;i<48;i++)puffer.update(e,p);assert.equal(e.deathT,0);
});
test('contact and bubbles share one player damage window; walls block attacks and projectile motion',()=>{
 const e=enemy(),p=hero();p.x=e.x;p.y=e.y;
 assert.equal(puffer.contact(e,p),true);assert.equal(p.health,2);
 assert.equal(puffer.contact(e,p),false);assert.equal(p.health,2);
 const blocked=enemy();for(let i=0;i<300;i++)puffer.update(blocked,hero(),()=>true);
 assert.equal(blocked.attack,0);assert.equal(blocked.phase,'stalk');
 const b=enemy();b.bubbles=[{x:450,y:800,w:20,h:20,vx:20,vy:0,life:100,age:0}];
 puffer.update(b,hero(),(x,y,w,h)=>x<480&&x+w>475);assert.equal(b.bubbles.length,0);
});
test('pressure remains bounded over sustained combat and stops chasing a dry hero',()=>{
 const e=enemy(),p=hero();let attacks=0;
 for(let i=0;i<2200;i++){
  puffer.update(e,p);attacks=Math.max(attacks,e.attack);
  assert.ok(e.bubbles.length<=12);assert.ok(e.x>=e.left&&e.x+e.w<=e.right);assert.ok(e.y>=e.top&&e.y+e.h<=e.bottom);
 }
 assert.ok(attacks>=10);p.swimming=false;
 for(let i=0;i<200;i++)puffer.update(e,p);assert.equal(e.phase,'stalk');assert.equal(e.bubbles.length,0);
});
function arena(){return previewGame({htmlPath:path.resolve(__dirname,'index.html')});}
test('isolated encounter boots both heroes, retries cleanly and retains campaign saves',()=>{
 const a=arena();a.click('shellResume');assert.equal(a.run('player.swimming'),true);
 assert.equal(a.run('pufferEncounter.enemy.hp'),4);assert.equal(a.run('floodedEntrance.patroller.alive'),false);
 a.run("selectCharacter('loafy');draw();selectCharacter('vance-wick');draw()");
 a.run('pufferEncounter.enemy.bubbles.push({x:400,y:850,w:20,h:20});respawnCheckpoint()');
 assert.equal(a.run('pufferEncounter.enemy.bubbles.length'),0);assert.equal(a.run('player.health'),3);
 assert.equal(a.storage.has('crustQuestBest'),false);assert.equal(a.storage.has('crustQuestCodex'),false);
});
test('real combat sweeps fast shots into the puffer and death recovers to a safe wet checkpoint',()=>{
 const a=arena();a.click('shellResume');
 a.run('pufferEncounter.enemy.x=600;pufferEncounter.enemy.y=850;pufferEncounter.enemy.timer=100;shots=[{x:580,y:860,w:10,h:6,vx:30,vy:0,life:30}];updateCombat(false,false)');
 assert.equal(a.run('pufferEncounter.enemy.hp'),3);
 a.run('player.health=0;updateCombat(false,false)');assert.equal(a.run('player.health'),3);
 assert.equal(a.run('player.swimming'),true);assert.equal(a.run('pufferEncounter.enemy.hp'),4);
});
test('standing still and holding fire does not solve the encounter before its first pressure cycle',()=>{
 const a=arena();a.click('shellResume');a.run('for(let i=0;i<180;i++){keys={shoot:true};update()}');
 assert.ok(a.run('pufferEncounter.enemy.alive'));assert.ok(a.run('pufferEncounter.enemy.attack')>=1);
 assert.ok(a.run('pufferEncounter.hits')>=1);
});
