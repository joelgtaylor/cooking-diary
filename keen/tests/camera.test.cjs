const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'), vm=require('node:vm'), path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../camera.js'),'utf8');
function follow(overrides={}) {
 const state={window:{__crustCameraDemo:true},W:960,H:540,world:3360,rows:56,T:32,camera:0,cameraY:0,player:{x:96,y:1690,w:28,h:38,vy:0},...overrides};
 vm.runInNewContext(source+'\nupdateViewCamera();',state);
 return [state.camera,state.cameraY];
}
test('classic follow clamps horizontally and resets vertical offset',()=>{
 assert.deepEqual(follow({window:{__crustCameraDemo:false},cameraY:400,player:{x:1000}}),[750,0]);
 assert.deepEqual(follow({window:{__crustCameraDemo:false},player:{x:4000}}),[2400,0]);
});
test('vertical dead zone leaves the camera still',()=>{
 assert.deepEqual(follow({player:{x:400,y:240,w:28,h:38,vy:0}}),[0,0]);
});
test('snap follow clamps to world edges',()=>{
 const window={__crustCameraDemo:true,__crustCameraSnap:true};
 assert.deepEqual(follow({window,player:{x:4000,y:2000,w:28,h:38,vy:0}}),[2400,1252]);
 assert.deepEqual(follow({window,camera:300,cameraY:300,player:{x:-100,y:-100,w:28,h:38,vy:0}}),[0,0]);
});
test('smooth follow caps displacement and keeps fractional coordinates',()=>{
 assert.deepEqual(follow({player:{x:3000,y:1600,w:28,h:38,vy:5}}),[14,18]);
 const [x,y]=follow({player:{x:610,y:360,w:28,h:38,vy:0}});
 assert.ok(x>0&&x<14&&!Number.isInteger(x));
 assert.ok(y>0&&y<18&&!Number.isInteger(y));
});
test('falling uses faster vertical easing',()=>{
 const player={x:400,y:380,w:28,h:38,vy:0};
 assert.ok(follow({player:{...player,vy:4}})[1]>follow({player})[1]);
});
