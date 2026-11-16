/* Rotapple — saved progress, the current run, the player and stat curves.
   These used to be three long lines of globals in the middle of the game
   script; putting them here means the shape of a save is one file.

   `P` is a live binding: assign through setP so importers see the new body
   after a respawn. Everything else is a mutable object, so property writes
   are visible everywhere without any plumbing. */

import { W } from '../data/weapons.js';

/* ---- saved progress: survives death, written to localStorage ---------- */
export const S = {
  v: 0, e: 0, m: 0,          // vigor / endurance / might
  r: 0,                      // runes
  w: 0,                      // equipped weapon index
  q: 0, rw: 0, pip: 0,       // quest flags: blade given, reward paid, Pip's hint counter
  sh: 0,                     // kite shield owned
  own: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  inv: { herb: 1 },
  taken: {},                 // one-shot pickups already collected
  seenI: {},                 // what the big map is allowed to reveal
  bf: {},                    // bonfires lit, by zone
  ogre: 0                    // Grummash slain
};

/* ---- the current run: rebuilt by loadZone ---------------------------- */
export const G = {
  vz: [{}, {}, {}, {}],      // rooms of each dungeon the player has entered
  z: 0,
  items: [], pw: [], mobs: [], tele: [], proj: [],
  stain: null,               // runes dropped where you died
  pause: 0, t: 0, dlg: 0, banner: null, nums: [],
  hs: 0,                     // hit-stop timer
  tod: 0.33, dayF: 1, bio: null, bioT: 0,
  defeated: [false, false, false],
  seen: [false, false, false]
};

/* ---- the player ------------------------------------------------------ */
export let P = null;
export function setP(v) { P = v; }

/* ---- where the bonfire is in the current zone ------------------------ */
export const BF = { x: 50, y: 200 };
export function setBF(x, y) { BF.x = x; BF.y = y; }

/* ---- the walkable bounds of the current zone ------------------------- */
const WS = 3400, CW = 320;
export const BND = () => G.z === 3
  ? { x0: 20, x1: WS - 20, y0: 20, y1: WS - 20 }
  : { x0: 10, x1: CW - 10, y0: 60, y1: 995 };

/* ---- stat curves ----------------------------------------------------- */
export const mhp = () => 60 + 14 * S.v;
export const mst = () => 60 + 10 * S.e;
export const pdm = () => 13 + 3 * S.m + W[S.w].d + (G.whet > 0 ? 4 : 0);
export const lv = () => 1 + S.v + S.e + S.m;
export const cost = () => 40 + 30 * (lv() - 1);

/* ---- persistence ----------------------------------------------------- */
const SAVE_KEY = 'rotapple.save.v1';

export function saveNow() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      s: S, z: G.z, at: { x: Math.round(P.x), y: Math.round(P.y) }, defeated: G.defeated
    }));
  } catch (e) { /* private browsing: still playable, just not persisted */ }
}

export function loadSave() {
  try {
    const r = localStorage.getItem(SAVE_KEY);
    return r ? JSON.parse(r) : null;
  } catch (e) { return null; }
}

export function wipeSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ }
}
