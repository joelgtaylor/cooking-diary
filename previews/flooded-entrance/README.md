# The Flooded Entrance — environmental slice

Milestone 3, October 23, 2026. Review the first Sunken Patisserie room with new architectural art, parallax and a reef patroller. The approved free-swim tuning is shared directly with `../sunken/`; this is an isolated preview, not a fourth campaign world or a merge to main.

## Play

Serve the repository root and open `previews/flooded-entrance/index.html`. The published review link uses a commit-specific hosted preview. `?scene=reef` is a visual inspection entry beside the first fish; omit it for the normal dry bakehouse entrance.

Walk right into the water, explore the chamber, descend through the submerged passage and rise beside the far dry ledge. Three optional rings mark different depths. The flag confirms exploration. A checkpoint activates after the submerged passage.

Arrows/WASD swim. X/K shoots. Space + Shoot aims up underwater; swimming up alone keeps forward aim. Both heroes, pause, fullscreen and the approved touch controls are retained. There is no oxygen timer. The old movement course remains at `previews/sunken/index.html`.

## First enemy

One reef patroller swims a fixed horizontal lane with gentle bobbing. It braces its fins for 24 simulation ticks before reversing. Contact costs one heart and grants 90 ticks of invulnerability. A shot defeats it once; it tilts, drifts upward and dissolves into a few bubbles over 36 ticks. Defeated fish cannot hurt the player. Restart/checkpoint recovery restores the encounter safely.

The first patrol begins well beyond the dry landing and can be bypassed above or below. It neither homes on the hero nor fires projectiles. Both heroes use the same hitbox and damage rules.

## Art and presentation

- `environment-kit.png`: new transparent architectural sheet, 1774×887. Ceramic/limestone arch, warm dry oven and counter, cold copper oven, glowing fermentation jars, ledges and bubble machinery. Crops are metadata in `environment.js`; the generated source is unchanged.
- `reef-patroller.png`: new transparent 2172×724 sheet derived from the approved aquatic concept. Three tail/fin poses and a turning pose share a stable head anchor and fixed 48×40 collision body.
- Existing approved environment concepts provide the far bakery skyline; subdued arch samples form a middle layer; local machinery/coral sit in world space. A depth gradient hides the source-image edge. Actors, hazards and pale collision outlines retain visual priority.

The architecture sheet is used for detailed tile materials and supported shelf facades. Flat pale ledge caps coincide with collision. Decorative ovens, jars and background arches are drawn behind the heroes. Water has its own surface band, moving line and cooler body wash; the dry bakehouse retains warm lighting. Particles are sparse and there are no full-screen distortion filters.

Generation used the built-in image tool. Prompt briefs: isolated side-view cream ceramic/coral bakery architecture, copper ovens/jars/vent, crisp grungy 16-bit pixels and transparent gaps; then a four-pose teal reef fish sheet preserving the approved broad fan tail, pale flank stripe, cream jaw and annoyed eye, with subtle fin/tail changes and no baked-in bubbles. The aquatic concept was the direct identity reference for the fish. Source assets were copied into this Git-backed preview after generation.

## Validation and boundaries

`node --test keen/tests/*.test.cjs previews/audio/audio.test.cjs`: **440 passed, 0 failed**. Eight added tests cover patrol bounds/turn pauses, damage/defeat, swept shots blocked by rock, checkpoint recovery, identical approved movement before encounters, both-hero traversal and absence of recipe writes. The shared preview test harness accepts an explicit HTML path so each page is exercised with the real module order.

Browser review checks startup, loaded art, the first encounter and water readability. Physical phone performance/multitouch and subjective environment/enemy review remain user playtests. Existing three-world production source, progression and save keys have not changed. This preview still uses temporary hero swim pose samples and the existing cavern soundtrack. Other aquatic enemies, full World 4 geometry, environmental controls and the octopus boss are later milestones.

Rebuild with `node previews/flooded-entrance/build.cjs`. It derives the page from the shared swim preview and adds only the environment/enemy adapter; no campaign entry point loads these modules.
