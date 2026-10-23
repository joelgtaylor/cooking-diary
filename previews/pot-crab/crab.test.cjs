const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const crab=require('./pot-crab.js'),{previewGame}=require('../sunken/test-harness.cjs');
const enemy=()=>crab.create({x:832,y:896});
const hero=()=>({x:600,y:928,w:58,h:26,health:3,inv:0,swimming:true});
const bullet=e=>({x:e.x+5,y:e.y+40,w:10,h:6});
test('closed armor blocks bullets; rattle warns before a generous opening',()=>{
 const e=enemy(),p=hero();assert.equal(crab.shot(e,bullet(e)),'armor');assert.equal(e.hp,3);
 for(let i=0;i<54;i++)crab.update(e,p);assert.equal(e.phase,'rattle');assert.equal(e.timer,28);
 assert.equal(crab.shot(e,bullet(e)),'armor');
 for(let i=0;i<28;i++)crab.update(e,p);assert.equal(e.phase,'open');assert.equal(e.timer,72);
 assert.equal(crab.shot(e,bullet(e)),'hit');assert.equal(e.hp,2);assert.equal(crab.shot(e,bullet(e)),'guard');
 for(let i=0;i<72;i++)crab.update(e,p);assert.equal(e.phase,'tuck');assert.equal(crab.shot(e,bullet(e)),'armor');
});
test('short claw jab is warned, modest, and harmless outside its reach',()=>{
 const e=enemy(),p=hero();e.phase='open';e.timer=59;crab.update(e,p);assert.equal(e.warning,true);assert.equal(e.jab,false);
 for(let i=0;i<24;i++)crab.update(e,p);assert.equal(e.jab,true);assert.equal(crab.contact(e,p),false);
 p.x=e.x-50;assert.equal(crab.contact(e,p),true);assert.equal(p.health,2);assert.equal(crab.contact(e,p),false);
 e.phase='shelter';e.jab=false;p.inv=0;assert.equal(crab.contact(e,p),false);
});
test('body remains solid in every living phase and through defeat, then clears safely',()=>{
 const e=enemy(),p=hero();for(const phase of ['shelter','rattle','open','tuck']){e.phase=phase;assert.equal(crab.blocks(e,e.x,e.y,58,26),true);}
 e.phase='open';for(let i=0;i<3;i++){e.inv=0;crab.shot(e,bullet(e));}
 assert.equal(e.alive,false);assert.equal(crab.solid(e),true);assert.equal(crab.contact(e,p),false);
 for(let i=0;i<48;i++)crab.update(e,p);assert.equal(crab.solid(e),false);assert.equal(e.w,96);assert.equal(e.h,96);
});
function arena(){return previewGame({htmlPath:path.resolve(__dirname,'index.html')});}
test('full-height divider cannot be bypassed in either wet or dry form, even while lid is open',()=>{
 const a=arena();a.click('shellResume');
 for(const phase of ['shelter','rattle','open','tuck']){
  a.run(`crabEncounter.enemy.phase='${phase}'`);
  for(const [w,h] of [[58,26],[29,38]])for(let y=0;y<56*32;y+=8){assert.equal(a.run(`hit(26*T,${y},${w},${h})`),true,`${phase} ${w}x${h} at y=${y}`);}
 }
});
test('boosted swimming and invulnerability cannot cross the living guardian; defeat opens the real route',()=>{
 const a=arena();a.click('shellResume');
 a.run('player.x=23*T;player.y=29*T;player.inv=999;player.speedT=999;keys={right:true};for(let i=0;i<120;i++)simulationStep()');
 assert.ok(a.run('player.x+player.w<=26*T+1'));
 a.run('crabEncounter.enemy.phase="open";for(let i=0;i<3;i++){crabEncounter.enemy.inv=0;CrustCrab.shot(crabEncounter.enemy,{x:26*T+5,y:29*T,w:10,h:6})}keys={};for(let i=0;i<48;i++)simulationStep()');
 assert.equal(a.run('CrustCrab.solid(crabEncounter.enemy)'),false);
 a.run('player.x=23*T;player.y=29*T;keys={right:true};for(let i=0;i<100;i++)simulationStep()');
 assert.ok(a.run('player.x>30*T'));assert.equal(a.run('crabEncounter.crossed'),true);
});
test('projectile sweeps hit exposed crab but cannot damage it through adjacent masonry',()=>{
 const a=arena();a.click('shellResume');
 a.run('crabEncounter.enemy.phase="open";crabEncounter.enemy.timer=70;shots=[{x:26*T-22,y:29*T,w:10,h:6,vx:30,vy:0,life:30}];updateCombat(false,false)');
 assert.equal(a.run('crabEncounter.enemy.hp'),2);
 a.run('crabEncounter.enemy.inv=0;shots=[{x:26*T-22,y:27*T,w:10,h:6,vx:30,vy:0,life:30}];updateCombat(false,false)');assert.equal(a.run('crabEncounter.enemy.hp'),2);
});
test('both heroes render; retry restores the blocked passage and keeps campaign saves untouched',()=>{
 const a=arena();a.click('shellResume');a.run("selectCharacter('loafy');draw();selectCharacter('vance-wick');draw()");
 a.run('crabEncounter.enemy.alive=false;crabEncounter.enemy.deathT=0;respawnCheckpoint()');
 assert.equal(a.run('crabEncounter.enemy.hp'),3);assert.equal(a.run('hit(26*T,29*T,58,26)'),true);assert.equal(a.run('player.health'),3);
 assert.equal(a.storage.has('crustQuestBest'),false);assert.equal(a.storage.has('crustQuestCodex'),false);
});
