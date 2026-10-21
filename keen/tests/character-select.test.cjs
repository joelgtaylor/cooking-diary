const {test}=require('node:test'),assert=require('node:assert/strict');
const {game}=require('./game-harness.cjs');
test('the original baker is Loafy; unavailable or invalid saved characters fall back safely',()=>{
 for(const saved of [undefined,'loafy','vance-wick','unknown']){
  const a=game(saved?{crustQuestCharacter:saved}:{});
  assert.equal(a.run('selectedCharacter().name'),'Loafy');
  assert.equal(a.elements.get('characterButton').textContent,'Character: Loafy');
  assert.equal(a.run('selectCharacter("vance-wick")'),false);
 }
});
test('selection pauses simulation, blocks gameplay shortcuts, and restores the exact prior mode',()=>{
 for(const state of ['play','pause','codex','clear','dialogue']){
  const a=game();a.run(`state=${JSON.stringify(state)};openCharacterSelector()`);
  const snapshot=a.run('JSON.stringify({player,enemies,gems,tick,foremanState,checkpointState,collected})');
  for(const key of ['r','Enter','c','v','t','p','q',' '])a.key(key);
  a.run('for(let i=0;i<120;i++){update();updateWorldProgress()}');
  assert.equal(a.run('state'),'character-select');
  assert.equal(a.run('JSON.stringify({player,enemies,gems,tick,foremanState,checkpointState,collected})'),snapshot);
  a.key('Escape');assert.equal(a.run('state'),state);assert.equal(a.run('Object.keys(keys).length'),0);
 }
});
test('Loafy selection persists independently of recipes, score and checkpoint progress',()=>{
 const a=game({crustQuestBest:'9000',crustQuestCodex:'[0,1]'});
 a.run('checkpointState.current=2;gems[0].got=true;collected=1;player.health=2;openCharacterSelector()');
 for(const click of a.elements.get('characterLoafy').listeners.click)click({});
 assert.equal(a.storage.get('crustQuestCharacter'),'loafy');
 assert.equal(a.storage.get('crustQuestBest'),'9000');assert.equal(a.storage.get('crustQuestCodex'),'[0,1]');
 assert.equal(a.run('checkpointState.current'),2);assert.equal(a.run('collected'),1);assert.equal(a.run('player.health'),2);assert.equal(a.run('state'),'play');
});
test('Vance concept can be previewed without selecting an unfinished skin or changing the game',()=>{
 const a=game();a.run('openCharacterSelector()');
 for(const click of a.elements.get('characterVance').listeners.click)click({});
 assert.equal(a.elements.get('characterConcept').style.display,'block');
 assert.match(a.elements.get('characterMessage').textContent,/Vance Wick/);
 assert.equal(a.run('selectedCharacterId'),'loafy');assert.equal(a.storage.size,0);
 a.run('closeCharacterSelector();openCharacterSelector()');assert.equal(a.elements.get('characterConcept').style.display,'none');
});
test('keyboard focus stays within the selector and returns to its opener',()=>{
 const a=game();a.run('for(const id of ["characterClose","characterLoafy","characterVance","characterConceptLink","characterButton"]){const el=document.getElementById(id);el.focus=()=>document.activeElement=el;}openCharacterSelector()');
 assert.equal(a.run('document.activeElement===document.getElementById("characterLoafy")'),true);
 a.key('ArrowRight');assert.equal(a.run('document.activeElement===document.getElementById("characterVance")'),true);
 a.run('document.activeElement=document.getElementById("characterConceptLink")');a.key('Tab');
 assert.equal(a.run('document.activeElement===document.getElementById("characterClose")'),true);
 a.key('Escape');assert.equal(a.run('document.activeElement===document.getElementById("characterButton")'),true);
});
