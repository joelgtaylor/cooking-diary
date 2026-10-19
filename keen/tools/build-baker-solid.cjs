/* Build-only dependency: sharp. No image readback/repair runs during gameplay. */
const path=require('node:path'),sharp=require('sharp');
const {repairBakerPixels}=require('../sprite-repair.js');
(async()=>{
 const root=path.join(__dirname,'..'),source=path.join(root,'art/baker-ai-stable.png');
 const {data,info}=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const {pixels,repaired}=repairBakerPixels(data,info.width,info.height);
 for(let p=0;p<data.length;p+=4)if(data[p+3])for(let c=0;c<4;c++){
  if(data[p+c]!==pixels[p+c])throw Error('Repair changed an existing opaque pixel');
 }
 await sharp(Buffer.from(pixels),{raw:{width:info.width,height:info.height,channels:4}}).png().toFile(path.join(root,'art/baker-ai-solid.png'));
 console.log(`Built ${info.width}x${info.height} immutable atlas; repaired ${repaired} pixels; original opaque pixels preserved.`);
})().catch(error=>{console.error(error);process.exitCode=1;});
