"""Prepare the two overrides for a same-origin GitHub Pages keen-tree copy.

Copy the keen subtree to previews/ascent, then replace index.html and world.js
with these files. Assets remain normal relative URLs; production stays intact.
"""
from pathlib import Path
import sys

root = Path(__file__).resolve().parents[1]
out = Path(sys.argv[1]).resolve()
out.mkdir(parents=True, exist_ok=True)
s = (root / 'index.html').read_text()
ui = '''<aside style="max-width:960px;margin:12px auto;padding:12px;background:#202936;color:#e8d6b5;font:14px monospace"><button onclick="startAscentPreview()">Restart ascent</button> <button onclick="practiceAscentBonus()">Bonus roof</button> <button onclick="startAscentFull()">Full Bakery 3</button> <button onclick="respawnCheckpoint()">Retry checkpoint</button><p>Culture one is banked for this focused preview. Find cultures two and three in the maintenance halls; the upper roof is optional. Arrows move · Space jump · X shoot · Jump + X fires up · C pogo · V / Kefir activates stored dash. All required jumps work without dash.</p></aside>'''
js = '''function startAscentFull(){window.__crustDevourerPreview=false;window.__crustBloomrotArena=false;init(3);keys={};}
function startAscentPreview(){startAscentFull();gems[0].got=true;collected=1;checkpointState.current=1;player.x=33*T;player.y=37*T-player.h;player.ground=true;player.ammo=45;player.kefirCharges=1;camera=700;cameraY=850;}
function practiceAscentBonus(){startAscentPreview();gems[1].got=true;collected=2;player.x=55*T;player.y=28*T-player.h;player.ground=true;camera=1400;cameraY=440;}
startAscentPreview();'''
s = s.replace('<body>', '<body>' + ui).replace('</body>', '<script>' + js + '</script></body>')
s = s.replace('Crust Quest — Rise of the Starter', 'Crust Quest — Clockwork Ascent Playtest')
s = s.replace('THREE BAKERIES<br>ONE LEGENDARY LOAF', 'CLOCKWORK ASCENT<br>BAKERY 3 PLAYTEST')
world = (root / 'world.js').read_text()
for key in ('crustQuestBest', 'crustQuestCodex'):
    s = s.replace("'" + key + "'", "'ascent-web-preview:" + key + "'")
    world = world.replace("'" + key + "'", "'ascent-web-preview:" + key + "'")
(out / 'index.html').write_text(s)
(out / 'world.js').write_text(world)
print(out)
