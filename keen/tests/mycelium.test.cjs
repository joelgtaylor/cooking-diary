const {test}=require('node:test'),assert=require('node:assert/strict');
const {game}=require('./game-harness.cjs');
function chamber(known=true){const a=game();a.run(`init(2);enemies=[];checkpointState.current=1;camera=960;cameraY=650;myceliumState.clueKnown=${known};`);return a;}
function land(a,index,pogo=true){a.run(`{const [x,y,len]=relayLayout().switches[${index}];player.x=(x+len/2)*T-player.w/2;player.y=y*T-player.h;myceliumLanding(${pogo});}`);}
function phrase(a,seq){for(const i of seq)land(a,i);}
function solve(a){phrase(a,[2,0,1]);phrase(a,[0,2,1]);a.run('for(let i=0;i<45;i++)updateMycelium()');}
test('discovery and keeper conversation are required before the relay responds',()=>{
 const a=chamber(false);land(a,2);assert.equal(a.run('myceliumState.progress'),0);
 a.run('player.x=29.4*T;player.y=38*T-player.h;talkMycelium()');assert.equal(a.run('myceliumState.dialogue'),'meet');assert.equal(a.run('myceliumState.clueKnown'),false);
 a.run('talkMycelium();player.x=34*T;player.y=35*T-player.h;updateMycelium()');assert.equal(a.run('myceliumState.discovered'),true);
 a.run('player.x=29.4*T;player.y=38*T-player.h;talkMycelium()');assert.equal(a.run('myceliumState.dialogue'),'clue');assert.equal(a.run('myceliumState.clueKnown'),true);
});
test('ordinary landings and consecutive pogo contacts on the same cap do not advance',()=>{
 const a=chamber();land(a,2,false);assert.equal(a.run('myceliumState.progress'),0);land(a,2);land(a,2);assert.equal(a.run('myceliumState.progress'),1);land(a,0);assert.equal(a.run('myceliumState.progress'),2);
});
test('wrong order is harmless; two distinct phrases are required',()=>{
 const a=chamber();land(a,2);land(a,1);assert.equal(a.run('myceliumState.progress'),0);assert.equal(a.run('player.health'),3);assert.ok(a.audio.effects.includes('relayReset'));
 phrase(a,[2,0,1]);assert.equal(a.run('myceliumState.round'),1);assert.equal(a.run('myceliumState.solved'),false);assert.equal(a.run('myceliumState.progress'),0);
 phrase(a,[0,2,1]);assert.equal(a.run('myceliumState.solved'),true);
});
test('gate stays solid during bloom then opens with a fixed one-way cap',()=>{
 const a=chamber();phrase(a,[2,0,1]);phrase(a,[0,2,1]);assert.equal(a.run('tile(55,32)'), '#');assert.equal(a.run('tile(52,31)'),'.');
 a.run('for(let i=0;i<44;i++)updateMycelium()');assert.equal(a.run('tile(55,32)'),'#');a.run('updateMycelium()');assert.equal(a.run('tile(55,32)'),'.');assert.equal(a.run('tile(52,31)'),'M');
 assert.equal(a.run('oneWayTop(52*T,990,995,29)'),992);assert.equal(a.run('oneWayTop(52*T,995,990,29)'),null);
});
test('checkpoint recovery preserves the clue and completed phrase, resets partial input, and retains a solved gate',()=>{
 const a=chamber();a.run('myceliumState.discovered=true;gems[0].got=true;collected=1;');phrase(a,[2,0,1]);land(a,0);a.run('respawnCheckpoint()');
 assert.equal(a.run('myceliumState.round'),1);assert.equal(a.run('myceliumState.progress'),0);assert.equal(a.run('myceliumState.clueKnown'),true);assert.equal(a.run('collected'),1);
 phrase(a,[0,2,1]);a.run('respawnCheckpoint()');assert.equal(a.run('myceliumState.solved'),true);assert.equal(a.run('myceliumState.bloom'),0);assert.equal(a.run('tile(55,32)'),'.');
 a.run('restart()');assert.equal(a.run('myceliumState.clueKnown'),false);assert.equal(a.run('myceliumState.round'),0);assert.equal(a.run('tile(55,32)'),'#');a.run('init(1)');assert.equal(a.run('myceliumState'),null);a.run('init(3)');assert.equal(a.run('myceliumState'),null);
});
test('dialogue and pause freeze simulation; E repeat cannot skip a conversation; held movement is cleared',()=>{
 const a=chamber(false);a.run('player.x=29.4*T;player.y=38*T-player.h;keys={right:true,jump:true};');a.key('e');assert.equal(a.run('state'),'dialogue');assert.equal(a.run('Object.keys(keys).length'),0);
 const before=a.run('JSON.stringify([player,myceliumState,tick])');a.run('for(let i=0;i<100;i++){update();updateWorldProgress();}');assert.equal(a.run('JSON.stringify([player,myceliumState,tick])'),before);
 a.key('e','keydown',true);assert.equal(a.run('state'),'dialogue');a.key('Enter');assert.equal(a.run('state'),'play');assert.equal(a.run('Object.keys(keys).length'),0);
});
test('touch talk control works only nearby and closes the same conversation',()=>{
 const a=chamber(false);a.run('syncMyceliumTalkButton()');assert.equal(a.elements.get('talkBtn').style.display,'none');
 a.run('player.x=29.4*T;player.y=38*T-player.h;syncMyceliumTalkButton()');assert.equal(a.elements.get('talkBtn').style.display,'');
 for(const fn of a.elements.get('talkBtn').listeners.click)fn({});assert.equal(a.run('state'),'dialogue');for(const fn of a.elements.get('talkBtn').listeners.click)fn({});assert.equal(a.run('state'),'play');
});
test('paused rendering consumes no randomness and never advances bloom',()=>{
 const a=chamber();solve(a);a.run("myceliumState.bloom=30;state='pause';Math.random=()=>{throw Error('render random')};");const before=a.run('JSON.stringify(myceliumState)');a.run('for(let i=0;i<100;i++){updateMycelium();drawMycelium();drawMyceliumUI();}');assert.equal(a.run('JSON.stringify(myceliumState)'),before);
});
test('actual descending pogo physics activates staggered caps without changing bounce velocity',()=>{
 const a=chamber();for(const i of [2,0,1,0,2,1]){
  a.run(`{const [x,y]=relayLayout().switches[${i}];player.x=(x+1)*T;player.y=y*T-player.h-3;player.vy=5;player.ground=false;pogoOn=true;keys={};update();}`);assert.equal(a.run('player.vy'),-12.3);
 }assert.equal(a.run('myceliumState.solved'),true);
});
test('root gate blocks jumping and pogo before solve; exit is reachable after',()=>{
 const a=chamber();for(const pogo of [false,true]){a.run(`player.x=53*T;player.y=33*T-player.h;player.vx=0;player.vy=0;player.ground=true;pogoOn=${pogo};keys={right:true,jump:true};for(let i=0;i<100;i++)updatePlayer();`);assert.ok(a.run('player.x+player.w')<=55*32+1);}
 solve(a);a.run('player.x=52*T;player.y=31*T-player.h;player.vx=0;player.vy=0;player.ground=true;pogoOn=false;keys={right:true};for(let i=0;i<55;i++)updatePlayer()');assert.ok(a.run('player.x')>56*32);assert.ok(a.run('player.y+player.h')<=35*32);
});
test('grotto edits remain local; cultures, powerups, oven and outside geometry are preserved',()=>{
 const a=chamber(),b=game({}, {originalLayout:true});b.run('init(2)');a.run('init(2)');const am=a.run('map'),bm=b.run('map');for(let y=0;y<56;y++)for(let x=0;x<105;x++)if(am[y][x]!==bm[y][x])assert.ok(x>=32&&x<64&&y>=20&&y<39,`${x},${y}`);
 assert.equal(a.run('JSON.stringify(enemies)'),b.run('JSON.stringify(enemies.filter(e=>e.x!==50*T))'));
 for(const expr of ['JSON.stringify(gems)','JSON.stringify(powerups)','JSON.stringify(currentVerticalLayout().oven)'])assert.equal(a.run(expr),b.run(expr));
});
test('real movement supports chamber entry, backtracking to keeper, and deliberate activation with mixer lowered between caps',()=>{
 const a=chamber(false);a.run('player.x=31*T;player.y=38*T-player.h;player.ground=true;keys={jump:true,right:true};');let entered=false;
 for(let i=0;i<100;i++){a.run('updatePlayer();updateMycelium()');if(a.run('player.x>33*T&&player.y+player.h<=35*T+.1')){entered=true;break;}}assert.ok(entered);
 a.run('keys={left:true};for(let i=0;i<44;i++)updatePlayer();keys={};for(let i=0;i<30;i++)updatePlayer();');assert.equal(a.run('nearSporekeeper()'),true);a.run('talkMycelium()');assert.equal(a.run('myceliumState.clueKnown'),true);a.run('talkMycelium()');
 // From the chamber floor, walk beneath unwanted caps, then pogo on the intended one.
 a.run('myceliumState.clueKnown=true;player.x=34*T;player.y=35*T-player.h;player.vx=0;player.vy=0;player.ground=true;');
 for(const i of [2,0,1,0,2,1]){
  a.run('pogoOn=false;keys={};for(let n=0;n<100;n++)updatePlayer();');
  const target=a.run(`(relayLayout().switches[${i}][0]+1.5)*T-player.w/2`);
  for(let n=0;n<200&&Math.abs(a.run('player.x')-target)>4;n++)a.run(`keys={right:player.x<${target}-2,left:player.x>${target}+2};updatePlayer();`);
  a.run('player.vx=0;keys={jump:true};togglePogo();');
  const before=a.run('JSON.stringify([myceliumState.round,myceliumState.progress,myceliumState.solved])');
  for(let n=0;n<110&&a.run('JSON.stringify([myceliumState.round,myceliumState.progress,myceliumState.solved])')===before;n++)a.run('update()');
  assert.notEqual(a.run('JSON.stringify([myceliumState.round,myceliumState.progress,myceliumState.solved])'),before,`cap ${i}`);
 }
 assert.equal(a.run('myceliumState.solved'),true);
});
