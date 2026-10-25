// Native Canvas pixel comparison and submitted-work counts. Optional argument:
// original fungal-environment.js. Uses the same runtime as profile-moonlit.cjs.
// These counts are not a physical phone FPS benchmark.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict');
const {createCanvas,loadImage}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
 ?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'@napi-rs/canvas'):'@napi-rs/canvas');
const root=path.resolve(__dirname,'../..');
const scenes=[['foothills',0,1252],['grotto',940,780],['canopy',1730,470],
 ['plunge',1700,1130],['bloomrot',2400,1252],['cellar',0,1764],['fractional',1700.5,1130.25]];
(async()=>{
 const image=await loadImage(path.join(root,'keen/art/fungal-environment.png'));
 const modes=process.argv[2]?['baseline','direct','cached']:['direct','cached'];
 const reference=new Map();
 for(const mode of modes){
  const surface=createCanvas(960,540),g=surface.getContext('2d');
  const c={console,g,W:960,H:540,T:32,cols:105,rows:72,bakery:2,camera:0,cameraY:1252,
   shake:0,assets:{fungalEnvironment:image},location:{search:''},
   OffscreenCanvas:class {constructor(w,h){return createCanvas(w,h);}}};
  c.window=c;c.rect=(x,y,w,h,color)=>{g.fillStyle=color;g.fillRect(Math.round(x),Math.round(y),w,h);};
  c.tile=(x,y)=>y<0?'.':c.map[y]?.[x]||'#';vm.createContext(c);
  vm.runInContext(fs.readFileSync(path.join(root,'keen/art/vertical-bakery2-layout.js'),'utf8'),c);
  vm.runInContext('map=Array.from({length:rows},()=>Array(cols).fill("."));CrustVerticalBakery2.apply({map});',c);
  vm.runInContext(fs.readFileSync(mode==='baseline'?path.resolve(process.argv[2]):path.join(root,'keen/fungal-environment.js'),'utf8'),c);
  if(mode==='direct')vm.runInContext('fungalStampCache.disabled=true',c);
  let images=0,filtered=0,saves=0;
  const draw=g.drawImage.bind(g),save=g.save.bind(g);
  g.drawImage=(...args)=>{images++;if(g.filter!=='none')filtered++;return draw(...args);};
  g.save=()=>{saves++;return save();};
  const render=()=>{
   g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,960,540);g.fillStyle='#102030';g.fillRect(0,0,960,540);
   g.translate(-Math.round(c.camera),-Math.round(c.cameraY));
   vm.runInContext('drawFungalEnvironment();drawFungalPlatformBacking();drawFungalPlatformFaces()',c);
  };
  for(const [name,x,y]of scenes){
   c.camera=x;c.cameraY=y;render();images=filtered=saves=0;render();
   const pixels=g.getImageData(0,0,960,540).data;
   let changed=0,maxDelta=0,large=0,squared=0;
   if(!reference.has(name))reference.set(name,Buffer.from(pixels));
   else for(let i=0;i<pixels.length;i++){
    const d=Math.abs(pixels[i]-reference.get(name)[i]);if(d)changed++;if(d>2)large++;squared+=d*d;maxDelta=Math.max(maxDelta,d);
   }
   const cache=mode==='baseline'?null:vm.runInContext('({pixels:fungalStampCache.pixels,entries:fungalStampCache.entries.size})',c);
   if(process.env.PROFILE_IMAGES)fs.writeFileSync(path.join(process.env.PROFILE_IMAGES,name+'-'+mode+'.png'),surface.toBuffer('image/png'));
   console.log(JSON.stringify({mode,scene:name,images,filtered,saves,cache,changedChannels:changed,maxDelta,large,rms:Math.sqrt(squared/pixels.length)}));
   // Offscreen compositing rounds alpha; nearest-neighbour texture sampling can
   // also choose an adjacent source texel after scaling into a small stamp.
   // Bound both the affected fraction and aggregate error against the original.
   assert.ok(large/pixels.length<.005&&Math.sqrt(squared/pixels.length)<2,`${mode} ${name}: excessive pixel difference`);
   if(mode==='cached'){assert.equal(filtered,0);assert.ok(cache.pixels<=512*1024);}
  }
 }
})().catch(error=>{console.error(error);process.exitCode=1;});
