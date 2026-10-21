# Supply artwork playtest

Approved artwork: heart-scored rye bread, shield-marked banneton basket, wooden one-use ammo/score crate, and a metal ammo rack with full and empty states. Existing culture/kefir artwork, in-game flags, effects, values, damage rules and soundtrack are unchanged.

## URLs

- `keen/index.html?pickups=pilot&supplies=pilot&scene=supplies`: a focused sample row in the real Clockwork maintenance passage. Starts with two health and ten ammo, and the first culture marked collected so it cannot alter the supply test's resource totals. Four sample powerups use the actual pickup/cooldown functions. Walk right to collect health, shield, cache, and ammo. Reload to retry the one-use items.
- `keen/index.html?pickups=pilot&supplies=pilot&scene=ammo`: actual authored Devourer service shelter, with its existing supply placements and normal boss rules. Starts at the right side with ten ammo. Walk left to the rack, then step away to watch the five-second refill; standing within pickup range recollects it immediately on refill, as before.
- Omit `scene` for the full approved levels with replacement art at original positions. Combine `signs=pilot&map=pilot` for the already approved visual previews. Set `supplies=off` for original supply artwork.

Both scene shortcuts are explicit preview-only initialization, do not grant recipes/write storage, and do not alter normal initialization. The sample row changes only that test scene's supply list; the actual shelter shortcut retains its original list. A mission restart follows normal world initialization; reload the preview URL to reset the samples.

## Art and rendering

Project asset: `keen/art/supply-pickups.png`, 1536×1024 RGBA, generated from the approved board with the built-in image tool. Prompt: five isolated sprites on a three-column/two-row transparent atlas: heart loaf, shield banneton, wood ammo/score crate, full metal rack, matching empty metal rack; no words or background, and dark empty gauge windows for runtime animation. Original generated source retained; render-time crops select each object without destructive image edits.

Runtime sizes: bread 38×26, basket 38×30, crate 36×26, rack 40×28. Full and empty racks share dimensions and anchor. The existing numeric ammo amount/countdown remains. Five segments fill from the existing refreshT/refreshTicks state; the renderer does not advance cooldown or grant ammo. The original artwork is the loading/error/default fallback. The culture and kefir renderer is untouched.

Validation: seven new tests cover atlas crops, opt-in/fallback, full/empty state selection, draw purity, exact recharge segments, real item effects and amounts, safe explicit scenes, original shelter supply placement, no recipe/storage writes, and unchanged checkpoint art. Full regression suite and browser playtest must pass before acceptance. No merge without Joel's approval.
