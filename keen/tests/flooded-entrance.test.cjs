const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const reef=require('../../previews/flooded-entrance/reef-patroller.js');
const {previewGame}=require('../../previews/sunken/test-harness.cjs');
const slice=()=>previewGame({htmlPath:path.resolve(__dirname,'../../previews/flooded-entrance/index.html')});
const fish=()=>reef.create({x:60,y:100,left:20,right:220});
test('reef patrol remains in authored bounds, bobs mildly, and visibly pauses before reversing',()=>{
 const e=fish();let turns=0,pauses=0;
 for(let i=0;i<1500;i++){
  const x=e.x,face=e.face,turn=e.phase;reef.update(e,()=>false);
  assert.ok(e.x>=e.left&&e.x+e.w<=e.right);assert.ok(Math.abs(e.y-e.homeY)<=3.001);
  if(e.phase==='turn'&&turn==='turn'&&e.turnT>0){assert.equal(e.x,x);pauses++;}
  if(e.face!==face){assert.equal(turn,'turn');turns++;}
 }
 assert.ok(turns>=3);assert.ok(pauses>=23*3);
});
test('patroller contact takes one heart per invulnerability window and dead fish are harmless',()=>{
 const e=fish(),a={x:60,y:100,w:58,h:26,health:3,inv:0};
 assert.equal(reef.contact(e,a),true);assert.equal(a.health,2);assert.equal(a.inv,90);
 assert.equal(reef.contact(e,a),false);assert.equal(a.health,2);
 assert.equal(reef.shot(e,{x:70,y:105,w:10,h:6}),true);a.inv=0;assert.equal(reef.contact(e,a),false);
 for(let i=0;i<36;i++)reef.update(e,()=>false);assert.equal(e.deathT,0);assert.equal(e.alive,false);
});
test('shots kill once, show a bounded defeat state, and turning never changes collision size',()=>{
 const e=fish();e.phase='turn';e.turnT=24;const shot={x:65,y:110,w:10,h:6};
 reef.update(e,()=>false);assert.equal(e.w,48);assert.equal(e.h,40);
 assert.equal(reef.shot(e,shot),true);assert.equal(shot.dead,true);assert.equal(e.phase,'defeat');assert.equal(e.deathT,36);
 assert.equal(reef.shot(e,{x:65,y:110,w:10,h:6}),false);
});
test('slice boots with a safe dry entry and can render both heroes without campaign saves',()=>{
 const a=slice();a.click('shellResume');assert.equal(a.run('player.swimming'),false);
 assert.ok(a.run('Math.abs(floodedEntrance.patroller.x-player.x)')>400);
 a.run("selectCharacter('loafy');draw();selectCharacter('vance-wick');draw()");
 assert.equal(a.storage.has('crustQuestBest'),false);assert.equal(a.storage.has('crustQuestCodex'),false);
});
test('approved free-swim motion stays identical before encounters and scene geometry diverges',()=>{
 const a=slice(),b=previewGame();a.click('shellResume');b.click('shellResume');
 for(let i=0;i<80;i++){
  a.run('keys={right:true};update()');b.run('keys={right:true};update()');
  assert.equal(a.run('JSON.stringify({x:player.x,y:player.y,vx:player.vx,vy:player.vy,w:player.w,h:player.h})'),b.run('JSON.stringify({x:player.x,y:player.y,vx:player.vx,vy:player.vy,w:player.w,h:player.h})'));
 }
});
test('actual slice combat hits patrols with fast shots and rock blocks the same path',()=>{
 const a=slice();a.click('shellResume');
 a.run('floodedEntrance.patroller.x=600;floodedEntrance.patroller.y=864;floodedEntrance.patroller.homeY=864;shots=[{x:590,y:870,w:10,h:6,vx:10,vy:0,life:50}];updateCombat(false,false)');
 assert.equal(a.run('floodedEntrance.patroller.alive'),false);
 a.run('init();floodedEntrance.patroller.x=930;floodedEntrance.patroller.y=850;floodedEntrance.patroller.homeY=850;shots=[{x:850,y:855,w:10,h:6,vx:100,vy:0,life:50}];updateCombat(false,false)');
 assert.equal(a.run('floodedEntrance.patroller.alive'),true);
});
test('death recovers at the safe submerged checkpoint and restores the enemy consistently',()=>{
 const a=slice();a.click('shellResume');a.run('player.x=32*T;player.y=29*T;CrustSwim.sync(player,[{x:0,y:0,w:3000,h:3000}],hit);updateWorldProgress();player.health=1;floodedEntrance.patroller.x=player.x;floodedEntrance.patroller.y=player.y;floodedEntrance.patroller.homeY=player.y;floodedEntrance.patroller.left=player.x;floodedEntrance.patroller.right=player.x+48;updateCombat(false,false)');
 assert.equal(a.run('player.health'),3);assert.equal(a.run('player.swimming'),true);assert.equal(a.run('player.w'),58);assert.equal(a.run('player.inv'),90);
 assert.equal(a.run('floodedEntrance.patroller.alive'),true);assert.equal(a.run('hit(player.x,player.y,player.w,player.h)'),false);
});
test('both heroes can explore the slice and return to the dry exit without unlocking recipes',()=>{
 for(const hero of ['loafy','vance-wick']){
  const a=slice();a.click('shellResume');a.run('selectCharacter('+JSON.stringify(hero)+')');
  for(const [tx,ty]of [[19,30],[31,30],[36,25],[36,21],[43,21]]){
   let reached=false;
   for(let i=0;i<1000;i++){
    const p=JSON.parse(a.run('JSON.stringify(player)')),dx=tx*32-p.x-p.w/2,dy=ty*32-p.y-p.h/2;
    if(Math.hypot(dx,dy)<18){reached=true;break;}
    a.run('keys='+JSON.stringify({left:dx<-7,right:dx>7,up:dy<-7,down:dy>7})+';update();updateWorldProgress()');
    assert.equal(a.run('player.hang&&!player.swimming?false:hit(player.x,player.y,player.w,player.h)'),false);
   }
   assert.ok(reached,hero+' reaches '+tx+','+ty);
  }
  assert.equal(a.run('floodedEntrance.finished'),true);assert.equal(a.run('player.swimming'),false);
  assert.equal(a.storage.has('crustQuestCodex'),false);
 }
});
