/* Step 1: render-only scale/arena preview. The Foreman is not a combat actor. */
'use strict';
function drawForemanPreview(){
 const court=currentVerticalLayout().forecourt,art=assets.foremanConcept;
 if(bakery!==1||!court||!art||!art.complete||art.naturalWidth!==1331)return;
 const {x,width,height}=court.foreman,base=court.floor*T;
 if(x*T+width<camera||x*T>camera+W||base<cameraY||base-height>cameraY+H)return;
 g.save();
 g.fillStyle='rgba(12,14,27,.36)';g.beginPath();g.ellipse(x*T+width*.62,base,54,5,0,0,Math.PI*2);g.fill();
 g.imageSmoothingEnabled=false;// Crop transparent export padding at render time to align the feet.
 g.drawImage(art,16,18,1314,1131,x*T,base-height,width,height);
 g.restore();
}
