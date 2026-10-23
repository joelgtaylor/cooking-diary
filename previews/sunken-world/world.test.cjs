const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const {create}=require('./layout.js'),{previewGame}=require('../sunken/test-harness.cjs');
const game=()=>previewGame({htmlPath:path.resolve(__dirname,'index.html')});
function reachable(l,closed){
 const w=58,h=26,q=[[14*32,31*32]],seen=new Set([q[0].join(',')]);
 const hit=(x,y)=>{if(x<0||x+w>l.cols*32||y<0||y+h>l.rows*32)return true;for(let a=Math.floor(x/32);a<=Math.floor((x+w-1)/32);a++)for(let b=Math.floor(y/32);b<=Math.floor((y+h-1)/32);b++)if(l.map[b][a]==='#')return true;return closed&&x<l.crab.x*32+96&&x+w>l.crab.x*32&&y<l.crab.y*32+96&&y+h>l.crab.y*32;};
 for(let i=0;i<q.length;i++){const [x,y]=q[i];for(const [dx,dy]of [[16,0],[-16,0],[0,16],[0,-16]]){const xx=x+dx,yy=y+dy,k=xx+','+yy;if(!seen.has(k)&&!hit(xx,yy)){seen.add(k);q.push([xx,yy]);}}}return q;
}
test('authored wet-body topology reaches five cultures and finish only after the crab passage opens',()=>{
 const l=create(),closed=reachable(l,true),open=reachable(l,false),near=(q,[x,y])=>q.some(([a,b])=>Math.hypot(a+29-x*32,b+13-y*32)<33);
 assert.deepEqual(l.cultures.map(c=>near(closed,c)),[true,true,true,false,false]);assert.ok(l.cultures.every(c=>near(open,c)));
 assert.equal(closed.some(([x])=>x>80*32),false);assert.ok(open.some(([x,y])=>Math.hypot(x-l.finish.x*32,y-l.finish.y*32)<95));
 assert.equal(l.sections.length,4);assert.equal(l.cultures.length,5);
});
test('one Rider only, crab aperture filled in dry and wet forms, and checkpoints spawn clear',()=>{
 const a=game();a.click('shellResume');assert.equal(a.run('sunkenWorld.actors.filter(a=>a.kind==="rider").length'),1);
 for(const [w,h]of [[58,26],[29,38]])for(let y=0;y<56*32;y+=8)assert.equal(a.run(`hit(77*T,${y},${w},${h})`),true);
 for(let i=0;i<5;i++)assert.equal(a.run(`(()=>{const p=sunkenWorld.layout.checkpoints[${i}];return hit(p.x*T,p.y*T,p.wet?58:29,p.wet?26:38)})()`),false);
});
const points=[[13,30],[20,31],[26,32],[31,34],[45,35],[45,40],[40,40],[40,47],[44,48],[48,48],[53,48],[70,48],[70,30],[65,30],[60,31],[60,30],[65,29],[73,29],[78,29],[82,34],[85.5,34],[85.5,43],[84,43],[96,49],[100,49],[100,34],[93,33],[93,21],[96,20],[99,20]];
test('real controls traverse the complete route and collect all cultures, including dry pocket and final surface exit',()=>{
 const a=game();a.click('shellResume');
 // Isolate traversal from combat: enemy behavior is covered by the archetype suites.
 a.run('for(const a of sunkenWorld.actors){a.e.alive=false;a.e.deathT=0;}');
 for(const [tx,ty]of points){let arrived=false;
  for(let i=0;i<600;i++){
   const p=JSON.parse(a.run('JSON.stringify(player)')),dx=tx*32-p.x-p.w/2,dy=ty*32-p.y-p.h/2;
   if(Math.abs(dx)<12&&Math.abs(dy)<18){arrived=true;break;}
   a.run('keys='+JSON.stringify({left:dx<-5,right:dx>5,up:dy<-7&&(p.swimming||i%32<16),down:dy>7})+';simulationStep()');
  }
  assert.ok(arrived,`unreachable control waypoint ${tx},${ty}`);
 }
 assert.equal(a.run('collected'),5);assert.equal(a.run('sunkenWorld.complete'),true);assert.equal(a.run('player.swimming'),false);
 assert.equal(a.storage.has('crustQuestCodex'),false);assert.equal(a.storage.has('crustQuestBest'),false);
});
test('dry pocket uses Up to jump and take culture; dry checkpoint restores the original body',()=>{
 const a=game();a.click('shellResume');
 a.run('player.x=60*T;player.y=32*T-38;player.w=29;player.h=38;player.swimming=false;keys={up:true};for(let i=0;i<12;i++)simulationStep()');
 assert.equal(a.run('gems[2].got'),true);
 a.run('sunkenWorld.checkpoint=2;sunkenPreview.checkpoint={x:57*T,y:32*T-38,swimming:false};respawnCheckpoint()');
 assert.equal(a.run('player.w'),29);assert.equal(a.run('player.h'),38);assert.equal(a.run('player.swimming'),false);
});
test('retry keeps cultures, pump state and defeated guardians; restart restores them',()=>{
 const a=game();a.click('shellResume');
 a.run('player.x=gems[0].x-29;player.y=gems[0].y-13;updateWorldProgress();sunkenWorld.pumpOn=true;sunkenPreview.currents[0].vx=.75;for(const a of sunkenWorld.actors)if(a.kind==="crab"||a.kind==="rider"){a.e.alive=false;a.e.deathT=0;}respawnCheckpoint()');
 assert.equal(a.run('gems[0].got'),true);assert.equal(a.run('collected'),1);assert.equal(a.run('sunkenWorld.pumpOn'),true);
 assert.equal(a.run('sunkenWorld.actors.find(a=>a.kind==="crab").e.alive'),false);assert.equal(a.run('sunkenWorld.actors.find(a=>a.kind==="rider").e.alive'),false);
 a.run('restart()');assert.equal(a.run('collected'),0);assert.equal(a.run('sunkenWorld.pumpOn'),false);assert.equal(a.run('sunkenWorld.actors.find(a=>a.kind==="crab").e.alive'),true);
});
test('both heroes can redirect the same bounded pump with Interact or a shot',()=>{
 const a=game();a.click('shellResume');
 a.run("selectCharacter('loafy');player.x=55*T-29;player.y=48*T-13");assert.equal(a.run('interactCavernExploration()'),true);assert.equal(a.run('sunkenPreview.currents[0].vx'),.75);
 a.run("selectCharacter('vance-wick');sunkenWorld.pumpCooldown=0;shots=[{x:55*T-5,y:48*T,w:10,h:6,vx:10,vy:0,life:30}];updateCombat(false,false)");assert.equal(a.run('sunkenPreview.currents[0].vx'),-.75);
});
test('integrated crab remains beatable with real fire while the opening blocks swimming',()=>{
 const a=game();a.click('shellResume');
 a.run('player.x=73*T;player.y=29*T;CrustSwim.sync(player,sunkenPreview.water,hit);for(let i=0;i<400;i++){const dy=29*T+16-player.y-player.h/2;keys={shoot:true,down:dy>2,up:dy<-2};simulationStep()}');
 assert.equal(a.run('sunkenWorld.actors.find(a=>a.kind==="crab").e.alive'),false);
 assert.equal(a.run('hit(77*T,29*T,58,26)'),false);
});
test('both heroes and map render without changing progression or enemy counts',()=>{
 const a=game();a.click('shellResume');a.run("selectCharacter('loafy');draw();selectCharacter('vance-wick');draw();shellOpenSheet('map')");
 assert.equal(a.doc.getElementById('sheetTitle').textContent,'The Sunken Patisserie · route map');assert.equal(a.run('sunkenWorld.actors.length'),7);
});
test('rendered air chamber and every reachable submerged point agree with the movement regions',()=>{
 const a=game();a.click('shellResume');
 const l=create();assert.deepEqual(l.airChamber,{x:54,y:23,w:10,h:9,roof:22,floor:32});
 const sample=a.run(`(()=>{const result=[];for(let y=22;y<55;y++)for(let x=10;x<104;x++){
  const cx=(x+.5)*T,cy=(y+.5)*T,body={x:cx-29,y:cy-13,w:58,h:26,swimming:false};
  if(hit(body.x,body.y,body.w,body.h))continue;
  result.push([x+.5,y+.5,!!CrustSwim.region(body,sunkenPreview.water,false)]);
 }return result})()`);
 for(const [x,y,wet]of sample){assert.equal(wet,require('./layout.js').isWater(l,x,y),`water mismatch at ${x},${y}`);if(!wet)assert.ok(x>=54&&x<64&&y>=23&&y<32);}
});
test('crossing either visible pressure seal switches between water and the warm air pocket safely',()=>{
 for(const side of ['left','right']){
  const a=game();a.click('shellResume');
  a.run(`player.x=${side==='right'?65:52}*T;player.y=30*T;player.w=58;player.h=26;player.swimming=true;player.vx=player.vy=0;keys={${side==='right'?'left':'right'}:true};for(let i=0;i<60;i++)updatePlayer()`);
  assert.equal(a.run('player.swimming'),false,`enter from ${side}`);assert.equal(a.run('hit(player.x,player.y,player.w,player.h)'),false);
  a.run(`keys={${side==='right'?'right':'left'}:true};for(let i=0;i<110;i++)updatePlayer()`);
  assert.equal(a.run('player.swimming'),true,`exit toward ${side}`);assert.equal(a.run('hit(player.x,player.y,player.w,player.h)'),false);
 }
});
test('foreground furniture bases and facade panels are supported by collision masonry',()=>{
 const l=create();
 for(const [name,x,y,w,h]of l.decor)for(let xx=x;xx<x+w;xx++)assert.equal(l.map[y+h][xx],'#',`${name} unsupported at ${xx},${y+h}`);
 for(const [x,y,w,h]of l.facades)for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)assert.equal(l.map[yy][xx],'#',`floating panel ${xx},${yy}`);
});
