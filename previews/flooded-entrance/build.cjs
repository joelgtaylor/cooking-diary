/* Reuse the approved swimming page; only this page installs the art/enemy slice. */
const fs=require('node:fs'),path=require('node:path');
require('../sunken/build.cjs');
let html=fs.readFileSync(path.join(__dirname,'../sunken/index.html'),'utf8');
html=html.replace('<title>Sunken Patisserie · Swim Preview</title>','<title>The Flooded Entrance · Crust Quest</title>');
html=html.replace('<script src="../previews/sunken/prototype.js"></script>','<script src="../previews/sunken/prototype.js"></script><script src="../previews/flooded-entrance/reef-patroller.js"></script><script src="../previews/flooded-entrance/environment.js"></script>');
html=html.replaceAll('Swim through the practice course and reach the far flag.','Explore the Flooded Entrance and reach the dry exit.');
// Generate preview-only adapters from the current engine/facade. Production stays untouched.
const engine=fs.readFileSync(path.join(__dirname,'../../keen/audio-engine.js'),'utf8');
const hook='music.connect(bus);';
if(!engine.includes(hook))throw new Error('Audio routing hook changed');
fs.writeFileSync(path.join(__dirname,'audio-engine.js'),engine.replace(hook,'music.connect(env.musicDestination?env.musicDestination(ctx,bus):bus);'));
const facade=fs.readFileSync(path.join(__dirname,'../../keen/audio.js'),'utf8');
fs.writeFileSync(path.join(__dirname,'audio.js'),facade.replace('window.CrustSoundtrack.create()','window.SunkenPreviewAudio.create()').replace('gameState=state;sync();','gameState=state;if(engine)engine.waterDepth();sync();'));
html=html.replace('<script src="audio-engine.js"></script>', '<script src="../previews/flooded-entrance/audio-engine.js"></script><script src="../previews/sunken-audio/theme.js"></script><script src="../previews/sunken-audio/underwater-mix.js"></script><script src="../previews/flooded-entrance/soundtrack.js"></script>');
html=html.replace('<script src="audio.js"></script>','<script src="../previews/flooded-entrance/audio.js"></script>');
fs.writeFileSync(path.join(__dirname,'index.html'),html);
