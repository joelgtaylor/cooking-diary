const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const {game}=require('./game-harness.cjs');
const root=path.join(__dirname,'..');
test('external fallback PNGs match the original embedded bytes',()=>{
 for(const asset of require('./fallback-assets.json')){
  const bytes=fs.readFileSync(path.join(root,asset.path));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256,asset.path);
  assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 }
});
test('production scripts and registered image files exist; HTML contains no inline image data',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 assert.doesNotMatch(html,/data:image\//);
 for(const [,src]of html.matchAll(/<script src="([^"]+)"/g))assert.ok(fs.existsSync(path.join(root,src)),src);
 const {run}=game();
 for(const [name,src]of run('Object.entries(assets).map(([name,img])=>[name,img.src])')){
  if(src.startsWith('data:'))continue;
  assert.ok(fs.existsSync(path.join(root,src)),name+': '+src);
 }
 assert.equal(run("'bakerPhase2' in assets || 'baker' in assets"),false);
});
