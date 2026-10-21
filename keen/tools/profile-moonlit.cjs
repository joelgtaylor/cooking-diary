// Native Canvas render benchmark; optional argument: pre-fix moonlit-environment.js.
// Uses @napi-rs/canvas from the configured primary runtime.
const path=require('path'),fs=require('fs'),vm=require('vm');
const {createCanvas,loadImage}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas');
const root=path.resolve(__dirname,'../..');const {game}=require('../tests/game-harness.cjs');
(async()=>{
 const a=game();const manifest=a.run('Object.entries(assets).map(([key,im])=>[key,im.src])');
 const images=new Map(await Promise.all(manifest.map(async([key,src])=>[key,await loadImage(src.startsWith('data:')?src:path.join(root,'keen',src))])));
 const surface=createCanvas(960,540),ctx=surface.getContext('2d');
 const baseline=process.argv[2];
 const old=baseline?fs.readFileSync(baseline,'utf8'):null;
 const pixels=new Map();
 for(const mode of (old?['before','optimized']:['optimized'])){
  const b=game({}, {context:ctx,globals:{__images:images,}});
  if(mode==='before')b.run(old.replace('const MOONLIT_ENVIRONMENT_CROPS','var OLD_CROPS').replaceAll('MOONLIT_ENVIRONMENT_CROPS','OLD_CROPS'));
  b.run('for(const [key,im]of __images)assets[key]=im;');
  for(const [scene,cx,cy]of [['opening',0,1252],['hall',760,850],['towers',1540,430],['boss',2400,1252]]){
   b.run(`camera=${cx};cameraY=${cy};`);b.run('drawWorld()');
   const start=performance.now();for(let i=0;i<60;i++)b.run('drawWorld()');const ms=(performance.now()-start)/60;
   console.log(mode,scene,ms.toFixed(2)+' ms/frame');
   const now=ctx.getImageData(0,0,960,540).data;
   if(mode==='before')pixels.set(scene,Buffer.from(now));
   else if(pixels.has(scene)){require('node:assert/strict').deepEqual(Buffer.from(now),pixels.get(scene));console.log('  pixel-identical to baseline');}
  }
 }
})();
