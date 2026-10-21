const{test}=require('node:test'),assert=require('node:assert/strict');const{game}=require('./game-harness.cjs');
function pilot(search='?baker=pilot'){return game({}, {search});}
function ready(a){a.run('drawBakerPilot();bakerPilotArt.complete=true;bakerPilotArt.naturalWidth=887;bakerPilotArt.naturalHeight=1774');}
test('approved baker enables on normal starts, with disabled/loading/error fallbacks',()=>{
 const a=pilot('');assert.equal(a.run('bakerPilotEnabled()'),true);assert.equal(a.run('drawBakerPilot()'),false);
 a.run('bakerPilotArt.complete=true;bakerPilotArt.naturalWidth=0');assert.equal(a.run('drawBakerPilot()'),false);
 for(const search of ['?baker=off','?baker=pilotish']){const b=pilot(search);assert.equal(b.run('drawBakerPilot()'),false);assert.equal(b.run('bakerPilotArt'),null);}
});
test('all 32 art crops are valid and remain within the former image footprint',()=>{
 const a=pilot();assert.equal(a.run('BAKER_PILOT_SPRITES.length'),8);
 for(const row of a.run('BAKER_PILOT_SPRITES')){assert.equal(row.length,4);for(const s of row){const[x,y,w,h]=s.crop;assert.ok(x>=0&&y>=0&&x+w<=887&&y+h<=1774);assert.ok(s.w>0&&s.w<=84&&s.h>0&&s.h<=96);}}
});
test('successful shots alone trigger horizontal/upward squeeze and cooldown expiration',()=>{
 const a=pilot();a.run('player.ammo=0;updateProjectiles(true,true)');assert.equal(a.run('bakerShotVisuals.has(player)'),false);
 a.run('player.ammo=35;updateProjectiles(true,false)');assert.equal(a.run('bakerPilotFrame().row'),5);assert.equal(a.run('bakerPilotFrame().frame'),1);
 a.run('tick+=3');assert.equal(a.run('bakerPilotFrame().frame'),0);a.run('tick+=4');assert.equal(a.run('bakerPilotFrame().row'),0);
 a.run('resetPlayerFire();updateProjectiles(true,true)');assert.equal(a.run('bakerPilotFrame().row'),6);
 a.run('resetPlayerFire()');assert.equal(a.run('bakerShotVisuals.has(player)'),false);
});
test('running and airborne aiming retain movement poses; hang and mixer keep precedence',()=>{
 const a=pilot();a.run('player.vx=3.6;rememberBakerShot(false)');assert.equal(a.run('bakerPilotFrame().row'),7);assert.ok(a.run('bakerPilotFrame().frame<2'));
 a.run('rememberBakerShot(true)');assert.ok(a.run('bakerPilotFrame().frame>=2'));
 a.run('player.ground=false;rememberBakerShot(false)');assert.equal(a.run('bakerPilotFrame().row'),5);assert.equal(a.run('bakerPilotFrame().frame'),3);
 a.run('rememberBakerShot(true)');assert.equal(a.run('bakerPilotFrame().row'),6);
 a.run('pogoOn=true');assert.equal(a.run('bakerPilotFrame().row'),4);
 a.run('player.hang={top:100}');assert.equal(a.run('bakerPilotFrame().row'),3);
});
test('drawing is pure, feet/hanging hands are anchored, facing and blinking remain intact',()=>{
 const a=pilot();ready(a);const expr='JSON.stringify({player,shots,enemies,collected,powerups,checkpointState})',before=a.run(expr);
 a.trace.length=0;a.run('drawBakerPilot()');assert.equal(a.run(expr),before);
 let c=a.trace.find(c=>c[0]==='drawImage');assert.equal(c[7],-c[9]);
 a.run('player.face=-1');a.trace.length=0;a.run('drawBakerPilot()');assert.ok(a.trace.some(c=>c[0]==='scale'&&c[1]===-1));
 a.run('player.inv=90;tick=4');a.trace.length=0;assert.equal(a.run('drawBakerPilot()'),true);assert.ok(!a.trace.some(c=>c[0]==='drawImage'));
 a.run('player.inv=0;player.hang={top:100};player.y=91');a.trace.length=0;a.run('drawBakerPilot()');c=a.trace.find(c=>c[0]==='drawImage');assert.equal(c[7],100-2-(91+38));
});
test('piping-bag art changes neither projectiles, fire cadence, resources nor damage outcomes',()=>{
 const a=pilot(),b=game();
 for(const c of [a,b])c.run("player.x=16*T;player.y=54*T-player.h;keys={shoot:true};");
 const expr='JSON.stringify({player,shots,enemies,collected,powerups,checkpointState})';
 for(let i=0;i<180;i++){a.run('update()');b.run('update()');assert.equal(a.run(expr),b.run(expr));}
 assert.deepEqual(a.audio,b.audio);
 const c=pilot(),d=game();for(const v of[c,d])v.run('player.x=16*T;player.y=54*T-player.h;updateProjectiles(true,true)');assert.equal(c.run('JSON.stringify(shots)'),d.run('JSON.stringify(shots)'));
});
test('dough blob rendering preserves the actual projectile and preview scene writes no progress',()=>{
 const a=pilot('?baker=pilot&scene=baker-workshop');assert.equal(a.run('contactSurface(player)'),54*32);assert.equal(a.storage.size,0);assert.equal(a.run('collected'),0);
 a.run('var blob={x:100,y:100,w:10,h:6,vx:10};var beforeBlob=JSON.stringify(blob);drawDoughShot(blob)');assert.equal(a.run('JSON.stringify(blob)'),a.run('beforeBlob'));
});
