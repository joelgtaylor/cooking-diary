/* Campaign destinations. A separate water page isolates its controller from dry worlds. */
'use strict';
window.CrustWorlds=Object.freeze([
 {id:1,name:'Moonlit Bakery'},
 {id:2,name:'Fungal Caverns'},
 {id:3,name:'Clockwork Ovens'},
 {id:4,name:'The Sunken Patisserie',href:'sunken.html',recipe:{
  name:'Sea Salt Sourdough Crackers',sub:'A crisp finish to the Sunken Patisserie',
  ing:['100g sourdough discard','30g melted butter','60g all-purpose flour','2g fine sea salt','Flaky sea salt, to finish'],
  steps:['Mix discard, butter, flour and fine salt into a soft dough.','Roll very thin between baking parchment; score into crackers.','Sprinkle lightly with flaky salt. Bake at 175°C / 350°F for 20–25 minutes until crisp and golden.','Cool completely before storing airtight.']
 }}
].map(world=>Object.freeze(world)));
