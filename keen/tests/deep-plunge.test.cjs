const {test}=require('node:test'),assert=require('node:assert/strict');const {game}=require('./game-harness.cjs');
function level(){const a=game();a.run('init(2)');return a;}
test('the plunge redesign preserves every tile and the relay/foothills metadata west of its fork',()=>{
 const a=level(),b=game({}, {layoutFixture2:'bakery2-foothills-approved.js'});b.run('init(2)');const am=a.run('map'),bm=b.run('map');for(let y=0;y<56;y++)for(let x=0;x<56;x++)assert.equal(am[y][x],bm[y][x],`${x},${y}`);
 for(const expr of ['JSON.stringify(relayLayout())','JSON.stringify(currentVerticalLayout().foothills)','JSON.stringify(gems.slice(0,2))','JSON.stringify(currentVerticalLayout().checkpoints.slice(0,2))'])assert.equal(a.run(expr),b.run(expr));
});
test('all five required cultures have main-route support; no culture or checkpoint requires the upper bonus route',()=>{
 const a=level();assert.equal(a.run('gems.length'),5);
 assert.deepEqual(JSON.parse(a.run('JSON.stringify(currentVerticalLayout().cultures.slice(2))')),[[63,38],[72,42],[98,46]]);
 for(const [x,y] of [[63,39],[72,43],[98,48]])assert.equal(a.run(`tile(${x},${y})`),'=');
 assert.ok(a.run('currentVerticalLayout().checkpoints.slice(2).every(([,y])=>y>=46)'));
});
test('existing movement descends the main shelves and reaches the lower oven approach',()=>{
 for(const [name,sx,sy,tx,ty,jump] of [['first drop',62,31,67,35,false],['culture shelf',67,35,63,39,false],['lower culture',64,39,71,43,false],['checkpoint',71,43,78,47,false],['lower shelf',78,47,85,51,false],['floor terrace',85,51,90,52,false],['last culture',91,52,96,48,true]]){
  const a=level();a.run(`player.x=${sx}*T;player.y=${sy}*T-player.h;player.ground=true;player.vx=0;player.vy=0;`);let landed=false;
  for(let n=0;n<220;n++){a.run(`keys={jump:${jump},right:player.x<${tx}*T-5,left:player.x>${tx}*T+5};updatePlayer()`);if(n>5&&a.run(`player.ground&&Math.abs(player.y+player.h-${ty}*T)<1&&Math.abs(player.x-${tx}*T)<24`)){landed=true;break;}}
  assert.ok(landed,name);
 }
});
test('recovery shelves allow ordinary jumps back to a missed main-route culture',()=>{
 for(const [sy,ty,tx] of [[54,51,59],[51,47,59],[47,43,59],[43,39,62]]){
  const a=level();a.run(`player.x=59*T;player.y=${sy}*T-player.h;player.ground=true;`);let landed=false;
  for(let n=0;n<180;n++){a.run(`keys={jump:true,right:player.x<${tx}*T-5,left:player.x>${tx}*T+5};updatePlayer()`);if(n>5&&a.run(`player.ground&&Math.abs(player.y+player.h-${ty}*T)<1`)){landed=true;break;}}assert.ok(landed,`${sy} to ${ty}`);
 }
});
test('bonus route has a mixed gauntlet and caches reward ammo/score without culture progression',()=>{
 const a=level();assert.equal(a.run('enemies.filter(e=>e.type==="thrower").length'),2);assert.equal(a.run('enemies.filter(e=>e.type==="hopper"&&e.x>56*T).length'),3);
 a.run('var cache=powerups.find(u=>u.kind==="cache");player.x=cache.x-14;player.y=cache.y-19;var ammoBefore=player.ammo;var scoreBefore=player.score;updatePickups();');
 assert.equal(a.run('player.ammo-ammoBefore'),15);assert.equal(a.run('player.score-scoreBefore'),500);assert.equal(a.run('collected'),0);a.run('updatePickups()');assert.equal(a.run('player.score-scoreBefore'),500);
});
test('bonus throwers cannot target the lower descent and checkpoint recovery lands safely',()=>{
 const a=level();a.run('player.x=69*T;player.y=43*T-player.h;camera=1800;cameraY=1100;for(let i=0;i<600;i++)updateEnemyShots();for(let i=0;i<600;i++)for(const e of enemies.filter(e=>e.type==="thrower"))updateThrower(e);');assert.equal(a.run('enemyShots.length'),0);
 for(const index of [2,3]){a.run(`checkpointState.current=${index};respawnCheckpoint();`);assert.equal(a.run('hit(player.x,player.y,player.w,player.h)'),false);assert.equal(a.run('spike(player.x,player.y,player.w,player.h)'),false);}
});

test('the optional canopy climb and return rejoin before the first lower culture',()=>{
 for(const [name,sx,sy,tx,ty,jump] of [['bonus entry',59,31,59,28,true],['first climb',60,28,63,25,true],['hopper ascent',64,25,67,22,true],['thrower ledge',68,22,72,19,true],['upper crossing',73,19,78,22,false],['right descent',80,22,82,26,false],['cache shelf',81,26,77,30,false],['return shelf',75,30,71,31,false],['main rejoin',70,31,67,35,false]]){
  const a=level();a.run(`player.x=${sx}*T;player.y=${sy}*T-player.h;player.ground=true;`);let landed=false;
  for(let n=0;n<200;n++){a.run(`keys={jump:${jump},right:player.x<${tx}*T-5,left:player.x>${tx}*T+5};updatePlayer()`);if(n>5&&a.run(`player.ground&&Math.abs(player.y+player.h-${ty}*T)<1&&Math.abs(player.x-${tx}*T)<24`)){landed=true;break;}}assert.ok(landed,name);
 }
});
