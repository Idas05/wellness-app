import { LM, RepCounter, bestSide, features, jointStatus, scoreSet, visible } from './analyze.js';
import { templateFor } from './rules.js';

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const exercise = params.get('exercise') || 'Exercise';
const template = templateFor(exercise);

const MODEL_LOCAL = './lib/pose_landmarker_lite.task';
const MODEL_REMOTE = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';
const MAX_REPS = 5;
const MAX_SECONDS = template.static ? 90 : 60;

const BONES = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24],
  [23, 25], [25, 27], [27, 31], [24, 26], [26, 28], [28, 32],
];
const COLORS = { good: '#3E8E5A', ok: '#D9922E', bad: '#C8553D', key: '#4C8DF6' };
const statusColor = (s) => (s >= 0.85 ? COLORS.good : s >= 0.5 ? COLORS.ok : COLORS.bad);

// ---- Talking to the app around this page (phone WebView or website iframe) ----
function send(msg) {
  const data = { source: 'form-check', exercise, ...msg };
  if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(data));
  else if (window.parent !== window) window.parent.postMessage(data, '*');
}
function leave() {
  stopCamera();
  if (window.ReactNativeWebView || window.parent !== window) send({ type: 'close' });
  else history.length > 1 ? history.back() : (location.href = '../workout');
}

// ---- Setup screen ----
$('exercise-name').textContent = exercise;
$('setup-tip').textContent = template.setup;
const jointWords = { shoulder: 'shoulders', elbow: 'elbows', wrist: 'wrists', hip: 'hips', knee: 'knees', ankle: 'ankles', foot: 'feet' };
const words = template.joints.map((j) => jointWords[j]);
$('setup-joints').textContent = words.length > 1 ? `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}` : words[0];
$('setup-reps').textContent = template.static ? 'your plank hold' : `3–${MAX_REPS} reps`;
$('close').onclick = leave;
$('done').onclick = leave;

// ---- Pose model ----
let landmarker = null;
async function loadModel() {
  if (landmarker) return landmarker;
  const vision = await import('./lib/vision_bundle.mjs');
  const fileset = await vision.FilesetResolver.forVisionTasks(new URL('./lib/wasm', location.href).href);
  const make = (modelAssetPath, delegate) =>
    vision.PoseLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath, delegate },
      runningMode: 'VIDEO',
      numPoses: 1,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
  const model = (await fetch(MODEL_LOCAL, { method: 'HEAD' }).then((r) => r.ok).catch(() => false)) ? MODEL_LOCAL : MODEL_REMOTE;
  try {
    landmarker = await make(model, 'GPU');
  } catch {
    landmarker = await make(model, 'CPU');
  }
  return landmarker;
}

// ---- Camera ----
const video = $('video');
const canvas = $('overlay');
const ctx = canvas.getContext('2d');
let stream = null;
let facing = 'user';

async function startCamera() {
  stopCamera();
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { facingMode: facing, width: { ideal: 720 }, height: { ideal: 960 } },
  });
  video.srcObject = stream;
  await video.play();
  $('stage').classList.toggle('mirror', facing === 'user');
}
function stopCamera() {
  stream?.getTracks().forEach((t) => t.stop());
  stream = null;
  cancelAnimationFrame(raf);
}

// ---- Recording state ----
let raf = 0;
let phase = 'framing'; // framing → countdown → recording → done
let counter, side, sideVotes, goodSince, countdownEnd, recordStart, lastTs, finishAt;
let snapshots; // rep index → { image, lms }
let currentPeak; // snapshot of the deepest point of the rep in progress
let staticFrames, lastLms;

function reset() {
  counter = new RepCounter(template.primary ?? { feature: 'elbow', dir: 'any', minRom: 999 });
  side = null;
  sideVotes = [];
  goodSince = null;
  countdownEnd = 0;
  recordStart = 0;
  lastTs = 0;
  finishAt = 0;
  snapshots = [];
  currentPeak = null;
  staticFrames = [];
  lastLms = null;
  phase = 'framing';
  $('rep-count').textContent = template.static ? '0 s' : '0 reps';
  $('timer').textContent = '';
  $('countdown').textContent = '';
  say('Get your whole body in frame');
}

function say(text) {
  $('live-msg').textContent = text;
  $('live-msg').parentElement.classList.toggle('hidden', !text);
}

function grab(lms) {
  const w = 480, h = Math.round((480 * video.videoHeight) / video.videoWidth) || 640;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  c.getContext('2d').drawImage(video, 0, 0, w, h);
  return { image: c, lms: lms.map((p) => ({ ...p })) };
}

function tick() {
  raf = requestAnimationFrame(tick);
  if (!landmarker || video.readyState < 2) return;
  let ts = performance.now();
  if (ts <= lastTs) ts = lastTs + 1;
  lastTs = ts;

  if (canvas.width !== video.videoWidth) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }
  // Tests can swap in made-up poses; real use always reads the camera.
  const res = window.__fakePose ? { landmarks: [window.__fakePose(ts)] } : landmarker.detectForVideo(video, ts);
  const lms = res.landmarks?.[0];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!lms) {
    if (phase === 'framing') say('Step into view');
    goodSince = null;
    return;
  }
  lastLms = lms;

  if (side === null) {
    sideVotes.push(bestSide(lms, template.joints));
    if (sideVotes.length >= 10) side = sideVotes.filter((s) => s === 1).length > 5 ? 1 : 0;
  }
  const s = side ?? bestSide(lms, template.joints);
  const ok = visible(lms, template.joints, template.view, s);
  drawPose(ctx, lms, canvas.width, canvas.height, ok ? null : 0.4);

  if (phase === 'framing') {
    if (!ok) {
      goodSince = null;
      say(template.view === 'front' ? 'Face the camera, with both arms and hips in frame' : 'Turn side-on and step back so your joints are in frame');
      return;
    }
    goodSince ??= ts;
    say('Hold still…');
    if (ts - goodSince > 800) {
      phase = 'countdown';
      countdownEnd = ts + 3000;
    }
    return;
  }

  if (phase === 'countdown') {
    const left = Math.ceil((countdownEnd - ts) / 1000);
    $('countdown').textContent = left > 0 ? String(left) : '';
    say(left > 0 ? 'Get ready' : '');
    if (ts >= countdownEnd) {
      phase = 'recording';
      recordStart = ts;
      say(template.static ? 'Hold it…' : 'Go! Do your reps');
    }
    return;
  }

  if (phase !== 'recording') return;
  const elapsed = (ts - recordStart) / 1000;
  $('timer').textContent = `${Math.floor(elapsed)} s`;

  if (ok) {
    const aspect = video.videoWidth / video.videoHeight;
    const f = features(lms, aspect, template.view, s);
    if (template.static) {
      staticFrames.push({ t: ts, f });
      const held = (staticFrames[staticFrames.length - 1].t - staticFrames[0].t) / 1000;
      $('rep-count').textContent = `${Math.floor(held)} s`;
      if (!currentPeak || staticFrames.length % 30 === 0) currentPeak = grab(lms);
    } else {
      const done = counter.push(ts, f);
      if (counter.atNewPeak) currentPeak = grab(lms);
      if (done) {
        snapshots[counter.reps.length - 1] = currentPeak;
        currentPeak = null;
        const n = counter.reps.length;
        $('rep-count').textContent = `${n} rep${n === 1 ? '' : 's'}`;
        say(n >= MAX_REPS ? 'Nice, checking your form…' : n >= 3 ? 'Good. Keep going or tap Finish' : 'Good rep');
        if (n >= MAX_REPS) finishAt = ts + 900;
      }
    }
  } else {
    say('Stay in frame');
  }

  if ((finishAt && ts >= finishAt) || elapsed >= MAX_SECONDS) finish();
}

function drawPose(c, lms, w, h, dim) {
  c.save();
  c.globalAlpha = dim ?? 1;
  c.lineWidth = Math.max(3, w / 160);
  c.strokeStyle = 'rgba(255,255,255,0.85)';
  for (const [a, b] of BONES) {
    if ((lms[a].visibility ?? 1) < 0.3 || (lms[b].visibility ?? 1) < 0.3) continue;
    c.beginPath();
    c.moveTo(lms[a].x * w, lms[a].y * h);
    c.lineTo(lms[b].x * w, lms[b].y * h);
    c.stroke();
  }
  const keys = new Set(template.joints.flatMap((j) => (Array.isArray(LM[j]) ? LM[j] : [])));
  for (let i = 11; i < 33; i++) {
    if (i > 28 && i !== 31 && i !== 32) continue;
    if ((lms[i].visibility ?? 1) < 0.3) continue;
    const key = keys.has(i);
    c.beginPath();
    c.arc(lms[i].x * w, lms[i].y * h, (key ? 9 : 5) * (w / 640), 0, Math.PI * 2);
    c.fillStyle = key ? COLORS.key : '#fff';
    c.fill();
    if (key) {
      c.lineWidth = 2;
      c.strokeStyle = '#fff';
      c.stroke();
    }
  }
  c.restore();
}

// ---- Finishing and results ----
function finish() {
  if (phase === 'done') return;
  phase = 'done';
  cancelAnimationFrame(raf);
  const result = template.static ? scoreSet(template, staticFrames, []) : scoreSet(template, counter.frames, counter.reps);
  const snap = template.static ? currentPeak : snapshots[result.worstRep] ?? currentPeak;
  stopCamera();
  showResults(result, snap);
}

function showResults(r, snap) {
  $('live').classList.add('hidden');
  $('results').classList.remove('hidden');
  window.scrollTo(0, 0);

  const nothing = template.static ? staticFrames.length < 10 : r.reps === 0;
  if (nothing) {
    $('score').textContent = '–';
    $('ring').style.setProperty('--p', 0);
    $('score-label').textContent = template.static ? 'Couldn’t see your hold' : 'No reps counted';
    $('score-sub').textContent = 'Make sure the joints in the setup tips stay in frame, then try again.';
    $('tips-card').classList.add('hidden');
    $('checks').innerHTML = '';
    $('snap-card').classList.add('hidden');
    send({ type: 'result', score: null, reps: 0 });
    return;
  }

  $('score').textContent = String(r.score);
  $('ring').style.setProperty('--p', r.score);
  $('ring').style.setProperty('--c', r.score >= 75 ? COLORS.good : r.score >= 60 ? COLORS.ok : COLORS.bad);
  $('score-label').textContent = r.label;
  $('score-sub').textContent = template.static
    ? `Held for ${Math.round(r.checks.find((c) => c.id === 'hold')?.value ?? 0)} seconds`
    : `${r.reps} rep${r.reps === 1 ? '' : 's'} checked`;

  const tips = r.tips.length ? r.tips : ['Great form. Keep it up and add weight when the reps feel easy.'];
  $('tips').innerHTML = '';
  for (const t of tips) {
    const li = document.createElement('li');
    li.textContent = t;
    $('tips').appendChild(li);
  }
  $('tips-card').classList.remove('hidden');

  $('checks').innerHTML = '';
  for (const c of r.checks) {
    const row = document.createElement('div');
    row.className = 'check';
    const fmt = (x) => (c.unit === '×' || (c.unit === 's' && x < 10) ? x.toFixed(1) : Math.round(x)) + (c.unit === '°' ? '°' : c.unit === 's' ? ' s' : c.unit);
    const goal = c.op === 'between' ? `${fmt(c.target[0])}–${fmt(c.target[1])}` : `${c.op === '>=' ? '≥' : '≤'} ${fmt(c.target)}`;
    row.innerHTML = `<i class="dot"></i><div class="name"></div><div class="nums"></div>`;
    row.querySelector('.dot').style.background = statusColor(c.score);
    row.querySelector('.name').textContent = c.label;
    row.querySelector('.nums').textContent = Number.isFinite(c.value) ? `You: ${fmt(c.value)} · Goal: ${goal}` : `Goal: ${goal}`;
    $('checks').appendChild(row);
  }

  if (snap) {
    $('snap-card').classList.remove('hidden');
    $('snap-label').textContent = template.static ? 'Your hold' : 'Your rep that needs the most work';
    drawSnapshot(snap, jointStatus(r.checks));
  } else {
    $('snap-card').classList.add('hidden');
  }

  send({ type: 'result', score: r.score, label: r.label, reps: r.reps, tips: r.tips });
}

function drawSnapshot({ image, lms }, status) {
  const c = $('snap');
  c.width = image.width;
  c.height = image.height;
  const g = c.getContext('2d');
  g.save();
  if (facing === 'user') {
    g.translate(c.width, 0);
    g.scale(-1, 1);
  }
  g.drawImage(image, 0, 0);
  const w = c.width, h = c.height;
  g.lineWidth = 3;
  g.strokeStyle = 'rgba(255,255,255,0.8)';
  for (const [a, b] of BONES) {
    if ((lms[a].visibility ?? 1) < 0.3 || (lms[b].visibility ?? 1) < 0.3) continue;
    g.beginPath();
    g.moveTo(lms[a].x * w, lms[a].y * h);
    g.lineTo(lms[b].x * w, lms[b].y * h);
    g.stroke();
  }
  const s = side ?? 0;
  for (const [joint, score] of Object.entries(status)) {
    const idx = LM[joint];
    if (!Array.isArray(idx)) continue;
    for (const i of template.view === 'front' ? idx : [idx[s]]) {
      const p = lms[i];
      g.beginPath();
      g.arc(p.x * w, p.y * h, 11, 0, Math.PI * 2);
      g.fillStyle = statusColor(score);
      g.fill();
      g.lineWidth = 3;
      g.strokeStyle = '#fff';
      g.stroke();
    }
  }
  g.restore();
}

// ---- Buttons ----
async function begin() {
  $('setup-error').textContent = '';
  $('start').disabled = true;
  try {
    $('loading').textContent = 'Starting camera…';
    await startCamera();
    $('loading').textContent = 'Loading the form tracker…';
    await loadModel();
    $('loading').textContent = '';
    $('setup').classList.add('hidden');
    $('results').classList.add('hidden');
    $('live').classList.remove('hidden');
    reset();
    tick();
  } catch (e) {
    console.error(e);
    stopCamera();
    $('loading').textContent = '';
    $('setup-error').textContent =
      e?.name === 'NotAllowedError'
        ? 'Camera access was blocked. Allow the camera for this app in Settings, then try again.'
        : `Couldn’t start: ${e?.message || e}`;
  } finally {
    $('start').disabled = false;
  }
}

$('start').onclick = begin;
$('finish').onclick = () => {
  if (phase === 'recording') return finish();
  stopCamera();
  $('live').classList.add('hidden');
  $('setup').classList.remove('hidden');
};
$('again').onclick = () => {
  $('results').classList.add('hidden');
  $('setup').classList.remove('hidden');
};
$('flip').onclick = async () => {
  facing = facing === 'user' ? 'environment' : 'user';
  try {
    await startCamera();
    reset();
    tick();
  } catch (e) {
    say('Couldn’t switch cameras');
  }
};

// For tests: feed landmarks without a camera.
window.__formCheck = { template, features, RepCounter, scoreSet, values: () => counter?.frames.map((x) => Math.round(x.v)), reps: () => counter?.reps };
