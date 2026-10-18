const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {game}=require('./game-harness.cjs');
const expected=require('./render-baseline.json');
// Golden canvas-command traces captured before splitting the renderer.
// These verify draw order, transforms, sprite frames and fallback paths, not pixels.
function renderCases(options={}){
 const output={};
 for(let stage=1;stage<=3;stage++)for(const mode of ['fallback','idle','run','jump','fall','pogo','hang','hurt','pause','codex','unlocked','clear','win']){
  const {run,trace}=game({},options);
  run(`init(${stage});tick=47;`);
  if(mode!=='fallback')run(`for(const a of Object.values(assets)){a.complete=true;a.naturalWidth=960;a.naturalHeight=540;}assets.environmentDecor.naturalWidth=256;assets.checkpointFlags.naturalWidth=320;`);
  if(mode==='run')run('player.vx=3.6;player.face=-1');
  if(mode==='jump')run('player.ground=false;player.vy=-5');
  if(mode==='fall')run('player.ground=false;player.vy=5');
  if(mode==='pogo')run('pogoOn=true');
  if(mode==='hang')run('player.hang={};');
  if(mode==='hurt')run('player.inv=20');
  if(['pause','codex','clear','win'].includes(mode))run(`state='${mode}'`);
  if(mode==='unlocked')run("state='codex';unlocked=[0,1,2];codexPage=2");
  trace.length=0;
  run('draw();window.__crustCameraDebug=true;diagnosticOverlay();minimap.style.display="block";drawPhase3Map();');
  output[`${stage}/${mode}`]=createHash('sha256').update(JSON.stringify(trace)).digest('hex');
 }
 return output;
}
test('renderer matches pre-extraction canvas traces across all three worlds',()=>{
 assert.deepEqual(renderCases(),expected);
});
module.exports={renderCases};
