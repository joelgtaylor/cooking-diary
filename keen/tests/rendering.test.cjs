const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {game}=require('./game-harness.cjs');
const expected=require('./render-baseline.json');
// Reviewed canvas-command traces verify draw order, transforms, sprite frames
// and fallback paths, not pixels. Historical pre-refactor traces remain in git.
function renderCases(options={}){
 const output={};
 for(let stage=1;stage<=3;stage++)for(const mode of ['fallback','idle','run','jump','fall','pogo','hang','hurt','pause','codex','unlocked','clear','win',...(stage===1?['thrower_windup','thrower_shot','descent_entry','foreman_scale','foreman_windup','foreman_sweep','foreman_recovery','foreman_toss_warning','foreman_projectile','foreman_hurt','foreman_defeated','foreman_defeat_stagger','foreman_defeat_impact','foreman_defeat_settled']:[]),...(stage===2?['relay_dormant','relay_progress','relay_reset','relay_bloom','relay_open','relay_keeper','relay_dialogue','relay_echo','foothills_start','foothills_passage','foothills_approach','plunge_fork','plunge_lower','plunge_bonus','bloomrot_idle','bloomrot_windup','bloomrot_dodge','bloomrot_defeated','bloomrot_spore_warning','bloomrot_volley','bloomrot_chain','bloomrot_defeat_stagger','bloomrot_defeat_impact','bloomrot_defeat_settled']:[]),...(stage===3?['devourer_disguise','devourer_slam','devourer_boules','devourer_open','devourer_defeated','devourer_cooling','devourer_repeat_warning','devourer_repeat_slam','devourer_shelter','devourer_upshot']:[]),...(options.polishedTerrain?['oven_ready','checkpoint_saved','yeast_collected']:[])]){
  const {run,trace}=game({},options);
  run(`init(${stage});tick=47;`);
  if(mode!=='fallback')run(`for(const a of Object.values(assets)){a.complete=true;a.naturalWidth=960;a.naturalHeight=540;}assets.myceliumAtlas.naturalWidth=1254;assets.myceliumAtlas.naturalHeight=1254;assets.foremanDefeated.naturalWidth=1536;assets.foremanDefeated.naturalHeight=1024;assets.foremanSweep.naturalWidth=1536;assets.foremanSweep.naturalHeight=1024;assets.foremanConcept.naturalWidth=1331;assets.foremanConcept.naturalHeight=1182;assets.environmentDecor.naturalWidth=256;assets.checkpointFlags.naturalWidth=320;`);
  if(options.polishedTerrain&&mode!=='fallback')run(`assets.spikeHazards.naturalWidth=96;assets.spikeHazards.naturalHeight=32;assets.grandOvens.naturalWidth=288;assets.grandOvens.naturalHeight=176;assets.bakerAI.naturalHeight=896;assets.gremlinRun.naturalWidth=128;assets.gremlinExpressions.naturalWidth=128;assets.${['moonlitTerrain','cavernTerrain','forgeTerrain'][stage-1]}.naturalWidth=256;assets.${['moonlitTerrain','cavernTerrain','forgeTerrain'][stage-1]}.naturalHeight=96;`);
  if(mode==='thrower_windup'||mode==='thrower_shot')run("camera=600;cameraY=1000;var thrower=enemies.find(e=>e.type==='thrower');thrower.windup=18;");
  if(mode==='thrower_shot')run("enemyShots=[{x:thrower.x-70,y:thrower.y+8,w:9,h:9,vx:-2.3,life:100,owner:thrower}]");
  if(mode==='descent_entry')run('camera=2250;cameraY=400;player.x=80*T;player.y=20*T-player.h;');
  if(mode==='foreman_scale')run('camera=2400;cameraY=1252;player.x=88*T;player.y=54*T-player.h;');
  if(mode.startsWith('foreman_'))run('camera=2400;cameraY=1252;player.x=92*T;player.y=54*T-player.h;');
  if(['foreman_windup','foreman_sweep','foreman_recovery'].includes(mode))run(`foremanState.phase='${mode.slice(8)}';foremanState.timer=9;`);
  if(mode==='foreman_toss_warning')run("foremanState.phase='windup';foremanState.attack='toss';foremanState.timer=30;");
  if(mode==='foreman_projectile')run("foremanState.phase='recovery';foremanState.attack='toss';foremanState.timer=90;foremanState.projectiles=[{x:foremanGeometry().cx-110,y:foremanGeometry().base-38,w:18,h:16,vx:-2.6,vy:0,bounces:0,life:100}]");
  if(mode==='foreman_hurt')run("foremanState.phase='recovery';foremanState.timer=60;foremanState.health=3;foremanState.hurtFlash=8;foremanState.inv=20;");
  if(mode==='foreman_defeated')run("foremanState.phase='defeated';foremanState.timer=25;foremanState.health=0;collected=5;");
  if(mode.startsWith('foreman_defeat_'))run(`foremanState.phase='defeated';foremanState.health=0;foremanState.timer=${({foreman_defeat_stagger:90,foreman_defeat_impact:82,foreman_defeat_settled:0})[mode]};collected=5;`);
  if(mode.startsWith('relay_')){run('camera=960;cameraY=650;player.x=34*T;player.y=35*T-player.h;');if(mode==='relay_progress')run('myceliumState.progress=2;myceliumState.last=1;myceliumState.pulse=20;');if(mode==='relay_reset')run('myceliumState.wrong=40;');if(mode==='relay_bloom')run('myceliumState.solved=true;myceliumState.progress=3;myceliumState.bloom=25;');if(mode==='relay_keeper')run('camera=640;cameraY=850;player.x=30*T;player.y=38*T-player.h;');if(mode==='relay_dialogue')run("camera=640;cameraY=850;player.x=30*T;player.y=38*T-player.h;myceliumState.discovered=true;talkMycelium();");if(mode==='relay_echo')run('myceliumState.round=1;myceliumState.clueKnown=true;myceliumState.discovered=true;');if(mode==='relay_open')run('myceliumState.solved=true;myceliumState.progress=3;syncMyceliumBloom();');}
  if(mode==='foothills_start')run('camera=0;cameraY=1252;');
  if(mode==='foothills_passage')run('player.x=14*T;player.y=54*T-player.h;camera=200;cameraY=1252;');
  if(mode==='foothills_approach')run('player.x=23*T;player.y=40*T-player.h;camera=480;cameraY=1030;');
  if(mode.startsWith('plunge_')){run('myceliumState.solved=true;myceliumState.progress=3;syncMyceliumBloom();');if(mode==='plunge_fork')run('camera=1650;cameraY=650;player.x=61*T;player.y=31*T-player.h;');if(mode==='plunge_lower')run('camera=1950;cameraY=1252;player.x=77*T;player.y=47*T-player.h;');if(mode==='plunge_bonus')run('camera=1750;cameraY=500;player.x=62*T;player.y=25*T-player.h;');}
  if(mode.startsWith('bloomrot_')){run('startBloomrotPreview();assets.bloomrotPoses.complete=true;assets.bloomrotPoses.naturalWidth=1254;assets.bloomrotPoses.naturalHeight=1254;assets.bloomrotActions.complete=true;assets.bloomrotActions.naturalWidth=2172;assets.bloomrotActions.naturalHeight=724;assets.bloomrotChamber.complete=true;assets.bloomrotChamber.naturalWidth=1672;assets.bloomrotChamber.naturalHeight=941;tick=47;bloomrotState.engaged=true;');if(mode==='bloomrot_windup')run("bloomrotState.phase='windup';bloomrotState.timer=20;");if(mode==='bloomrot_dodge')run("bloomrotState.phase='dodge';bloomrotState.y-=65;");if(mode==='bloomrot_spore_warning')run("bloomrotState.attack='volley';beginBloomrotAttack(bloomrotState);");if(mode==='bloomrot_volley')run("bloomrotState.phase='volley';bloomrotState.projectiles=[{x:2900,y:1695,w:10,h:10,vx:-4.2,vy:0,life:60},{x:2950,y:1695,w:10,h:10,vx:-4.2,vy:0,life:70}];");if(mode==='bloomrot_chain')run("bloomrotState.health=5;bloomrotState.phase='windup';bloomrotState.chainSecond=true;");if(mode==='bloomrot_defeated')run("bloomrotState.health=0;bloomrotState.phase='defeated';bloomrotState.timer=20;");}
  if(mode.startsWith('bloomrot_defeat_'))run(`bloomrotState.health=0;bloomrotState.phase='defeated';bloomrotState.timer=${({bloomrot_defeat_stagger:90,bloomrot_defeat_impact:66,bloomrot_defeat_settled:0})[mode]};`);
  if(mode.startsWith('devourer_')){run('startDevourerPreview();assets.devourerForms.complete=true;assets.devourerForms.naturalWidth=2007;assets.devourerForms.naturalHeight=784;tick=47;');if(mode!=='devourer_disguise')run('player.x=91*T;updateDevourer();');if(mode==='devourer_slam')run('for(let i=0;i<10;i++)updateDevourer();');if(mode==='devourer_open')run("devourerState.phase='recovery';devourerState.timer=60;devourerState.foot=54*T;");if(mode==='devourer_boules')run("devourerState.phase='boules';devourerState.timer=50;for(let i=0;i<25;i++)updateDevourer();");if(mode==='devourer_cooling')run("devourerState.cycle=1;devourerState.phase='rest';devourerState.timer=30;");if(mode==='devourer_repeat_warning'||mode==='devourer_repeat_slam')run("devourerState.cycle=1;queueDevourerSlam(devourerState);");if(mode==='devourer_repeat_slam')run("startDevourerSlam(devourerState);for(let i=0;i<10;i++)updateDevourer();");if(mode==='devourer_shelter')run("player.x=102*T;player.y=54*T-player.h;devourerState.phase='rest';devourerState.timer=60;devourerState.cycle=1;");if(mode==='devourer_upshot')run("devourerState.phase='recovery';devourerState.timer=84;player.x=devourerState.x-player.w/2;keys={jump:true,shoot:true};update();");if(mode==='devourer_defeated')run("devourerState.health=0;devourerState.phase='defeated';devourerState.timer=30;");}
  if(mode==='run')run('player.vx=3.6;player.face=-1');
  if(mode==='jump')run('player.ground=false;player.vy=-5');
  if(mode==='fall')run('player.ground=false;player.vy=5');
  if(mode==='pogo')run('pogoOn=true');
  if(mode==='hang')run('player.hang={};');
  if(mode==='hurt')run('player.inv=20');
  if(['pause','codex','clear','win'].includes(mode))run(`state='${mode}'`);
  if(mode==='checkpoint_saved')run('drawCheckpoints();checkpointState.current=0;tick=48;');
  if(mode==='yeast_collected')run('drawYeastCollectibles();gems[0].got=true;collected=1;tick=48;');
  if(mode==='oven_ready')run("if(foremanState){foremanState.health=0;foremanState.phase='defeated';foremanState.timer=0;}if(bloomrotState){bloomrotState.health=0;bloomrotState.timer=0;}collected=5;camera=world-W;cameraY=rows*T-H;");
  if(mode==='unlocked')run("state='codex';unlocked=[0,1,2];codexPage=2");
  trace.length=0;
  run('draw();window.__crustCameraDebug=true;diagnosticOverlay();minimap.style.display="block";drawPhase3Map();');
  output[`${stage}/${mode}`]=createHash('sha256').update(JSON.stringify(trace)).digest('hex');
 }
 return output;
}
test('renderer matches reviewed world-object traces across all three worlds',()=>{
 assert.deepEqual(renderCases(),expected);
});
test('loaded world artwork matches reviewed polished render traces across all worlds',()=>{
 assert.deepEqual(renderCases({polishedTerrain:true}),require('./polished-render-baseline.json'));
});
module.exports={renderCases};
