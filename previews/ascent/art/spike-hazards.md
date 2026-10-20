# Readable spike hazards

`spike-hazards.png` is a 96 × 32 transparent atlas: one 32 × 32 cell per
bakery. All three designs share three sharp points, pale tips, a dark outline
and a heavy base. Materials vary between steel/stone, mineral/basalt and
steel/riveted iron. Readability relies on silhouette and luminance rather than
red/green colour distinctions. No glow, collectible sparkle or additional
particles are introduced.

Each sprite draws exactly into its existing ^ map cell. Collision, damage,
placement, enemy behaviour and level geometry are unchanged. Until the atlas
loads, the earlier environment-atlas artwork remains available. If neither
image is available, a procedural three-spike fallback draws in the actual
hazard cell; this fixes an old draw-only bug that used hard-coded row 14/15
coordinates from the former level layout.

Built-in image generation used the approved October 18 three-world hazard
concept as reference. Prompt: three isolated square 32px-style spike traps in
one row on transparent background; tall central and shorter side spikes,
pale ivory tips, dark outlines, material-matched bases, no scenery/floor,
labels, glow, fire, perspective or extra props. The 2172 × 724 generated sheet
was divided into three 724px-wide columns. Alpha-bound crops within each column
were (47,106)-(671,629), (48,106)-(674,629) and (52,106)-(677,629); each was
reduced to 32 × 32 with nearest-neighbour sampling.
