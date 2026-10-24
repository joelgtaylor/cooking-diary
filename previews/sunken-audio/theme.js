/* Original World 4 audition: Where the Starter Sleeps. No samples.
 * Registers only when explicitly loaded by the isolated audition page.
 * 4/4, 104 BPM, contrasting arrangements, E Dorian. Revision 04. */
'use strict';
(function(root){
const unit=60/104/2,length=256;
// E Dorian: E F# G A B C# D. A recurring E–G–A–B–C#–B hook
// makes the raised sixth audible, with answering phrases returning to E.
// Each entry is [eighth-note offset, MIDI pitch, duration in eighth notes].
const phrases=[
 [[0,64,2],[2,67,1],[3,69,1],[4,71,2],[6,73,1],[7,71,2],
  [10,69,2],[12,67,2],[14,66,2],[16,64,5],
  [32,64,2],[34,67,1],[35,69,1],[36,71,2],[38,73,1],[39,71,2],
  [42,69,2],[44,66,2],[46,62,2],[48,64,6]],
 [[0,64,2],[2,67,1],[3,69,1],[4,71,2],[6,73,1],[7,71,2],
  [10,74,2],[12,73,2],[14,71,2],[16,69,3],[20,67,2],[24,66,4],
  [32,67,2],[34,69,1],[35,71,1],[36,73,2],[38,74,1],[39,73,2],
  [42,71,2],[44,69,2],[46,66,2],[48,64,6]],
 [[0,64,4],[6,67,2],[8,69,4],[14,71,2],[16,73,6],[24,71,5],
  [32,69,3],[36,71,2],[38,73,2],[40,74,3],[44,73,2],[46,71,2],
  [48,69,3],[52,67,2],[56,66,4]],
 [[0,76,2],[2,79,1],[3,81,1],[4,83,2],[6,85,1],[7,83,2],
  [10,81,2],[12,79,2],[14,78,2],[16,76,3],[20,74,2],[24,73,4],
  [32,64,2],[34,67,1],[35,69,1],[36,71,2],[38,73,1],[39,71,2],
  [42,69,2],[44,67,2],[46,66,2],[48,64,6],[58,62,2]]
];
// The approved open-water chorus now frames the whole piece.
const openWater=phrases[3];
phrases[0]=openWater;
phrases[2]=[
 [0,71,2],[2,73,1],[3,74,1],[4,78,3],[8,76,2],[10,74,2],[12,73,3],
 [16,71,2],[18,73,1],[19,74,1],[20,78,3],[24,81,2],[26,78,2],[28,76,3],
 [32,78,2],[34,81,1],[35,83,1],[36,81,3],[40,78,2],[42,76,2],[44,74,3],
 [48,73,3],[52,71,2],[54,69,2],[56,66,3],[60,71,3]
];
// Em9 ↔ A9 establishes the minor tonic / major IV Dorian identity.
// All pitched accompaniment stays in the same mode, including bass fifths.
const chords=[
 [40,55,59,66],[45,55,61,64],[47,54,57,62],[40,55,59,66],
 [40,55,59,66],[45,55,61,64],[38,54,57,64],[47,54,57,62],
 [47,54,57,62],[42,57,61,64],[45,55,61,64],[47,57,64,66],
 [40,55,59,66],[45,55,61,64],[47,54,57,62],[40,55,59,66]
];
function score(step){
 const s=((step%length)+length)%length,bar=Math.floor(s/8),b=s%8,section=Math.floor(s/64),local=s%64,c=chords[Math.floor(bar/2)];
 const ev=[],add=(n,d,v,k)=>ev.push({n,d:d*unit,v,k});
 const open=section===0||section===3,tension=section===2,release=bar===31;
 const lead=phrases[section].find(e=>e[0]===local);
 if(lead)add(lead[1],lead[2],open?.064:tension?.060:.057,'bell');
 // Begin with the approved full open-water texture; tonic returns at the end.
 if(b===0){
  add(c[0],3.4,tension?.095:.100,'bass');
  c.slice(1).forEach(n=>add(n,7.4,tension?.025:.023,'mist'));
 }
 if(!release){
  if(b===3)add(c[0]+(bar%2?12:7),1.3,.049,'bass');
  if(b===6)add(c[0]+12,1.6,.062,'bass');
  if((open||tension)&&b===7)add(c[0]+7,.7,.038,'bass');
 }
 // Two interlocking voices: little bubbles answer the longer bell phrases.
 if(!release){
  const pattern=tension?[1,2,4,7]:open?[1,3,4,7]:[1,4,7];
  if(pattern.includes(b))add(c[1+(b%3)]+12,open||tension?1.2:1.7,open?.032:tension?.029:.026,'pluck');
  if((b===5&&bar%2===0)||(b===2&&bar%2===1))add(c[2]+12,.6,.022,'drop');
 }
 // Suspended harmony and a rising answer create mild pressure without a tempo jump.
 if(tension&&[2,5].includes(b))add(c[b===2?2:1]+12,1.5,.032,'glass');
 // Final chorus gains a separate rising/falling counterline, then thins out.
 if(open&&!release&&[2,5].includes(b))add(c[b===2?2:1]+12,1.7,.035,'glass');
 if(!release){
  if(b===0||b===4)add(36,.34,open?.046:tension?.043:.037,'kick');
  if(b===6&&bar%4===3)add(c[3]+12,.45,.027,'drop');
 }
 if(bar%8===7&&!release&&[5,6,7].includes(b))add(c[1+(b%3)]+12,.5,.022+(b-5)*.004,'drop');
 return ev;
}
const theme={structure:'Open water → exploration → gathering current → open-water return',mode:'E Dorian',title:'Where the Starter Sleeps',bpm:104,length,score};
function install(engine){engine.themes.sunken=theme;return theme;}
if(root.CrustSoundtrack)install(root.CrustSoundtrack);
root.SunkenTheme={theme,install};
if(typeof module!=='undefined')module.exports=root.SunkenTheme;
})(typeof window!=='undefined'?window:globalThis);
