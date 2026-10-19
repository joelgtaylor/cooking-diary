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
test('atmosphere is confined to loaded Moonlit illustrations and cannot mutate gameplay',()=>{
 for(let n=1;n<=3;n++){
  const a=game();a.run(`init(${n});for(const im of Object.values(assets)){im.complete=true;im.naturalWidth=960;}var calls=0;window.CrustAtmosphere.renderMoonlit=()=>calls++;`);
  const before=a.run('JSON.stringify([player,tick,gems,checkpointState])');
  a.run('draw()');assert.equal(a.run('calls'),n===1?2:0);
  assert.equal(a.run('JSON.stringify([player,tick,gems,checkpointState])'),before);
  a.run('window.__crustAtmosphereEnabled=false;draw()');assert.equal(a.run('calls'),n===1?2:0);
 }
});
