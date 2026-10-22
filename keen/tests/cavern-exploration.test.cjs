const{test}=require('node:test'),assert=require('node:assert/strict');const{game}=require('./game-harness.cjs');
function level(saved={}){const a=game(saved);a.run('init(2);enemies=[]');return a;}
function place(a,x,y){a.run(`player.x=${x}*T;player.y=${y}*T-player.h;player.vx=0;player.vy=0;player.ground=true;player.hang=null;keys={};prevJump=false;pogoOn=false;`);}
function move(a,x,y,jump=false){a.run('prevJump=false');for(let n=0;n<240;n++){
 a.run(`keys={jump:${jump},right:player.x<${x}*T-4,left:player.x>${x}*T+4};updatePlayer();updateCavernExploration();`);
 if(n>5&&a.run(`player.ground&&Math.abs(player.y+player.h-${y}*T)<1&&Math.abs(player.x-${x}*T)<24`))return;
 }assert.fail(`route ${x},${y}: `+a.run('JSON.stringify([player.x/T,(player.y+player.h)/T])'));}
test('cellar forms an ordinary-jump loop below the opening and returns to the starting street',()=>{
 const a=level();place(a,10.5,54);a.run('interactCavernExploration()');
 for(const p of [[10.5,57],[13,59],[11,63],[10,65],[5,69],[8,69]])move(a,...p);
 assert.equal(a.run('cavernExploration.collected.has("cellar-pin")'),true);
 for(const p of [[8,65],[8,61],[10.5,57],[14,54]])move(a,...p,true);
 assert.equal(a.run('collected'),0);assert.equal(a.run('player.health'),3);
});
test('second cellar entrance and right recovery climb reconnect before the keeper',()=>{
 const a=level();place(a,21.5,54);a.run('interactCavernExploration()');move(a,21.5,57);move(a,17,69);move(a,20,69);
 for(const p of [[20,65],[20,61],[20,57],[21.5,57],[23,54]])move(a,...p,true);
 assert.ok(a.run('player.x')<55*32);
});
test('Hollow loop reaches its relic, repair mechanism and main checkpoint shelf',()=>{
 const a=level();place(a,75.1,43);a.run('for(let i=0;i<10;i++)updatePlayer()');move(a,74,47);move(a,69,50);move(a,72,50);
 assert.equal(a.run('cavernExploration.collected.has("hollow-compass")'),true);
 assert.equal(a.run('interactCavernExploration()'),true);assert.equal(a.run('cavernExploration.repaired'),true);
 move(a,74,47,true);move(a,78,47,true);
 assert.equal(a.run('collected'),0);
});
test('lift is unusable until repaired, carries to both terminals, and jump exits safely',()=>{
 const a=level();place(a,82.6,54);a.run('interactCavernExploration()');assert.equal(a.run('cavernExploration.ride'),null);
 place(a,71,50);a.run('interactCavernExploration()');place(a,82.6,54);a.run('interactCavernExploration()');
 for(let i=0;i<400;i++)a.run('update()');
 assert.equal(a.run('cavernExploration.liftY'),26*32);assert.equal(a.run('player.y+player.h'),26*32);
 assert.equal(a.run('cavernExploration.collected.has("freight-token")'),true);
 a.run('keys={};interactCavernExploration();for(let i=0;i<30;i++)update();keys={jump:true};update()');
 assert.equal(a.run('cavernExploration.ride'),null);assert.ok(a.run('player.vy')<0);assert.equal(a.run('hit(player.x,player.y,player.w,player.h)'),false);
 a.run('recoverCavernExploration()');place(a,82.6,26);assert.equal(a.run('cavernExploreAction()'),'call');
 a.run('interactCavernExploration();interactCavernExploration();keys={};for(let i=0;i<400;i++)update()');assert.equal(a.run('cavernExploration.liftY'),54*32);
});
test('relics reward once per attempt, persist independently and never count as cultures or unlock recipes',()=>{
 const a=level({crustQuestBest:'9000',crustQuestCodex:'[0]'});
 for(const [x,y]of [[8,69],[72,50],[83,26]]){place(a,x,y);a.run('updateCavernExploration();updateCavernExploration()');}
 assert.equal(a.run('cavernExploration.found.size'),3);assert.equal(a.run('player.score'),2250);assert.equal(a.run('player.ammo'),65);assert.equal(a.run('collected'),0);
 assert.equal(a.storage.get('crustQuestBest'),'9000');assert.equal(a.storage.get('crustQuestCodex'),'[0]');
 a.run('checkpointState.current=1;cavernExploration.repaired=true;respawnCheckpoint()');assert.equal(a.run('cavernExploration.repaired'),true);assert.equal(a.run('cavernExploration.collected.size'),3);
 a.run('restart()');assert.equal(a.run('cavernExploration.repaired'),false);assert.equal(a.run('cavernExploration.collected.size'),0);assert.equal(a.run('cavernExploration.found.size'),3);
 const b=level(Object.fromEntries(a.storage));assert.equal(b.run('cavernExploration.found.size'),3);
 for(const invalid of ['broken','{}','["unknown"]'])assert.equal(level({crustQuestCavernRelics:invalid}).run('cavernExploration.found.size'),0);
});
test('lift, discovery and rendering respect pause, character selection and other bakeries',()=>{
 const a=level();place(a,71,50);a.run('interactCavernExploration()');place(a,82.6,54);a.run('interactCavernExploration();openCharacterSelector()');
 const before=a.run('JSON.stringify([player,cavernExploration.liftY,tick])');a.run('for(let i=0;i<120;i++){update();draw()}');assert.equal(a.run('JSON.stringify([player,cavernExploration.liftY,tick])'),before);
 a.run('closeCharacterSelector();update()');assert.notEqual(a.run('cavernExploration.liftY'),54*32);
 for(const stage of [1,3]){a.run(`init(${stage});draw()`);assert.equal(a.run('cavernExploration'),null);assert.equal(a.run('interactCavernExploration()'),false);assert.equal(a.run('rows'),56);}
});
test('district map fits the deeper world and only names discovered rooms; draw calls are pure and culled',()=>{
 const a=level();a.trace.length=0;a.run('drawCavernDistrictMap(g,336/rows,82)');assert.ok(!a.trace.some(c=>c[0]==='fillText'));
 a.run('cavernExploration.visited.add("cellar");cavernExploration.visited.add("hollow");cavernExploration.repaired=true');
 const before=a.run('JSON.stringify([player,map,collected,cavernExploration.liftY,tick])');a.trace.length=0;
 a.run('drawCavernDistrictMap(g,336/rows,82)');assert.ok(a.trace.some(c=>c[0]==='fillText'&&c[1]==='STARTER CELLAR'));
 for(const c of a.trace.filter(c=>c[0]==='strokeRect'))assert.ok(c[2]+c[4]<=418);
 a.trace.length=0;a.run('camera=0;cameraY=0;drawCavernDiscoveryBackdrop();drawCavernExploration()');assert.equal(a.trace.length,0);
 assert.equal(a.run('JSON.stringify([player,map,collected,cavernExploration.liftY,tick])'),before);
});
