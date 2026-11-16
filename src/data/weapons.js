/* Rotapple — the armory.

   d    damage added to the base
   r    reach in world units
   len  how far the blade projects from the fist (drives the swinging mesh)
   col  steel / magic colour
   p    rune price in a shop (0 = found, never bought)
   fx   whether the blade takes an emissive glow
   em   the emissive colour, when fx is set
   ab   special ability keyword handled by combat/abilities.js
   ad   the ability's description, shown in the shop and the inventory
*/
export const W = [
  { n: 'Bare Fists', d: -6, r: 14, len: 0, col: 0, p: 0 },
  { n: 'Pilgrim’s Blade', d: 0, r: 20, len: 1, col: 0xcfd8e0, p: 0 },
  { n: 'Orchard Hatchet', d: 5, r: 17, len: 0.7, col: 0x9a9a8a, p: 110 },
  { n: 'Iron Falchion', d: 9, r: 22, len: 1.05, col: 0xb8c4d0, p: 240 },
  { n: 'Bone Saber', d: 8, r: 24, len: 1.15, col: 0xe8e0c8, p: 200 },
  { n: 'Vesper’s Fang', d: 14, r: 23, len: 1.1, col: 0xb070ff, p: 420, fx: 1 },
  { n: 'Emberbrand', d: 12, r: 21, len: 1.1, col: 0xff7a30, p: 380, fx: 1 },
  { n: 'Harebone Greatsword', d: 22, r: 30, len: 1.6, col: 0xaab8c8, p: 650 },

  /* the three relics, one per hollow lord */
  {
    n: 'Blood-Apple Cleaver', d: 11, r: 19, len: 0.9, col: 0xd01428, p: 0, fx: 1, em: 0xa00010,
    ab: 'leech', ad: 'Bloodletter: every hit heals you for 18% of the damage dealt.'
  },
  {
    n: 'Nightfall Scythe', d: 13, r: 24, len: 1.25, col: 0x9a60ff, p: 0, fx: 1, em: 0x5a20c0,
    ab: 'wave', ad: 'Umbral Crescent: each swing looses a piercing dark crescent. Heavy attacks fire three.'
  },
  {
    n: 'Tidecaller Cutlass', d: 16, r: 23, len: 1.1, col: 0x40e0c0, p: 0, fx: 1, em: 0x10a080,
    ab: 'storm', ad: 'Stormcall: each hit arcs lightning to a nearby foe. Heavy attacks arc to three.'
  },

  /* the ogre's weapon, taken from his corpse */
  { n: 'Grummash’s Maul', d: 19, r: 27, len: 1.35, col: 0xa89870, p: 0, ad: 'A crude hammer of ogre bone and iron. Long reach, heavy hits.' }
];
