const {test}=require('node:test'),assert=require('node:assert/strict');
const {game}=require('./game-harness.cjs');
function level(old=false){const a=game({},old?{layoutFixture2:'bakery2-environments-approved.js'}:{});a.run('init(2)');return a;}
function place(a,x,y){a.run(`player.x=${x}*T;player.y=${y}*T-player.h;player.vx=0;player.vy=0;player.ground=true;player.hang=null;prevJump=false;keys={};pogoOn=false;`);}
function move(a,x,y,jump=false){
 a.run('prevJump=false;');
 for(let n=0;n<220;n++){
  a.run(`keys={jump:${jump},right:player.x<${x}*T-4,left:player.x>${x}*T+4};updatePlayer();updateMycelium();updatePickups();updateWorldProgress();`);
  if(n>5&&a.run(`player.ground&&Math.abs(player.y+player.h-${y}*T)<1&&Math.abs(player.x-${x}*T)<24`))return;
 }
 assert.fail(`route to ${x},${y}: `+a.run('JSON.stringify([player.x/T,(player.y+player.h)/T])'));
}
function solve(a){a.run(`myceliumState.clueKnown=true;for(const i of [2,0,1,0,2,1]){const [x,y]=relayLayout().switches[i];player.x=(x+1.5)*T-player.w/2;player.y=y*T-player.h;myceliumLanding(true);}for(let i=0;i<45;i++)updateMycelium();`);}
test('reproduce shipped floor and roof bypasses; neither crosses the rebuilt divide',()=>{
 for(const row of [54,26]){
  const old=level(true);place(old,53,row);old.run('keys={right:true};for(let i=0;i<100;i++)updatePlayer()');assert.ok(old.run('player.x')>56*32);
  const a=level();place(a,53,row);a.run('keys={right:true};for(let i=0;i<100;i++)updatePlayer()');assert.ok(a.run('player.x+player.w')<=55*32+1);assert.equal(a.run('myceliumState.solved'),false);
 }
});
test('closed divide separates every elevation, including pogo, ledge grab and kefir dash attempts',()=>{
 const a=level();
 // Topological separator plus real collision/physics attempts, rather than
 // empty-cell flood fill. Normal movement cannot jump through this column.
 assert.ok(a.run('map.every(row=>row[55]==="#")'));
 for(let row=18;row<=54;row++)for(const pogo of [false,true]){
  place(a,53,row);a.run(`pogoOn=${pogo};player.speedT=600;keys={right:true,jump:true};for(let n=0;n<100;n++)updatePlayer()`);
  assert.ok(a.run('player.x+player.w')<=55*32+1,`row ${row}, pogo ${pogo}`);
 }
 // The highest western support is far below the top of the separator.
 place(a,53,26);a.run('pogoOn=true;keys={jump:true};var highest=player.y;for(let n=0;n<100;n++){updatePlayer();highest=Math.min(highest,player.y)}');assert.ok(a.run('highest')>0);
});
test('solving opens exactly the illustrated doorway and supports crossing in both directions',()=>{
 const a=level();const before=JSON.parse(a.run('JSON.stringify(map)'));solve(a);
 const after=a.run('map');for(let y=0;y<56;y++)assert.equal(after[y][55],y>=28&&y<35?'.':before[y][55]);
 place(a,52,31);move(a,59,31);move(a,52,31,true);
});
test('falls on the entrance side recover to the relay with ordinary jumps',()=>{
 const a=level();place(a,44,54);
 for(const [x,y]of [[46,51],[48,48],[46,44],[46,39],[48,35]])move(a,x,y,true);
 assert.ok(a.run('player.x')<55*32);assert.equal(a.run('myceliumState.solved'),false);
});
test('deep-plunge return reaches the open doorway with ordinary jumps',()=>{
 const a=level();solve(a);place(a,59,54);
 for(const y of [51,47,43,39,35,31])move(a,59,y,true);
 move(a,52,31,true);
});
test('new geometry and all encounter metadata preserve the approved arena and systems',()=>{
 const a=level(),b=level(true),am=a.run('map'),bm=b.run('map');
 const edits=a.run('[...currentVerticalLayout().relayDivide.approach,...currentVerticalLayout().relayDivide.return,currentVerticalLayout().relayDivide.landing]');
 for(let y=0;y<56;y++)for(let x=0;x<105;x++)if(am[y][x]!==bm[y][x])assert.ok(x===55||edits.some(([sx,sy,w])=>y===sy&&x>=sx&&x<sx+w),`${x},${y}`);
 for(const expr of ['gems','enemies','powerups','checkpointState.spawns','currentVerticalLayout().bloomrot','relayLayout()'])assert.equal(a.run(`JSON.stringify(${expr})`),b.run(`JSON.stringify(${expr})`));
 for(let i=0;i<4;i++){a.run(`checkpointState.current=${i};respawnCheckpoint()`);assert.equal(a.run('hit(player.x,player.y,player.w,player.h)||spike(player.x,player.y,player.w,player.h)'),false);assert.equal(a.run('player.x<55*T'),i<2);}
});
