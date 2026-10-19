const {test}=require('node:test');
const assert=require('node:assert/strict');
const {game}=require('./game-harness.cjs');
test('Oven Descent preserves approved terrain and encounters before column 78',()=>{
 const a=game(),b=game({}, {layoutFixture:'bakery1-towers.js'});const am=a.run('map'),bm=b.run('map');
 for(let y=0;y<56;y++)for(let x=0;x<105;x++)if(am[y][x]!==bm[y][x])assert.ok(x>=78&&y>=20&&y<=53);
 for(const q of ['gems.slice(0,3)','checkpointState.spawns.slice(0,3)','enemies.filter(e=>e.x<78*T)'])assert.equal(a.run(`JSON.stringify(${q})`),b.run(`JSON.stringify(${q})`));
});
test('terrace drops lead to the forecourt with visible landings and no jump required',()=>{
 for(const [name,sx,sy,tx,ty] of [['entry',76,19,80,20],['culture four',81,20,84,24],['east terrace',85,24,90,28],['east balcony',91,28,95,32],['culture five',96,32,100,36],['turn west',99,36,96,40],['west balcony',93,40,91,44],['foyer upper',88,44,86,46],['foyer lower',87,46,85,49],['arena approach',85,49,89,54]]){
  const a=game();a.run(`player.x=${sx}*T;player.y=${sy}*T-player.h;player.vx=0;player.vy=0;player.ground=true;`);let landed=false;
  for(let f=0;f<240;f++){
   a.run(`keys={right:player.x<${tx}*T-5,left:player.x>${tx}*T+5};updatePlayer()`);
   if(f>5&&a.run(`player.ground&&Math.abs(player.y+player.h-${ty}*T)<1&&Math.abs(player.x-${tx}*T)<24`)){landed=true;break;}
  }
  assert.ok(landed,name);
 }
});
test('both final cultures can be revisited from the arena via normal jumps',()=>{
 for(const [sx,sy,tx,ty] of [[86,54,85,49],[85,49,88,44],[88,46,90,44],[91,44,94,40],[96,40,100,36],[99,36,96,32],[95,32,90,28],[89,28,86,24]]){
  const a=game();a.run(`player.x=${sx}*T;player.y=${sy}*T-player.h;player.vx=0;player.vy=0;player.ground=true;`);let landed=false;
  for(let f=0;f<200;f++){
   a.run(`keys={jump:true,right:player.x<${tx}*T-5,left:player.x>${tx}*T+5};updatePlayer()`);
   if(f>5&&a.run(`player.ground&&Math.abs(player.y+player.h-${ty}*T)<1&&Math.abs(player.x-${tx}*T)<24`)){landed=true;break;}
  }
  assert.ok(landed,`${sx},${sy} to ${tx},${ty}`);
 }
});
test('forecourt is clear, checkpoint recovery is safe, and Foreman rendering cannot alter gameplay',()=>{
 const a=game();
 assert.equal(a.run("map[53].slice(88).every(v=>v==='.')"),true);
 assert.equal(a.run('enemies.filter(e=>e.y>45*T&&e.x>=88*T).length'),0);
 a.run('checkpointState.current=3;respawnCheckpoint();');assert.equal(a.run('hit(player.x,player.y,player.w,player.h)'),false);
 a.run('assets.foremanConcept.complete=true;assets.foremanConcept.naturalWidth=1331;');
 const before=a.run('JSON.stringify([player,enemies,gems,state,checkpointState,unlocked])');a.trace.length=0;a.run('camera=2400;cameraY=1252;drawForemanPreview()');
 assert.equal(a.run('JSON.stringify([player,enemies,gems,state,checkpointState,unlocked])'),before);
 assert.equal(a.trace.filter(c=>c[0]==='drawImage').length,1);
 const draw=a.trace.find(c=>c[0]==='drawImage');assert.equal(draw.at(-3)+draw.at(-1),54*32);
 a.run('collected=5;player.x=102*T;player.y=54*T-player.h;updateWorldProgress()');assert.equal(a.run('state'),'clear');
});
