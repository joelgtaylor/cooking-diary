const {test}=require('node:test'),assert=require('node:assert/strict');
const {game}=require('./game-harness.cjs');
function show(a){a.run("window.location={search:'?map=pilot'};minimap.style.display='block';drawPhase3Map();");}
function labels(a){return a.trace.filter(c=>c[0]==='fillText').map(c=>c[1]);}
test('symbol map is opt-in and preserves the original map otherwise',()=>{
 const a=game();a.run("minimap.style.display='block';drawPhase3Map()");assert.ok(labels(a).some(s=>s.includes('GREEN checkpoints')));
 a.run("window.location={search:'?map=pilotish'}");assert.equal(a.run('symbolMapEnabled()'),false);
});
test('all three symbol maps have named glyph legends instead of colour-name legends',()=>{
 const a=game();
 for(const stage of [1,2,3]){
  a.run('init('+stage+')');a.trace.length=0;show(a);
  for(const label of ['YOU','CULTURE','REACHED','UNVISITED','HAZARD','OVEN'])assert.ok(labels(a).includes(label));
  assert.ok(!labels(a).some(s=>s.includes('GREEN checkpoints')));
  assert.equal(a.run('minimap.height'),460);assert.equal(a.run('minimap.style.minWidth'),'840px');
 }
});
test('map markers represent current authored objective locations and pickup state',()=>{
 const a=game();a.run('init(2);checkpointState.current=1;');
 assert.equal(a.run("symbolMapMarkers().filter(m=>m.kind==='culture').length"),5);
 assert.equal(a.run("symbolMapMarkers().filter(m=>m.kind==='checkpoint'&&m.current).length"),1);
 a.run('gems[1].got=true;collected=1;');assert.equal(a.run("symbolMapMarkers().filter(m=>m.kind==='culture').length"),4);
 const oven=JSON.parse(a.run("JSON.stringify(symbolMapMarkers().find(m=>m.kind==='oven'))"));
 assert.equal(oven.x,a.run('worldOvenTarget().x*10+8'));
});
test('nearby culture/checkpoint markers remain separated with original coordinates retained',()=>{
 const a=game();a.run('init(2)');const markers=JSON.parse(a.run('JSON.stringify(symbolMapMarkers())'));
 for(let i=0;i<markers.length;i++)for(let j=i+1;j<markers.length;j++)assert.ok(Math.abs(markers[i].drawX-markers[j].drawX)>=25||Math.abs(markers[i].drawY-markers[j].drawY)>=35);
 assert.ok(markers.some(m=>m.drawX!==m.x||m.drawY!==m.y));
 for(const m of markers){assert.ok(m.drawX>=12&&m.drawX<=1036);assert.ok(m.drawY>=96&&m.drawY<=414);}
});
test('map glyphs have distinct monochrome geometry and checkpoint states',()=>{
 const a=game();const signatures=[];
 for(const kind of ['baker','culture','checkpoint','hazard','oven']){
  a.trace.length=0;a.run("drawMapSymbol(g,"+JSON.stringify(kind)+",0,0)");
  signatures.push(JSON.stringify(a.trace.filter(c=>!(c[0]==='set'&&['fillStyle','strokeStyle'].includes(c[1])))));
 }
 assert.equal(new Set(signatures).size,5);
 const flags=[];
 for(const opts of [{},{reached:true},{reached:true,current:true}]){a.trace.length=0;a.run('drawMapSymbol(g,"checkpoint",0,0,'+JSON.stringify(opts)+')');flags.push(JSON.stringify(a.trace));}
 assert.equal(new Set(flags).size,3);
});
test('symbol-map rendering preserves gameplay, audio and persistence',()=>{
 const a=game();
 for(const stage of [1,2,3]){
  a.run('init('+stage+')');
  const expr='JSON.stringify({map,player,gems,enemies,powerups,checkpointState,collected,state,unlocked})';
  const before=a.run(expr),effects=JSON.stringify(a.audio),storage=JSON.stringify([...a.storage]);show(a);
  assert.equal(a.run(expr),before);assert.equal(JSON.stringify(a.audio),effects);assert.equal(JSON.stringify([...a.storage]),storage);
 }
});
