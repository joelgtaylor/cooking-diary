const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {previewGame}=require('../../previews/sunken/test-harness.cjs');
const root=path.resolve(__dirname,'..');
const campaign=(options={})=>previewGame({htmlPath:path.join(root,'sunken.html'),...options});
const main=(options={})=>previewGame({htmlPath:path.join(root,'index.html'),...options});
function win(a){
 a.run(`for(const gem of sunkenWorld.cultures)gem.got=true;collected=5;sunkenLevel.enterBoss();Object.assign(deepArena.boss,{hp:0,alive:false,phase:'defeat',deathT:0});updateWorldProgress();player.x=180;player.y=410;player.w=29;player.h=38;player.swimming=false;updateWorldProgress();syncGameShell();`);
}
test('production campaign advances through three dry worlds then launches the isolated water destination',()=>{
 const a=main();a.click('shellResume');a.run("window.location.assign=url=>window.destination=url;advanceBakery()");assert.equal(a.run('bakery'),1);
 for(let i=1;i<=3;i++){
  a.run("state='clear';advanceBakery()");
  if(i<3){assert.equal(a.run('bakery'),i+1);assert.equal(a.run('state'),'play');}
 }
 assert.equal(a.run('state'),'cutscene');a.run('campaignScene.skip()');
 assert.equal(a.run('destination'),'sunken.html');assert.equal(a.run('state'),'cutscene');assert.equal(a.run('typeof sunkenPreview'),'undefined');
});
test('existing three-recipe saves retain progress and expose World 4 for returning players',()=>{
 const saved={crustQuestCodex:'[0,1,2]',crustQuestBest:'8500',crustQuestCharacter:'vance-wick',crustQuestShellSettings:'{"touch":true,"size":110,"opacity":60}'};
 const a=main({saved});assert.equal(a.run('JSON.stringify(unlocked)'),'[0,1,2]');assert.equal(a.elements.get('sunkenReplay').hidden,false);assert.equal(a.run('RECIPES.length'),4);
 const b=campaign({saved});assert.equal(b.run('JSON.stringify(unlocked)'),'[0,1,2]');assert.equal(b.run('best'),8500);assert.equal(b.run('sunkenLevel.mode'),'route');assert.equal(b.run('RECIPES[3].name'),'Sea Salt Sourdough Crackers');
 for(const [key,value]of Object.entries(saved))assert.equal(b.storage.get(key),value);
});
test('only the finishing oven awards recipe 4; credits and recipes preserve the original unlocks and best',()=>{
 const a=campaign({saved:{crustQuestCodex:'[0,1,2]',crustQuestBest:'8500'}});a.click('shellResume');
 a.run('updateWorldProgress()');assert.equal(a.storage.get('crustQuestCodex'),'[0,1,2]');win(a);
 assert.equal(a.run('state'),'win');assert.equal(a.elements.get('endCredits').hidden,false);assert.equal(a.storage.get('crustQuestCodex'),'[0,1,2,3]');assert.equal(a.storage.get('crustQuestBest'),'8500');
 a.click('creditsRecipes');assert.equal(a.run('shellPage'),'recipes');a.run('shellRecipePage=3;shellRenderRecipe()');assert.equal(a.elements.get('recipeTitle').textContent,'Sea Salt Sourdough Crackers');
 a.click('sheetBack');a.click('shellResume');assert.equal(a.run('state'),'win');a.run('restart()');assert.equal(a.run('state'),'play');assert.equal(a.run('collected'),0);assert.equal(a.storage.get('crustQuestCodex'),'[0,1,2,3]');
 const restored=main({saved:Object.fromEntries(a.storage)});assert.equal(restored.run('JSON.stringify(unlocked)'),'[0,1,2,3]');
});
test('standalone World 4 completion adds only its own recipe and updates a lower best once',()=>{
 const a=campaign({saved:{crustQuestCodex:'[1]',crustQuestBest:'12'}});a.click('shellResume');a.run('player.score=9000');win(a);assert.equal(a.storage.get('crustQuestCodex'),'[1,3]');assert.equal(a.storage.get('crustQuestBest'),'10500');
 a.run('updateWorldProgress()');assert.equal(a.storage.get('crustQuestBest'),'10500');
});
test('production ignores boss and oven review shortcuts, keeps touch and ink accessibility controls',()=>{
 for(const search of ['?scene=boss','?scene=oven','?scene=defeat']){
  const a=campaign({search});assert.equal(a.run('sunkenLevel.mode'),'route');assert.equal(a.run('collected'),0);assert.equal(a.storage.has('crustQuestCodex'),false);
 }
 const a=campaign();a.click('shellResume');a.pointer('down','pointerdown',{clientX:78,clientY:550});assert.equal(a.run('keys.down'),true);a.pointer('down','pointercancel');assert.equal(a.run('!!keys.down'),false);
 a.click('inkObstructionBtn');assert.equal(a.storage.get('crustQuestPreviewInkReduced'),'true');
});
test('production bundle has no preview resource paths and every static script and image exists',()=>{
 const html=fs.readFileSync(path.join(root,'sunken.html'),'utf8');assert.doesNotMatch(html,/\.\.\/previews\//);
 for(const m of html.matchAll(/(?:src|href)="([^"?#]+)(?:\?[^" ]*)?"/g))if(!/^(?:https?:|#)/.test(m[1]))assert.ok(fs.existsSync(path.resolve(root,m[1])),m[1]);
 for(const dir of fs.readdirSync(path.join(root,'sunken'),{recursive:true})){
  const file=path.join(root,'sunken',dir);if(!/\.js$/.test(file))continue;const src=fs.readFileSync(file,'utf8');assert.doesNotMatch(src,/\.\.\/previews\//,dir);
  for(const m of src.matchAll(/\.src=['"]([^'"]+)['"]/g))if(/\.(png|webp)$/.test(m[1]))assert.ok(fs.existsSync(path.join(root,m[1])),m[1]);
 }
});

function arrival(character='vance-wick',at=Date.now()){
 const data=new Map([['crustQuestCampaignArrival',JSON.stringify({version:1,from:3,world:4,character,at})]]);
 return {data,getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
}
test('campaign arrival waits for artwork, consumes once, selects hero and starts the water entrance',()=>{
 const sessionStorage=arrival();
 const a=campaign({globals:{sessionStorage},saved:{crustQuestCodex:'[0,1,2]',crustQuestShellSettings:'{"touch":true,"size":110,"opacity":60}'}});
 assert.equal(a.run('state'),'play');assert.equal(a.run('selectedCharacterId'),'vance-wick');assert.equal(a.run('shellStarted'),true);
 assert.equal(a.run('sunkenLevel.mode'),'route');assert.equal(a.run('Object.keys(keys).length'),0);assert.equal(sessionStorage.data.size,0);
 assert.equal(a.run('JSON.stringify(unlocked)'),'[0,1,2]');assert.equal(a.elements.get('showTouch').checked,true);
 const direct=campaign({globals:{sessionStorage}});assert.equal(direct.run('state'),'shell-menu');
});
test('stale and invalid arrival tokens leave the direct menu available',()=>{
 for(const sessionStorage of [arrival('unknown'),arrival('loafy',Date.now()-121000),arrival('loafy',Date.now()+60000)]){
  const a=campaign({globals:{sessionStorage}});assert.equal(a.run('state'),'shell-menu');assert.equal(sessionStorage.data.size,0);
 }
 const a=campaign({globals:{sessionStorage:{getItem(){throw Error('denied')},removeItem(){throw Error('denied')}}}});assert.equal(a.run('state'),'shell-menu');
});
test('cutscene freezes simulation, isolates shortcuts and held controls, and replay restores menu',()=>{
 const a=main();a.click('shellResume');a.key('d','KeyD');a.run('shellPause()');
 const before=a.run('JSON.stringify({player,tick,enemies,shots,collected,checkpointState})');a.click('replayTransition');
 assert.equal(a.run('state'),'cutscene');assert.equal(a.run('Object.keys(keys).length'),0);
 a.key('d','KeyD');a.key('x','KeyX');a.key('r');a.key('p');a.key('f');
 a.run('campaignSceneFrame(100);campaignSceneFrame(2000)');
 assert.equal(a.run('JSON.stringify({player,tick,enemies,shots,collected,checkpointState})'),before);
 a.key('Escape');assert.equal(a.run('state'),'shell-menu');assert.equal(a.run('Object.keys(keys).length'),0);
 a.click('replayTransition');a.run('campaignSceneFrame(100);campaignSceneFrame(12000)');assert.equal(a.run('state'),'shell-menu');
});
test('a real departure writes a fresh one-use token only on cinematic completion',()=>{
 const sessionStorage=arrival();sessionStorage.data.clear();const a=main({globals:{sessionStorage}});a.click('shellResume');
 a.run("window.location.assign=url=>window.destination=url;init(3);state='clear';advanceBakery()");assert.equal(sessionStorage.data.size,0);
 a.run('campaignSceneFrame(100);campaignSceneFrame(12000)');assert.equal(a.run('destination'),'sunken.html');
 const b=campaign({globals:{sessionStorage}});assert.equal(b.run('state'),'play');assert.equal(sessionStorage.data.size,0);
});

test('arrival cannot advance behind artwork; interrupted loading keeps the explicit Resume boundary',()=>{
 const a=campaign({globals:{sessionStorage:arrival()},deferArtwork:true});
 assert.equal(a.run('state'),'shell-menu');assert.equal(a.run('artworkLoading'),true);assert.equal(a.run('shellStarted'),false);
 a.run('window.audioStarts=0;AudioKit.start=()=>audioStarts++;completeArtworkLoading()');assert.equal(a.run('state'),'play');assert.equal(a.run('audioStarts'),0);
 const b=campaign({globals:{sessionStorage:arrival()},deferArtwork:true});b.doc.hidden=true;b.run('completeArtworkLoading()');assert.equal(b.run('state'),'shell-menu');b.doc.hidden=false;b.click('shellResume');assert.equal(b.run('state'),'play');
});
