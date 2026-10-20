const {createHash}=require('node:crypto');
const {game}=require('./game-harness.cjs');
// Deterministic historic-layout traces; player-kit fire/aim changes were reviewed explicitly.
function physicsCases(options={}){
 const output={};
 for(let stage=1;stage<=3;stage++)for(const mode of ['traversal','pogo','shoot','hang','shield','pickups']){
  const {run,audio}=game({},options);
  run(`init(${stage});`);
  if(mode==='pogo')run('pogoOn=true');
  if(mode==='shoot')run("player.x=400;player.y=320;enemies=[{x:450,y:320,w:25,h:25,vx:0,vy:0,alive:true,type:'walker'}];tick=12;");
  if(mode==='hang')run('player.hang={x:150,y:310,timer:0,destX:180,top:320};');
  if(mode==='shield')run("player.shield=true;enemies=[{x:player.x,y:player.y,w:25,h:38,vx:0,vy:0,alive:true,type:'chaser'}];");
  if(mode==='pickups')run('player.x=gems[0].x;player.y=gems[0].y;');
  const trace=run(String.raw`(()=>{const trace=[];for(let frame=0;frame<240;frame++){
   keys={right:frame%120<70,left:frame%120>100,jump:frame%48<17,shoot:frame%3!==0,c:frame===90||frame===180};
   if(hitStop>0)hitStop--;else update();updateWorldProgress();updateViewCamera();
   trace.push(JSON.stringify({player,enemies,shots,particles,floaters,gems,powerups,collected,combo,comboT,shake,hitStop,pogoOn,prevJump,prevPogo,tick,state,camera,cameraY,checkpointState,best,unlocked}));
  }return trace.join('\n');})()`);
  output[`${stage}/${mode}`]=createHash('sha256').update(trace).update(JSON.stringify(audio.effects)).digest('hex');
 }
 return output;
}
module.exports={physicsCases};
