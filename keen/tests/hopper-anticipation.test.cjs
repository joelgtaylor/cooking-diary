const {test}=require('node:test'),assert=require('node:assert/strict');const{game}=require('./game-harness.cjs');
function pilot(){return game({}, {search:'?enemies=pilot&scene=gremlins-roof'});}
test('compression uses only the final ten grounded countdown ticks',()=>{
 const a=pilot();a.run('var hopper=enemies[4];hopper.vy=0');
 for(const [timer,amount] of [[50,0],[11,0],[10,.1],[5,.6],[1,1],[0,0],[-1,0]]){a.run(`hopper.hopT=${timer}`);assert.equal(a.run('openingEnemyCompression(hopper)'),amount);}
 a.run('hopper.hopT=5;hopper.y-=20;hopper.vy=0');assert.equal(a.run('openingEnemyCompression(hopper)'),0);
 a.run('hopper.y=48*T-hopper.h;hopper.vy=-7.5');assert.equal(a.run('openingEnemyCompression(hopper)'),0);
 a.run('hopper.vy=0');assert.equal(a.run('openingEnemyCompression(enemies[3])'),0);
});
test('squash stays foot anchored, within 42px, and leaves hitboxes and timers unchanged',()=>{
 const a=pilot();a.run('drawOpeningEnemy(enemies[4]);openingEnemyArt.complete=true;openingEnemyArt.naturalWidth=1536;openingEnemyArt.naturalHeight=1024;enemies[4].hopT=1');
 const before=a.run('JSON.stringify({player,enemies,shots,enemyShots,checkpointState})');a.trace.length=0;a.run('drawOpeningEnemy(enemies[4])');
 const c=a.trace.find(c=>c[0]==='drawImage'),[x,y,w,h]=c.slice(6);
 assert.equal(x,-w/2);assert.equal(y,-h);assert.ok(w>35&&w<=42);assert.ok(h<40);
 assert.equal(a.run('JSON.stringify({player,enemies,shots,enemyShots,checkpointState})'),before);
 a.run("window.location.search+='&anticipation=off'");assert.equal(a.run('openingEnemyCompression(enemies[4])'),0);
});
test('rendered anticipation preserves exact launch ticks and enemy trajectories',()=>{
 const a=pilot(),b=pilot();b.run("window.location.search+='&anticipation=off'");
 a.run('drawOpeningEnemy(enemies[4]);openingEnemyArt.complete=true;openingEnemyArt.naturalWidth=1536;openingEnemyArt.naturalHeight=1024');
 b.run('drawOpeningEnemy(enemies[4]);openingEnemyArt.complete=true;openingEnemyArt.naturalWidth=1536;openingEnemyArt.naturalHeight=1024');
 const expr='JSON.stringify(enemies.map(e=>({x:e.x,y:e.y,vy:e.vy,vx:e.vx,hopT:e.hopT,alive:e.alive})))';let launches=0;
 for(let i=0;i<240;i++){
  const before=a.run('enemies[4].vy');a.run('updateEnemies();drawOpeningEnemy(enemies[4])');b.run('updateEnemies();drawOpeningEnemy(enemies[4])');
  if(before>=0&&a.run('enemies[4].vy')<0)launches++;assert.equal(a.run(expr),b.run(expr));
 }
 assert.ok(launches>=3);
});
