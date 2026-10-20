# Bakery Entry indicator audition
Direction A approved by Joel on 20 October 2026. Limited rendering-only implementation.
First culture: permanent YEAST badge omitted; original jar, halo, glints and pickup feedback retained.
First checkpoint: wooden pole, folded inactive cloth, broad checked saved cloth, double current-foot marker; CHECKPOINT SAVED appears for 120 render ticks after observed activation. Existing gameplay checkpoint floater also remains. No new controls, collisions, enemy changes, audio changes or room signage changes.
All other cultures/checkpoints and all other worlds remain unchanged. Opt-in query: ?indicators=pilot. No query gives the original rendering path.
Shared-source audition:
https://raw.githack.com/joelgtaylor/cooking-diary/design/keen-world-polish/keen/index.html?indicators=pilot
Comparison:
https://raw.githack.com/joelgtaylor/cooking-diary/design/keen-world-polish/keen/index.html?indicators=off
Third-party branch previews can cache resources; prefer commit-pinned links supplied in review.
Verification pending: this session has no execution environment or cloud browser. Added entry-indicators.test.cjs but did not run it or existing tests. Required gate: node --test keen/tests/*.test.cjs. Historical render baselines were not rewritten.
Review on desktop and mobile: approach first flag from spawn, activate, wait two seconds, collect first jar. Check flag support, contrast, legibility at mobile scale, overlap with player, folded vs saved silhouette, current vs passed foot state, and return-to-checkpoint behavior. Verify first-use objective remains readable in existing HUD/status/help. Compare identical camera positions in both links. Grayscale inspection pending.
No before/after screenshots or browser-verified playback claimed. No merge approval requested until visual and regression verification are complete.
