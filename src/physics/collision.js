/* Rotapple — collision.

   Broadphase and narrowphase come from `detect-collisions` (an rbush-backed
   spatial index plus SAT shape tests) instead of the hand-rolled collider
   array and its full scans. What stays local is only the part that is game
   design rather than geometry: how hard a body is pushed out of a wall.

   Colliders live on the XZ plane; the game is effectively 2D.

   API note: this build of the library exposes per-body queries as
   `System.checkOne(body, cb)` — `cb` receives a SAT Response and returning
   false stops the walk. Circles are constructed as (position, radius). */

import { System, Circle, Polygon } from 'detect-collisions';

export const COL = [];              // authored collider records (minimap, scaling)
const sys = new System();
const recBody = new Map();          // record -> body
const bodyRec = new Map();          // body -> record

/* One query circle per distinct radius, inserted once and moved around
   rather than building a body per query — line-of-sight checks run
   thousands of these a second. */
const queries = new Map();
function queryCircle(rad) {
  let q = queries.get(rad);
  if (!q) {
    q = new Circle({ x: 0, y: 0 }, rad);
    q.__query = true;
    sys.insert(q);
    queries.set(rad, q);
  }
  return q;
}

function rectPolygon(cx, cy, w, d) {
  const hw = w / 2, hd = d / 2;
  return new Polygon({ x: cx, y: cy }, [
    { x: -hw, y: -hd }, { x: hw, y: -hd }, { x: hw, y: hd }, { x: -hw, y: hd }
  ]);
}

/* ---- authoring ------------------------------------------------------- */

export function cCir(k, x, y, r) {
  const rec = { k, x, y, r };
  COL.push(rec);
  const b = new Circle({ x, y }, r);
  sys.insert(b);
  recBody.set(rec, b); bodyRec.set(b, rec);
  return rec;
}

export function cBox(k, cx, cy, w, d) {
  const rec = { k, x0: cx - w / 2, y0: cy - d / 2, x1: cx + w / 2, y1: cy + d / 2 };
  COL.push(rec);
  const b = rectPolygon(cx, cy, w, d);
  sys.insert(b);
  recBody.set(rec, b); bodyRec.set(b, rec);
  return rec;
}

export function removeCollider(rec) {
  const b = recBody.get(rec);
  if (b) { sys.remove(b); recBody.delete(rec); bodyRec.delete(b); }
  const i = COL.indexOf(rec);
  if (i >= 0) COL.splice(i, 1);
}

export function clearColliders() {
  COL.length = 0;
  recBody.clear();
  bodyRec.clear();
  for (const q of queries.values()) sys.remove(q);
  queries.clear();
  sys.clear();
}

/* a structure authored at human scale is scaled onto its plot afterwards */
export function scaleColliders(cols, cx, cz, s) {
  for (const rec of cols) {
    const b = recBody.get(rec);
    if (rec.r != null) {
      rec.x = cx + (rec.x - cx) * s;
      rec.y = cz + (rec.y - cz) * s;
      rec.r *= s;
      if (b) b.setPosition(rec.x, rec.y);
    } else {
      rec.x0 = cx + (rec.x0 - cx) * s;
      rec.x1 = cx + (rec.x1 - cx) * s;
      rec.y0 = cz + (rec.y0 - cz) * s;
      rec.y1 = cz + (rec.y1 - cz) * s;
      if (b) b.setPosition((rec.x0 + rec.x1) / 2, (rec.y0 + rec.y1) / 2);
    }
  }
}

/* ---- queries --------------------------------------------------------- */

/* Is anything solid within `rad` of (x,y)? */
export function solidAt(x, y, rad) {
  const q = queryCircle(rad);
  q.setPosition(x, y);
  let hit = false;
  sys.checkOne(q, res => {
    const other = res.a === q ? res.b : res.a;
    if (other.__query) return true;
    if (res.overlap > 0) { hit = true; return false; }
    return true;
  });
  return hit;
}

/* Unobstructed straight line between two points? The game sampled along the
   segment originally, which is cheap and good enough for creature sight. */
const LOS_STEP = 9;
export function losClear(ax, ay, bx, by, rad) {
  const d = Math.hypot(bx - ax, by - ay);
  const n = Math.max(2, Math.ceil(d / LOS_STEP));
  for (let i = 1; i < n; i++) {
    const t = i / n;
    if (solidAt(ax + (bx - ax) * t, ay + (by - ay) * t, rad)) return false;
  }
  return true;
}

/* ---- resolution ------------------------------------------------------ */

/* Push a circle body out of any static collider it has entered. The library
   finds the overlaps; the separation itself is cheap circle/AABB maths with
   the game's own tuning. */
export function push(e, rad) {
  for (let it = 0; it < 2; it++) {
    const q = queryCircle(rad);
    q.setPosition(e.x, e.y);
    sys.checkOne(q, res => {
      const other = res.a === q ? res.b : res.a;
      if (other.__query) return true;
      const rec = bodyRec.get(other);
      if (!rec || res.overlap <= 0) return true;

      if (rec.r != null) {
        const dx = e.x - rec.x, dy = e.y - rec.y, m = rad + rec.r;
        const d = Math.hypot(dx, dy);
        if (d >= m) return true;
        if (d < 0.001) { e.x += m; return true; }
        e.x = rec.x + dx / d * m;
        e.y = rec.y + dy / d * m;
      } else {
        const qx = Math.max(rec.x0, Math.min(rec.x1, e.x));
        const qy = Math.max(rec.y0, Math.min(rec.y1, e.y));
        const dx = e.x - qx, dy = e.y - qy, d2 = dx * dx + dy * dy;
        if (d2 >= rad * rad) return true;
        if (d2 > 1e-6) {
          const d = Math.sqrt(d2);
          e.x = qx + dx / d * rad;
          e.y = qy + dy / d * rad;
        } else {
          const l = e.x - rec.x0, r = rec.x1 - e.x, t = e.y - rec.y0, b = rec.y1 - e.y;
          const mn = Math.min(l, r, t, b);
          if (mn === l) e.x = rec.x0 - rad;
          else if (mn === r) e.x = rec.x1 + rad;
          else if (mn === t) e.y = rec.y0 - rad;
          else e.y = rec.y1 + rad;
        }
      }
      return true;
    });
  }
}

/* Sub-stepped movement, so a fast body cannot tunnel through a wall. */
export function mv(e, dx, dy, rad) {
  const n = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 3));
  for (let i = 0; i < n; i++) {
    e.x += dx / n;
    e.y += dy / n;
    push(e, rad);
  }
}
