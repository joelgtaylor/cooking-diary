"""Prepare the two overrides for a same-origin GitHub Pages keen-tree copy.

Copy the keen subtree to previews/factory, then replace index.html and world.js
with these files. Assets remain normal relative URLs; production stays intact.
"""
from pathlib import Path
import sys

root = Path(__file__).resolve().parents[1]
out = Path(sys.argv[1]).resolve()
out.mkdir(parents=True, exist_ok=True)
s = (root / 'index.html').read_text()
ui = '''<aside style="max-width:960px;margin:12px auto;padding:12px;background:#202936;color:#e8d6b5;font:14px monospace"><button onclick="startFactoryPreview()">Restart entrance</button> <button onclick="practiceFactoryExit()">Exit encounter</button> <button onclick="respawnCheckpoint()">Retry checkpoint</button><p>Explore the maintenance passage for the first culture and stored kefir. The roof holds an optional supply cache. Arrows move · Space jump · X shoot · C pogo · V / Kefir activates your stored dash. Normal jumps reach every required landing.</p></aside>'''
js = '''function startFactoryPreview(){window.__crustDevourerPreview=false;window.__crustBloomrotArena=false;init(3);keys={};}
function practiceFactoryExit(){startFactoryPreview();player.x=21*T;player.y=49*T-player.h;player.ground=true;player.kefirCharges=1;camera=400;cameraY=1100;checkpointState.current=0;}
startFactoryPreview();'''
s = s.replace('<body>', '<body>' + ui).replace('</body>', '<script>' + js + '</script></body>')
s = s.replace('Crust Quest — Rise of the Starter', 'Crust Quest — Factory Entrance Playtest')
s = s.replace('THREE BAKERIES<br>ONE LEGENDARY LOAF', 'FACTORY ENTRANCE<br>BAKERY 3 PLAYTEST')
world = (root / 'world.js').read_text()
for key in ('crustQuestBest', 'crustQuestCodex'):
    s = s.replace("'" + key + "'", "'factory-web-preview:" + key + "'")
    world = world.replace("'" + key + "'", "'factory-web-preview:" + key + "'")
(out / 'index.html').write_text(s)
(out / 'world.js').write_text(world)
print(out)
