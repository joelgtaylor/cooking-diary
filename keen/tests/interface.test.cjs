const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {game}=require('./game-harness.cjs');
test('retired tuning shortcuts cannot teleport or change the approved camera and parallax',()=>{
 const {run,key}=game();const before=run('JSON.stringify([player.x,player.y,window.__crustCameraSnap,window.__crustParallaxEnabled,window.__crustParallaxProfile])');
 for(const k of ['1','2','3','b','v','g'])key(k);
 assert.equal(run('JSON.stringify([player.x,player.y,window.__crustCameraSnap,window.__crustParallaxEnabled,window.__crustParallaxProfile])'),before);
 const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
 assert.doesNotMatch(html,/id="(?:camera\w+|parallax\w+)"|moveToAltitude/);
});
test('player toolbar pauses and resumes without resetting progress',()=>{
 const {elements,run}=game();run('collected=3;player.score=120');
 const click=id=>elements.get(id).listeners.click[0]();
 click('pauseBtn');assert.equal(run('state'),'pause');
 click('pauseBtn');assert.equal(run('state'),'play');
 assert.equal(run('collected'),3);assert.equal(run('player.score'),120);
 click('mapButton');assert.equal(run('minimap.style.display'),'block');
 click('codexBtn');assert.equal(run('state'),'codex');
 click('pauseBtn');assert.equal(run('state'),'codex');
});
