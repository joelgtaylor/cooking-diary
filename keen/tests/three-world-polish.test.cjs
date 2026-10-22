const{test}=require('node:test'),assert=require('node:assert/strict');
const{game}=require('./game-harness.cjs');
const scaled=()=>game({}, {search:'?enemyScale=pilot'});
test('later-world scale keeps foot anchors, speed, timers and collision-free spawns',()=>{
 for(const stage of[2,3]){
  const a=scaled(),b=game({}, {search:''});for(const c of[a,b])c.run(`init(${stage});player.x=-1000`);
  assert.equal(a.run('JSON.stringify(map)'),b.run('JSON.stringify(map)'));
  const larger=a.run('enemies'),old=b.run('enemies');
  for(let i=0;i<larger.length;i++){
   const e=larger[i],o=old[i];assert.equal(e.y+e.h,o.y+o.h);assert.equal(e.vx,o.vx);assert.equal(e.hopT,o.hopT);assert.equal(e.attackT,o.attackT);
   assert.equal(e.h,e.type==='flyer'?35:54);
  }
  for(let i=0;i<600;i++){
   a.run('updateEnemies()');
   assert.equal(a.run('enemies.every(e=>!hit(e.x,e.y,e.w,e.h))'),true,`${stage}/${i}`);
  }
  assert.equal(a.run('enemies.every(e=>e.alive)'),true);
 }
});
test('both heroes can hit every enlarged later-world ground role from either side',()=>{
 for(const stage of[2,3])for(const type of['walker','hopper','thrower'])for(const character of['loafy','vance-wick'])for(const face of[-1,1]){
  const a=scaled();a.run(`init(${stage});var target=enemies.find(e=>e.type==='${type}');enemies=[target];map=map.map((row,y)=>row.map(()=>y>=54?'#':'.'));target.x=800;target.y=54*T-target.h;target.vx=0;selectCharacter('${character}');player.x=${face===1?640:960};player.y=54*T-player.h;player.face=${face};player.ground=true;updateProjectiles(true);for(let i=0;i<30;i++)updateProjectiles(false)`);
  assert.equal(a.run('target.alive'),false,`${stage} ${type} ${character} ${face}`);
 }
});
test('resized flyer keeps safe reset and bounded repeated dive cycles',()=>{
 const a=scaled();a.run("init(2);var flyer=enemies.find(e=>e.type==='flyer');var spawn={x:flyer.x,y:flyer.y};flyer.x=2*T;flyer.flight.cooldown=0;player.x=flyer.x;player.y=54*T-player.h;updateSporewing(flyer)");
 assert.equal(a.run('flyer.flight.phase'),'warn');assert.equal(a.run('flyer.flight.timer'),24);
 a.run('for(let i=0;i<24;i++)updateSporewing(flyer);player.x=2000;for(let i=0;i<1200;i++)updateSporewing(flyer)');
 assert.equal(a.run('flyer.alive'),true);assert.equal(a.run('hit(flyer.x,flyer.y,flyer.w,flyer.h)'),false);
 a.run('respawnCheckpoint()');assert.equal(a.run('flyer.x'),a.run('spawn.x'));assert.equal(a.run('flyer.y'),a.run('spawn.y'));
});
test('checkpoint art paints before either hero without changing gameplay state',()=>{
 for(const stage of[1,2,3])for(const character of['loafy','vance-wick']){
  const a=scaled();a.run(`init(${stage});selectCharacter('${character}');var order=[];drawCheckpoints=()=>order.push('flag');drawPlayer=()=>order.push('hero');var before=JSON.stringify({player,enemies,checkpointState});drawWorld()`);
  assert.equal(a.run('JSON.stringify(order)'), '["flag","hero"]');assert.equal(a.run('JSON.stringify({player,enemies,checkpointState})'),a.run('before'));
 }
});
test('relic counter has its own upper HUD slot clear of bottom touch controls',()=>{
 const a=scaled();a.run('init(2)');a.trace.length=0;a.run('drawCavernDiscoveryUI()');
 const label=a.trace.find(c=>c[0]==='fillText'&&c[1].startsWith('RELICS'));
 assert.equal(label[2],936);assert.equal(label[3],67);
 assert.ok(a.trace.some(c=>c[0]==='fillRect'&&c[1]===818&&c[2]===52&&c[3]===128&&c[4]===22));
});
test('joined cavern textures preserve terrain and actor state without gameplay mutations',()=>{
 const a=scaled();a.run('init(2);assets.fungalEnvironment.complete=true;assets.fungalEnvironment.naturalWidth=1536;assets.fungalEnvironment.naturalHeight=1024;camera=1700;cameraY=470;var before=JSON.stringify({map,player,enemies,checkpointState})');
 a.run('drawFungalEnvironment()');assert.equal(a.run('JSON.stringify({map,player,enemies,checkpointState})'),a.run('before'));
});
