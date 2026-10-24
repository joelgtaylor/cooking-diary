const fs=require('node:fs'),path=require('node:path');
require('../flooded-entrance/build.cjs');
let html=fs.readFileSync(path.join(__dirname,'../flooded-entrance/index.html'),'utf8');
html=html.replace('<title>The Flooded Entrance · Crust Quest</title>','<title>Copper Pot Crab · Crust Quest encounter</title>');
html=html.replace('<script src="../previews/flooded-entrance/environment.js"></script>','<script src="../previews/flooded-entrance/environment.js"></script><script src="../previews/pot-crab/pot-crab.js"></script><script src="../previews/pot-crab/claw-animation.js"></script><script src="../previews/pot-crab/encounter.js"></script>');
html=html.replaceAll('Explore the Flooded Entrance and reach the dry exit.','Wait for the lid to lift, then shoot. Clear the guarded passage.');
fs.writeFileSync(path.join(__dirname,'index.html'),html);
