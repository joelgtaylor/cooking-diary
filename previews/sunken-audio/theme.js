/* Original World 4 audition: Where the Starter Sleeps. No samples.
 * Registers only when explicitly loaded by the isolated audition page.
 * 4/4, 104 BPM, contrasting arrangements, E-major/Lydian colour. Revision 02. */
'use strict';
(function(root){
const unit=60/104/2,length=256;
// Each entry is [eighth-note offset, MIDI pitch, duration in eighth notes].
// Air between gestures is part of the melody; offsets deliberately cross beats.
const phrases=[
 [[0,68,2.5],[3,71,1.5],[6,78,3],[10,75,3],[16,73,2],[19,71,2],[23,68,4],
  [32,66,2.5],[35,70,2],[38,75,3],[43,73,3],[48,71,2],[52,68,2],[57,66,4]],
 [[0,71,3],[4,75,2],[7,78,3],[12,80,3],[16,78,2],[19,75,2],[23,73,4],
  [32,68,3],[36,71,2],[39,75,3],[44,73,2],[48,70,3],[53,66,2],[58,63,4]],
 [[0,80,4],[6,78,3],[11,75,3],[16,76,3],[21,80,2],[25,83,5],
  [32,78,4],[38,75,3],[43,73,3],[48,71,3],[53,70,3],[59,66,3]],
 [[0,68,3],[4,71,2],[7,78,3],[12,75,3],[16,73,3],[21,71,2],[25,68,4],
  [32,66,3],[37,70,3],[42,75,3],[48,71,3],[53,66,3],[58,63,2]]
];
// Two bars per harmony: a warm bakery heart under unfamiliar deep-water light.
const chords=[
 [40,56,59,63],[42,58,61,68],[37,56,59,63],[47,54,61,64],
 [40,56,59,66],[44,59,63,66],[45,56,59,64],[47,58,61,66],
 [37,56,59,66],[45,57,61,68],[42,57,61,68],[47,54,61,66],
 [40,56,59,63],[37,56,59,66],[42,58,61,68],[47,54,58,66]
];
function score(step){
 const s=((step%length)+length)%length,bar=Math.floor(s/8),b=s%8,section=Math.floor(s/64),local=s%64,c=chords[Math.floor(bar/2)];
 const ev=[],add=(n,d,v,k)=>ev.push({n,d:d*unit,v,k});
 const entrance=bar<4,descent=bar>=16&&bar<20,release=bar>=30;
 const lead=phrases[section].find(e=>e[0]===local);
 if(lead)add(lead[1],lead[2],descent?.043:section===3?.064:section===1?.059:.051,'bell');
 // The opening is nearly weightless. Bass and inner rhythm emerge four bars in.
 if(b===0){
  add(c[0],descent?7:entrance?6:3.4,entrance?.060:descent?.080:.100,'bass');
  c.slice(1).forEach(n=>add(n,7.4,descent?.029:entrance?.018:.023,'mist'));
 }
 if(!entrance&&!descent&&!release){
  if(b===3)add(c[0]+(bar%2?12:7),1.3,.049,'bass');
  if(b===6)add(c[0]+12,1.6,.062,'bass');
  if(section===3&&b===7)add(c[0]+7,.7,.038,'bass');
 }
 // Two interlocking voices: little bubbles answer the longer bell phrases.
 if(!entrance&&!release){
  const pattern=section===3?[1,3,4,7]:section===1?[1,4,7]:[3,7];
  if(!descent&&pattern.includes(b))add(c[1+(b%3)]+12,section===3?1.2:1.7,section===3?.032:.026,'pluck');
  if((b===5&&bar%2===0)||(b===2&&bar%2===1))add(c[2]+12,.6,.022,'drop');
 }
 if(entrance&&bar===3&&b===7)add(c[3]+12,.7,.025,'drop');
 // In the deep chamber, a low answer replaces the busier accompaniment.
 if(descent&&(b===4&&bar%2===0))add(c[1]+7,3.4,.037,'glass');
 if(bar>=20&&bar<24&&(b===2||b===5))add(c[b===2?1:3]+12,2,.031,'bell');
 // Final chorus gains a separate rising/falling counterline, then thins out.
 if(section===3&&!release&&[2,5].includes(b))add(c[b===2?2:1]+12,1.7,.035,'glass');
 if(!entrance&&!descent&&!release){
  if(b===0||b===4)add(36,.34,section===3?.046:.037,'kick');
  if(b===6&&bar%4===3)add(c[3]+12,.45,.027,'drop');
 }
 if(bar%8===7&&!release&&[5,6,7].includes(b))add(c[1+(b%3)]+12,.5,.022+(b-5)*.004,'drop');
 return ev;
}
const theme={title:'Where the Starter Sleeps',bpm:104,length,score};
function install(engine){engine.themes.sunken=theme;return theme;}
if(root.CrustSoundtrack)install(root.CrustSoundtrack);
root.SunkenTheme={theme,install};
if(typeof module!=='undefined')module.exports=root.SunkenTheme;
})(typeof window!=='undefined'?window:globalThis);
