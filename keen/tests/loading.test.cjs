const {test}=require('node:test');
const assert=require('node:assert/strict');
const {waitForArtwork}=require('../loading.js');
function image({complete=false,width=16,height=16,decode=()=>Promise.resolve()}={}){
 const handlers=new Map();let source='art/test.png';
 return{complete,naturalWidth:width,naturalHeight:height,decode,
 addEventListener(type,fn){handlers.set(type,fn);},removeEventListener(type){handlers.delete(type);},
 emit(type){handlers.get(type)?.();},get listeners(){return handlers.size;},
 get src(){return source;},set src(value){source=value;this.complete=false;this.retried=true;}};
}
test('artwork waits for download and decoding before revealing the game',async()=>{
 let decoded,ready=false;const img=image({decode:()=>new Promise(resolve=>decoded=resolve)});
 const pending=waitForArtwork({label:'hero',image:img}).then(()=>ready=true);
 await Promise.resolve();assert.equal(ready,false);img.emit('load');await Promise.resolve();
 assert.equal(ready,false);decoded();await pending;assert.equal(ready,true);assert.equal(img.listeners,0);
});
test('cached artwork decodes without waiting for a second load event',async()=>{
 let calls=0;const img=image({complete:true,decode:()=>{calls++;return Promise.resolve();}});
 await waitForArtwork({label:'hero',image:img});assert.equal(calls,1);assert.equal(img.listeners,0);
});
test('failed downloads, invalid sheets and decoding errors reject for retry',async()=>{
 const img=image();const pending=waitForArtwork({label:'hero',image:img});img.emit('error');await assert.rejects(pending,/hero/);
 await assert.rejects(waitForArtwork({label:'empty',image:image({complete:true,width:0})}),/empty/);
 await assert.rejects(waitForArtwork({label:'wrong dimensions',image:image({complete:true}),width:32}),/wrong dimensions/);
 await assert.rejects(waitForArtwork({label:'corrupt',image:image({complete:true,decode:()=>Promise.reject(Error('decode'))})}),/corrupt/);
});
test('retry restarts a failed image and waits for its replacement',async()=>{
 const img=image({complete:true,width:0});let ready=false;
 const pending=waitForArtwork({label:'hero',image:img},{retry:true}).then(()=>ready=true);
 assert.equal(img.retried,true);await Promise.resolve();assert.equal(ready,false);
 img.naturalWidth=16;img.emit('load');await pending;assert.equal(ready,true);
});
test('a stalled download times out and releases event listeners',async()=>{
 let expire,cleared=false;const img=image();
 const pending=waitForArtwork({label:'stalled',image:img},{timers:{setTimeout(fn){expire=fn;return 1;},clearTimeout(){cleared=true;}}});
 expire();await assert.rejects(pending,/stalled/);assert.equal(cleared,true);assert.equal(img.listeners,0);
});
