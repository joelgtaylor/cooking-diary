const{test}=require('node:test'),assert=require('node:assert/strict');const{game}=require('./game-harness.cjs');
function pilot(scene='flight'){return game({}, {search:'?fungal=pilot&scene=fungal-'+scene});}
test('fungal release is scoped to Bakery 2; scenes use real support with no save writes',()=>{
 const a=pilot();assert.equal(a.run('bakery'),2);assert.equal(a.run('state'),'pause');assert.equal(a.run('enemies.length'),9);assert.equal(a.storage.size,0);assert.equal(a.run('collected'),0);
 for(const scene of ['opening','hopper','caster']){const b=pilot(scene);assert.notEqual(b.run('contactSurface(player)'),null);assert.ok(b.run('enemies.filter(e=>e.alive).every(e=>!collide(e,player))'));}
 for(const stage of [1,3]){a.run(`init(${stage})`);assert.equal(a.run('fungalPilotEnabled()'),false);assert.equal(a.run("enemies.filter(e=>e.type==='flyer').length"),0);}
 const b=game({}, {search:''});b.run('init(2)');assert.equal(b.run('enemies.length'),9);assert.equal(b.run('fungalPilotEnabled()'),true);assert.equal(b.run("enemies.find(e=>e.type==='thrower').attackT"),30);const old=game({}, {search:'?fungal=off'});old.run('init(2)');assert.equal(old.run('enemies.length'),8);
});
test('moving ground enemies retain the approved simulation',()=>{
 const a=pilot(),b=game();b.run('init(2)');a.run('state="play";player.x=2000;player.y=0');b.run('player.x=2000;player.y=0');
 const expr="JSON.stringify(enemies.filter(e=>e.type==='walker'||e.type==='hopper'))";
 for(let i=0;i<900;i++){a.run('updateEnemies()');b.run('updateEnemies()');}assert.equal(a.run(expr),b.run(expr));
});
test('flyer warns before a locked dive; stepping aside avoids damage; cooldown permits escape',()=>{
 const a=pilot();a.run("state='play';var e=enemies.find(e=>e.type==='flyer');e.x=2*T;e.flight.cooldown=0;player.x=e.x;player.y=54*T-player.h;updateSporewing(e)");
 assert.equal(a.run('e.flight.phase'),'warn');assert.equal(a.run('e.flight.timer'),24);const x=a.run('e.x');
 a.run('for(let i=0;i<24;i++)updateSporewing(e)');const target=a.run('e.flight.targetX');a.run('player.x=0');assert.equal(a.run('e.flight.phase'),'dive');assert.equal(a.run('e.x'),x);assert.equal(a.run('e.flight.targetX'),target);
 a.run('for(let i=0;i<130;i++)updateSporewing(e)');assert.equal(a.run('e.flight.phase'),'patrol');assert.equal(a.run('e.y'),a.run('e.flight.homeY'));assert.equal(a.run('player.health'),3);assert.ok(a.run('e.flight.cooldown')>0);
});
test('flyer cannot trigger through terrain, offscreen or through one-way support',()=>{
 const a=pilot();a.run("state='play';var e=enemies.find(e=>e.type==='flyer');e.x=2*T;player.x=e.x;player.y=54*T-player.h");assert.equal(a.run('sporewingCanDive(e)'),true);
 a.run("map[52][2]='='");assert.equal(a.run('sporewingCanDive(e)'),false);a.run("map[52][2]='#'");assert.equal(a.run('sporewingCanDive(e)'),false);a.run("map[52][2]='.';camera=500");assert.equal(a.run('sporewingCanDive(e)'),false);
});
test('dive stops at support and patrol stays in bounds across repeated cycles',()=>{
 const a=pilot();a.run("state='play';var e=enemies.find(e=>e.type==='flyer');e.x=2*T;e.flight.phase='dive';e.flight.timer=45;e.flight.targetY=54*T;e.flight.diveVX=0;e.flight.diveVY=5;map[51][2]='=';for(let i=0;i<12;i++)updateSporewing(e)");
 assert.ok(a.run('e.y+e.h')<=51*32);assert.equal(a.run('e.flight.phase'),'brake');
 a.run("map[51][2]='.';player.x=2000;for(let i=0;i<1200;i++)updateSporewing(e)");assert.ok(a.run('e.x>=e.flight.left&&e.x<=e.flight.right'));assert.equal(a.run('e.alive'),true);
});
test('flyer takes one shot or descending mixer pogo and shares ordinary contact damage',()=>{
 for(const method of ['shot','pogo','contact']){
  const a=pilot();a.run("state='play';var e=enemies.find(e=>e.type==='flyer');enemies=[e];e.flight.phase='brake';e.flight.timer=99;player.x=e.x;player.y=e.y;player.inv=0");
  if(method==='shot')a.run('shots=[{x:e.x,y:e.y,w:8,h:8,vx:0,vy:0,life:100}];updateProjectiles(false)');
  if(method==='pogo')a.run('pogoOn=true;player.y=e.y-player.h+5;player.vy=3;updateEnemies()');
  if(method==='contact')a.run('updateEnemies()');
  assert.equal(a.run('e.alive'),method==='contact');assert.equal(a.run('player.health'),method==='contact'?2:3);
 }
});
test('art crop bounds, pose selection and rendering are pure; retries reset flyer safely',()=>{
 const a=pilot();for(const row of a.run('FUNGAL_CROPS'))for(const[x,y,w,h]of row)assert.ok(x>=0&&y>=0&&x+w<=1536&&y+h<=1024);
 for(const[x,y,w,h]of a.run('SPOREWING_CROPS'))assert.ok(x>=0&&y>=0&&x+w<=1536&&y+h<=1024);
 a.run("var e=enemies.find(e=>e.type==='flyer');drawFungalEnemy(e);sporewingArt.complete=true;sporewingArt.naturalWidth=1536;sporewingArt.naturalHeight=1024");
 const expr='JSON.stringify({enemies,player,checkpointState})',before=a.run(expr);a.run('for(let i=0;i<20;i++)drawFungalEnemy(e)');assert.equal(a.run(expr),before);
 a.run("e.flight.phase='dive';e.y+=100;respawnCheckpoint()");assert.equal(a.run('e.flight.phase'),'patrol');assert.equal(a.run('e.y'),50*32);assert.equal(a.run('e.flight.cooldown'),90);
});

test('Sporewing hits an unmoving player and a steady walk, but release direction remains locked',()=>{
 for(const speed of [0,-1.1]){
  const a=pilot();a.run(`state='play';var e=enemies.find(e=>e.type==='flyer');enemies=[e];e.flight.cooldown=0;player.x=e.x;player.y=54*T-player.h;player.vx=${speed};`);
  for(let i=0;i<100&&a.run('player.health')===3;i++)a.run(`player.x+=${speed};updateEnemies()`);
  assert.equal(a.run('player.health'),2);
 }
 const a=pilot();a.run("state='play';var e=enemies.find(e=>e.type==='flyer');e.flight.cooldown=0;player.x=e.x;updateSporewing(e);for(let i=0;i<24;i++)updateSporewing(e)");
 const vx=a.run('e.flight.diveVX');a.run('player.x+=100;updateSporewing(e)');assert.equal(a.run('e.flight.diveVX'),vx);
});
test('fungal caster gets a faster first shot and repeat with the warning intact; other worlds unchanged',()=>{
 const a=pilot('caster');a.run("state='play';var casterEnemy=enemies.find(e=>e.type==='thrower');enemies=[casterEnemy]");
 a.run('for(let i=0;i<29;i++)updateThrower(casterEnemy)');assert.equal(a.run('casterEnemy.windup'),0);
 a.run('updateThrower(casterEnemy)');assert.equal(a.run('casterEnemy.windup'),24);
 a.run('for(let i=0;i<23;i++)updateThrower(casterEnemy)');assert.equal(a.run('enemyShots.length'),0);
 a.run('updateThrower(casterEnemy)');assert.equal(a.run('enemyShots.length'),1);assert.equal(a.run('casterEnemy.attackT'),84);
 a.run('for(let i=0;i<108;i++)updateThrower(casterEnemy)');assert.equal(a.run('enemyShots.length'),2);
 a.run('player.x=0;updateThrower(casterEnemy)');assert.equal(a.run('casterEnemy.windup'),0);
 for(const stage of [1,3]){a.run(`init(${stage})`);assert.deepEqual(JSON.parse(a.run('JSON.stringify(fungalThrowerTiming())')),{ready:90,windup:36,recovery:150});}
});

test('changing course after dive release still avoids contact',()=>{
 const a=pilot();a.run("state='play';var e=enemies.find(e=>e.type==='flyer');enemies=[e];e.flight.cooldown=0;player.x=e.x;updateEnemies();for(let i=0;i<24;i++)updateEnemies();player.x=0;for(let i=0;i<80;i++)updateEnemies()");assert.equal(a.run('player.health'),3);
});
