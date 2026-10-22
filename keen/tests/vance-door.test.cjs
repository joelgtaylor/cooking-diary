const {test}=require('node:test'),assert=require('node:assert/strict');
const {game}=require('./game-harness.cjs');
function setup(character='vance-wick',right=false){const a=game();a.run(`init(2);enemies=[];selectCharacter('${character}');player.x=${right?'56*T':'54*T'};player.y=32*T;player.face=${right?-1:1};player.ammo=10;`);return a;}
function fire(a){a.run('updateProjectiles(true);for(let i=0;i<8;i++)updateProjectiles(false);');}
test('Vance opens the root doorway from either side without learning or playing the relay',()=>{
 for(const right of [false,true]){const a=setup('vance-wick',right);fire(a);assert.equal(a.run('myceliumState.solved'),true);assert.equal(a.run('myceliumState.clueKnown'),false);assert.equal(a.run('shots.length'),0);assert.equal(a.run('player.ammo'),9);assert.equal(a.run('tile(55,32)'),'.');assert.equal(a.run('tile(52,31)'),'M');assert.equal(a.run('tile(55,27)'),'#');assert.equal(a.run('tile(55,35)'),'#');a.run('respawnCheckpoint()');assert.equal(a.run('tile(55,32)'),'.');}
});
test('Loafy shots leave the puzzle locked and are consumed by the door',()=>{
 const a=setup('loafy');fire(a);assert.equal(a.run('myceliumState.solved'),false);assert.equal(a.run('tile(55,32)'),'#');assert.equal(a.run('shots.length'),0);
});
test('missed shots and ordinary rock do not open the relay; restarting restores it',()=>{
 const a=setup();a.run('player.y=26*T');fire(a);assert.equal(a.run('myceliumState.solved'),false);a.run('player.y=32*T');fire(a);assert.equal(a.run('myceliumState.solved'),true);a.run('init(2)');assert.equal(a.run('myceliumState.solved'),false);assert.equal(a.run('tile(55,32)'),'#');
});
test('projectile identity follows its shooter even if the selected character changes in flight',()=>{
 const a=setup('loafy');a.run("updateProjectiles(true);selectCharacter('vance-wick')");a.run('for(let i=0;i<8;i++)updateProjectiles(false)');assert.equal(a.run('myceliumState.solved'),false);
});

test('Vance barrel-aligned shots still open the relay from either side with production art enabled',()=>{
 for(const face of [-1,1]){
  const a=game({}, {search:''});
  a.run(`init(2);enemies=[];selectCharacter('vance-wick');player.x=${face===1?'54*T':'56*T'};player.y=32*T;player.face=${face};player.ammo=10`);
  fire(a);assert.equal(a.run('myceliumState.solved'),true);assert.equal(a.run('player.ammo'),9);
 }
});
