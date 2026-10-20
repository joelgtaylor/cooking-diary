const {test}=require('node:test');
const assert=require('node:assert/strict');
const {game}=require('./game-harness.cjs');
test('High Towers preserves both approved slices and all geometry outside the tower section',()=>{
 const a=game(),b=game({}, {layoutFixture:'bakery1-ascension.js'});const am=a.run('map'),bm=b.run('map');
 // Historical fixture retains the sunk walker; allow only its reviewed placement/patrol fix.
 b.run('enemies[0].y-=enemies[0].h;enemies[0].encounter={left:25*T,right:32*T-25};');
 for(let y=0;y<56;y++)for(let x=0;x<105;x++)if(am[y][x]!==bm[y][x])assert.ok((x>=53&&x<=77&&y>=16&&y<=37)||(x>=78&&x<=104&&y>=20&&y<=53));
 for(const q of ['gems.slice(0,3)','checkpointState.spawns.slice(0,2)','enemies.slice(0,6).filter((e,i)=>i!==2)','powerups'])assert.equal(a.run(`JSON.stringify(${q})`),b.run(`JSON.stringify(${q})`));
});
test('tower routes, recovery ledges, pogo shortcut and descent rejoin are reachable',()=>{
 for(const [name,sx,sy,tx,ty,pogo] of [['bridge',55,28,58,26,false],['culture',61,26,61,23,false],['safe landing',64,26,68,23,false],['tower',68,23,71,19,false],['pogo shortcut',62,23,68,19,true],['parapet',73,19,75,16,false],['checkpoint',75,16,76.5,19,false],['descent',76,19,80,20,false],['entry recovery',56,33,56,28,false],['bridge recovery',56,30,58,26,false],['middle recovery',67,29,64,26,false],['far recovery',74,27,74,23,false]]){
  const a=game();a.run(`player.x=${sx}*T;player.y=${sy}*T-player.h;player.vx=0;player.vy=0;player.ground=true;pogoOn=${pogo};`);let landed=false;
  for(let f=0;f<200;f++){
   a.run(`keys={jump:true,right:player.x<${tx}*T-5,left:player.x>${tx}*T+5};updatePlayer()`);
   if(f>5&&a.run(`Math.abs(player.y+player.h-${ty}*T)<1&&Math.abs(player.x-${tx}*T)<24&&(player.ground||pogoOn)`)){landed=true;break;}
  }
  assert.ok(landed,name);
 }
});
test('short tower jump catches the lip and completes the existing ledge climb',()=>{
 const a=game();a.run('player.x=68*T;player.y=23*T-player.h;player.ground=true;');let caught=false;
 for(let f=0;f<100;f++){a.run(`keys={right:true,jump:${f<3}};updatePlayer()`);if(a.run('!!player.hang')){caught=true;break;}}
 assert.ok(caught);a.run('for(let i=0;i<12;i++)updatePlayer()');assert.equal(a.run('player.hang'),null);assert.equal(a.run('player.y+player.h'),19*32);
});
test('checkpoint parapet blocks the thrower and paired enemies stay out of recovery space',()=>{
 const a=game();a.run("var upperThrower=enemies.find(e=>e.type==='thrower'&&e.x===73*T);checkpointState.current=2;respawnCheckpoint();camera=2000;cameraY=350;");
 assert.equal(a.run('hit(player.x,player.y,player.w,player.h)'),false);assert.equal(a.run('throwerCanSee(upperThrower)'),false);
 for(let i=0;i<900;i++)a.run('updateEnemies();updateEnemyShots()');
 assert.equal(a.run('player.health'),3);assert.equal(a.run('enemyShots.length'),0);
 assert.equal(a.run('enemies.filter(e=>e.encounter).every(e=>e.alive&&e.x>=e.encounter.left&&e.x<=e.encounter.right)'),true);
});
test('upper pair creates delayed projectile pressure without touching the safe approach',()=>{
 const a=game();a.run("player.x=68*T;player.y=19*T-player.h;camera=2000;cameraY=350;var upperThrower=enemies.find(e=>e.type==='thrower'&&e.x===73*T);");
 assert.equal(a.run('throwerCanSee(upperThrower)'),true);
 a.run('for(let i=0;i<90;i++){updateEnemies();updateEnemyShots()}');
 assert.equal(a.run('player.health'),3);assert.equal(a.run('upperThrower.windup'),36);assert.equal(a.run('enemyShots.length'),0);
 a.run('for(let i=0;i<150;i++){updateEnemies();updateEnemyShots()}');
 assert.equal(a.run('player.health'),2);
});
