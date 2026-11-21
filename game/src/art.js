// The three pictures of Twin Vistas, drawn with canvas shapes only: no image
// files, no fonts, nothing fetched. Each picture is drawn twice per frame —
// once plain (the original) and once with every difference applied (the
// altered copy). A difference is a named spot: the altered copy paints that
// spot differently, and the game scores a click that lands near its centre.
//
// Coordinates are in picture space: 600 wide, 580 tall.

import { scatter } from './random.js';

export const PIC_W = 600;
export const PIC_H = 580;

/* ---------- small shape helpers ---------- */

function disc(ctx, x, y, r, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function box(ctx, x, y, w, h, colour) {
  ctx.fillStyle = colour;
  ctx.fillRect(x, y, w, h);
}

function poly(ctx, points, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function stroke(ctx, points, colour, width) {
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.stroke();
}

function cloudShape(ctx, x, y, s, colour) {
  ellipse(ctx, x, y, 44 * s, 20 * s, colour);
  ellipse(ctx, x - 30 * s, y + 6 * s, 30 * s, 15 * s, colour);
  ellipse(ctx, x + 32 * s, y + 6 * s, 32 * s, 16 * s, colour);
  ellipse(ctx, x + 4 * s, y - 12 * s, 28 * s, 17 * s, colour);
}

function sparkle(ctx, x, y, r, colour) {
  poly(ctx, [[x, y - r], [x + r * 0.22, y - r * 0.22], [x + r, y], [x + r * 0.22, y + r * 0.22],
    [x, y + r], [x - r * 0.22, y + r * 0.22], [x - r, y], [x - r * 0.22, y - r * 0.22]], colour);
}

function birdShape(ctx, x, y, s, colour) {
  ctx.strokeStyle = colour;
  ctx.lineWidth = 3 * s;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(x - 9 * s, y, 9 * s, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + 9 * s, y, 9 * s, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
}

function skyGradient(ctx, stops) {
  const grad = ctx.createLinearGradient(0, 0, 0, PIC_H);
  for (const [at, colour] of stops) grad.addColorStop(at, colour);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, PIC_W, PIC_H);
}

/* ---------- level 1: Dawn Harbour ---------- */

function drawHarbour(ctx, alt) {
  skyGradient(ctx, [[0, '#ffe7bd'], [0.45, '#ffc98f'], [0.52, '#e8906f'], [0.55, '#2e6f8e'], [1, '#17455e']]);

  // The sun: gold with rays in the original, a pale rose disc in the copy.
  if (!alt('sun')) {
    ctx.strokeStyle = '#ffcf4d';
    ctx.lineWidth = 5;
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(452 + Math.cos(a) * 50, 118 + Math.sin(a) * 50);
      ctx.lineTo(452 + Math.cos(a) * 66, 118 + Math.sin(a) * 66);
      ctx.stroke();
    }
  }
  disc(ctx, 452, 118, 40, alt('sun') ? '#f2a0b5' : '#ffd23f');

  cloudShape(ctx, 168, 82, 1, '#fff6e8');
  cloudShape(ctx, 316, 56, 0.7, '#ffedd6');
  if (!alt('cloud')) cloudShape(ctx, 96, 152, 0.55, '#fff6e8');

  // Birds over the water: three in the original, two in the copy.
  birdShape(ctx, 306, 148, 1, '#3c4b57');
  birdShape(ctx, 344, 132, 0.8, '#3c4b57');
  if (!alt('birds')) birdShape(ctx, 330, 168, 0.9, '#3c4b57');

  // Distant hills along the horizon.
  poly(ctx, [[0, 302], [90, 262], [190, 296], [300, 268], [420, 300], [520, 274], [600, 298], [600, 320], [0, 320]], '#7a5a68');

  // The lighthouse on its rocks, far left.
  poly(ctx, [[52, 336], [84, 300], [140, 300], [168, 336], [176, 352], [44, 352]], '#5d6068');
  poly(ctx, [[46, 352], [176, 352], [184, 372], [38, 372]], '#4a4d54');
  box(ctx, 88, 196, 36, 108, '#f4f1ea'); // tower
  box(ctx, 88, 232, 36, 22, alt('stripe') ? '#3f6fb5' : '#d64541'); // the painted band
  box(ctx, 88, 268, 36, 20, '#d64541');
  box(ctx, 82, 184, 48, 12, '#37404a'); // gallery
  box(ctx, 94, 158, 24, 26, '#ffd23f'); // lamp room
  poly(ctx, [[90, 158], [122, 158], [106, 138]], '#37404a'); // cap
  // Its little flag: red in the original, green in the copy.
  stroke(ctx, [[106, 138], [106, 112]], '#37404a', 3);
  poly(ctx, [[106, 112], [132, 119], [106, 126]], alt('flag') ? '#3fae6a' : '#d64541');

  // Shore houses on the right, one window lit.
  const houses = [[452, 258, '#e8dcc8'], [500, 246, '#dcc7a8'], [548, 260, '#e8dcc8']];
  for (const [hx, hy, wall] of houses) {
    box(ctx, hx, hy, 44, 52, wall);
    poly(ctx, [[hx - 4, hy], [hx + 48, hy], [hx + 22, hy - 20]], '#8a4b3a');
  }
  box(ctx, 516, 268, 12, 14, alt('window') ? '#4a4238' : '#ffd873');
  box(ctx, 466, 280, 10, 12, '#ffd873');
  box(ctx, 562, 282, 10, 12, '#6b5a44');

  // Wave lines on the sea.
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  for (let row = 0; row < 5; row += 1) {
    const y = 372 + row * 42;
    for (let x = 16 + (row % 2) * 30; x < PIC_W - 30; x += 74) {
      ctx.beginPath();
      ctx.arc(x, y, 13, Math.PI * 0.1, Math.PI * 0.9);
      ctx.stroke();
    }
  }

  // Two sailboats. The far one's sail is gone in the copy.
  function sailboat(x, y, s, withSail) {
    poly(ctx, [[x - 34 * s, y], [x + 34 * s, y], [x + 24 * s, y + 14 * s], [x - 24 * s, y + 14 * s]], '#7a4a2b');
    stroke(ctx, [[x, y], [x, y - 62 * s]], '#4a3520', 4 * s);
    if (withSail) {
      poly(ctx, [[x + 3 * s, y - 58 * s], [x + 3 * s, y - 4 * s], [x + 30 * s, y - 4 * s]], '#ffffff');
      poly(ctx, [[x - 3 * s, y - 50 * s], [x - 3 * s, y - 4 * s], [x - 24 * s, y - 4 * s]], '#ffe9a8');
    }
  }
  sailboat(268, 452, 1, true);
  sailboat(452, 428, 0.8, !alt('sail'));

  // A mooring buoy: red in the original, green in the copy.
  ellipse(ctx, 520, 508, 18, 10, alt('buoy') ? '#3fae6a' : '#d64541');
  box(ctx, 517, 488, 6, 12, '#37404a');
}

/* ---------- level 2: The Night Garden ---------- */

function drawGarden(ctx, alt, flicker) {
  skyGradient(ctx, [[0, '#141b36'], [0.6, '#27335c'], [0.78, '#1d3325'], [1, '#12241a']]);

  for (const [x, y, s] of scatter(7, 80, PIC_W, 330, 1, 2.4)) disc(ctx, x, y, s, '#e8ecff');
  // One bright sparkle star, gone in the copy.
  if (!alt('star')) sparkle(ctx, 120, 90, 16, '#fff3b0');

  // The moon: a crescent in the original, full in the copy.
  disc(ctx, 492, 96, 34, '#f4f1de');
  if (!alt('moon')) disc(ctx, 476, 84, 30, '#1a2140');

  // The big tree, left of centre.
  box(ctx, 156, 300, 26, 178, '#4a3423');
  poly(ctx, [[169, 330], [238, 262], [246, 274], [176, 344]], '#4a3423'); // branch
  for (const [x, y, r] of [[120, 238, 62], [196, 206, 72], [258, 252, 54], [168, 282, 58], [96, 282, 40]]) {
    disc(ctx, x, y, r, '#22452a');
  }
  for (const [x, y, r] of [[150, 220, 40], [210, 196, 44], [120, 262, 34]]) {
    disc(ctx, x, y, r, '#2c5a36');
  }
  // An owl on the branch, gone in the copy.
  if (!alt('owl')) {
    ellipse(ctx, 238, 258, 13, 17, '#8a6d4a');
    disc(ctx, 238, 240, 11, '#a5875e');
    disc(ctx, 234, 240, 3, '#14100a');
    disc(ctx, 242, 240, 3, '#14100a');
  }

  // Ground and the fence the cat sits on.
  box(ctx, 0, 470, PIC_W, 110, '#16301e');
  box(ctx, 0, 462, PIC_W, 8, '#5d4a33');
  for (let x = 18; x < PIC_W; x += 56) box(ctx, x, 440, 9, 40, '#5d4a33');
  box(ctx, 0, 448, PIC_W, 7, '#6e583d');

  // The cat: a dark sitting silhouette, gone in the copy.
  if (!alt('cat')) {
    ellipse(ctx, 420, 428, 17, 13, '#10131c');
    disc(ctx, 420, 410, 10, '#10131c');
    poly(ctx, [[412, 404], [410, 392], [419, 400]], '#10131c');
    poly(ctx, [[428, 404], [430, 392], [421, 400]], '#10131c');
    stroke(ctx, [[436, 434], [452, 428], [454, 414]], '#10131c', 5);
  }

  // A lantern on a post: warm light in the original, cold blue in the copy.
  box(ctx, 516, 368, 7, 96, '#3a3f4a');
  const glow = alt('lantern') ? 'rgba(120,170,255,0.30)' : 'rgba(255,190,90,0.32)';
  disc(ctx, 520, 352, 34, glow);
  box(ctx, 506, 332, 28, 38, '#2c2f36');
  box(ctx, 512, 339, 16, 24, alt('lantern') ? '#9cc2ff' : '#ffca66');
  poly(ctx, [[503, 332], [537, 332], [520, 318]], '#2c2f36');

  // Flower beds along the bottom: one patch changes colour in the copy.
  const beds = [[40, '#e86a92'], [150, '#f2d060'], [262, '#b48ce0'], [360, '#e86a92'], [470, '#f2d060']];
  for (const [bx, colour] of beds) {
    const patchColour = bx === 360 && alt('flowers') ? '#f08c3a' : colour;
    for (let i = 0; i < 6; i += 1) {
      const fx = bx + (i % 3) * 26;
      const fy = 512 + Math.floor(i / 3) * 28;
      stroke(ctx, [[fx, fy + 16], [fx, fy + 4]], '#2c5a36', 3);
      disc(ctx, fx, fy, 7, patchColour);
      disc(ctx, fx, fy, 3, '#fff3b0');
    }
  }

  // Fireflies: a loose drift everywhere, and a cluster by the tree that
  // thins out in the copy.
  const flies = scatter(21, 16, PIC_W, 440, 1.6, 2.6);
  for (const [x, y, s] of flies) {
    if (y < 180) continue;
    disc(ctx, x, y, s + flicker, '#ffe97a');
  }
  const cluster = [[282, 392], [306, 410], [322, 388], [296, 428], [330, 420]];
  const shown = alt('fireflies') ? cluster.slice(0, 2) : cluster;
  for (const [x, y] of shown) {
    disc(ctx, x, y, 7, 'rgba(255,233,122,0.25)');
    disc(ctx, x, y, 2.6, '#ffe97a');
  }
}

/* ---------- level 3: Rocket Yard ---------- */

function drawRocketYard(ctx, alt) {
  skyGradient(ctx, [[0, '#241d4d'], [0.55, '#5b3260'], [0.8, '#b5533c'], [0.82, '#3c4048'], [1, '#2c2f36']]);

  for (const [x, y, s] of scatter(11, 55, PIC_W, 300, 1, 2.2)) disc(ctx, x, y, s, '#e8ecff');
  // A triangle of bright stars; one is gone in the copy.
  sparkle(ctx, 356, 78, 11, '#fff3b0');
  sparkle(ctx, 404, 102, 9, '#fff3b0');
  if (!alt('stars')) sparkle(ctx, 380, 128, 10, '#fff3b0');

  // The ringed planet: the ring is gone in the copy.
  disc(ctx, 108, 108, 44, '#d9905f');
  ellipse(ctx, 96, 96, 18, 12, '#c47a4c');
  ellipse(ctx, 122, 126, 12, 8, '#c47a4c');
  if (!alt('ring')) {
    ctx.strokeStyle = '#f2d060';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.ellipse(108, 108, 74, 20, -0.35, 0, Math.PI * 2);
    ctx.stroke();
  }
  disc(ctx, 540, 76, 17, '#cfd6dd');
  disc(ctx, 534, 70, 5, '#aab3bb');

  // The rocket on its pad, centre stage.
  box(ctx, 196, 452, 208, 18, '#565d68'); // pad
  poly(ctx, [[268, 452], [262, 486], [282, 452]], '#e5534b'); // left fin
  poly(ctx, [[332, 452], [338, 486], [318, 452]], '#e5534b'); // right fin
  box(ctx, 272, 236, 56, 216, '#eef1f5'); // body
  poly(ctx, [[272, 236], [328, 236], [300, 168]], '#e5534b'); // nose
  box(ctx, 272, 340, 56, 18, alt('stripe') ? '#2a9d8f' : '#e5534b'); // painted band
  disc(ctx, 300, 262, 13, '#7ec8e3');
  disc(ctx, 300, 262, 13, 'rgba(0,0,0,0)');
  ctx.strokeStyle = '#37404a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(300, 262, 13, 0, Math.PI * 2);
  ctx.stroke();
  // A second, lower porthole: gone in the copy.
  if (!alt('porthole')) {
    disc(ctx, 300, 308, 10, '#7ec8e3');
    ctx.beginPath();
    ctx.arc(300, 308, 10, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Gantry arm reaching to the rocket.
  box(ctx, 336, 268, 64, 10, '#8b93a3');
  box(ctx, 394, 268, 10, 184, '#8b93a3');

  // The control hut, bottom left: one window lit.
  box(ctx, 52, 404, 92, 58, '#6b5844');
  poly(ctx, [[46, 404], [150, 404], [98, 376]], '#4a3b2c');
  box(ctx, 84, 420, 24, 20, alt('hut') ? '#33291f' : '#ffd873');
  box(ctx, 122, 424, 14, 38, '#4a3b2c');

  // The antenna dish on its mast: it faces left in the original, right in the copy.
  stroke(ctx, [[520, 240], [520, 330]], '#8b93a3', 6);
  if (alt('dish')) {
    poly(ctx, [[520, 218], [556, 200], [556, 236]], '#cfd6dd');
    stroke(ctx, [[538, 218], [520, 218]], '#cfd6dd', 4);
  } else {
    poly(ctx, [[520, 218], [484, 200], [484, 236]], '#cfd6dd');
    stroke(ctx, [[502, 218], [520, 218]], '#cfd6dd', 4);
  }
  box(ctx, 470, 330, 110, 132, '#4c4438'); // dish hut
  box(ctx, 512, 420, 20, 42, '#33291f');

  // An alien sprout by the pad: its flower changes colour in the copy.
  stroke(ctx, [[420, 540], [420, 500]], '#3fae6a', 5);
  poly(ctx, [[420, 516], [402, 506], [404, 522]], '#3fae6a');
  poly(ctx, [[420, 510], [438, 500], [436, 516]], '#3fae6a');
  disc(ctx, 420, 494, 11, alt('plant') ? '#f2d060' : '#b48ce0');
  disc(ctx, 420, 494, 4, '#fff3b0');

  // Ground markings.
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 500);
  ctx.lineTo(PIC_W, 500);
  ctx.stroke();
}

/* ---------- the level table ---------- */

export const LEVELS = [
  {
    name: 'Dawn Harbour',
    draw: (ctx, alt) => drawHarbour(ctx, alt),
    diffs: [
      { id: 'sun', x: 452, y: 118, r: 46 },
      { id: 'cloud', x: 96, y: 152, r: 36 },
      { id: 'birds', x: 330, y: 150, r: 36 },
      { id: 'flag', x: 118, y: 119, r: 26 },
      { id: 'stripe', x: 106, y: 243, r: 28 },
      { id: 'window', x: 522, y: 275, r: 26 },
      { id: 'sail', x: 452, y: 412, r: 38 },
      { id: 'buoy', x: 520, y: 502, r: 28 },
    ],
  },
  {
    name: 'The Night Garden',
    draw: (ctx, alt, t) => drawGarden(ctx, alt, Math.sin(t * 2.2) * 0.5),
    diffs: [
      { id: 'star', x: 120, y: 90, r: 28 },
      { id: 'moon', x: 492, y: 96, r: 40 },
      { id: 'owl', x: 238, y: 254, r: 30 },
      { id: 'cat', x: 420, y: 424, r: 34 },
      { id: 'lantern', x: 520, y: 350, r: 32 },
      { id: 'fireflies', x: 306, y: 406, r: 38 },
      { id: 'flowers', x: 386, y: 524, r: 38 },
    ],
  },
  {
    name: 'Rocket Yard',
    draw: (ctx, alt) => drawRocketYard(ctx, alt),
    diffs: [
      { id: 'ring', x: 108, y: 108, r: 52 },
      { id: 'stars', x: 380, y: 102, r: 34 },
      { id: 'porthole', x: 300, y: 308, r: 26 },
      { id: 'stripe', x: 300, y: 349, r: 28 },
      { id: 'dish', x: 520, y: 218, r: 34 },
      { id: 'hut', x: 96, y: 430, r: 28 },
      { id: 'plant', x: 420, y: 500, r: 30 },
    ],
  },
];

// Dawn Harbour hides eight spots; the other two pictures hide seven each.
// The HUD always counts from the level's own list, so the numbers stay true.
