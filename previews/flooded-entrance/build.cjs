/* Reuse the approved swimming page; only this page installs the art/enemy slice. */
const fs=require('node:fs'),path=require('node:path');
require('../sunken/build.cjs');
let html=fs.readFileSync(path.join(__dirname,'../sunken/index.html'),'utf8');
html=html.replace('<title>Sunken Patisserie · Swim Preview</title>','<title>The Flooded Entrance · Crust Quest</title>');
html=html.replace('<script src="../previews/sunken/prototype.js"></script>','<script src="../previews/sunken/prototype.js"></script><script src="../previews/flooded-entrance/reef-patroller.js"></script><script src="../previews/flooded-entrance/environment.js"></script>');
html=html.replaceAll('Swim through the practice course and reach the far flag.','Explore the Flooded Entrance and reach the dry exit.');
fs.writeFileSync(path.join(__dirname,'index.html'),html);
