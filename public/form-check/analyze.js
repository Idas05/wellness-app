// Turns pose landmarks into joint angles, counts reps, and scores them against the rules.
// No camera or DOM here, so it can be tested on its own.

export const LM = {
  nose: 0,
  shoulder: [11, 12],
  elbow: [13, 14],
  wrist: [15, 16],
  hip: [23, 24],
  knee: [25, 26],
  ankle: [27, 28],
  foot: [31, 32],
};

const deg = (r) => (r * 180) / Math.PI;

function angle(a, b, c) {
  const v1x = a.x - b.x, v1y = a.y - b.y, v2x = c.x - b.x, v2y = c.y - b.y;
  const d = Math.hypot(v1x, v1y) * Math.hypot(v2x, v2y);
  if (!d) return NaN;
  return deg(Math.acos(Math.max(-1, Math.min(1, (v1x * v2x + v1y * v2y) / d))));
}

/** Tilt of the line from `from` to `to` away from vertical, 0–90°. */
function tilt(from, to) {
  return deg(Math.atan2(Math.abs(to.x - from.x), Math.abs(to.y - from.y)));
}

const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, visibility: Math.min(a.visibility ?? 1, b.visibility ?? 1) });

/** Picks the side (0 = left, 1 = right) the camera sees best for these joints. */
export function bestSide(lms, joints) {
  let l = 0, r = 0;
  for (const j of joints) {
    const idx = LM[j];
    if (!Array.isArray(idx)) continue;
    l += lms[idx[0]]?.visibility ?? 0;
    r += lms[idx[1]]?.visibility ?? 0;
  }
  return r > l ? 1 : 0;
}

/** True when every joint the exercise needs is clearly visible. */
export function visible(lms, joints, view, side, min = 0.5) {
  for (const j of joints) {
    const idx = LM[j];
    if (!Array.isArray(idx)) continue;
    const sides = view === 'front' ? [0, 1] : [side];
    for (const s of sides) if ((lms[idx[s]]?.visibility ?? 0) < min) return false;
  }
  return true;
}

/**
 * All the measurements for one frame. `aspect` is video width ÷ height so that
 * angles aren't squashed by the normalised 0–1 coordinates.
 */
export function features(raw, aspect, view, side) {
  const lms = raw.map((p) => ({ x: p.x * aspect, y: p.y, visibility: p.visibility ?? 1 }));
  const pick = (name, s) => lms[LM[name][s]];
  const sideFeatures = (s) => ({
    elbow: angle(pick('shoulder', s), pick('elbow', s), pick('wrist', s)),
    shoulder: angle(pick('hip', s), pick('shoulder', s), pick('elbow', s)),
    hip: angle(pick('shoulder', s), pick('hip', s), pick('knee', s)),
    knee: angle(pick('hip', s), pick('knee', s), pick('ankle', s)),
    ankle: angle(pick('knee', s), pick('ankle', s), pick('foot', s)),
    forearm: tilt(pick('elbow', s), pick('wrist', s)),
  });

  let f;
  if (view === 'front') {
    const a = sideFeatures(0), b = sideFeatures(1);
    f = {};
    for (const k of Object.keys(a)) f[k] = (a[k] + b[k]) / 2;
    f.elbowDiff = Math.abs(a.elbow - b.elbow);
    f.shoulderDiff = Math.abs(a.shoulder - b.shoulder);
  } else {
    f = sideFeatures(side);
  }

  const sh = mid(pick('shoulder', 0), pick('shoulder', 1));
  const hp = mid(pick('hip', 0), pick('hip', 1));
  f.lean = view === 'front' ? tilt(hp, sh) : tilt(pick('hip', side), pick('shoulder', side));

  const shoulderWidth = Math.abs(pick('shoulder', 0).x - pick('shoulder', 1).x) || 1e-6;
  f.spread = Math.abs(pick('wrist', 0).x - pick('wrist', 1).x) / shoulderWidth;

  f.kneeMin = Math.min(angle(pick('hip', 0), pick('knee', 0), pick('ankle', 0)), angle(pick('hip', 1), pick('knee', 1), pick('ankle', 1)));

  // Plank line: below 180 means hips sag, above 180 means hips are piked up.
  const s = pick('shoulder', side), h = pick('hip', side), an = pick('ankle', side);
  const straight = angle(s, h, an);
  const t = (h.x - s.x) / ((an.x - s.x) || 1e-6);
  const lineY = s.y + t * (an.y - s.y);
  f.body = h.y > lineY ? straight : 360 - straight;

  return f;
}

/**
 * Counts reps from one measurement. A rep starts when the value moves away from
 * where you were resting and ends when it comes most of the way back.
 */
export class RepCounter {
  constructor({ feature, dir, minRom }) {
    this.feature = feature;
    this.dir = dir;
    this.minRom = minRom;
    this.frames = []; // { t, f }
    this.reps = []; // { start, peak, end }
    this.phase = 'rest';
    this.baseline = null;
    this.lastRest = 0;
    this.autoRange = {};
  }

  value(f) {
    if (this.feature !== 'auto') return f[this.feature];
    // General exercises: follow whichever joint has moved the most so far.
    if (!this.reps.length && this.phase === 'rest') {
      let best = 'elbow', bestRange = -1;
      for (const k of ['elbow', 'knee', 'hip', 'shoulder']) {
        const v = f[k];
        if (!Number.isFinite(v)) continue;
        const r = (this.autoRange[k] ??= { lo: v, hi: v });
        r.lo = Math.min(r.lo, v);
        r.hi = Math.max(r.hi, v);
        if (r.hi - r.lo > bestRange) (best = k), (bestRange = r.hi - r.lo);
      }
      if (best !== this.autoFeature) (this.autoFeature = best), (this.baseline = null);
    }
    return f[this.autoFeature ?? 'elbow'];
  }

  dev(v) {
    if (this.dir === 'down') return this.baseline - v;
    if (this.dir === 'up') return v - this.baseline;
    return Math.abs(v - this.baseline);
  }

  /** How "at rest" a value is: higher means closer to the resting end of the movement. */
  restness(v) {
    if (this.dir === 'down') return v;
    if (this.dir === 'up') return -v;
    return -Math.abs(v - (this.anchor ?? v));
  }

  /** Feed one frame. Returns true when a rep was just completed. */
  push(t, f) {
    const v = this.value(f);
    this.frames.push({ t, f, v });
    const i = this.frames.length - 1;
    if (!Number.isFinite(v)) return false;
    if (this.baseline === null) {
      this.baseline = v;
      this.anchor = v;
      this.lastRest = i;
      this.restBest = i;
      return false;
    }
    const d = this.dev(v);
    if (this.phase === 'rest') {
      // Keep stretching the last rep's end, and the next rep's start, to the true
      // resting point, so lockout and full-stretch checks see the whole movement.
      const best = this.frames[this.restBest]?.v;
      if (!Number.isFinite(best) || this.restness(v) >= this.restness(best)) this.restBest = i;
      const last = this.reps[this.reps.length - 1];
      if (last && !last.closed && this.restness(v) >= this.restness(this.frames[last.end].v)) last.end = i;

      if (d > this.minRom * 0.4) {
        if (last) last.closed = true;
        this.phase = 'moving';
        this.start = this.restBest;
        this.peakDev = d;
        this.peak = i;
      } else {
        // Directional moves measure from the most "at rest" point since the last rep, so a
        // slow start can't drag the starting point along with it.
        this.baseline = this.dir === 'any' ? this.baseline * 0.97 + v * 0.03 : this.frames[this.restBest].v;
        this.lastRest = i;
      }
      return false;
    }
    if (d > this.peakDev) {
      this.peakDev = d;
      this.peak = i;
    }
    if (d < this.peakDev * 0.3) {
      this.phase = 'rest';
      this.baseline = v;
      this.lastRest = i;
      this.restBest = i;
      if (this.peakDev >= this.minRom) {
        this.reps.push({ start: this.start, peak: this.peak, end: i, closed: false });
        return true;
      }
    }
    return false;
  }

  /** True while the current rep has just hit a new deepest point. */
  get atNewPeak() {
    return this.phase === 'moving' && this.peak === this.frames.length - 1;
  }
}

function statFor(frames, rep, feature, stat) {
  if (stat === 'duration') return (frames[rep.end].t - frames[rep.start].t) / 1000;
  const slice = frames.slice(rep.start, rep.end + 1).map((x) => x.f[feature]).filter(Number.isFinite);
  if (!slice.length) return NaN;
  if (stat === 'min') return Math.min(...slice);
  if (stat === 'max') return Math.max(...slice);
  if (stat === 'range') return Math.max(...slice) - Math.min(...slice);
  if (stat === 'avg') return slice.reduce((a, b) => a + b, 0) / slice.length;
  if (stat === 'peak') return frames[rep.peak].f[feature];
  return NaN;
}

export function checkScore(check, x) {
  if (!Number.isFinite(x)) return 0;
  const clamp = (n) => Math.max(0, Math.min(1, n));
  const { op, target, tol } = check;
  if (op === '>=') return x >= target ? 1 : clamp(1 - (target - x) / tol);
  if (op === '<=') return x <= target ? 1 : clamp(1 - (x - target) / tol);
  if (op === 'between') {
    const [a, b] = target;
    if (x < a) return clamp(1 - (a - x) / tol);
    if (x > b) return clamp(1 - (x - b) / tol);
    return 1;
  }
  return 0;
}

const median = (xs) => {
  const s = xs.filter(Number.isFinite).sort((a, b) => a - b);
  if (!s.length) return NaN;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

export function ratingLabel(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  return 'Needs work';
}

function plankTip(x) {
  if (x < 165) return 'Your hips are sagging. Squeeze your glutes and brace your abs to keep a straight line.';
  if (x > 195) return 'Your hips are too high. Lower them so your shoulders, hips and ankles line up.';
  return '';
}

/**
 * Scores a set. `frames` are { t (ms), f (features) }; `reps` come from RepCounter.
 * Returns the score out of 100, each check with your number and the goal, and tips.
 */
export function scoreSet(template, frames, reps) {
  const units = (c) => c.unit ?? (c.feature === 'spread' ? '×' : '°');
  const results = [];

  if (template.static) {
    const seconds = frames.length > 1 ? (frames[frames.length - 1].t - frames[0].t) / 1000 : 0;
    for (const c of template.checks) {
      const x = c.feature === 'time' ? seconds : statFor(frames, { start: 0, end: frames.length - 1, peak: 0 }, c.feature, c.stat);
      const s = checkScore(c, x);
      results.push({ ...c, value: x, score: s, unit: units(c), tip: c.id === 'line' ? plankTip(x) : c.tip });
    }
  } else {
    for (const c of template.checks) {
      const feature = c.feature === 'auto' ? undefined : c.feature;
      const values = reps.map((r) => statFor(frames, r, feature ?? autoFeature(frames, r), c.stat));
      const scores = values.map((x) => checkScore(c, x));
      const s = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      const worst = scores.length ? scores.indexOf(Math.min(...scores)) : -1;
      results.push({ ...c, value: median(values), score: s, worstRep: worst, unit: units(c) });
    }
  }

  const totalWeight = results.reduce((a, r) => a + (r.weight ?? 1), 0);
  const score = Math.round((100 * results.reduce((a, r) => a + (r.weight ?? 1) * r.score, 0)) / (totalWeight || 1));
  const tips = results
    .filter((r) => r.score < 0.85 && r.tip)
    .sort((a, b) => (a.weight ?? 1) * a.score - (b.weight ?? 1) * b.score)
    .map((r) => r.tip);

  // The rep that needs the most work, to show its snapshot.
  let worstRep = -1;
  if (reps.length) {
    const perRep = reps.map((r) =>
      template.checks.reduce((a, c) => a + (c.weight ?? 1) * checkScore(c, statFor(frames, r, c.feature === 'auto' ? autoFeature(frames, r) : c.feature, c.stat)), 0),
    );
    worstRep = perRep.indexOf(Math.min(...perRep));
  }

  return { score, label: ratingLabel(score), reps: reps.length, checks: results, tips, worstRep };
}

function autoFeature(frames, rep) {
  let best = 'elbow', bestRange = -1;
  for (const k of ['elbow', 'knee', 'hip', 'shoulder']) {
    const r = statFor(frames, rep, k, 'range');
    if (r > bestRange) (best = k), (bestRange = r);
  }
  return best;
}

/** Joints from the rules that each check points at, for colouring the snapshot. */
export function jointStatus(checks) {
  const out = {};
  for (const c of checks) {
    if (!c.joint) continue;
    const prev = out[c.joint];
    out[c.joint] = prev === undefined ? c.score : Math.min(prev, c.score);
  }
  return out;
}
