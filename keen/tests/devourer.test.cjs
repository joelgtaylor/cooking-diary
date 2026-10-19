const{test}=require('node:test'),assert=require('node:assert/strict');const{game}=require('./game-harness.cjs');
function trial(){const a=game();a.run('startDevourerPreview()');return a;}
function engage(a){a.run('player.x=91*T;updateDevourer()');}
test('Devourer trial is isolated, disguised and unannounced until approaching',()=>{
 const a=game();for(const i of [1,2,3]){a.run(`init(${i})`);assert.equal(a.run('devourerState'),null);}
 a.run('startDevourerPreview();updateDevourer()');assert.equal(a.run('devourerState.phase'),'disguise');assert.equal(a.run('tile(80,50)'),'.');engage(a);assert.equal(a.run('devourerState.phase'),'slam');assert.equal(a.run('devourerState.timer'),24);assert.equal(a.run('tile(80,50)'),'#');
});
test('first slam has a fixed 24-tick flight and never tracks the player after takeoff',()=>{
 const a=trial();engage(a);const target=a.run('devourerState.targetX');a.run('player.x+=140;for(let i=0;i<23;i++)updateDevourer()');assert.equal(a.run('devourerState.phase'),'slam');assert.equal(a.run('devourerState.targetX'),target);a.run('updateDevourer()');assert.equal(a.run('devourerState.phase'),'landing');assert.equal(a.run('devourerState.foot'),54*32);assert.equal(a.run('devourerState.x'),target);
});
test('standing still takes slam damage, running away using real player physics escapes',()=>{
 const a=trial();engage(a);a.run('for(let i=0;i<24;i++)updateDevourer()');assert.equal(a.run('player.health'),2);
 const b=trial();engage(b);b.run('keys={left:true};for(let i=0;i<24;i++)update()');assert.equal(b.run('player.health'),3);
});
test('five boules fire ten ticks apart, then recovery vents before exposing door for 60 ticks',()=>{
 const a=trial();engage(a);a.run("devourerState.phase='boules';devourerState.timer=50;");const fire=[];
 for(let i=0;i<50;i++){const before=a.audio.effects.filter(x=>x==='shoot').length;a.run('updateDevourer()');if(a.audio.effects.filter(x=>x==='shoot').length>before)fire.push(i);}assert.deepEqual(fire,[0,10,20,30,40]);assert.equal(a.run('devourerOpen(devourerState)'),false);
 a.run('for(let i=0;i<24;i++)updateDevourer()');assert.equal(a.run('devourerState.projectiles.length'),0);assert.equal(a.run('devourerOpen(devourerState)'),true);
 a.run('for(let i=0;i<59;i++)updateDevourer()');assert.equal(a.run('devourerOpen(devourerState)'),true);a.run('updateDevourer()');assert.equal(a.run('devourerOpen(devourerState)'),false);
});
test('closed door blocks shots; real moving bullets enter the opening from either side',()=>{
 for(const face of [-1,1]){const a=trial();engage(a);a.run(`devourerState.phase='recovery';devourerState.timer=60;shots=[{x:devourerState.x+${face}*100,y:devourerState.foot-110,w:10,h:6,vx:${-face}*10}];for(let i=0;i<12;i++)updateProjectiles(false);`);assert.equal(a.run('devourerState.health'),11);}
 const a=trial();engage(a);a.run("devourerState.phase='boules';shots=[{x:devourerState.x-70,y:devourerState.foot-110,w:10,h:6,vx:10}];for(let i=0;i<12;i++)updateProjectiles(false)");assert.equal(a.run('devourerState.health'),12);assert.equal(a.run('shots.length'),0);
});
test('boules bounce once, expire, respect stone, and fatal damage stops stale updates',()=>{
 const a=trial();engage(a);a.run('devourerState.projectiles=[{x:3000,y:54*T-19,w:18,h:18,vx:1,vy:2,bounces:0,life:100}];updateDevourer()');assert.equal(a.run('devourerState.projectiles[0].bounces'),1);assert.ok(a.run('devourerState.projectiles[0].vy')<0);
 a.run('devourerState.projectiles[0].life=1;updateDevourer()');assert.equal(a.run('devourerState.projectiles.length'),0);
 a.run('player.health=1;player.inv=0;devourerState.projectiles=[{x:player.x,y:player.y,w:18,h:18,vx:0,vy:0,bounces:0,life:100}];updateDevourer()');assert.equal(a.run('devourerState.phase'),'disguise');assert.equal(a.run('devourerState.projectiles.length'),0);assert.equal(a.run('player.x'),79*32);
});
test('retry/restart/defeat safely reset or clear the isolated fight without changing full Bakery 3',()=>{
 const a=trial();engage(a);a.run('devourerState.health=1;hurtDevourer();hurtDevourer()');assert.equal(a.run('player.score'),2000);assert.equal(a.run('tile(80,50)'),'.');a.run('player.ammo=0;respawnCheckpoint()');assert.equal(a.run('player.ammo'),65);assert.equal(a.run('devourerState.health'),12);a.run('restart()');assert.equal(a.run('player.x'),83*32);a.run('leaveDevourerPreview()');assert.equal(a.run('devourerState'),null);assert.equal(a.run('gems.length'),5);
});
test('pause and rendering are pure; timing is identical at 30/60/120 render fps',()=>{
 const a=trial();engage(a);const before=a.run('JSON.stringify(devourerState)');a.run("state='pause';for(let i=0;i<100;i++){updateDevourer();drawDevourer()}");assert.equal(a.run('JSON.stringify(devourerState)'),before);
 let expected;for(const fps of [30,60,120]){const b=trial();engage(b);b.run('draw=()=>{};diagnosticOverlay=()=>{};drawPhase3Map=()=>{};');b.run(`for(let i=0;i<=${fps*8};i++)loop(i*1000/${fps})`);const actual=b.run('JSON.stringify([devourerState,player,tick])');if(expected)assert.equal(actual,expected);else expected=actual;}
});

test('real jump-and-fire controls can punish the opening after a human reaction delay at useful distances',()=>{
 for(const distance of [100,180,260])for(const delay of [12,20])for(let cadence=0;cadence<13;cadence++){
  const a=trial();a.run(`devourerState.phase='recovery';devourerState.timer=108;tick=${cadence};player.x=devourerState.x-${distance};player.face=1;`);
  for(let n=0;n<108;n++)a.run(`keys=${n>=24+delay?'{jump:true,shoot:true}':'{}'};update()`);
  assert.ok(a.run('devourerState.health')<12,`distance${distance}, reaction${delay}, cadence${cadence}`);
 }
});
test('the real shooting path can exhaust all twelve health bars across controlled repeated recovery openings',()=>{
 const a=trial();let windows=0;
 while(a.run('devourerState.health')>0&&windows++<12){
  // Exercise an ordinary grounded jump with real ammo, firing cadence and bullets.
  a.run("devourerState.phase='recovery';devourerState.timer=108;player.x=devourerState.x-180;player.y=54*T-player.h;player.vy=0;player.vx=0;player.ground=true;player.face=1;prevJump=false;");
  for(let n=0;n<108&&a.run('devourerState.health')>0;n++)a.run(`keys=${n>=44?`{jump:true,shoot:${n<84}}`:'{}'};update()`);
 }
 assert.equal(a.run('devourerState.health'),0);assert.ok(a.run('player.ammo')>0);
});

test('repeat attacks leave a full cooling beat, warn early, cap travel and never retarget during windup',()=>{
 const a=trial();engage(a);a.run("devourerState.phase='recovery';devourerState.timer=1;devourerState.foot=54*T;updateDevourer()");assert.equal(a.run('devourerState.phase'),'rest');assert.equal(a.run('devourerState.timer'),60);
 a.run('player.x=82*T;for(let i=0;i<59;i++)updateDevourer()');assert.equal(a.run('devourerState.phase'),'rest');a.run('updateDevourer()');assert.equal(a.run('devourerState.phase'),'windup');assert.equal(a.run('devourerState.timer'),48);
 const target=a.run('devourerState.queuedTargetX');assert.ok(Math.abs(target-a.run('devourerState.x'))<=160);a.run('player.x=102*T;for(let i=0;i<48;i++)updateDevourer()');assert.equal(a.run('devourerState.targetX'),target);assert.equal(a.run('devourerState.timer'),36);
 a.run('for(let i=0;i<35;i++)updateDevourer()');assert.equal(a.run('devourerState.phase'),'slam');a.run('updateDevourer()');assert.equal(a.run('devourerState.phase'),'landing');assert.equal(a.run('devourerState.timer'),30);
 a.run('for(let i=0;i<29;i++)updateDevourer()');assert.equal(a.run('devourerState.phase'),'landing');a.run('updateDevourer()');assert.equal(a.run('devourerState.phase'),'boules');
});
test('ordinary movement during the repeat warning creates separation before the locked landing',()=>{
 const a=trial();a.run("devourerState.cycle=1;devourerState.x=96*T;player.x=devourerState.x-110;queueDevourerSlam(devourerState);keys={left:true};for(let i=0;i<84;i++)update();");assert.equal(a.run('player.health'),3);assert.ok(a.run('Math.abs(player.x+player.w/2-devourerState.x)')>160);assert.equal(a.run('devourerState.phase'),'landing');
});
