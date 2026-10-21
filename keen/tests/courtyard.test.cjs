const {test}=require('node:test');
const assert=require('node:assert/strict');
const {game}=require('./game-harness.cjs');
test('courtyard and ascension edits stay confined to their slices, with the other worlds untouched',()=>{
 for(let stage=1;stage<=3;stage++){
  const a=game(),b=game({}, {layoutFixture:'bakery1-original.js'});a.run(`init(${stage})`);b.run(`init(${stage})`);
  // Historical fixtures retain the sunk walker; allow only its reviewed placement/patrol fix.
  if(stage===1)b.run('enemies[0].y-=enemies[0].h;enemies[0].encounter={left:25*T,right:32*T-25};');
  const am=a.run('map'),bm=b.run('map');
  for(let y=0;y<56;y++)for(let x=0;x<105;x++)if(am[y][x]!==bm[y][x])assert.ok(stage===1&&x>=4&&((x<=21&&y>=44&&y<=52)||(x>=23&&x<=52&&y>=28&&y<=48)||(x>=53&&x<=77&&y>=16&&y<=37)||(x>=78&&x<=104&&y>=20&&y<=53)));
  assert.equal(a.run('JSON.stringify(enemies.slice(0,3).filter((e,i)=>bakery!==1||i===0))'),b.run('JSON.stringify(enemies.slice(0,3).filter((e,i)=>bakery!==1||i===0))'));
  assert.equal(a.run('JSON.stringify(powerups)'),b.run('JSON.stringify(powerups)'));
  if(stage===1){assert.equal(a.run('gems.length'),5);assert.equal(a.run('JSON.stringify(gems[2])'),b.run('JSON.stringify(gems[2])'));}
 }
});
test('existing physics traverses the courtyard, roof, tower, rejoin and interior shelf',()=>{
 for(const [name,sx,sy,tx,ty,pogo] of [['entry',6,52,9,50,false],['roof',9,50,14,48,false],['tower',16,48,20,44,false],['rejoin',20,44,25,40,false],['pogo shortcut',9,54,14,48,true],['yeast shelf',13,54,16,51,false]]){
  const a=game();a.run(`player.x=${sx}*T;player.y=${sy}*T-player.h;player.vx=0;player.vy=0;player.ground=true;pogoOn=${pogo};`);
  let landed=false;
  for(let frame=0;frame<180;frame++){
   a.run(`keys={jump:true,right:player.x<${tx}*T-5,left:player.x>${tx}*T+5};updatePlayer()`);
   if(frame>5&&a.run(`Math.abs(player.y+player.h-${ty}*T)<1&&Math.abs(player.x-${tx}*T)<24&&(player.ground||pogoOn)`)){landed=true;break;}
  }
  assert.ok(landed,name);
 }
});
test('workshop doorway can be walked through and the yeast can be collected inside',()=>{
 const a=game();a.run('player.x=9*T;player.y=54*T-player.h;player.ground=true;keys={right:true};');
 for(let i=0;i<40;i++)a.run('update()');
 assert.ok(a.run('player.x>12*T'));assert.equal(a.run('player.health'),3);
 a.run('keys={jump:true,right:true}');
 for(let i=0;i<55&&!a.run('gems[0].got');i++)a.run('update()');
 assert.equal(a.run('gems[0].got'),true);
 a.run('checkpointState.current=0;respawnCheckpoint()');
 assert.equal(a.run('hit(player.x,player.y,player.w,player.h)'),false);
});
