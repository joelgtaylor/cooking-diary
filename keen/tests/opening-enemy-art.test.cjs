const {test}=require('node:test'),assert=require('node:assert/strict');const{game}=require('./game-harness.cjs');
function pilot(){return game({}, {search:'?enemies=pilot'});}
function ready(a){a.run('drawOpeningEnemy(enemies[3]);openingEnemyArt.complete=true;openingEnemyArt.naturalWidth=1536;openingEnemyArt.naturalHeight=1024');}
test('new enemy art is restricted to the two approved Bakery 1 opening enemies',()=>{
 const a=pilot();ready(a);
 assert.deepEqual(Array.from(a.run('enemies.map(e=>drawOpeningEnemy(e))')), [false,false,false,true,true,false,false,false,false,false,false]);
 for(const stage of [2,3]){a.run(`init(${stage})`);assert.equal(a.run('enemies.some(e=>drawOpeningEnemy(e))'),false);}
});
test('off, malformed, loading and failed artwork retain existing sprites',()=>{
 for(const search of ['', '?enemies=off','?enemies=pilotish']){const a=game({}, {search});assert.equal(a.run('drawOpeningEnemy(enemies[3])'),false);assert.equal(a.run('openingEnemyArt'),null);}
 const a=pilot();assert.equal(a.run('drawOpeningEnemy(enemies[3])'),false);
 a.run('openingEnemyArt.complete=true;openingEnemyArt.naturalWidth=0');assert.equal(a.run('drawOpeningEnemy(enemies[3])'),false);
});
test('hopper poses follow real rest, rise, apex and descent without introducing a crouch',()=>{
 const a=pilot();assert.equal(a.run('openingEnemyPose(enemies[4])'),0);
 for(const [velocity,frame]of [[-7.5,1],[0,2],[5,3]]){a.run(`enemies[4].y-=10;enemies[4].vy=${velocity}`);assert.equal(a.run('openingEnemyPose(enemies[4])'),frame);}
});
test('rendering preserves simulation and keeps sprite extents within the established 42px envelope',()=>{
 const a=pilot();ready(a);const expr='JSON.stringify({player,enemies,shots,enemyShots,collected,powerups,checkpointState})',before=a.run(expr);
 a.run('drawOpeningEnemy(enemies[3]);drawOpeningEnemy(enemies[4])');assert.equal(a.run(expr),before);
 for(const s of a.run('OPENING_ENEMY_SPRITES.flat()')){assert.ok(s.w<=42&&s.h<=42&&s.w>0&&s.h>0);const[x,y,w,h]=s.crop;assert.ok(x>=0&&y>=0&&x+w<=1536&&y+h<=1024);}
 const b=game();for(let i=0;i<120;i++){a.run('update()');b.run('update()');}assert.equal(a.run(expr),b.run(expr));
});
test('roof comparison scene starts safely and never grants progress',()=>{
 const a=game({}, {search:'?enemies=pilot&scene=gremlins-roof'});
 assert.equal(a.run('bakery'),1);assert.equal(a.run('contactSurface(player)'),48*32);assert.equal(a.run('hit(player.x,player.y,player.w,player.h)'),false);
 assert.equal(a.run('collected'),0);assert.equal(a.storage.size,0);
});
