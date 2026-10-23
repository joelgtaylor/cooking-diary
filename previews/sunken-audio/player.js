'use strict';
const audition=CrustSoundtrack.create(),$=id=>document.getElementById(id);
let selected='sunken',serial=0,muted=false,started=0;
function tell(text){$('status').textContent=text;}
function stop(){serial++;audition.stop();$('play').setAttribute('aria-pressed','false');$('compare').setAttribute('aria-pressed','false');$('progress').value=0;$('position').textContent='0:00 / '+(selected==='sunken'?'1:14':'1:04');}
async function play(id){
 stop();selected=id;const token=serial,t=CrustSoundtrack.themes[id];
 try{await audition.start(id);if(token!==serial)return;
  if(muted){tell('Muted — tap Unmute to hear the selected theme.');return;}
  started=audition.context.currentTime;
  $(id==='sunken'?'play':'compare').setAttribute('aria-pressed','true');
  $('progress').max=t.length*60/t.bpm/2;
  tell('Playing · '+t.title+(id==='bakery2'?' · approved cavern comparison':''));
 }catch{tell('Audio unavailable. Please try another browser.');}
}
$('play').onclick=()=>play('sunken');$('compare').onclick=()=>play('bakery2');
$('stop').onclick=()=>{stop();tell('Stopped — ready to listen.');};
$('mute').onclick=()=>{muted=!muted;audition.mute(muted);$('mute').textContent=muted?'Unmute':'Mute';$('mute').setAttribute('aria-pressed',String(muted));if(muted){serial++;$('play').setAttribute('aria-pressed','false');$('compare').setAttribute('aria-pressed','false');tell('Muted.');}else play(selected);};
document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();audition.visibility(true).catch(()=>{});tell('Stopped while away — tap Play to resume.');}else audition.visibility(false).catch(()=>{});});
setInterval(()=>{if(!audition.status().playing||!audition.context)return;const duration=Number($('progress').max),p=(audition.context.currentTime-started)%duration;$('progress').value=p;const fmt=t=>Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0');$('position').textContent=fmt(p)+' / '+fmt(Math.round(duration));},200);
