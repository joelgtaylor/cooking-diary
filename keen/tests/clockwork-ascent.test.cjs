const {test}=require('node:test'),assert=require('node:assert/strict');
const {game}=require('./game-harness.cjs');
function level(options={}){const a=game({},options);a.run('init(3)');return a;}
function segment(name,sx,sy,tx,ty,jump=true){
 const a=level();a.run(`player.x=${sx}*T;player.y=${sy}*T-player.h;player.ground=true;player.vx=0;player.vy=0;`);
 for(let f=0;f<220;f++){
  a.run(`keys={jump:${jump},right:player.x<${tx}*T-5,left:player.x>${tx}*T+5};updatePlayer()`);
  if(f>5&&a.run(`player.ground&&Math.abs(player.y+player.h-${ty}*T)<1&&Math.abs(player.x-${tx}*T)<24`))return;
 }assert.fail(name+' '+a.run('JSON.stringify({x:player.x/T,foot:(player.y+player.h)/T})'));
}
test('ascent preserves the approved entrance and untouched final descent exactly',()=>{
 const a=level({layoutFixture3:'bakery3-ascent-approved.js'}),b=level({layoutFixture3:'bakery3-entrance-approved.js'}),am=a.run('map'),bm=b.run('map');
 for(let y=0;y<56;y++)for(let x=0;x<105;x++)if(am[y][x]!==bm[y][x])assert.ok(x>=26&&x<=77&&y>=16&&y<54,`${x},${y}`);
 for(const q of ['currentVerticalLayout().entrance','gems[0]','gems.slice(3)','checkpointState.spawns[0]','checkpointState.spawns[3]','powerups.slice(0,2)','powerups[4]','currentVerticalLayout().oven'])assert.equal(a.run(`JSON.stringify(${q})`),b.run(`JSON.stringify(${q})`),q);
 assert.equal(a.run('JSON.stringify(enemies[0])'),b.run('JSON.stringify(enemies[1])'));
 assert.equal(a.run('gems.length'),5);assert.equal(a.run('devourerState'),null);
});
test('ordinary jumps traverse the main ascent and both culture passages',()=>{
 for(const s of [
  ['hall approach',30,39,33,37],['hall entry',33,37,37,37,false],['culture shelf',37,37,40,35],
  ['hall exit',44,37,47,37,false],['first catwalk',47,37,50,34],['central landing',50,34,54,31],
  ['exposed bridge',54,31,57,28],['upper passage approach',57,28,59,25],['upper entry',59,25,63,25,false],
  ['upper exit',68,25,71,25,false],['summit stair',71,25,73,22],['summit lip',73,22,73,19],
  ['parapet',73,19,74,16],['summit refuge',74,16,76,19,false],['descent rejoin',76,19,80,22,false]
 ])segment(...s);
});
test('optional roof loop has a complete ordinary-jump entry and return',()=>{
 for(const s of [['fork',55,28,55,25],['bonus climb',55,25,57,22],['roof entry',57,22,61,19],
  ['roof crossing',61,19,68,19,false],['roof return',69,19,71,25,false],['main return',71,25,73,22]])segment(...s);
});
test('recovery ladders lead back to the main route after a missed landing',()=>{
 for(const s of [['lower catch',28,54,29,51],['first recovery',29,51,32,48],['left switchback',32,48,30,45],
  ['hall recovery',30,45,33,42],['hall rejoin',33,42,33,37],['central catch',42,54,43,51],
  ['central recovery',43,51,46,48],['return west',46,48,44,45],['return east',44,45,47,42],
  ['catwalk recovery',47,42,50,37],['central rejoin',50,37,50,34]])segment(...s);
});
test('cultures collect in the sheltered main passages without visiting bonus supplies',()=>{
 const a=level();a.run('enemies=[];player.x=37*T;player.y=37*T-player.h;player.ground=true;');
 for(let f=0;f<60&&!a.run('gems[1].got');f++)a.run('keys={right:true,jump:true};update()');assert.equal(a.run('gems[1].got'),true);
 a.run('player.x=61*T;player.y=25*T-player.h;player.ground=true;player.vx=0;player.vy=0;keys={right:true};');
 for(let f=0;f<45;f++)a.run('update()');assert.equal(a.run('gems[2].got'),true);
 assert.equal(a.run('powerups.filter(u=>u.kind==="cache"&&u.x>26*T).every(u=>!u.got)'),true);
});
test('bonus return allows backtracking through the gallery door for culture three',()=>{
 const a=level();a.run('enemies=[];player.x=69*T;player.y=19*T-player.h;player.ground=true;');
 for(let f=0;f<110;f++)a.run('keys={right:player.x<70.5*T-5,left:player.x>70.5*T+5};updatePlayer()');
 assert.equal(a.run('player.y+player.h'),25*32);
 for(let f=0;f<90&&!a.run('gems[2].got');f++)a.run('keys={left:true};update()');
 assert.equal(a.run('gems[2].got'),true);
});
test('ascent encounters stay bounded and both checkpoints remain protected',()=>{
 for(const cp of [1,2]){
  const a=level();a.run(`checkpointState.current=${cp};respawnCheckpoint();camera=player.x-450;cameraY=player.y-250;`);
  for(let f=0;f<900;f++)a.run('updateEnemies();updateEnemyShots()');
  assert.equal(a.run('player.health'),3);assert.equal(a.run('hit(player.x,player.y,player.w,player.h)'),false);
  assert.equal(a.run('enemies.filter(e=>e.encounter).every(e=>e.alive&&e.x>=e.encounter.left&&e.x<=e.encounter.right)'),true);
 }
});
test('optional thrower cannot attack the main gallery; bonus caches pay only once',()=>{
 const a=level();a.run("player.x=66*T;player.y=25*T-player.h;camera=1800;cameraY=450;var roof=enemies.find(e=>e.type==='thrower'&&e.x===68*T);for(let f=0;f<300;f++)updateThrower(roof)");
 assert.equal(a.run('enemyShots.length'),0);assert.equal(a.run('roof.windup'),0);
 a.run("var cache=powerups.find(u=>u.kind==='cache'&&u.x>60*T);player.x=cache.x-14;player.y=19*T-player.h;updatePickups();updatePickups()");
 assert.equal(a.run('player.score'),500);assert.equal(a.run('player.ammo'),50);assert.equal(a.run('collected'),0);
});
