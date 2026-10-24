# Sunken Patisserie — concept review handoff

October 22, 2026. Branch: `feature/keen-sunken-patisserie`.
Read `../../SUNKEN_PATISSERIE_DESIGN.md` and `../../CREATIVE_CHARTER.md` first.

## Review decisions

- After playing the movement prototype, Joel selected free swimming over buoyant strokes. Preserve the easier, responsive controls; note the “less natural” feel for later animation/presentation polish. See `../../../previews/sunken/README.md` for the playable prototype status.

- Joel approved all four aquatic enemies and the octopus baker: “excellent, no notes”.
- The initial upright swimming proposal was rejected in favor of natural horizontal human swimming.
- Joel approved the revised horizontal swimming sheet: “Perfect”. This is the authoritative hero pose direction.
- Environment board is supplied for review; explicit environment approval has not yet been recorded.
- A stable horizontal underwater collision body shared by both heroes, with safe transitions to upright on land, was proposed alongside the approved revised poses. Exact dimensions and transition behavior need prototype validation.

## Boards

- [Environment concepts](environment-concepts.png): submerged coral masonry, cream ceramic, copper machinery, glowing fermentation vessels, cold ovens and warm dry pockets.
- [Octopus baker](octopus-baker-concept.png): violet theatrical chef, small lame, broad scraper and localized ink clouds.
- [Aquatic enemies](aquatic-enemies-concept.png): reef patroller, bubble puffer, current rider, armoured crustacean; attack/readiness variants.
- [Approved horizontal hero swimming](heroes-horizontal-swim-concept.png): Loafy top row, Vance bottom; glide, stroke, forward fire and diagonal ascent. Supersedes the upright concept, which is intentionally not included.

These are review concepts, not ready-to-use animation atlases or tilesets. Preserve existing hero identities, outfits and weapons. Production art needs consistent pixel treatment, isolated transparent frames, stable anchors and muzzle metadata. Concept bubbles and firing effects are not baked-in animation requirements. Boss ink must preserve essential player, collision and attack visibility; the illustration alone does not specify render ordering.

## Next session

Build only the small isolated movement prototype described in the design document after confirming the remaining movement/control review gate. Use horizontal swim poses rather than the obsolete upright-body constraint. Retain responsive free swimming in explicit water regions, ordinary dry platforming, quick braking, gentle buoyancy, identical hero physics, no oxygen timer, and swim ascent independent from upward aim as the proposed movement direction.

Validate stable underwater collision geometry, corner clearance, facing changes, water entry/exit clearance, shallow water, checkpoints and restoration of the original dry body. Never change collision dimensions per animation frame or force a wider/taller body into a solid at a boundary. Test weapon origin and rock-blocked muzzle paths for both heroes.

No gameplay implementation or merge was performed in this art session. Full-world integration remains gated on review and playtesting; do not merge without Joel's approval. The prior 416-test baseline belongs to be06bc45; this commit changes only concept assets and documentation.

## Generation provenance

Generated with the built-in image tool in this session; the previous HTTP 400 reasoning-parameter blocker did not recur. Existing `baker-grunge-actions.png`, `vance-wick-concept.webp` and `clockwork-environment.png` were visually inspected. Hero generation used the first two files as direct references.

Prompt briefs: three-panel underwater bakery environment board; theatrical violet octopus chef and lame/scraper/ink attack board; four distinct aquatic enemies with readable silhouette and warning/recovery variants; two-row horizontal human-swimming hero sheet preserving original appearances, with glide, stroke, forward firing and diagonal ascent. No scuba costumes, no red/green-only critical cues. The environment and boss remain concept-level illustrations rather than final pixel assets.
