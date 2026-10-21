# Integrated indicator playtest

The design branch now enables all approved visual indicators by default: distinct culture/kefir art, supply art and ammo recharge segments, Fungal fork and Clockwork route plaques, entrance destination signs, shape-based world map, and five-slot oven plaques. Existing flags, boss/puzzle/control text, layouts, encounters and audio remain unchanged.

Open keen/index.html with no query parameters for a normal Bakery 1 start and complete three-world playthrough. Use Q / World map to inspect the map. Historical pilot and explicit scene links still work. Scene shortcuts still require their explicit mode parameter and never run on a normal start.

For before comparisons, add pickups=off&supplies=off&signs=off&map=off&goals=off. Each switch can also disable its own family separately. Missing or failed art retains original visible items/labels.

The test harness explicitly selects the legacy comparison view for existing render snapshots; new integration tests select a normal empty query string. Tests compare all three authored worlds and simulation under both modes, check render purity, and verify normal starts do not grant progress or activate review scenes. The full game/audio suite has 261 tests.

User review: desktop keyboard and mobile touch traversal, first-use pickup recognition, forks and return directions, supply refill, readable map, and locked/ready oven states. Main is unchanged; merge requires approval.
