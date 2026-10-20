const {test}=require('node:test');
const assert=require('node:assert/strict');
const {game}=require('./game-harness.cjs');
function atmosphere(time,reduced=false){
 const a=game();a.trace.length=0;
 a.run(`window.CrustAtmosphere.renderMoonlit(g,{x:-125,y:-73,width:1210,height:686,time:${time},reduced:${reduced}})`);
 return a.trace;
}
test('Moonlit atmosphere is deterministic and reduced motion stays still',()=>{
 assert.deepEqual(atmosphere(4),atmosphere(4));
 assert.notDeepEqual(atmosphere(4),atmosphere(9));
 assert.deepEqual(atmosphere(4,true),atmosphere(9,true));
});
test('atmosphere is confined to loaded world illustrations and cannot mutate gameplay',()=>{
 for(let n=1;n<=3;n++){
  const a=game();a.run(`init(${n});for(const im of Object.values(assets)){im.complete=true;im.naturalWidth=960;}var calls=0;window.CrustAtmosphere.renderMoonlit=window.CrustAtmosphere.renderFungal=window.CrustAtmosphere.renderClockwork=()=>calls++;`);
  const before=a.run('JSON.stringify([player,tick,gems,checkpointState])');
  a.run('draw()');assert.equal(a.run('calls'),2);
  assert.equal(a.run('JSON.stringify([player,tick,gems,checkpointState])'),before);
  a.run('window.__crustAtmosphereEnabled=false;draw()');assert.equal(a.run('calls'),2);
 }
});

test('fungal spores move, reduced motion stays still, and drawing restores the canvas',()=>{
 const a=game();
 const render=(time,reduced)=>{a.trace.length=0;a.run(`window.CrustAtmosphere.renderFungal(g,{x:-125,y:-73,width:1210,height:686,time:${time},reduced:${reduced},layer:'near'})`);return JSON.stringify(a.trace)};
 assert.notEqual(render(2,false),render(5,false));assert.equal(render(2,true),render(5,true));
 assert.equal(a.trace[0][0],'save');assert.equal(a.trace.at(-1)[0],'restore');
});

test('Clockwork vents and pistons animate deterministically and respect reduced motion',()=>{
 const a=game();
 const render=(time,reduced)=>{a.trace.length=0;a.run(`window.CrustAtmosphere.renderClockwork(g,{x:-125,y:-73,width:1210,height:686,time:${time},reduced:${reduced},layer:'near'})`);return JSON.stringify(a.trace)};
 assert.notEqual(render(1,false),render(3,false));assert.equal(render(1,false),render(1,false));assert.equal(render(1,true),render(8,true));
 assert.equal(a.trace[0][0],'save');assert.equal(a.trace.at(-1)[0],'restore');
});
test('Clockwork cogs are drawn in illustration layers instead of the legacy world-coordinate loop',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const source=fs.readFileSync(path.join(__dirname,'../render.js'),'utf8');
 assert.doesNotMatch(source,/spin=tick|r=10\+\(k%3\)/);
 const a=game();a.run('init(3)');a.trace.length=0;
 a.run("window.CrustAtmosphere.renderClockwork(g,{x:0,y:0,width:1200,height:676,time:1,layer:'mid'});window.CrustAtmosphere.renderClockwork(g,{x:0,y:0,width:1200,height:676,time:1,layer:'near'});");
 assert.equal(a.trace.filter(c=>c[0]==='rotate').length,21); // Three cogs, each with six spokes.
});
