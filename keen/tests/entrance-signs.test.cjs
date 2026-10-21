const {test}=require('node:test'),assert=require('node:assert/strict');
const {game}=require('./game-harness.cjs');
function scene(mode='pilot'){const a=game();a.run(`window.location={search:'?scene=entrance&signs=${mode}'};prepareWayfindingPreview()`);return a;}
function ready(a){a.run('entranceIndicatorReady();entranceIndicatorArt.complete=true;entranceIndicatorArt.naturalWidth=1536;entranceIndicatorArt.naturalHeight=1024');}
function labels(a){return a.trace.filter(c=>c[0]==='fillText').map(c=>c[1]);}
test('entrance art replaces only route labels and preserves kefir teaching text',()=>{
 const a=scene();ready(a);a.trace.length=0;a.run('drawFactoryEntrance()');
 assert.ok(!labels(a).includes('SUPPLIES ↑'));assert.ok(!labels(a).includes('LIFT SHAFT ↑'));
 assert.ok(labels(a).includes('STORE NOW · V / KEFIR TO DASH'));
 assert.ok(labels(a).includes('MAINTENANCE / KEFIR RESERVE'));
 assert.equal(a.trace.filter(c=>c[0]==='drawImage').length,2);
});
test('original route labels remain for disabled, loading and failed art',()=>{
 for(const mode of ['off','pilot']){const a=scene(mode);
  for(const setup of ['',...(mode==='pilot'?['entranceIndicatorArt.complete=true;entranceIndicatorArt.naturalWidth=0','entranceIndicatorArt.naturalWidth=64;entranceIndicatorArt.naturalHeight=64']:[])]){
   if(setup)a.run(setup);a.trace.length=0;a.run('drawFactoryEntrance()');
   assert.ok(labels(a).includes('SUPPLIES ↑'));assert.ok(labels(a).includes('LIFT SHAFT ↑'));
  }
 }
});
test('entrance preview is safe, explicit, and leaves authored items and saves untouched',()=>{
 const a=scene();assert.equal(a.run('bakery'),3);assert.equal(a.run('contactSurface(player)'),54*32);
 assert.equal(a.run('hit(player.x,player.y,player.w,player.h)'),false);assert.equal(a.storage.size,0);
 const b=game();b.run('init(3)');
 for(const q of ['map','gems','enemies','powerups'])assert.equal(a.run(`JSON.stringify(${q})`),b.run(`JSON.stringify(${q})`));
 for(const query of ['?scene=entrance','?scene=entrance&signs=pilotish','?scene=entrances&signs=pilot']){const c=game();c.run('window.location={search:'+JSON.stringify(query)+'};prepareWayfindingPreview()');assert.equal(c.run('bakery'),1);}
});
test('entrance rendering changes no gameplay state and neither plaque intersects collision tiles',()=>{
 const a=scene();ready(a);const expr='JSON.stringify({map,player,gems,enemies,powerups,collected,checkpointState})',before=a.run(expr);
 a.trace.length=0;a.run('drawFactoryEntrance()');assert.equal(a.run(expr),before);
 for(const c of a.trace.filter(c=>c[0]==='drawImage')){
  const[x,y,w,h]=c.slice(6);for(let ty=Math.floor(y/32);ty<=Math.floor((y+h-1)/32);ty++)for(let tx=Math.floor(x/32);tx<=Math.floor((x+w-1)/32);tx++)assert.equal(a.run(`map[${ty}][${tx}]`),'.',`${tx},${ty}`);
 }
});
test('entrance art cannot load in other bakeries or malformed pilot queries',()=>{
 const a=game();a.run("window.location={search:'?signs=pilot'}");assert.equal(a.run('entranceIndicatorReady()'),false);
 a.run('init(2)');assert.equal(a.run('entranceIndicatorReady()'),false);
 a.run("init(3);window.location.search='?signs=pilotish'");assert.equal(a.run('entranceIndicatorReady()'),false);assert.equal(a.run('entranceIndicatorArt'),null);
});
