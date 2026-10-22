# Bakery 2 — discovery districts

Playable review: `/previews/exploration/`. Starts at the normal Bakery 2 entrance.
The required relay divide, five cultures, keeper, canopy and Bloomrot arena remain.
Bakery 2 alone grows from 56 to 72 rows, excavating a cellar below the old floor.
All other sub-floor cells remain solid; spawn, combat, physics and recipes are unchanged.

- **Forgotten Starter Cellar:** two marked hatches at columns 10–12 and 21–22.
  Press E / Open cellar to enter. Preserves the old walking passage until opened.
  Split rooms, old starter shelves, a window, a rolling-pin relic and ordinary-jump
  return climbs make a loop back to the street. No mandatory culture below ground.
- **Giant’s Hollow:** a cutaway mushroom interior under the culture-4 ledge, columns
  69–75. Step off the right end of the culture ledge and turn into its windows/shelves.
  A Spore Compass and repair station sit on the middle landing; jumping out rejoins
  the existing pre-boss checkpoint shelf. No mandatory geometry or culture moved.
- **Old Freight Lift:** column 83, from floor row 54 to canopy row 26. Follow its cable
  into the Hollow to repair it with E / Repair lift. Ride/call from either terminal;
  jump to leave at intermediate shelves. A Freight Token marks the upper terminal.
  The lift is a physical support surface and carries the player at 2.4 px/tick.

Three relics grant 750 points and 10 ammo once per attempt. Their names/found status
persist under `crustQuestCavernRelics`; they never advance culture or recipe progression.
Lift repair, open hatches and current-attempt relics survive checkpoint retries.
Restart restores hatches/lift/relic pickups, retaining the collection record.
Map district labels appear after discovery; the HUD shows relic collection progress.

All additions use native pixel-art geometry and existing materials. Offscreen rooms,
props, relics and lift details are culled. No image readback or per-frame asset generation.

Validation: 364 tests pass, including real-player cellar loops, both returns, Hollow
entry/rejoin, lift locking/repair/both directions/jump-off, persistence, pause, safe
retry/restart and map bounds. The existing continuous five-culture relay route passes.
Bakery 1 and Bakery 3 render hashes match exactly. Browser visual review verified the cellar, Hollow repair prompt, and lift boarding.
