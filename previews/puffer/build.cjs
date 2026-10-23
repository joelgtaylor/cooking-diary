const fs=require('node:fs'),path=require('node:path');
require('../flooded-entrance/build.cjs');
let html=fs.readFileSync(path.join(__dirname,'../flooded-entrance/index.html'),'utf8');
html=html.replace('<title>The Flooded Entrance · Crust Quest</title>','<title>Bubble Puffer · Crust Quest encounter</title>');
html=html.replace('<script src="../previews/flooded-entrance/environment.js"></script>','<script src="../previews/flooded-entrance/environment.js"></script><script src="../previews/puffer/bubble-puffer.js"></script><script src="../previews/puffer/encounter.js"></script>');
html=html.replaceAll('Explore the Flooded Entrance and reach the dry exit.','Defeat the Bubble Puffer. Shoot bubbles to clear a path.');
fs.writeFileSync(path.join(__dirname,'index.html'),html);
