const {test}=require('node:test');
const assert=require('node:assert/strict');
const {game}=require('./game-harness.cjs');
const {createHash}=require('node:crypto');
const bakerHash=createHash('sha256').update('art/baker-ai-solid.png').digest('hex');
test('baker feet stay anchored across idle/run frames without changing actor state',()=>{
 const {run,trace}=game();run('assets.bakerAI.complete=true;assets.bakerAI.naturalWidth=960;');
 for(const vx of [0,3.6])for(const t of [0,14,28,42,56]){
  run(`player.vx=${vx};tick=${t};`);const before=run('JSON.stringify(player)');
  trace.length=0;run('drawPlayer()');
  assert.equal(run('JSON.stringify(player)'),before);
  const image=trace.find(c=>c[0]==='drawImage'&&c[1]?.image===bakerHash);
  assert.equal(image[7],-86);
  const origin=trace.find(c=>c[0]==='translate');
  assert.equal(origin[2],run('Math.round(player.y+player.h)'));
 }
});
test('contact shadows require support and clip at the end of a ledge',()=>{
 const {run,trace}=game();run("map=Array.from({length:rows},()=>Array(cols).fill('.'));map[10][5]='=';player.x=185;player.y=320-player.h;");
 trace.length=0;run('drawContactShadow(player,25)');
 const rects=trace.filter(c=>c[0]==='fillRect');assert.ok(rects.length>0);
 for(const r of rects){assert.ok(r[1]>=160);assert.ok(r[1]+r[3]<=192);}
 run('player.y-=8');trace.length=0;run('drawContactShadow(player,25)');
 assert.equal(trace.filter(c=>c[0]==='fillRect').length,0);
});
test('gremlin frames retain their durations independent of position and pause redraws',()=>{
 const {run}=game();run("var actor={x:0,vx:1,vy:0,type:'walker'};tick=20;");
 assert.equal(run('gremlinAnimation(actor).frame'),0);
 run('tick=28;actor.x=900');assert.equal(run('gremlinAnimation(actor).frame'),0);
 run('tick=29');assert.equal(run('gremlinAnimation(actor).frame'),1);
 run('actor.x=0');assert.equal(run('gremlinAnimation(actor).frame'),1);
 assert.equal(run('gremlinAnimation(actor).frame'),1);
 run('actor.vx=0');assert.equal(run('gremlinAnimation(actor).frame'),0);
 run('tick=46');assert.equal(run('gremlinAnimation(actor).frame'),0);
 run('tick=47');assert.equal(run('gremlinAnimation(actor).frame'),1);
});
test('actor animation clocks restart for new actors and reset ticks',()=>{
 const {run}=game();run('tick=100;actorAnimation(player,0);tick=142;');
 assert.equal(run('actorAnimation(player,0)'),42);
 run('init(1)');assert.equal(run('actorAnimation(player,0)'),0);
 run('tick=50;actorAnimation(player,0);tick=0;');assert.equal(run('actorAnimation(player,0)'),0);
});
test('supported gremlin frames keep their visible feet on the same surface',()=>{
 const {run,trace}=game();const hash=createHash('sha256').update('art/dough-gremlins-primary.png').digest('hex');
 run("map=Array.from({length:rows},()=>Array(cols).fill('.'));map[10][5]='=';var gremlin={x:164,y:295,w:25,h:25,vx:1,alive:true,type:'walker'};enemies=[gremlin];assets.gremlinRun.complete=true;assets.gremlinRun.naturalWidth=128;");
 for(const [i,bottom]of [28,29,27,28].entries()){
  run(`tick=${i*9}`);trace.length=0;run('drawWorld()');
  const index=trace.findIndex(c=>c[0]==='drawImage'&&c[1]?.image===hash),image=trace[index];
  assert.equal(image[2],i*32);assert.equal(image[3],32);
  const origin=trace.slice(0,index).findLast(c=>c[0]==='translate');
  assert.equal(origin[2],320);
  assert.ok(Math.abs(origin[2]+image[7]+bottom*42/32-320)<=.5);
 }
});
