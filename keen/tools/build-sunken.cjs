/* Promote the approved review modules into a self-contained production bundle.
 * No production page loads files from previews/. Rebuild after approved changes.
 */
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
require('../../previews/sunken-level/build.cjs');
let html=fs.readFileSync(path.join(root,'previews/sunken-level/index.html'),'utf8');
html=html.replace('<base href="../../keen/">','').replaceAll('../previews/','sunken/');
html=html.replace('<script src="sunken/sunken-level/level.js"></script>','<script src="sunken/sunken-level/level.js"></script><script src="sunken/campaign.js"></script>');
html=html.replace("sunkenReplay.hidden=!unlocked.includes(2);sunkenReplay.addEventListener('click',()=>window.location.assign(window.CrustWorlds[3].href));","sunkenReplay.hidden=false;sunkenReplay.textContent='Return to Moonlit Bakery';sunkenReplay.addEventListener('click',()=>window.location.assign('index.html'));");
fs.writeFileSync(path.join(root,'keen/sunken.html'),html);
const dirs=['sunken','flooded-entrance','sunken-audio','puffer','current-rider','pot-crab','sunken-world','octopus','sunken-level'];
const assets=['flooded-entrance/environment-kit.png','flooded-entrance/masonry.png','flooded-entrance/reef-patroller.png','puffer/puffer-frames.png','current-rider/rider-frames.png','pot-crab/crab-frames.png','pot-crab/claw-grab.png',...['joined-master','lame-slender','defeat-frames','scraper-frames','scraper-wake','ink-frames','ink-cloud'].map(x=>'octopus/'+x+'.png')];
const files=new Set([...html.matchAll(/(?:src|href)="sunken\/([^"?]+)(?:\?[^" ]*)?"/g)].map(m=>m[1]));
for(const file of assets)files.add(file);
for(const file of files){
 const src=path.join(root,'previews',file),dst=path.join(root,'keen/sunken',file);if(file==='campaign.js')continue;
 fs.mkdirSync(path.dirname(dst),{recursive:true});
 const data=fs.readFileSync(src);let out=data;
 if(/\.(js|css)$/.test(file)){let s=data.toString().replaceAll('../previews/','sunken/');
  // Production always starts at the entrance; review shortcuts cannot award recipes.
  if(file==='sunken-level/level.js')s=s.replace("const scene=/(?:^|[?&])scene=(boss|oven)(?:&|$)/.exec(window.location?.search||'');","const scene=null;");
  out=s;
 }
 fs.writeFileSync(dst,out);
}
console.log('Built keen/sunken.html and '+files.size+' production resources');
