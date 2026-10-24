# The Sunken Patisserie — campaign release

World 4 follows Clockwork Ovens via `CrustWorlds` in `world-registry.js`.
The main menu offers returning players a direct entrance when recipe 3 is unlocked.
The fourth recipe is Sea Salt Sourdough Crackers; only entering the finishing oven
following all five cultures and the Master's complete defeat awards it. Existing
recipe IDs 0–2, best score, character selection and control preferences are retained.
The credits now conclude World 4. Replay returns to the Moonlit Bakery.

## Isolation and packaging

`sunken.html` uses the production shell, characters, fixed timestep and dry controller.
Its water controller installs only on that page. The first three worlds do not load
water scripts or assets. Page navigation starts the new world at its entrance and
requires a fresh gesture to start audio, consistent with the ordinary start menu.

`node keen/tools/build-sunken.cjs` promotes the approved review sources into
`keen/sunken/` and generates `keen/sunken.html`. Runtime references never reach
outside `keen/`. Review-only boss/oven shortcuts are disabled in the production
assembly. The separate review pages remain available for attack iteration.
The production campaign adapter owns persistent completion writes; review scenes
cannot award recipes. Do not edit generated modules directly; change their approved
source and rebuild. `keen/sunken/campaign.js` is the authored production adapter.

The full-obstruction ink behavior, reduced-obstruction preference, one Current Rider,
36-HP staged fight, fixed-scale generated arm poses and theatrical defeat retain
the reviewed tuning. The original E Dorian score and underwater music bus are shipped
with the water page. Effects bypass the music filter; pause/mute/visibility lifecycle
remains shared. Saves contain recipe unlocks, not resumable mid-level positions.

## Validation

Run the regression command in `.github/workflows/keen-tests.yml` (529 tests).
The original dry-world canvas trace baselines remain unchanged. Campaign tests cover
World 3 → World 4 navigation, three-recipe saves, fourth-recipe completion/reload,
best-score retention, credits, water-only touch controls, accessibility preference,
production asset paths and disabled review shortcuts. Existing route and boss tests
cover real controller movement, crab combat, combined fight and finishing-room entry.
Manual complete-level playtest was approved before integration.

Global touch/jump follow-up remains in `FOLLOW_UPS.md` for a separate change.
