const{test}=require('node:test'),assert=require('node:assert/strict');const{game}=require('./game-harness.cjs');
function arena(mode='pilot'){const a=game({}, {search:'?foreman='+mode});a.run('checkpointState.current=3;player.x=92*T;player.y=54*T-player.h;player.ground=true;player.face=1;camera=2400;cameraY=1252');return a;}
test('Foreman walks within a small authored arena envelope and parks for warned attacks',()=>{
 const a=arena();const home=a.run('foremanGeometry().cx');a.run('for(let i=0;i<60;i++)updateForeman()');assert.ok(a.run('foremanGeometry().cx')<home);
 for(const phase of ['windup','sweep','toss']){a.run(`foremanState.phase='${phase}';foremanState.timer=50`);const x=a.run('foremanGeometry().cx');a.run('updateForeman()');assert.equal(a.run('foremanGeometry().cx'),x);}
 a.run("foremanState.phase='recovery';foremanState.timer=9999;foremanState.inv=0;player.x=foremanGeometry().cx+200;");for(let i=0;i<500;i++)a.run('updateForeman()');assert.ok(Math.abs(a.run('foremanState.walkOffset'))<=64);
});
test('guarded pogo is deflected sideways without health damage; open pogo remains valid',()=>{
 const a=arena();a.run("foremanState.phase='windup';foremanState.timer=60;player.x=foremanGeometry().cx-12;player.y=foremanBodyBox().y-player.h+6;player.vy=3;pogoOn=true;updateForeman()");
 assert.equal(a.run('foremanState.health'),6);assert.equal(a.run('player.health'),3);assert.equal(a.run('player.vy'),-6);assert.equal(Math.abs(a.run('player.vx')),14);assert.equal(a.run('foremanState.deflectCue'),18);
 a.run("foremanState.phase='recovery';foremanState.timer=150;foremanState.inv=0;player.x=foremanGeometry().cx-12;player.y=foremanBodyBox().y-player.h+6;player.vy=3;updateForeman()");assert.equal(a.run('foremanState.health'),5);assert.equal(a.run('player.vy'),-11);
});
test('new timing preserves warnings and attacks and grants a longer 150-tick opening',()=>{
 const a=arena();a.run("foremanState.phase='idle';foremanState.timer=1;updateForeman()");assert.equal(a.run('foremanState.timer'),60);
 a.run('for(let i=0;i<60;i++)updateForeman()');assert.equal(a.run('foremanState.phase'),'sweep');assert.equal(a.run('foremanState.timer'),18);
 a.run('for(let i=0;i<18;i++)updateForeman()');assert.equal(a.run('foremanState.phase'),'recovery');assert.equal(a.run('foremanState.timer'),150);assert.equal(a.run('foremanState.maxHealth'),6);
});
test('existing shooting strategy still wins with no more damage or ammo than the original fight',()=>{
 const results=[];for(const mode of ['off','pilot']){const a=arena(mode);let won=false;
  for(let i=0;i<1100;i++){a.run("keys={shoot:foremanState.phase==='recovery',jump:foremanState.phase==='windup'&&foremanState.timer<=18};if(hitStop>0)hitStop--;else update()");if(a.run('foremanState.health')===0){won=true;break;}}
  assert.ok(won);results.push(a.run('({health:player.health,ammo:player.ammo})'));
 }assert.ok(results[1].health>=results[0].health);assert.ok(results[1].ammo>=results[0].ammo);
});
test('steered pogo remains a viable zero-ammo strategy',()=>{
 const a=arena();let won=false;
 for(let i=0;i<1600;i++){a.run("pogoOn=true;keys={jump:true,right:player.x<foremanGeometry().cx-player.w/2-4,left:player.x>foremanGeometry().cx-player.w/2+4};if(hitStop>0)hitStop--;else update()");if(a.run('foremanState.health')===0){won=true;break;}}
 assert.ok(won);assert.equal(a.run('player.ammo'),35);assert.ok(a.run('player.health')>0);
});
test('pause/rendering is pure; retries reset position, guard and the approved reward gates',()=>{
 const a=arena();a.run('for(let i=0;i<20;i++)updateForeman();state="pause";assets.foremanConcept.complete=true;assets.foremanConcept.naturalWidth=1331');
 const expr='JSON.stringify({foremanState,player,collected,checkpointState})',before=a.run(expr);a.run('for(let i=0;i<50;i++){updateForeman();drawForeman()}');assert.equal(a.run(expr),before);
 a.run('respawnCheckpoint()');assert.equal(a.run('foremanState.walkOffset'),0);assert.equal(a.run('foremanState.deflectCue'),0);assert.equal(a.run('foremanState.health'),6);
});
test('review start is paused and scoped, and other bosses do not receive the new state',()=>{
 const a=game({}, {search:'?foreman=pilot&scene=foreman'});assert.equal(a.run('state'),'pause');assert.equal(a.run('contactSurface(player)'),54*32);assert.equal(a.storage.size,0);assert.equal(a.run('collected'),0);
 for(const stage of [2,3]){a.run(`init(${stage})`);assert.equal(a.run('foremanState'),null);}
});
test('walk/brace crops fit the immutable atlas and physical guard art matches vulnerability',()=>{
 const a=arena();for(const[x,y,w,h]of a.run('FOREMAN_WALK_SPRITES'))assert.ok(x>=0&&y>=0&&x+w<=2172&&y+h<=724);
 a.run("foremanState.phase='windup';player.x=foremanGeometry().cx-12;player.y=foremanBodyBox().y-player.h;drawForemanWalk(foremanGeometry(),foremanState,true);foremanWalkArt.complete=true;foremanWalkArt.naturalWidth=2172;foremanWalkArt.naturalHeight=724");
 assert.equal(a.run('foremanCrownGuard(foremanGeometry(),foremanState)'),true);a.trace.length=0;const before=a.run('JSON.stringify({foremanState,player})');a.run('drawForemanWalk(foremanGeometry(),foremanState,true)');
 assert.deepEqual(a.trace.find(c=>c[0]==='drawImage').slice(2,6),Array.from(a.run('FOREMAN_WALK_SPRITES[3]')));assert.equal(a.run('JSON.stringify({foremanState,player})'),before);
 a.run("foremanState.phase='recovery';foremanState.inv=0");assert.equal(a.run('foremanCrownGuard(foremanGeometry(),foremanState)'),false);
});

test('guard shove clears the crown even while steering back toward it',()=>{
 for(const side of [-1,1]){
  const a=arena();a.run(`foremanState.phase='windup';foremanState.timer=60;player.x=foremanGeometry().cx+${side}*8-player.w/2;player.y=foremanBodyBox().y-player.h+6;player.vy=3;pogoOn=true;updateForeman()`);
  for(let i=0;i<12;i++)a.run(`keys={left:${side===1},right:${side===-1}};if(hitStop>0)hitStop--;else update()`);
  assert.ok(a.run(`(player.x+player.w/2-foremanGeometry().cx)*${side}`)>90);
  assert.equal(a.run('player.health'),3);assert.equal(a.run('foremanState.health'),6);
 }
});

test('approved Foreman is enabled on a normal start',()=>{const a=game({}, {search:''});assert.equal(a.run('foremanPolishEnabled()'),true);assert.equal(a.run('foremanRecoveryTicks()'),150);assert.equal(a.run('foremanState.deflectPush'),0);});
