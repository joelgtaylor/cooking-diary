const{test}=require('node:test'),assert=require('node:assert/strict');const{game}=require('./game-harness.cjs');
function ready(a){a.run("drawOpeningEnemy(enemies[0]);drawDoughSlinger(enemies.find(e=>e.type==='thrower'));openingEnemyArt.complete=true;openingEnemyArt.naturalWidth=1536;openingEnemyArt.naturalHeight=1024;slingerArt.complete=true;slingerArt.naturalWidth=2172;slingerArt.naturalHeight=724");}
test('all eleven authored Moonlit enemies select exactly one approved role renderer',()=>{
 const a=game({}, {search:''});ready(a);
 assert.equal(a.run("enemies.filter(e=>e.type==='walker').length"),6);assert.equal(a.run("enemies.filter(e=>e.type==='hopper').length"),3);assert.equal(a.run("enemies.filter(e=>e.type==='thrower').length"),2);
 for(let i=0;i<11;i++){a.trace.length=0;assert.equal(a.run(`drawDoughSlinger(enemies[${i}])||drawOpeningEnemy(enemies[${i}])`),true);assert.equal(a.trace.filter(c=>c[0]==='drawImage').length,1);}
 for(const stage of [2,3]){a.run(`init(${stage})`);assert.equal(a.run('enemies.some(e=>drawDoughSlinger(e)||drawOpeningEnemy(e))'),false);}
});
test('full-world rollout preserves simulation through 900 ticks in every bakery',()=>{
 for(const stage of [1,2,3]){
  const a=game({}, {search:'?fungal=off'}),b=game();a.run(`init(${stage})`);b.run(`init(${stage})`);
  const state='JSON.stringify({map,enemies,enemyShots,player,gems,powerups,collected,checkpointState})';assert.equal(a.run(state),b.run(state));
  for(let i=0;i<900;i++){for(const c of[a,b])c.run('tick++;updateEnemies();updateEnemyShots()');}
  assert.equal(a.run(state),b.run(state));assert.deepEqual(a.audio,b.audio);
 }
});
test('both slingers own independent phase feedback and a restart clears old actor feedback',()=>{
 const a=game({}, {search:''});a.run("var ranged=enemies.filter(e=>e.type==='thrower');rememberSlingerRelease(ranged[0])");assert.equal(a.run('slingerPose(ranged[0])'),2);assert.equal(a.run('slingerPose(ranged[1])'),0);
 a.run('tick+=8;rememberSlingerRelease(ranged[1])');assert.equal(a.run('slingerPose(ranged[0])'),3);assert.equal(a.run('slingerPose(ranged[1])'),2);
 a.run('init(1)');assert.equal(a.run("enemies.filter(e=>e.type==='thrower').every(e=>slingerPose(e)===0)"),true);
});

test('summit review shortcut starts paused on real support and does not grant progress',()=>{
 const a=game({}, {search:'?enemies=pilot&scene=moonlit-summit'});assert.equal(a.run('state'),'pause');assert.equal(a.run('contactSurface(player)'),19*32);assert.equal(a.run('hit(player.x,player.y,player.w,player.h)'),false);assert.equal(a.storage.size,0);assert.equal(a.run('collected'),0);
});
