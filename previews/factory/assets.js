/* Production image registration, including the original fallback artwork.
 * Called once during setup; load order and renderer fallback choices are retained.
 */
'use strict';
const assets={};
function loadArt(name,uri){const img=new Image();img.src=uri;assets[name]=img}
function loadGameArt(){
loadArt('myceliumAtlas','art/mycelium-relay-atlas.png');
// Bakery 1 stone coping, slate ledges and opaque masonry (8 variants/row).
loadArt('moonlitTerrain','art/moonlit-terrain.png');
loadArt('cavernTerrain','art/cavern-terrain.png');
loadArt('forgeTerrain','art/forge-terrain.png');
loadArt('foremanDefeated','art/foreman-defeated.png');
loadArt('foremanSweep','art/foreman-sweep.png');
loadArt('foremanConcept','art/foreman-concept.png');
loadArt('grandOvens','art/grand-ovens.png');
loadArt('spikeHazards','art/spike-hazards.png');
// CRUST_MUSHROOM_CITY_BG_V1: generated 960x540 background, Bakery 2 only.
// Kept separate from Phase3 art so it can fall back safely if not loaded.
loadArt('generatedMushroomBG','art/bioluminescent-mushroom-city.webp');
 // CRUST_COMPLETE_TRILOGY_BG_V1: matching AI-generated backdrops.
 // File-based images, loaded once; original Phase 3 backgrounds remain fallbacks.
loadArt('generatedMoonlitBG','art/moonlit-bakery-city.webp');
loadArt('generatedClockworkBG','art/clockwork-oven.webp');
 // PHASE2_1_BAKERY1_ART: authentic rendered transparency; no procedural scenery.
 loadArt('bakery1ParallaxFar','art/bakery1-parallax-far.webp');
 loadArt('bakery1ParallaxMid','art/bakery1-parallax-mid.webp');
 loadArt('bakery1ParallaxNear','art/bakery1-parallax-near.webp');
 // Bakery 2 approved, generated, three-layer cavern illustrations.
 loadArt('bakery2ParallaxFar','art/bakery2-parallax-far.webp');
loadArt('bakery2ParallaxMid','art/bakery2-parallax-mid.webp');
loadArt('bakery2ParallaxNear','art/bakery2-parallax-near.webp');
loadArt('bakery3ParallaxFar','art/bakery3-parallax-far.webp');
 loadArt('bakery3ParallaxMid','art/bakery3-parallax-mid.webp');
 loadArt('bakery3ParallaxNear','art/bakery3-parallax-near.webp');
// CRUST_ENVIRONMENT_ART_V1: compact 256x256 / 64px-per-cell concept-art atlas.
loadArt('environmentDecor',window.__CRUST_ENVIRONMENT_ATLAS);
loadArt('checkpointFlags',window.__CRUST_CHECKPOINT_FLAG_ART);
// CRUST_DOUGH_GREMLINS_V1: compact transparent 4x4 animation atlases
// derived from the two approved character sheets. Load asynchronously,
// preserving the original item tile as a fallback if they are unavailable.
loadArt('gremlinRun','art/dough-gremlins-primary.png');
loadArt('gremlinExpressions','art/dough-gremlins-expressions.png');
// Stable production baker atlas.
loadArt('bakerAI','art/baker-ai-solid.png');
// Original hand-pixeled backgrounds retained as load-failure fallbacks.
loadArt('retroStage1','art/fallback-retro-stage-1.png');
loadArt('retroStage2','art/fallback-retro-stage-2.png');
loadArt('retroStage3','art/fallback-retro-stage-3.png');
// Original multi-action baker atlas retained as a fallback.
// CRUST_REIMAGINED: larger baker atlas (art in art/baker-reimagined.js)
if(window.__BAKER_REIMAGINED)loadArt('bakerReimagined',window.__BAKER_REIMAGINED);
loadArt('bakerPhase4','art/fallback-baker-phase4.png');

loadArt('tiles','art/fallback-tiles.png');loadArt('background','art/fallback-background.png');loadArt('items','art/fallback-items.png');
}
