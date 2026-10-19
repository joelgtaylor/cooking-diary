const {test}=require('node:test'),assert=require('node:assert/strict');
const {game}=require('./game-harness.cjs');
function level(){const a=game();a.run('init(2)');return a;}
test('foothills edits stay inside the opening and preserve the approved relay, keeper, and keeper approach',()=>{
 const a=level(),b=game({}, {layoutFixture2:'bakery2-relay-approved.js'});b.run('init(2)');const am=a.run('map'),bm=b.run('map');
 for(let y=0;y<56;y++)for(let x=0;x<105;x++)if(x<56&&am[y][x]!==bm[y][x])assert.ok(x>=4&&x<32&&y>=38&&y<54,`${x},${y}`);
 for(const expr of ['JSON.stringify(relayLayout())','JSON.stringify(gems.slice(0,2))','JSON.stringify(powerups[0])','JSON.stringify(currentVerticalLayout().checkpoints.slice(0,2))','JSON.stringify(currentVerticalLayout().oven)'])assert.equal(a.run(expr),b.run(expr));

});
test('existing held jump traverses the balcony, terraces and keeper switchback without pogo',()=>{
 for(const [name,sx,sy,tx,ty] of [['entry',3,54,6,52],['culture balcony',8,52,11,49],['balcony exit',14,49,18,51],['lower terrace',18,51,22,48],['hopper shelf',22,48,24.3,45],['upper terrace',27,45,29,42],['switchback',29,42,25,40],['keeper shelf',25,40,29,38]]){
  const a=level();a.run(`player.x=${sx}*T;player.y=${sy}*T-player.h;player.vx=0;player.vy=0;player.ground=true;pogoOn=false;`);let landed=false;
  for(let frame=0;frame<180;frame++){
   a.run(`keys={jump:true,right:player.x<${tx}*T-5,left:player.x>${tx}*T+5};updatePlayer()`);
   if(frame>5&&a.run(`Math.abs(player.y+player.h-${ty}*T)<1&&Math.abs(player.x-${tx}*T)<24&&player.ground`)){landed=true;break;}
  }assert.ok(landed,name);
 }
});
test('the low passage admits the full player rectangle and the balcony yields the original culture',()=>{
 const a=level();a.run('player.x=10*T;player.y=54*T-player.h;player.ground=true;keys={right:true};for(let i=0;i<50;i++)updatePlayer()');assert.ok(a.run('player.x')>15*32);
 a.run('player.x=11*T;player.y=49*T-player.h;player.vx=0;player.vy=0;player.ground=true;keys={};update()');assert.equal(a.run('gems[0].got'),true);
});
test('the new walker and hopper stay bounded, supported and outside the keeper refuge',()=>{
 const a=level();a.run('player.x=0;var low=Infinity,high=0;');
 for(let i=0;i<900;i++){a.run('updateEnemies();var h=enemies.find(e=>e.type==="hopper");low=Math.min(low,h.y);high=Math.max(high,h.y)');assert.equal(a.run('enemies.filter(e=>e.encounter).every(e=>e.alive&&e.x>=e.encounter.left&&e.x<=e.encounter.right)'),true);}
 assert.ok(a.run('high-low')>40);assert.equal(a.run('high'),45*32-25);assert.equal(a.run('enemies.find(e=>e.encounter&&e.type==="walker").y'),54*32-25);
 assert.ok(a.run('enemies.filter(e=>e.encounter&&e.encounter.left<32*T).every(e=>e.encounter.right<29*T)'));
});
test('checkpoint retries are safe and both encounters retain shooting and pogo counterplay',()=>{
 const a=level();a.run('checkpointState.current=0;respawnCheckpoint();for(let i=0;i<500;i++)updateEnemies()');assert.equal(a.run('player.health'),3);
 a.run('player.x=14*T;player.y=54*T-player.h;player.face=1;keys={shoot:true};for(let i=0;i<55;i++)update()');assert.equal(a.run('enemies.find(e=>e.encounter&&e.type==="walker").alive'),false);
 a.run('var h=enemies.find(e=>e.type==="hopper");h.vx=0;h.hopT=100;player.x=h.x;player.y=h.y-player.h+4;player.vy=2;pogoOn=true;updateEnemies()');assert.equal(a.run('h.alive'),false);assert.equal(a.run('player.vy'),-11);
});
