const fs=require('node:fs'),path=require('node:path');require('../flooded-entrance/build.cjs');
let html=fs.readFileSync(path.join(__dirname,'../flooded-entrance/index.html'),'utf8');
html=html.replace('<title>The Flooded Entrance · Crust Quest</title>','<title>The Sunken Patisserie · World route preview</title>');
html=html.replace('<script src="../previews/flooded-entrance/environment.js"></script>', '<script src="../previews/flooded-entrance/environment.js"></script><script src="../previews/puffer/bubble-puffer.js"></script><script src="../previews/current-rider/current-rider.js"></script><script src="../previews/pot-crab/pot-crab.js"></script><script src="../previews/pot-crab/claw-animation.js"></script><script src="../previews/sunken-world/layout.js"></script><script src="../previews/sunken-world/enemy-art.js"></script><script src="../previews/sunken-world/world.js"></script>');
html=html.replaceAll('Explore the Flooded Entrance and reach the dry exit.','Collect five cultures and reach the Abyssal boss approach.');
fs.writeFileSync(path.join(__dirname,'index.html'),html);
