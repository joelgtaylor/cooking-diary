const fs=require('node:fs'),path=require('node:path');require('../flooded-entrance/build.cjs');
let html=fs.readFileSync(path.join(__dirname,'../flooded-entrance/index.html'),'utf8');
html=html.replace('<title>The Flooded Entrance · Crust Quest</title>','<title>The Master of the Deep · Lame attack review</title>');
html=html.replace('<script src="../previews/flooded-entrance/environment.js"></script>','<script src="../previews/flooded-entrance/environment.js"></script><script src="../previews/octopus/master-of-deep.js"></script><script src="../previews/octopus/arena.js"></script>');
html=html.replaceAll('Explore the Flooded Entrance and reach the dry exit.','Read the lame sweep, swim clear, then shoot his exposed mantle.');
fs.writeFileSync(path.join(__dirname,'index.html'),html);
