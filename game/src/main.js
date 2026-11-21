// Twin Vistas — a spot-the-difference game in one looping file: it owns the
// state (which picture, which spots are found, the clock and the score),
// reads mouse and keyboard, and paints everything on one canvas each frame.
//
// Two copies of the same picture sit side by side. The right-hand copy has a
// handful of spots painted differently; clicking a spot in either copy rings
// it in both. Find them all to clear the picture.
//
// ?shot=start|play|end stages a fixed scene for screenshots and sets
// window.__shotReady. ?selftest=1 plays the whole game by itself through the
// real click handler and reports the result in the document title.

import { LEVELS, PIC_W, PIC_H } from './art.js';
import { stageShot } from './shots.js';

const VIEW_W = 1280;
const VIEW_H = 720;
const PANEL_Y = 104;
const PANEL_X = [28, 652];
const FIND_POINTS = 100;
const MISS_PENALTY = 15;
const HINT_COST = 25;

const params = new URLSearchParams(window.location.search);
const canvas = document.getElementById('game');
const status = document.getElementById('status');
const ctx = canvas.getContext('2d');

const game = {
  screen: 'title',
  levelIndex: 0,
  found: new Set(),
  misses: 0,
  score: 0,
  time: 0,
  totalTime: 0,
  hintsLeft: 3,
  hintId: null,
  hintUntil: 0,
  missMarks: [],
  anim: 0,
};

const level = () => LEVELS[game.levelIndex];
const remaining = () => level().diffs.length - game.found.size;

/* ---------- sound: tiny generated beeps, no audio files ---------- */

let audio = null;
function beep(freq, at, dur, type = 'sine', gain = 0.06) {
  try {
    if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
    const t0 = audio.currentTime + at;
    const osc = audio.createOscillator();
    const amp = audio.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    amp.gain.setValueAtTime(gain, t0);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(amp).connect(audio.destination);
    osc.start(t0);
    osc.stop(t0 + dur);
  } catch {
    // No audio device or a blocked context: the game stays silent.
  }
}
const soundFound = () => { beep(660, 0, 0.09); beep(990, 0.08, 0.12); };
const soundMiss = () => beep(140, 0, 0.16, 'square', 0.04);
const soundClear = () => { beep(523, 0, 0.12); beep(659, 0.1, 0.12); beep(784, 0.2, 0.2); };

/* ---------- game flow ---------- */

function startLevel(index) {
  game.levelIndex = index;
  game.found = new Set();
  game.misses = 0;
  game.time = 0;
  game.hintsLeft = 3;
  game.hintId = null;
  game.missMarks = [];
  game.screen = 'play';
  announce(`${level().name}. ${level().diffs.length} differences to find.`);
}

function startGame() {
  game.score = 0;
  game.totalTime = 0;
  startLevel(0);
}

function confirm() {
  if (game.screen === 'title' || game.screen === 'won') startGame();
  else if (game.screen === 'done') {
    if (game.levelIndex === LEVELS.length - 1) {
      game.screen = 'won';
      announce(`You spotted them all. Final score ${game.score}.`);
    } else {
      startLevel(game.levelIndex + 1);
    }
  } else if (game.screen === 'paused') {
    game.screen = 'play';
  }
}

/** One click inside a picture, in picture coordinates. Returns what it was. */
function trySceneClick(sx, sy) {
  let nearest = null;
  let nearestDist = Infinity;
  for (const diff of level().diffs) {
    const d = Math.hypot(sx - diff.x, sy - diff.y);
    if (d < nearestDist) { nearestDist = d; nearest = diff; }
  }
  if (nearest && nearestDist <= Math.max(nearest.r, 30)) {
    if (game.found.has(nearest.id)) return 'already';
    game.found.add(nearest.id);
    game.score += FIND_POINTS;
    soundFound();
    announce(`Found one. ${remaining()} to go.`);
    if (remaining() === 0) {
      game.totalTime += game.time;
      game.score += Math.max(0, 300 - Math.floor(game.time) * 2);
      game.screen = 'done';
      soundClear();
      announce(`${level().name} cleared in ${formatTime(game.time)}.`);
    }
    return 'found';
  }
  game.misses += 1;
  game.score = Math.max(0, game.score - MISS_PENALTY);
  game.missMarks.push({ x: sx, y: sy, until: game.anim + 0.7 });
  soundMiss();
  announce(`Not a difference. ${remaining()} to go.`);
  return 'miss';
}

function useHint() {
  if (game.screen !== 'play' || game.hintsLeft <= 0) return;
  const open = level().diffs.filter((d) => !game.found.has(d.id));
  if (!open.length) return;
  const pick = open[Math.floor(Math.random() * open.length)];
  game.hintId = pick.id;
  game.hintUntil = game.anim + 1.6;
  game.hintsLeft -= 1;
  game.score = Math.max(0, game.score - HINT_COST);
  announce('A ring pulses around one difference, briefly.');
}

function announce(message) {
  status.textContent = message;
}

function formatTime(seconds) {
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/* ---------- painting ---------- */

function panelPath(x) {
  ctx.beginPath();
  ctx.roundRect(x, PANEL_Y, PIC_W, PIC_H, 10);
}

function drawPanel(side) {
  const x = PANEL_X[side];
  // Frame and shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.roundRect(x + 6, PANEL_Y + 8, PIC_W, PIC_H, 10);
  ctx.fill();
  panelPath(x);
  ctx.fillStyle = '#f4f1ea';
  ctx.fill();
  ctx.save();
  panelPath(x);
  ctx.clip();
  ctx.translate(x, PANEL_Y);
  const altered = side === 1 ? new Set(level().diffs.map((d) => d.id)) : new Set();
  level().draw(ctx, (id) => altered.has(id), game.anim);
  // Rings around the found spots.
  for (const diff of level().diffs) {
    if (!game.found.has(diff.id)) continue;
    const pulse = 1 + Math.sin(game.anim * 4) * 0.04;
    ctx.strokeStyle = '#69e04e';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(diff.x, diff.y, diff.r * 0.78 * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(diff.x, diff.y, diff.r * 0.78 * pulse - 5, 0, Math.PI * 2);
    ctx.stroke();
  }
  // The hint ring, while it lasts.
  if (game.hintId && game.anim < game.hintUntil) {
    const diff = level().diffs.find((d) => d.id === game.hintId);
    if (diff && !game.found.has(diff.id)) {
      ctx.strokeStyle = '#ffb02e';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(diff.x, diff.y, diff.r * (1 + Math.sin(game.anim * 10) * 0.12), 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  // Fresh miss marks.
  for (const mark of game.missMarks) {
    if (game.anim > mark.until) continue;
    ctx.strokeStyle = 'rgba(229,83,75,0.9)';
    ctx.lineWidth = 5;
    const r = 12;
    ctx.beginPath();
    ctx.moveTo(mark.x - r, mark.y - r);
    ctx.lineTo(mark.x + r, mark.y + r);
    ctx.moveTo(mark.x + r, mark.y - r);
    ctx.lineTo(mark.x - r, mark.y + r);
    ctx.stroke();
  }
  ctx.restore();
  // Caption over the frame's top edge.
  ctx.fillStyle = '#8b93a3';
  ctx.font = '600 15px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(side === 0 ? 'THE ORIGINAL' : 'THE COPY — WHAT CHANGED?', x + 4, PANEL_Y - 10);
}

function drawHeader() {
  ctx.fillStyle = '#eef1f5';
  ctx.font = '800 30px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('TWIN VISTAS', 28, 46);
  ctx.fillStyle = '#8b93a3';
  ctx.font = '600 17px system-ui, sans-serif';
  ctx.fillText('spot the difference', 30, 72);

  ctx.fillStyle = '#eef1f5';
  ctx.font = '700 22px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(level().name, VIEW_W / 2, 48);
  ctx.fillStyle = '#8b93a3';
  ctx.font = '500 16px system-ui, sans-serif';
  ctx.fillText(`Picture ${game.levelIndex + 1} of ${LEVELS.length}`, VIEW_W / 2, 72);

  // The counter of what remains, in a pill so it cannot be missed.
  ctx.fillStyle = '#252b38';
  ctx.beginPath();
  ctx.roundRect(1012, 14, 240, 44, 22);
  ctx.fill();
  ctx.fillStyle = remaining() === 0 ? '#69e04e' : '#ffd23f';
  ctx.font = '800 22px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${remaining()} TO GO`, 1132, 44);

  ctx.fillStyle = '#eef1f5';
  ctx.font = '600 17px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`Found ${game.found.size} of ${level().diffs.length}`, 1252, 84);
}

function card(lines, width = 640) {
  const height = 84 + lines.length * 40;
  const x = (VIEW_W - width) / 2;
  const y = (VIEW_H - height) / 2;
  ctx.fillStyle = 'rgba(10,13,20,0.62)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = '#1b1f2a';
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 16);
  ctx.fill();
  ctx.strokeStyle = '#4fc3f7';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.textAlign = 'center';
  lines.forEach((line, i) => {
    ctx.fillStyle = line.colour || '#eef1f5';
    ctx.font = `${line.bold ? '800' : '500'} ${line.size || 22}px system-ui, sans-serif`;
    ctx.fillText(line.text, VIEW_W / 2, y + 62 + i * 40);
  });
}

function draw() {
  ctx.fillStyle = '#0e1420';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  drawHeader();
  drawPanel(0);
  drawPanel(1);
  ctx.fillStyle = '#8b93a3';
  ctx.font = '500 15px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`Time ${formatTime(game.time)} · Score ${game.score} · Misses ${game.misses}`, 28, 710);
  ctx.textAlign = 'center';
  ctx.fillText('Click a difference in either picture · H for a hint · P to pause', VIEW_W / 2 + 120, 710);

  if (game.screen === 'title') {
    card([
      { text: 'TWIN VISTAS', size: 40, bold: true, colour: '#4fc3f7' },
      { text: 'Two pictures, side by side — and they are not quite the same.', size: 19 },
      { text: 'Click each spot that changed. Rings mark the ones you found,', size: 19 },
      { text: 'and the counter up top tells you how many remain.', size: 19 },
      { text: 'Click or press Space to start', size: 20, bold: true, colour: '#ffd23f' },
    ], 700);
  } else if (game.screen === 'paused') {
    card([{ text: 'Paused', size: 32, bold: true }, { text: 'Press P or click to keep looking', size: 19 }], 520);
  } else if (game.screen === 'done') {
    const last = game.levelIndex === LEVELS.length - 1;
    card([
      { text: `${level().name} — cleared!`, size: 30, bold: true, colour: '#69e04e' },
      { text: `Time ${formatTime(game.time)} · Misses ${game.misses} · Score ${game.score}`, size: 20 },
      { text: last ? 'Click or press Space for your final score' : 'Click or press Space for the next picture', size: 20, bold: true, colour: '#ffd23f' },
    ], 640);
  } else if (game.screen === 'won') {
    card([
      { text: 'You spotted them all!', size: 34, bold: true, colour: '#69e04e' },
      { text: `Final score ${game.score} · Total time ${formatTime(game.totalTime)}`, size: 21 },
      { text: 'Every difference in all three pictures, found.', size: 19 },
      { text: 'Click or press Space to play again', size: 20, bold: true, colour: '#ffd23f' },
    ], 660);
  }
}

/* ---------- input ---------- */

function toLogical(event) {
  const rect = canvas.getBoundingClientRect();
  return [
    (event.clientX - rect.left) * (VIEW_W / rect.width),
    (event.clientY - rect.top) * (VIEW_H / rect.height),
  ];
}

canvas.addEventListener('pointerdown', (event) => {
  if (game.screen !== 'play') { confirm(); return; }
  const [lx, ly] = toLogical(event);
  for (let side = 0; side < 2; side += 1) {
    const sx = lx - PANEL_X[side];
    const sy = ly - PANEL_Y;
    if (sx >= 0 && sx < PIC_W && sy >= 0 && sy < PIC_H) {
      if (trySceneClick(sx, sy) === 'already') announce('That one is already ringed.');
      return;
    }
  }
});

window.addEventListener('keydown', (event) => {
  if (event.code === 'Space' || event.code === 'Enter') {
    event.preventDefault();
    if (game.screen !== 'play') confirm();
    else if (game.screen === 'paused') game.screen = 'play';
  } else if (event.code === 'KeyP') {
    if (game.screen === 'play') game.screen = 'paused';
    else if (game.screen === 'paused') game.screen = 'play';
  } else if (event.code === 'KeyH') {
    useHint();
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden && game.screen === 'play') game.screen = 'paused';
});

/* ---------- sizing ---------- */

function fitCanvas() {
  const scale = Math.min(window.innerWidth / VIEW_W, window.innerHeight / VIEW_H);
  canvas.width = VIEW_W;
  canvas.height = VIEW_H;
  canvas.style.width = `${Math.floor(VIEW_W * scale)}px`;
  canvas.style.height = `${Math.floor(VIEW_H * scale)}px`;
}
window.addEventListener('resize', fitCanvas);
fitCanvas();

/* ---------- boot: screenshot staging, self-test, or the live game ---------- */

const shotName = params.get('shot');

if (shotName) {
  stageShot(shotName, game);
  let painted = 0;
  const paint = () => {
    draw();
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  };
  requestAnimationFrame(paint);
} else if (params.get('selftest')) {
  const problems = [];
  startGame();
  // A click on plain water in picture 1 must be a miss, not a find.
  if (trySceneClick(24, 556) !== 'miss') problems.push('stray click was not a miss');
  for (let li = 0; li < LEVELS.length; li += 1) {
    for (const diff of LEVELS[li].diffs) {
      if (trySceneClick(diff.x, diff.y) !== 'found') problems.push(`click failed: ${LEVELS[li].name}/${diff.id}`);
    }
    if (game.screen !== 'done') problems.push(`level ${li + 1} did not complete`);
    confirm();
  }
  if (game.screen !== 'won') problems.push('game did not reach the won screen');
  const verdict = problems.length ? `SELFTEST FAIL ${problems.join('; ')}` : `SELFTEST PASS score=${game.score}`;
  document.title = verdict;
  status.textContent = verdict;
  window.__selftest = verdict;
  draw();
} else {
  let last = performance.now();
  const frame = (now) => {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.25);
    last = now;
    game.anim += dt;
    if (game.screen === 'play') game.time += dt;
    game.missMarks = game.missMarks.filter((m) => game.anim < m.until + 0.1);
    draw();
  };
  announce('Twin Vistas. Click or press Space to start.');
  requestAnimationFrame(frame);
}
