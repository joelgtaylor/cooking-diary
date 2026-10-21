const{test}=require('node:test'),assert=require('node:assert/strict');const{game}=require('./game-harness.cjs');
function scene(mode='pilot'){const a=game({}, {search:`?slinger=${mode}&scene=slinger`});a.run("var slinger=enemies.find(e=>e.type==='thrower')");return a;}
function ready(a){a.run('drawDoughSlinger(slinger);slingerArt.complete=true;slingerArt.naturalWidth=2172;slingerArt.naturalHeight=724');}
test('slinger is limited to first B1 thrower and retains loading/disabled fallbacks',()=>{
 const a=scene();assert.equal(a.run('drawDoughSlinger(slinger)'),false);ready(a);assert.equal(a.run('drawDoughSlinger(slinger)'),true);
 assert.equal(a.run('enemies.filter(e=>drawDoughSlinger(e)).length'),1);
 for(const s of [2,3]){a.run(`init(${s})`);assert.equal(a.run('enemies.some(e=>drawDoughSlinger(e))'),false);}
 const b=scene('off');assert.equal(b.run('drawDoughSlinger(slinger)'),false);assert.equal(b.run('slingerArt'),null);
});
test('ready, wind-up, release and recovery follow actual attack events',()=>{
 const a=scene();assert.equal(a.run('slingerPose(slinger)'),0);a.run('slinger.windup=1');assert.equal(a.run('slingerPose(slinger)'),1);
 a.run('updateThrower(slinger)');assert.equal(a.run('enemyShots.length'),1);assert.equal(a.run('slingerPose(slinger)'),2);
 a.run('tick+=6');assert.equal(a.run('slingerPose(slinger)'),3);a.run('tick+=18');assert.equal(a.run('slingerPose(slinger)'),0);
 a.run('slinger.windup=30;player.x=0;updateThrower(slinger)');assert.equal(a.run('slingerPose(slinger)'),0);
});
test('the art pilot preserves exact wind-up, projectile trajectories and damage across repeated attacks',()=>{
 const a=scene(),b=scene('off');
 for(let i=0;i<400;i++){
  for(const c of[a,b])c.run('tick++;updateThrower(slinger);updateEnemyShots()');
  assert.equal(a.run('JSON.stringify({player,enemies,enemyShots})'),b.run('JSON.stringify({player,enemies,enemyShots})'));
 }
 assert.deepEqual(a.audio,b.audio);
});
test('loaded rendering is pure, foot anchored, direction locked, and warns only during wind-up',()=>{
 const a=scene();ready(a);const expr='JSON.stringify({player,enemies,enemyShots,collected,checkpointState})',before=a.run(expr);
 for(const windup of [0,36,18,1]){
  a.run(`slinger.windup=${windup};slinger.face=-1`);const state=a.run(expr);a.trace.length=0;a.run('drawDoughSlinger(slinger)');assert.equal(a.run(expr),state);
  const image=a.trace.find(c=>c[0]==='drawImage');assert.equal(image[7],-image[9]);assert.ok(a.trace.some(c=>c[0]==='scale'&&c[1]===-1));
  assert.equal(a.trace.some(c=>c[0]==='stroke'),windup>0);assert.ok(!a.trace.some(c=>c[0]==='fillText'));
 }
 a.run('slinger.windup=0;slinger.face=-1');assert.equal(a.run(expr),before);
});
test('crops remain inside actual atlas and release arm stays compact',()=>{
 const a=scene();assert.equal(a.run('SLINGER_SPRITES.length'),4);
 for(const s of a.run('SLINGER_SPRITES')){const[x,y,w,h]=s.crop;assert.ok(x>=0&&y>=0&&x+w<=2172&&y+h<=724);assert.ok(s.w<=46&&s.h<=42);}
});
test('review scene starts paused on real support and never writes progress',()=>{
 const a=scene();assert.equal(a.run('state'),'pause');assert.equal(a.run('contactSurface(player)'),40*32);assert.equal(a.run('hit(player.x,player.y,player.w,player.h)'),false);assert.equal(a.storage.size,0);assert.equal(a.run('collected'),0);
 for(const search of ['?scene=slinger','?scene=slingers&slinger=pilot']){const b=game({}, {search});assert.equal(b.run('player.x'),3*32);}
});
