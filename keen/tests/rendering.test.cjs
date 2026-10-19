const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {game}=require('./game-harness.cjs');
const expected=require('./render-baseline.json');
// Reviewed canvas-command traces verify draw order, transforms, sprite frames
// and fallback paths, not pixels. Historical pre-refactor traces remain in git.
function renderCases(options={}){
 const output={};
 for(let stage=1;stage<=3;stage++)for(const mode of ['fallback','idle','run','jump','fall','pogo','hang','hurt','pause','codex','unlocked','clear','win',...(stage===1?['thrower_windup','thrower_shot','descent_entry','foreman_scale']:[]),...(options.polishedTerrain?['oven_ready','checkpoint_saved','yeast_collected']:[])]){
  const {run,trace}=game({},options);
  run(`init(${stage});tick=47;`);
  if(mode!=='fallback')run(`for(const a of Object.values(assets)){a.complete=true;a.naturalWidth=960;a.naturalHeight=540;}assets.foremanConcept.naturalWidth=1331;assets.foremanConcept.naturalHeight=1182;assets.environmentDecor.naturalWidth=256;assets.checkpointFlags.naturalWidth=320;`);
  if(options.polishedTerrain&&mode!=='fallback')run(`assets.spikeHazards.naturalWidth=96;assets.spikeHazards.naturalHeight=32;assets.grandOvens.naturalWidth=288;assets.grandOvens.naturalHeight=176;assets.bakerAI.naturalHeight=896;assets.gremlinRun.naturalWidth=128;assets.gremlinExpressions.naturalWidth=128;assets.${['moonlitTerrain','cavernTerrain','forgeTerrain'][stage-1]}.naturalWidth=256;assets.${['moonlitTerrain','cavernTerrain','forgeTerrain'][stage-1]}.naturalHeight=96;`);
  if(mode==='thrower_windup'||mode==='thrower_shot')run("camera=600;cameraY=1000;var thrower=enemies.find(e=>e.type==='thrower');thrower.windup=18;");
  if(mode==='thrower_shot')run("enemyShots=[{x:thrower.x-70,y:thrower.y+8,w:9,h:9,vx:-2.3,life:100,owner:thrower}]");
  if(mode==='descent_entry')run('camera=2250;cameraY=400;player.x=80*T;player.y=20*T-player.h;');
  if(mode==='foreman_scale')run('camera=2400;cameraY=1252;player.x=88*T;player.y=54*T-player.h;');
  if(mode==='run')run('player.vx=3.6;player.face=-1');
  if(mode==='jump')run('player.ground=false;player.vy=-5');
  if(mode==='fall')run('player.ground=false;player.vy=5');
  if(mode==='pogo')run('pogoOn=true');
  if(mode==='hang')run('player.hang={};');
  if(mode==='hurt')run('player.inv=20');
  if(['pause','codex','clear','win'].includes(mode))run(`state='${mode}'`);
  if(mode==='checkpoint_saved')run('drawCheckpoints();checkpointState.current=0;tick=48;');
  if(mode==='yeast_collected')run('drawYeastCollectibles();gems[0].got=true;collected=1;tick=48;');
  if(mode==='oven_ready')run('collected=5;camera=world-W;cameraY=rows*T-H;');
  if(mode==='unlocked')run("state='codex';unlocked=[0,1,2];codexPage=2");
  trace.length=0;
  run('draw();window.__crustCameraDebug=true;diagnosticOverlay();minimap.style.display="block";drawPhase3Map();');
  output[`${stage}/${mode}`]=createHash('sha256').update(JSON.stringify(trace)).digest('hex');
 }
 return output;
}
test('renderer matches reviewed world-object traces across all three worlds',()=>{
 assert.deepEqual(renderCases(),expected);
});
test('loaded world artwork matches reviewed polished render traces across all worlds',()=>{
 assert.deepEqual(renderCases({polishedTerrain:true}),require('./polished-render-baseline.json'));
});
module.exports={renderCases};
