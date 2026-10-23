const {test}=require('node:test'),assert=require('node:assert/strict');
const swim=require('../../previews/sunken/swim-physics.js');
const {previewGame}=require('../../previews/sunken/test-harness.cjs');
const actor=(extra={})=>({x:100,y:100,w:58,h:26,vx:0,vy:0,face:1,swimming:true,...extra});
const env={hit:()=>false,currents:[],mode:'free'};
test('swim accelerates, reverses and brakes promptly with only gentle passive rise',()=>{
 const a=actor();for(let i=0;i<10;i++)swim.step(a,{right:true},env);assert.ok(a.vx>3.6&&a.vx<=3.8);
 for(let i=0;i<5;i++)swim.step(a,{left:true},env);assert.ok(a.vx<0);
 for(let i=0;i<15;i++)swim.step(a,{},env);assert.ok(Math.abs(a.vx)<.02);assert.ok(Math.abs(a.vy+.18)<.01);
});
test('diagonal propulsion is normalized, with equal deliberate ascent/descent',()=>{
 const a=actor(),up=actor(),down=actor();for(let i=0;i<60;i++){swim.step(a,{right:true,down:true},env);swim.step(up,{up:true},env);swim.step(down,{down:true},env);}
 assert.ok(Math.hypot(a.vx,a.vy)<=3.800001);assert.ok(Math.abs(up.vy+down.vy)<1e-8);
});
test('current influence is bounded, escapable and cannot tunnel through a wall',()=>{
 const a=actor(),e={...env,currents:[{x:0,y:0,w:1000,h:1000,vx:100}],hit:(x,y,w)=>x+w>200};
 for(let i=0;i<100;i++)swim.step(a,{right:true},e);assert.ok(a.x+a.w<=200);
 const before=a.x;for(let i=0;i<30;i++)swim.step(a,{left:true},e);assert.ok(a.x<before-30);
});
test('entry uses a stable wider body and clears dry jump/ledge state',()=>{
 const a=actor({w:29,h:38,swimming:false,vy:10,buffer:9,coyote:7,hang:{},climb:4});
 assert.equal(swim.sync(a,[{x:0,y:0,w:1000,h:1000}],()=>false),'enter');assert.equal(a.w,58);assert.equal(a.h,26);assert.equal(a.vy,4);assert.equal(a.buffer,0);assert.equal(a.hang,null);
});
test('water transitions never resize into a solid and use surface hysteresis',()=>{
 const a=actor({y:91}),r=[{x:0,y:100,w:1000,h:1000}];assert.equal(swim.sync(a,r,()=>false),null);
 a.y=70;assert.equal(swim.sync(a,r,()=>true),'blocked');assert.equal(a.w,58);assert.equal(a.swimming,true);
 assert.equal(swim.sync(a,r,()=>false),'exit');assert.equal(a.w,29);assert.equal(a.h,38);
});
test('upward aiming is independent of swim ascent and muzzle paths stop at rock',()=>{
 const a=actor();assert.deepEqual(swim.step(a,{up:true,shoot:true},env),{shoot:true,aimUp:false});
 assert.deepEqual(swim.step(a,{down:true,jump:true,shoot:true},env),{shoot:true,aimUp:true});
 const s=swim.shot(a,false,()=>false);assert.equal(s.vx,10);assert.equal(s.vy,0);
 const up=swim.shot(a,true,()=>false);assert.equal(up.vy,-10);
 assert.equal(swim.shot(a,false,(x)=>x>160),null);
});
test('direction pad supports sliding diagonals, centre deadzone and leaving its area',()=>{
 const r={left:0,top:0,width:150,height:150};assert.deepEqual(swim.pad(75,75,r),{left:false,right:false,up:false,down:false});
 const diagonal=swim.pad(140,10,r);assert.equal(diagonal.right,true);assert.equal(diagonal.up,true);assert.deepEqual(swim.pad(500,20,r),{});
});
test('preview boots paused; production shell controls resume both heroes',()=>{
 const a=previewGame();assert.equal(a.run('state'),'shell-menu');a.click('shellResume');assert.equal(a.run('state'),'play');
 a.run("selectCharacter('vance-wick')");assert.equal(a.run('selectedCharacterId'),'vance-wick');a.run('draw()');
});
test('real preview update enters water, restores a dry body and never clips on the exit ledge',()=>{
 const a=previewGame();a.click('shellResume');a.run('keys={right:true}');
 for(let i=0;i<130;i++)a.run('update();updateWorldProgress()');assert.equal(a.run('player.swimming'),true);assert.equal(a.run('player.w'),58);assert.equal(a.run('hit(player.x,player.y,player.w,player.h)'),false);
 a.run('player.x=68*T;player.y=22*T+50;player.vx=player.vy=0;keys={up:true}');
 let exited=false;for(let i=0;i<70;i++){a.run('update();updateWorldProgress()');if(!a.run('player.swimming'))exited=true;assert.equal(a.run('hit(player.x,player.y,player.w,player.h)'),false);}
 assert.ok(exited);
});
test('actual production keyboard adapter preserves horizontal fire during ascent',()=>{
 const a=previewGame();a.click('shellResume');a.run('player.x=18*T;player.y=34*T;CrustSwim.sync(player,[{x:0,y:0,w:3000,h:3000}],hit)');
 a.key('w','KeyW');a.key('x','KeyX');a.run('update()');assert.equal(a.run('keys.up'),true);assert.equal(a.run('shots[0].vy'),0);
 a.key(' ','Space');a.run('playerFireCooldown=0;update()');assert.equal(a.run('shots.at(-1).vy'),-10);
});
test('two touch fingers and keyboard sources remain independent; pause cancels all holds',()=>{
 const a=previewGame();a.click('shellResume');a.pointer('up','pointerdown',{pointerId:11,clientX:140,clientY:410});
 a.pointer('shoot','pointerdown',{pointerId:12,clientX:30,clientY:478});assert.equal(a.run('keys.up'),true);assert.equal(a.run('keys.right'),true);assert.equal(a.run('keys.shoot'),true);
 a.pointer('up','pointerup',{pointerId:11});assert.equal(a.run('!!keys.up'),false);assert.equal(a.run('keys.shoot'),true);
 a.click('shellPause');assert.equal(a.run('shellInput.size()'),0);assert.equal(a.run('shellPointers.size'),0);
});
test('submerged checkpoint recovery restores water body and original saves are not written',()=>{
 const a=previewGame();a.click('shellResume');a.run('player.x=40*T;player.y=39*T;CrustSwim.sync(player,[{x:0,y:0,w:3000,h:3000}],hit);updateWorldProgress();player.x=60*T;respawnCheckpoint()');
 assert.equal(a.run('player.swimming'),true);assert.equal(a.run('player.w'),58);assert.equal(a.run('hit(player.x,player.y,player.w,player.h)'),false);
 assert.equal(a.storage.has('crustQuestBest'),false);assert.equal(a.storage.has('crustQuestCodex'),false);
});
test('both heroes can swim the complete intended route and exit without clipping or save writes',()=>{
 for(const hero of ['loafy','vance-wick']){
  const a=previewGame();a.click('shellResume');a.run('selectCharacter('+JSON.stringify(hero)+')');
  for(const [tx,ty]of [[20,34],[31,34],[44,40],[55,40],[55,28],[65,28],[68,21],[75,21]]){
   let arrived=false;
   for(let i=0;i<1100;i++){
    const p=JSON.parse(a.run('JSON.stringify(player)')),dx=tx*32-p.x-p.w/2,dy=ty*32-p.y-p.h/2;
    if(Math.hypot(dx,dy)<18){arrived=true;break;}
    a.run('keys='+JSON.stringify({left:dx<-7,right:dx>7,up:dy<-7,down:dy>7})+';update();updateWorldProgress()');
    // The shipped dry ledge-grab intentionally overlaps its wall by five
    // pixels while its scripted hand anchor climbs; preserve that behavior.
    assert.equal(a.run('player.hang&&!player.swimming?false:hit(player.x,player.y,player.w,player.h)'),false,hero+' must not clip');
   }
   assert.ok(arrived,hero+' reaches waypoint '+tx+','+ty);
  }
  assert.equal(a.run('sunkenPreview.finished'),true);assert.equal(a.run('player.swimming'),false);assert.equal(a.run('player.w'),29);
  assert.equal(a.storage.has('crustQuestBest'),false);assert.equal(a.storage.has('crustQuestCodex'),false);
 }
});
test('holding underwater aim across a surface exit does not buffer a land jump',()=>{
 const a=previewGame();a.click('shellResume');
 a.run('player.x=66*T;player.y=22*T;CrustSwim.sync(player,[{x:0,y:0,w:3000,h:3000}],hit);keys={up:true,jump:true}');
 for(let i=0;i<15&&a.run('player.swimming');i++)a.run('update()');assert.equal(a.run('player.swimming'),false);
 a.run('update()');assert.equal(a.run('player.buffer'),0);assert.equal(a.run('sunkenPreview.blockDryJump'),true);
 a.run('keys={};update()');assert.equal(a.run('sunkenPreview.blockDryJump'),false);
});
test('touch cancellation clears its vector without releasing a keyboard direction',()=>{
 const a=previewGame();a.click('shellResume');a.key('d','KeyD');
 a.pointer('up','pointerdown',{pointerId:4,clientX:78,clientY:410});assert.equal(a.run('keys.up'),true);
 a.pointer('up','lostpointercapture',{pointerId:4});assert.equal(a.run('!!keys.up'),false);assert.equal(a.run('keys.right'),true);
 a.blur();assert.equal(a.run('shellInput.size()'),0);
});
test('buoyant comparison preset is distinct and paused display fitting preserves simulation coordinates',()=>{
 const free=actor(),reference=actor();for(let i=0;i<80;i++){swim.step(free,{},env);swim.step(reference,{},{...env,mode:'buoyant'});}
 assert.ok(reference.y>free.y+40);
 const a=previewGame();a.click('shellResume');a.elements.get('wrap').clientWidth=390;a.elements.get('wrap').clientHeight=844;
 a.elements.get('showTouch').checked=true;const before=a.run('player.x');a.run('shellSettings();shellFit()');
 assert.equal(a.run('player.x'),before);assert.ok(parseFloat(a.elements.get('wrap').style['--canvas-width'])<=390);
});
