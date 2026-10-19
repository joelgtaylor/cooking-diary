# Mycelium Relay — playable mechanics pass

Bakery 2's Sporelit Stairways now contains the reviewed one-screen puzzle. A tablet shows crescent, fork and spiral. Land on the three mushroom caps with the existing pogo mixer in that order. Ordinary landings and shooting do not activate them. Consecutive contacts on the same cap count once until a different cap is touched. Wrong order resets the lights and plays a harmless descending note.

The solved mushroom grows over 45 simulation ticks, then enables its fixed one-way surface and opens the root doorway. Collision never follows a moving surface. Solved state survives checkpoint recovery, including recovery during the bloom. Unsolved partial progress resets on recovery; restart resets the entire puzzle. No score, recipe, music, input, or jump/bounce constants changed.

Layout changes are bounded to columns 32–63 and rows 20–38. The ceiling and side frame prevent jumping around the local root door; an extra landing outside makes the exit usable with existing physics. The second checkpoint moved from column37 to34 on the same floor to keep its flag off the first symbol. The former enemy at50,28 was removed from this peaceful chamber. Cultures, powerups, the oven, and all outside map cells are preserved. The existing world floor still permits backtracking; this pass does not impose a new global completion requirement.

Artwork remains a functional pixel blockout based on the approved layout study. A dedicated cap/root/tablet art pass follows playtesting. The preview-only chamber restart button is excluded from production.

Validation: all 108 tests pass. New cases cover wrong order, duplicate pogo contacts, ordinary landings, real physics activation and traversal, timed gate/cap collision, paused rendering, checkpoint persistence, world isolation, and local geometry. Original Bakery 2 layout is retained as a fixture so the 4320 historical physics frames remain an unchanged regression check. Only Bakery 2 render traces changed; added dormant, progress, reset, growing and open cases.
