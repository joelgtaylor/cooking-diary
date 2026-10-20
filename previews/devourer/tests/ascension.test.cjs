const {test}=require('node:test');
const assert=require('node:assert/strict');
const {game}=require('./game-harness.cjs');
test('Ascension preserves the approved opening and all geometry beyond its boundaries',()=>{
 const a=game(),b=game({}, {layoutFixture:'bakery1-workshop.js'});
 const am=a.run('map'),bm=b.run('map');
 for(let y=0;y<56;y++)for(let x=0;x<105;x++)if(am[y][x]!==bm[y][x])assert.ok((x>=23&&x<=52&&y>=28&&y<=48)||(x>=53&&x<=77&&y>=16&&y<=37)||(x>=78&&x<=104&&y>=20&&y<=53));
 for(const query of ['gems[0]','checkpointState.spawns[0]','enemies[3]','enemies[4]','enemies.find(e=>e.type==="thrower")','powerups'])assert.equal(a.run(`JSON.stringify(${query})`),b.run(`JSON.stringify(${query})`));
});
test('both Ascension routes and the pogo shortcut reconnect using unchanged player physics',()=>{
 for(const [name,sx,sy,tx,ty,pogo] of [['lower balcony',29,40,33,38,false],['upper step',28,40,31,36,false],['stair',31,36,34,34,false],['hall roof',34,34,37,32,false],['upper bridge',43,32,47,30,false],['High Towers',47,30,53,28,false],['inner shelf',36,38,40,35,false],['exit rise',46,38,47,35,false],['lower rise',46,35,50,32,false],['lower rejoin',50,32,53,28,false],['pogo shortcut',33,38,37,32,true]]){
  const a=game();a.run(`player.x=${sx}*T;player.y=${sy}*T-player.h;player.vx=0;player.vy=0;player.ground=true;pogoOn=${pogo};`);
  let landed=false;
  for(let frame=0;frame<180;frame++){
   a.run(`keys={jump:true,right:player.x<${tx}*T-5,left:player.x>${tx}*T+5};updatePlayer()`);
   if(frame>5&&a.run(`Math.abs(player.y+player.h-${ty}*T)<1&&Math.abs(player.x-${tx}*T)<24&&(player.ground||pogoOn)`)){landed=true;break;}
  }
  assert.ok(landed,name);
 }
});
test('Proofing Hall doors have continuous footing, yeast is collectible, and checkpoint is safe',()=>{
 const a=game();a.run('enemies=[];player.x=33*T;player.y=38*T-player.h;player.ground=true;keys={right:true};');
 for(let i=0;i<35;i++)a.run('update()');assert.ok(a.run('player.x>36*T'));
 a.run('keys={jump:true,right:true}');for(let i=0;i<65&&!a.run('gems[1].got');i++)a.run('update()');
 assert.equal(a.run('gems[1].got'),true);
 a.run('player.x=43*T;player.y=38*T-player.h;player.vx=0;player.vy=0;keys={right:true};');
 for(let i=0;i<35;i++)a.run('update()');assert.ok(a.run('player.x>46*T'));assert.equal(a.run('player.y+player.h'),38*32);
 a.run('checkpointState.current=1;respawnCheckpoint()');assert.equal(a.run('hit(player.x,player.y,player.w,player.h)'),false);
});
test('Ascension enemies remain on their platforms and away from the second checkpoint',()=>{
 const a=game();a.run('checkpointState.current=1;respawnCheckpoint();');
 for(let i=0;i<900;i++)a.run('updateEnemies()');
 assert.equal(a.run('player.health'),3);
 assert.equal(a.run('enemies[1].alive&&enemies[5].alive'),true);
 assert.equal(a.run('enemies[1].y+enemies[1].h'),38*32);
 assert.ok(a.run('enemies[5].y+enemies[5].h<=32*T'));
});
