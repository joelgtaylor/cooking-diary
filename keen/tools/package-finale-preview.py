"""Prepare the two overrides for a same-origin GitHub Pages keen-tree copy.

Copy the keen subtree to previews/finale, then replace index.html and world.js
with these files. Assets remain normal relative URLs; production stays intact.
"""
from pathlib import Path
import sys

root = Path(__file__).resolve().parents[1]
out = Path(sys.argv[1]).resolve()
out.mkdir(parents=True, exist_ok=True)
s = (root / 'index.html').read_text()
ui = '''<aside style="max-width:960px;margin:12px auto;padding:12px;background:#202936;color:#e8d6b5;font:14px monospace"><button onclick="startFinalePreview()">Restart descent</button> <button onclick="practiceFinalCheckpoint()">Final checkpoint</button> <button onclick="practiceOvenRelease()">Replay oven reveal</button> <button onclick="startFinaleFull()">Full Bakery 3</button> <button onclick="respawnCheckpoint()">Retry checkpoint</button><p>The first three cultures are banked. Collect the last two on the descent, follow the service stairs to the checkpoint, then reach the grand oven. Arrows move · Space jump · X shoot · Jump + X fires up · C pogo · V / Kefir activates stored dash. The final checkpoint restores at least 3 hearts, 65 ammo and one stored kefir.</p></aside>'''
js = '''function startFinaleFull(){window.__crustDevourerPreview=false;window.__crustBloomrotArena=false;init(3);keys={};}
function startFinalePreview(){startFinaleFull();for(let i=0;i<3;i++)gems[i].got=true;collected=3;checkpointState.current=2;player.x=76*T;player.y=19*T-player.h;player.ground=true;player.ammo=45;player.kefirCharges=1;camera=2250;cameraY=350;}
function practiceFinalCheckpoint(){startFinaleFull();gems.forEach(g=>g.got=true);collected=5;checkpointState.current=3;respawnCheckpoint();camera=2400;cameraY=rows*T-H;}
function practiceOvenRelease(){practiceFinalCheckpoint();devourerState.x=94*T;devourerState.health=1;hurtDevourer();player.x=90*T;}
startFinalePreview();'''
s = s.replace('<body>', '<body>' + ui).replace('</body>', '<script>' + js + '</script></body>')
s = s.replace('Crust Quest — Rise of the Starter', 'Crust Quest — Grand Oven Finale Playtest')
s = s.replace('THREE BAKERIES<br>ONE LEGENDARY LOAF', 'FINAL DESCENT<br>BAKERY 3 PLAYTEST')
world = (root / 'world.js').read_text()
for key in ('crustQuestBest', 'crustQuestCodex'):
    s = s.replace("'" + key + "'", "'finale-web-preview:" + key + "'")
    world = world.replace("'" + key + "'", "'finale-web-preview:" + key + "'")
(out / 'index.html').write_text(s)
(out / 'world.js').write_text(world)
print(out)
