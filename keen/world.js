/* World lifecycle for the three authored vertical bakeries.
 * Entry points: init(bakery?), restart(), respawnCheckpoint(),
 * updateWorldProgress(), and advanceBakery().
 * Loaded before index.html game setup; called after shared game state is ready.
 * State remains in the shared classic-script scope during incremental extraction.
 */
'use strict';
function saveBest(){try{localStorage.setItem('crustQuestBest',String(best))}catch(e){}}
function saveCodex(){try{localStorage.setItem('crustQuestCodex',JSON.stringify(unlocked))}catch(e){}}
// Progress within the current authored world; reset only on world initialization.
let checkpointState={current:-1,spawns:[],complete:false};
// PHASE4_CHECKPOINT_SUPPORT: checkpoint metadata may describe the platform
// row itself or the row directly above it. Determine the actual solid top
// rather than assuming every marker is one tile above a walkway.
// Three authored worlds share camera, collision, collectibles and physics.
function currentVerticalLayout(){
 return [window.CrustVerticalBakery1,window.CrustVerticalBakery2,window.CrustVerticalBakery3][bakery-1];
}
function checkpointSupportRow(tx,ty){
 for(let y=Math.max(0,ty);y<Math.min(rows,ty+7);y++){
  if(map[y]&&(map[y][tx]==='='||map[y][tx]==='#'))return y;
 }
 return Math.min(rows-1,ty+1);
}
function initVerticalWorld(){
 const layout=currentVerticalLayout();
 rows=layout.rows;
 map=Array.from({length:rows},()=>Array(cols).fill('.'));
 const data=layout.apply({map});
 gems=data.gems;enemies=data.enemies;powerups=data.powerups;
 enemyShots=[];shots=[];particles=[];floaters=[];
 player={x:3*T,y:54*T-38,w:29,h:38,vx:0,vy:0,ground:true,
 health:3,inv:0,face:1,ammo:35,score:0,hang:null,climb:0,speedT:0,shield:false};
 camera=0;cameraY=Math.max(0,Math.min(rows*T-H,player.y-H*.6));
 collected=0;combo=0;comboT=0;shake=0;hitStop=0;
 state='play';tick=0;resetPlayerFire();prevJump=false;pogoOn=false;
 checkpointState={current:-1,spawns:layout.checkpoints.map(([x,y])=>({x:x*T+3,y:checkpointSupportRow(x,y)*T-38})),complete:false};
 document.getElementById('pogoBtn').textContent='Mixer OFF';resetForeman();resetMycelium();resetBloomrot();resetDevourer();
}
function respawnCheckpoint(){
 const cp=checkpointState.spawns[Math.max(0,checkpointState.current)] || {x:3*T,y:54*T-38};
 player.x=cp.x;player.y=cp.y;player.vx=0;player.vy=0;player.ground=false;
 resetPlayerFire();player.speedT=0;player.hang=null;player.health=3;player.inv=90;player.shield=false;
 recoverMycelium();resetForeman();resetBloomrot();resetDevourer();if(foremanState&&checkpointState.current===3)player.ammo=Math.max(35,player.ammo);enemyShots=[];shots=[];state='play';cameraY=Math.max(0,Math.min(rows*T-H,player.y-H*.52));
}
function updateWorldProgress(){
 if(state!=='play')return;
 const layout=currentVerticalLayout();
 for(let i=0;i<layout.checkpoints.length;i++){
  const [x,y]=layout.checkpoints[i];
  if(i>checkpointState.current&&Math.abs(player.x+14-x*T-12)<52&&Math.abs(player.y+22-y*T)<62){
    checkpointState.current=i;
    if(bakery===2&&bloomrotArena()&&i===3)player.ammo=Math.max(45,player.ammo);
    floater(player.x,player.y-12,'CHECKPOINT '+(i+1),'#a5ffdc');
    AudioKit.effect('collect');
  }
 }
 if(player.health<=0){respawnCheckpoint();return;}
 const target=layout.oven;
 if(foremanOvenReady()&&bloomrotOvenReady()&&Math.abs(player.x+14-(target.x*T+12))<53&&
    Math.abs(player.y+22-(target.y*T+25))<85){
    checkpointState.complete=true;
    if(player.score>best){best=player.score;saveBest();}
    const ri=bakery-1;
    if(!unlocked.includes(ri)){unlocked.push(ri);saveCodex();}
    state='clear';AudioKit.effect('win');
 }
}

function init(b){if(b)bakery=b;initVerticalWorld();}
// Both keyboard and canvas input advance through the same clear-state gate.
function advanceBakery(){
 if(state!=='clear')return;
 if(bakery<MAXBAKERY)init(bakery+1);
 else state='win';
}
function restart(){if(devourerArena()){startDevourerPreview();return;}if(window.__crustBloomrotArena){startBloomrotPreview();return;}init(bakery)}
