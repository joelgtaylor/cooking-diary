/* Rebuild the isolated preview from the current production shell/bootstrap. */
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'../..');
let html=fs.readFileSync(path.join(root,'keen/index.html'),'utf8');
html=html.replace('<head>','<head><base href="../../keen/">');
html=html.replace('</head>','<link rel="stylesheet" href="../previews/sunken/preview.css"></head>');
html=html.replace(/<title>[^<]*<\/title>/,'<title>Sunken Patisserie · Swim Preview</title>');
html=html.replaceAll('Find five yeast cultures, then reach the grand oven.','Swim through the practice course and reach the far flag.');
html=html.replace('<div id="directionPad" class="direction-pad">','<div id="directionPad" class="direction-pad"><button class="touch-control direction" data-action="up" aria-label="Swim up">▲</button><button class="touch-control direction" data-action="down" aria-label="Swim down">▼</button>');
html=html.replace('<details id="shellSettings">','<label class="preview-preset">Swimming feel<select id="swimPreset"><option value="free">Free swim — recommended</option><option value="buoyant">Buoyant strokes — comparison</option></select></label><details id="shellSettings">');
html=html.replace('<p>← → / A D move · Space / W / ↑ jump<br>X / K shoot · C mixer · V kefir · E interact<br>Esc / P pause · F fullscreen · M mute · Q map · T recipes</p>','<p>Arrows / WASD swim · Space + Shoot aim up<br>On land: Space / W / ↑ jump · X / K shoot<br>C mixer · V kefir · Esc / P pause · F fullscreen · M mute</p>');
html=html.replace('Touch: slide between the direction buttons. Hold Jump + Shoot to aim upward. Mixer toggles once per press.','Touch: slide around the direction pad, including diagonals. Hold Aim Up + Shoot to fire upward underwater. Mixer toggles once per press.');
html=html.replace("bindInput();bindCharacterSelector();","installSunkenPrototype();\nbindInput();bindCharacterSelector();");
html=html.replace('<script>\n\'use strict\';window.__crustCameraDebug', '<script src="../previews/sunken/swim-physics.js"></script><script src="../previews/sunken/prototype.js"></script><script>\n\'use strict\';window.__crustCameraDebug');
fs.writeFileSync(path.join(__dirname,'index.html'),html);
