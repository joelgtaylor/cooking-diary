"""Build a self-contained offline fight preview, with literal art URLs embedded."""
from pathlib import Path
import re, base64, mimetypes, zipfile, sys
root=Path(__file__).resolve().parents[1]
out=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else root.parent.parent/'devourer-first-fight-playtest.zip'
s=(root/'index.html').read_text()
def script(m):return '<script>\n'+(root/m[1]).read_text().replace('</script','<\\/script')+'\n</script>'
s=re.sub(r'<script src="([^"]+)"></script>',script,s)
def asset(m):
 p=root/m[2]
 return m[1]+'data:'+mimetypes.guess_type(p.name)[0]+';base64,'+base64.b64encode(p.read_bytes()).decode()+m[1] if p.is_file() else m[0]
s=re.sub(r"(['\"])(art/[^'\"]+\.(?:png|webp))\1",asset,s)
s=s.replace("localStorage.getItem('","localStorage.getItem('devourer-trial:").replace("localStorage.setItem('","localStorage.setItem('devourer-trial:")
ui='''<aside style="max-width:960px;margin:12px auto;padding:12px;background:#242231;color:#ffe0aa;font:14px monospace"><button onclick="startDevourerPreview()">Restart ambush</button> <button onclick="practiceDevourerDoor()">Door practice</button> <button onclick="respawnCheckpoint()">Retry checkpoint</button> <button onclick="leaveDevourerPreview()">Full Bakery 3</button><p>Arrows move · Space jump · X shoot · P pause. Approach the grand oven. Jump + shoot into the glowing door when it opens.</p></aside>'''
js="function practiceDevourerDoor(){startDevourerPreview();devourerState.phase='recovery';devourerState.timer=108;devourerState.x=91*T;devourerGate(true);player.x=87*T;player.y=51*T-player.h;player.ground=true;}startDevourerPreview();"
s=s.replace('<body>','<body>'+ui).replace('</body>','<script>'+js+'</script></body>')
assert '<script src=' not in s
out.with_suffix('.html').write_text(s)
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 z.writestr('Bakery-3.html',s)
 z.writestr('START-HERE.txt','Extract and open Bakery-3.html in Chrome, Edge or Firefox. All artwork/scripts are embedded.\nWalk toward the supposed final oven. Move quickly when it leaps; the landing target locks at takeoff. Five bouncing flaming boules follow, then a pressure-release beat and a one-second opening. The vent extinguishes remaining boules, giving a clean chance to attack. Jump and shoot into the glowing furnace or use a low maintenance shelf. Closed armor blocks shots.\nArrows move; Space jumps (hold for height); X shoots; P pauses; R restarts. Preview buttons restart the ambush, practice the door, retry the checkpoint, or return to the original full Bakery 3.\nThis is an isolated first fight prototype: disguise/reveal, slam, boules and guarded door. Kefir spray, the precision pogo weak point, final defeat animation and level integration follow after playtesting.\n')
with zipfile.ZipFile(out) as z:assert z.testzip() is None;assert z.read('Bakery-3.html').decode()==s
print(out)
