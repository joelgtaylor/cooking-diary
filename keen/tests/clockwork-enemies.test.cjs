const{test}=require('node:test'),assert=require('node:assert/strict');const{game}=require('./game-harness.cjs');
function pilot(scene='gearling'){return game({}, {search:'?clockwork=pilot&scene=mechanical-'+scene});}
function ready(a){a.run("drawClockworkEnemy(enemies[0]);clockworkEnemyArt.complete=true;clockworkEnemyArt.naturalWidth=1536;clockworkEnemyArt.naturalHeight=1024");}
test('mechanical scenes start paused on support without overlap or save changes',()=>{
 for(const scene of ['gearling','piston','ember']){const a=pilot(scene);assert.equal(a.run('state'),'pause');assert.equal(a.run('bakery'),3);assert.notEqual(a.run('contactSurface(player)'),null);assert.equal(a.run('enemies.some(e=>collide(e,player))'),false);assert.equal(a.run('collected'),0);assert.equal(a.storage.size,0);}
});
test('all ten authored mechanical actors select approved art on normal Bakery 3 starts',()=>{
 const a=pilot();ready(a);assert.equal(a.run('enemies.length'),10);
 assert.deepEqual(JSON.parse(a.run("JSON.stringify(['walker','hopper','thrower'].map(type=>enemies.filter(e=>e.type===type).length))")),[3,4,3]);
 for(let i=0;i<10;i++){a.trace.length=0;assert.equal(a.run(`drawClockworkEnemy(enemies[${i}])`),true);assert.equal(a.trace.filter(c=>c[0]==='drawImage').length,1);}
 for(const stage of [1,2]){a.run(`init(${stage})`);assert.equal(a.run('enemies.some(e=>drawClockworkEnemy(e))'),false);}
 const b=game({}, {search:''});b.run('init(3)');assert.equal(b.run('clockworkEnemyEnabled()'),true);ready(b);assert.equal(b.run('enemies.every(e=>drawClockworkEnemy(e))'),true);const old=game({}, {search:'?clockwork=off'});old.run('init(3)');assert.equal(old.run('clockworkEnemyEnabled()'),false);
});
test('mechanical art preserves complete simulation and audio through 900 ticks in each world',()=>{
 for(const stage of [1,2,3]){
  const a=game({}, {search:'?clockwork=pilot'}),b=game({}, {search:''});a.run(`init(${stage})`);b.run(`init(${stage})`);
  const expr='JSON.stringify({map,enemies,enemyShots,player,gems,powerups,collected,checkpointState,devourerState})';
  for(let i=0;i<900;i++){for(const c of [a,b])c.run('tick++;updateEnemies();updateEnemyShots()');}
  assert.equal(a.run(expr),b.run(expr));assert.deepEqual(a.audio,b.audio);
 }
});
test('piston compression follows the existing countdown and grounded support',()=>{
 const a=pilot('piston');a.run("var hopper=enemies.find(e=>e.type==='hopper');hopper.vy=0;hopper.hopT=11");assert.equal(a.run('clockworkEnemyPose(hopper)'),0);
 a.run('hopper.hopT=10');assert.equal(a.run('clockworkEnemyPose(hopper)'),1);
 a.run('hopper.vy=-7.5');assert.equal(a.run('clockworkEnemyPose(hopper)'),2);a.run('hopper.vy=2');assert.equal(a.run('clockworkEnemyPose(hopper)'),3);
});
test('ember release pose follows actual firing, independent actors and clean reinitialization',()=>{
 const a=pilot('ember');a.run("state='play';var caster=enemies.find(e=>e.type==='thrower');caster.attackT=1;updateThrower(caster)");assert.equal(a.run('caster.windup'),36);assert.equal(a.run('clockworkEnemyPose(caster)'),1);
 a.run('for(let i=0;i<35;i++)updateThrower(caster)');assert.equal(a.run('enemyShots.length'),0);a.run('updateThrower(caster)');assert.equal(a.run('enemyShots.length'),1);assert.equal(a.run('clockworkEnemyPose(caster)'),2);assert.equal(a.run('caster.attackT'),150);
 assert.equal(a.run("clockworkEnemyPose(enemies.filter(e=>e.type==='thrower')[1])"),0);
 a.run('tick+=8');assert.equal(a.run('clockworkEnemyPose(caster)'),3);a.run('tick+=20');assert.equal(a.run('clockworkEnemyPose(caster)'),0);
 a.run('init(3)');assert.equal(a.run("enemies.filter(e=>e.type==='thrower').every(e=>clockworkEnemyPose(e)===0)"),true);
});
test('crop bounds and rendering purity; missing art preserves fallback path',()=>{
 const a=pilot();assert.equal(a.run('drawClockworkEnemy(enemies[0])'),false);
 for(const row of a.run('CLOCKWORK_ENEMY_CROPS'))for(const[x,y,w,h]of row)assert.ok(x>=0&&y>=0&&x+w<=1536&&y+h<=1024);
 ready(a);const expr='JSON.stringify({enemies,player,checkpointState,devourerState})',before=a.run(expr);a.run('for(let i=0;i<20;i++)for(const e of enemies)drawClockworkEnemy(e)');assert.equal(a.run(expr),before);
});
