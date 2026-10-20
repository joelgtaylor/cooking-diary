const {test}=require('node:test'),assert=require('node:assert/strict');
const {game}=require('./game-harness.cjs');
function level(){const a=game();a.run('init(3)');return a;}
function segment(name,sx,sy,tx,ty,jump=false){
 const a=level();a.run(`player.x=${sx}*T;player.y=${sy}*T-player.h;player.ground=true;player.vx=0;player.vy=0;`);
 for(let f=0;f<230;f++){
  a.run(`keys={jump:${jump},right:player.x<${tx}*T-5,left:player.x>${tx}*T+5};updatePlayer()`);
  if(f>5&&a.run(`player.ground&&Math.abs(player.y+player.h-${ty}*T)<1&&Math.abs(player.x-${tx}*T)<24`))return;
 }assert.fail(name+' '+a.run('JSON.stringify({x:player.x/T,foot:(player.y+player.h)/T})'));
}
test('finale preserves all approved entrance/ascent tiles and early progression',()=>{
 const a=level(),b=game({}, {layoutFixture3:'bakery3-ascent-approved.js'});b.run('init(3)');
 const am=a.run('map'),bm=b.run('map');for(let y=0;y<56;y++)for(let x=0;x<78;x++)if(x<76||y<36)assert.equal(am[y][x],bm[y][x],`${x},${y}`);
 for(const q of ['currentVerticalLayout().entrance','currentVerticalLayout().ascent','gems.slice(0,3)','checkpointState.spawns.slice(0,3)','enemies.filter(e=>e.x<78*T)','powerups.filter((u,i)=>i!==4).slice(0,6)'])assert.equal(a.run(`JSON.stringify(${q})`),b.run(`JSON.stringify(${q})`),q);
 assert.equal(a.run('gems.length'),5);assert.equal(a.run('player.ammo'),35);assert.equal(a.run('player.kefirCharges||0'),0);
});
test('descent terraces and quiet return reach the checkpoint with existing movement',()=>{
 for(const s of [['first terrace',76,19,80,22],['culture four',82,22,85,25],['hopper terrace',87,25,91,28],
  ['last culture',93,28,97,31],['west return',95,31,91,32],['west bridge',88,32,84,32],
  ['service stair',81,32,79,36],['stair forty',79,36,76.5,40],['stair forty-four',76.5,40,78.5,44],
  ['stair forty-eight',78.5,44,76.5,48],['stair fifty-one',76.5,48,78.5,51],['checkpoint floor',78.5,51,76.5,54],['checkpoint approach',76.5,54,79,54]]){
  segment(...s);
 }
});
test('ordinary recovery jumps return from the checkpoint to both last cultures',()=>{
 for(const s of [['first stair',79,54,79,51,true],['second stair',79,51,76.5,48,true],['third stair',76.5,48,79,44,true],
  ['fourth stair',79,44,76.5,40,true],['fifth stair',76.5,40,79,36,true],['bridge recovery',79,36,82,32,true],
  ['reverse crossing',84,32,90,28,true],['last culture return',91,28,97,31,false],['earlier culture return',90,28,86,25,true]])segment(...s);
});
test('final cultures are collectible and crossing overhead never reveals the mimic',()=>{
 const a=level();a.run('enemies=[];');
 for(const i of [3,4]){a.run(`player.x=gems[${i}].x;player.y=gems[${i}].y;keys={};update()`);assert.equal(a.run(`gems[${i}].got`),true);}
 a.run('player.x=96*T;player.y=31*T-player.h;for(let i=0;i<180;i++)updateDevourer()');
 assert.equal(a.run('devourerState.phase'),'disguise');assert.equal(a.run('tile(80,50)'),'.');
});
test('last checkpoint resupplies safely and retry preserves cultures, scores and arena tuning',()=>{
 const a=level();a.run('player.x=79*T;player.y=54*T-player.h;player.health=1;player.ammo=0;player.kefirCharges=0;updateWorldProgress()');
 assert.equal(a.run('checkpointState.current'),3);assert.equal(a.run('player.ammo'),65);assert.equal(a.run('player.health'),3);assert.equal(a.run('player.kefirCharges'),1);
 a.run('for(let i=0;i<500;i++){updateEnemies();updateEnemyShots();updateDevourer()}');assert.equal(a.run('player.health'),3);assert.equal(a.run('devourerState.phase'),'disguise');
 a.run('collected=5;gems.forEach(g=>g.got=true);player.score=123;player.x=91*T;updateDevourer()');assert.equal(a.run('devourerState.timer'),58);assert.equal(a.run('tile(80,50)'),'#');
 a.run("player.ammo=0;player.kefirCharges=0;devourerState.phase='kefir';respawnCheckpoint()");
 assert.equal(a.run('player.x'),79*32+3);assert.equal(a.run('collected'),5);assert.equal(a.run('player.score'),123);assert.equal(a.run('player.ammo'),65);assert.equal(a.run('devourerState.health'),12);assert.equal(a.run('tile(80,50)'),'.');
 assert.equal(a.run('hit(player.x,player.y,player.w,player.h)'),false);
});
test('normal arena geometry matches the approved isolated fight inside its gate',()=>{
 const a=level(),b=game();b.run('startDevourerPreview()');
 for(let y=36;y<56;y++)for(let x=80;x<105;x++)assert.equal(a.run(`tile(${x},${y})`),b.run(`tile(${x},${y})`),`${x},${y}`);
 a.run('checkpointState.current=3;respawnCheckpoint();');assert.equal(a.run('powerups.find(u=>u.kind==="ammo").got'),false);
 a.run('player.x=102*T;player.y=54*T-player.h;keys={};updatePickups()');assert.equal(a.run('player.kefirCharges'),2);
});
test('descent guards stay supported and retain ordinary shooting and pogo counterplay',()=>{
 const a=level();a.run('for(let i=0;i<900;i++)updateEnemies()');
 assert.equal(a.run('enemies.filter(e=>e.x>78*T).every(e=>e.alive&&e.x>=e.encounter.left&&e.x<=e.encounter.right)'),true);
 a.run('player.x=83*T;player.y=25*T-player.h;player.ground=true;player.face=1;keys={shoot:true};for(let i=0;i<50;i++)update()');
 assert.equal(a.run('enemies.find(e=>e.type==="walker"&&e.encounter.left===85*T).alive'),false);
 a.run('var hopper=enemies.find(e=>e.type==="hopper"&&e.encounter.left===91*T);hopper.vx=0;hopper.hopT=100;player.x=hopper.x;player.y=hopper.y-player.h+4;player.vy=2;pogoOn=true;updateEnemies()');
 assert.equal(a.run('hopper.alive'),false);assert.equal(a.run('player.vy'),-11);
});
test('real shooting defeats the integrated oven and the settled wreck completes the mission',()=>{
 const a=level();a.run('checkpointState.current=3;respawnCheckpoint();collected=5;gems.forEach(g=>g.got=true);');
 let windows=0;
 while(a.run('devourerState.health')>0&&windows++<12){
  a.run("devourerState.phase='recovery';devourerState.timer=108;player.x=devourerState.x-180;player.y=54*T-player.h;player.vy=0;player.vx=0;player.ground=true;player.face=1;prevJump=false;");
  for(let n=0;n<108&&a.run('devourerState.health')>0;n++)a.run(`keys={jump:${n>=44&&n<52},shoot:${n>=52&&n<84}};update();updateWorldProgress()`);
 }
 assert.equal(a.run('devourerState.health'),0);assert.equal(a.run('state'),'play');assert.equal(a.run('player.score'),2000);
 a.run('keys={};for(let i=0;i<120;i++)updateDevourer();player.x=96*T;player.y=54*T-player.h;updateWorldProgress()');
 assert.equal(a.run('state'),'clear');assert.equal(a.storage.get('crustQuestCodex'),'[2]');
});
test('the full-level oven requires cultures and the finished collapse, then unlocks recipe three',()=>{
 const a=level();a.run('collected=5;player.x=96*T;player.y=54*T-player.h;updateWorldProgress()');assert.equal(a.run('state'),'play');
 a.run('devourerState.health=1;hurtDevourer();updateWorldProgress()');assert.equal(a.run('state'),'play');
 a.run('for(let i=0;i<120;i++)updateDevourer();collected=4;updateWorldProgress()');assert.equal(a.run('state'),'play');
 a.run('collected=5;updateWorldProgress()');assert.equal(a.run('state'),'clear');assert.equal(a.run('player.score'),2000);assert.equal(a.storage.get('crustQuestCodex'),'[2]');
 a.enter();assert.equal(a.run('state'),'win');
});
test('full mission restart returns to the entrance while isolated restart keeps its practice arena',()=>{
 const a=level();a.run('checkpointState.current=3;collected=5;restart()');assert.equal(a.run('player.x'),3*32);assert.equal(a.run('collected'),0);assert.equal(a.run('gems.length'),5);assert.equal(a.run('devourerState.phase'),'disguise');
 a.run('startDevourerPreview();restart()');assert.equal(a.run('player.x'),83*32);assert.equal(a.run('gems.length'),0);
});
