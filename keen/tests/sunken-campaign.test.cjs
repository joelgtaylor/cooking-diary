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
 assert.equal(a.run('destination'),'sunken.html');assert.equal(a.run('state'),'clear');assert.equal(a.run('typeof sunkenPreview'),'undefined');
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
