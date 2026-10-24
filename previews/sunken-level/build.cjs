const fs=require('node:fs'),path=require('node:path');require('../sunken-world/build.cjs');
let html=fs.readFileSync(path.join(__dirname,'../sunken-world/index.html'),'utf8');
html=html.replace('<title>The Sunken Patisserie · World route preview</title>','<title>The Sunken Patisserie · Complete level</title>');
html=html.replace('<div class="menu-grid">','<div class="menu-grid"><button id="inkObstructionBtn" type="button" hidden aria-pressed="false">Ink obstruction: FULL</button>');
html=html.replace('<script src="../previews/sunken-world/world.js"></script>','<script src="../previews/sunken-world/world.js"></script><script src="../previews/octopus/master-of-deep.js"></script><script src="../previews/octopus/bench-scraper.js"></script><script src="../previews/octopus/ink-attack.js"></script><script src="../previews/octopus/full-fight.js"></script><script src="../previews/octopus/boss-art.js"></script><script src="../previews/octopus/arena.js"></script><script src="../previews/sunken-level/level.js"></script>');
html=html.replaceAll('Collect five cultures and reach the Abyssal boss approach.','Gather five cultures, face the Master of the Deep, and enter the finishing oven.');
fs.writeFileSync(path.join(__dirname,'index.html'),html);
