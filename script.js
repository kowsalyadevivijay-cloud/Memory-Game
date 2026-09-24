
const allImages = [
  'https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=400',
  'https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=400',
  'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=400',
  'https://images.unsplash.com/photo-1591025207163-942350e47db2?w=400',
  'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400',
  'https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?w=400',
  'https://plus.unsplash.com/premium_photo-1675848495392-6b9a3b962df0?w=400',
  'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=400',
  'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400',
  'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?w=400'
];

let firstCard = null;
let secondCard = null;
let matches = 0;
let moves = 0;
let startTime = null;
let timerInterval = null;
let canFlip = true;
let totalPairs = 8;
let muted = false;
const sounds = {
  flip: new Audio('sounds/flip.mp3'),
  match: new Audio('sounds/match.mp3'),
  win: new Audio('sounds/win.mp3')
};

sounds.flip.volume = 0.2;
sounds.match.volume = 0.4;
sounds.win.volume = 1.0;
sounds.match.loop = true;

function playSound(name) {
  if (muted) return;
  const sound = sounds[name];
  
  if (name === 'match') {
    if (sound.paused) {
      sound.play().catch(() => {});
    }
  } else {
    sound.volume = 0.5;
    sound.pause();
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }
}

function stopAllSounds() {
  Object.values(sounds).forEach(sound => {
    sound.pause();
    sound.currentTime = 0;
  });
}
function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function buildDeck() {
  const selected = allImages.slice(0, totalPairs);
  return shuffle(selected.concat(selected));
}

function flipCard(card) { card.classList.add('flipped'); }
function unflipCard(card) { card.classList.remove('flipped'); }
function markMatched(card) { card.classList.add('matched'); }
function resetPair() { 
  firstCard = null; 
  secondCard = null; 
  canFlip = true; 
}

function updateHUD() {
  document.getElementById('moves').textContent = moves;
  document.getElementById('matches').textContent = `${matches}/${totalPairs}`;
  
  if (startTime) {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    document.getElementById('time').textContent = `${mins}:${secs < 10 ? '0' + secs : secs}`;
  } else {
    document.getElementById('time').textContent = '0:00';
  }
}

function loadBestScore() {
  const best = localStorage.getItem('memoryBest');
  document.getElementById('bestScore').textContent = best || '—';
}

function saveBestScore(moves, time) {
  const current = `${moves} moves in ${time}`;
  const best = localStorage.getItem('memoryBest');
  if (!best || isBetterScore(current, best)) {
    localStorage.setItem('memoryBest', current);
    document.getElementById('bestScore').textContent = current;
  }
}

function isBetterScore(current, best) {
  const [curMoves, curTime] = parseScore(current);
  const [bestMoves, bestTime] = parseScore(best);
  return curMoves < bestMoves || (curMoves === bestMoves && curTime < bestTime);
}

function parseScore(str) {
  const moves = parseInt(str.split(' ')[0], 10);
  const [m, s] = str.split('in ')[1].split(':').map(Number);
  return [moves, m * 60 + s];
}

function checkWin() {
  if (matches === totalPairs) {
    clearInterval(timerInterval);
    stopAllSounds();
    const finalMoves = moves;
    const finalTime = document.getElementById('time').textContent;
    
    document.getElementById('finalMoves').textContent = finalMoves;
    document.getElementById('finalTime').textContent = finalTime;
    document.getElementById('winModal').classList.add('show');
    
    playSound('win');
    saveBestScore(finalMoves, finalTime);
    startWinEffect();
  }
}

function handleCardClick(card) {
  if (!canFlip || card.classList.contains('flipped') || card.classList.contains('matched')) return;

  if (!startTime) {
    startTime = Date.now();
    timerInterval = setInterval(updateHUD, 1000);
  }
  
  flipCard(card);
  playSound('flip');

  if (!firstCard) {
    firstCard = card;
  } else {
    secondCard = card;
    canFlip = false;
    moves++;
    updateHUD();
    checkMatch();
  }
}

function checkMatch() {
  const isMatch = firstCard.dataset.image === secondCard.dataset.image;
  
  if (isMatch) {
    setTimeout(() => {
      markMatched(firstCard);
      markMatched(secondCard);
      matches++;
      playSound('match');
      updateHUD();
      resetPair();
      checkWin();
    }, 500);
  } else {
    setTimeout(() => {
      unflipCard(firstCard);
      unflipCard(secondCard);
      resetPair();
    }, 1000);
  }
}

function renderBoard() {
  const gameBoard = document.getElementById('gameBoard');
  gameBoard.innerHTML = '';
  const deck = buildDeck();
  
  deck.forEach(img => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.image = img;
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-front"><i class="fas fa-heart"></i></div>
        <div class="card-face card-back"><img src="${img}" alt="memory card"></div>
      </div>
    `;
    gameBoard.appendChild(card);
  });
}

function newGame() {
  clearInterval(timerInterval);
  timerInterval = null;
  startTime = null;
  matches = 0;
  moves = 0;
  firstCard = null;
  secondCard = null;
  canFlip = true;
  
  document.getElementById('winModal').classList.remove('show');
  stopAllSounds();
  renderBoard();
  updateHUD();
}

const fxCanvas = document.createElement('canvas');
fxCanvas.id = 'fxCanvas';
document.body.appendChild(fxCanvas);
const fx = fxCanvas.getContext('2d');

let particles = [];
let fxFrame = null;
let launchTimer = null;
let showEnd = 0;
let flash = 0;
const MAX_PARTICLES = 2500;

const rand = (a, b) => a + Math.random() * (b - a);
const randHue = () => Math.floor(Math.random() * 360);

function resizeFx() {
  fxCanvas.width = window.innerWidth;
  fxCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeFx);
resizeFx();

function spawn(p) {
  if (particles.length < MAX_PARTICLES) particles.push(p);
}

function spark(x, y, vx, vy, hue, o = {}) {
  const life = rand(60, 100) * (o.lifeMul || 1);
  spawn({
    type: 'spark', x, y, px: x, py: y, vx, vy, hue,
    life, max: life,
    size: o.size || rand(1.5, 3),
    gravity: o.gravity ?? 0.05,
    drag: o.drag ?? 0.975,
    twinkle: o.twinkle ?? Math.random() < 0.35
  });
}

function explode(x, y) {
  const hue = randHue();
  const shapes = ['sphere', 'ring', 'heart', 'star', 'double'];
  const shape = shapes[Math.floor(Math.random() * shapes.length)];
  flash = 0.12;

  if (shape === 'sphere' || shape === 'double') {
    for (let i = 0; i < 90; i++) {
      const a = rand(0, Math.PI * 2), s = rand(1, 7);
      spark(x, y, Math.cos(a) * s, Math.sin(a) * s, hue + rand(-15, 15));
    }
  }
  if (shape === 'double') {
    for (let i = 0; i < 45; i++) {
      const a = (i / 45) * Math.PI * 2, s = 2.6;
      spark(x, y, Math.cos(a) * s, Math.sin(a) * s, hue + 150, { twinkle: false });
    }
  }
  if (shape === 'ring') {
    for (let i = 0; i < 80; i++) {
      const a = (i / 80) * Math.PI * 2, s = 5.5;
      spark(x, y, Math.cos(a) * s, Math.sin(a) * s, hue, { gravity: 0.03, drag: 0.965 });
    }
  }
  if (shape === 'heart') {
    for (let i = 0; i < 90; i++) {
      const t = (i / 90) * Math.PI * 2;
      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      spark(x, y, hx * 0.3, -hy * 0.3, 335 + rand(-10, 10), { gravity: 0.03, drag: 0.965 });
    }
  }
  if (shape === 'star') {
    for (let i = 0; i < 110; i++) {
      const a = (i / 110) * Math.PI * 2;
      const s = 2 + 4.5 * Math.abs(Math.cos(2.5 * a));
      spark(x, y, Math.cos(a) * s, Math.sin(a) * s, 48 + rand(-8, 8), { gravity: 0.03, drag: 0.965 });
    }
  }
}

function launch(targetX, targetY) {
  const w = fxCanvas.width;
  const h = fxCanvas.height;
  const x = targetX ?? rand(w * 0.1, w * 0.9);
  const ty = targetY ?? rand(h * 0.12, h * 0.5);
  const g = 0.12;
  const vy = -Math.sqrt(2 * g * (h - ty));
  
  spawn({
    type: 'rocket', x, y: h + 10, px: x, py: h + 10,
    vx: rand(-0.6, 0.6), vy, gravity: g, drag: 1,
    hue: randHue(), life: 400, max: 400
  });
}

function confettiDrop(count) {
  for (let i = 0; i < count; i++) {
    spawn({
      type: 'confetti',
      x: rand(0, fxCanvas.width), y: rand(-220, -20), px: 0, py: 0,
      vx: rand(-1, 1), vy: rand(2, 5),
      life: 260, max: 260, size: rand(5, 10),
      hue: randHue(), gravity: 0.02, drag: 0.99,
      rot: rand(0, 6), spin: rand(-0.15, 0.15)
    });
  }
}

function fxLoop() {
  fx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
  fx.globalCompositeOperation = 'lighter';

  particles = particles.filter(p => p.life > 0);
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.px = p.x; 
    p.py = p.y;
    p.vy += p.gravity;
    p.vx *= p.drag;
    p.vy *= p.drag;
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    const alpha = Math.max(p.life / p.max, 0);

    if (p.type === 'rocket') {
      fx.strokeStyle = 'rgba(255, 230, 160, 0.95)';
      fx.lineWidth = 3;
      fx.lineCap = 'round';
      fx.beginPath();
      fx.moveTo(p.px, p.py);
      fx.lineTo(p.x, p.y);
      fx.stroke();
      spark(p.x, p.y, rand(-0.4, 0.4), rand(0.5, 1.5), 40, { lifeMul: 0.35, size: 1.5, gravity: 0.02, twinkle: false });
      if (p.vy >= -0.5) { 
        p.life = 0; 
        explode(p.x, p.y); 
      }
    } else if (p.type === 'spark') {
      const a = p.twinkle ? alpha * (0.4 + Math.random() * 0.6) : alpha;
      fx.strokeStyle = `hsla(${p.hue}, 100%, 65%, ${a})`;
      fx.lineWidth = p.size;
      fx.lineCap = 'round';
      fx.beginPath();
      fx.moveTo(p.px, p.py);
      fx.lineTo(p.x, p.y);
      fx.stroke();
    } else {
      p.rot += p.spin;
      fx.save();
      fx.translate(p.x, p.y);
      fx.rotate(p.rot);
      fx.scale(1, Math.abs(Math.sin(p.rot * 2)) + 0.2);
      fx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${Math.min(alpha * 2, 1)})`;
      fx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      fx.restore();
    }
  }
  
  fx.globalCompositeOperation = 'source-over';

  if (flash > 0.01) {
    fx.fillStyle = `rgba(255, 255, 255, ${flash})`;
    fx.fillRect(0, 0, fxCanvas.width, fxCanvas.height);
    flash *= 0.85;
  } else {
    flash = 0;
  }

  if (particles.length || Date.now() < showEnd) {
    fxFrame = requestAnimationFrame(fxLoop);
  } else {
    fxFrame = null;
    fx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
  }
}
function startWinEffect() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  stopWinEffect();
  
  const w = fxCanvas.width;
  const h = fxCanvas.height;
  showEnd = Date.now() + 7000;

  [0.2, 0.4, 0.6, 0.8].forEach(f => launch(w * f, h * rand(0.15, 0.4)));
  confettiDrop(150);

  launchTimer = setInterval(() => {
    const left = showEnd - Date.now();
    if (left <= 0) return stopLaunching();
    const finale = left < 1200;
    const count = finale ? 3 : (Math.random() < 0.4 ? 2 : 1);
    
    for (let i = 0; i < count; i++) launch();
    if (left > 1500) confettiDrop(12);
  }, 260);
  
  fxFrame = requestAnimationFrame(fxLoop);
}

function stopLaunching() { 
  clearInterval(launchTimer); 
  launchTimer = null; 
}
function stopWinEffect() {
  stopLaunching();
  if (fxFrame) cancelAnimationFrame(fxFrame);
  fxFrame = null;
  particles = [];
  flash = 0;
  fx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
}
(function cosmicCursor() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cv = document.createElement('canvas');
  cv.id = 'cursorCanvas';
  cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:15;';
  document.body.appendChild(cv);
  
  const c = cv.getContext('2d');
  if (!c) return;

  const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  const MAX_PARTS = coarse ? 220 : 420;
  const TRAIL_LEN = 22;
  const TAU = Math.PI * 2;
  const rnd = (a, b) => a + Math.random() * (b - a);

  let W = 0, H = 0;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; 
    H = window.innerHeight;
    cv.width = W * dpr; 
    cv.height = H * dpr;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  const ptr = { x: 0, y: 0, px: 0, py: 0, has: false, down: false, downAt: 0, lastMove: 0, hide: false, over: false };
  const orb = { x: 0, y: 0 };
  let parts = [], rings = [], trail = [];
  let energy = 0, alpha = 0, raf = null, lastT = 0, T = 0;
  const cosmicHue = (off = 0) => 250 + 70 * Math.sin(T / 900) + off;

  function dust(x, y, vx, vy, h, size, life, kind = 0, drag = 0.97, swirl = null) {
    if (parts.length >= MAX_PARTS) return;
    parts.push({
      x, y, vx, vy, h, s: size, l: life, m: life, k: kind, dr: drag,
      sw: swirl === null ? rnd(-0.05, 0.05) : swirl,
      rot: rnd(0, TAU), spin: rnd(-0.08, 0.08), ph: rnd(0, TAU)
    });
  }

  function sparkleAt(x, y, v = 1) {
    const gold = Math.random() < 0.25;
    dust(x + rnd(-6, 6), y + rnd(-6, 6), rnd(-0.6, 0.6) * v, rnd(-0.9, 0.2) * v,
      gold ? 48 : cosmicHue(rnd(-30, 60)), rnd(3, 6.5), rnd(40, 75), gold ? 2 : 1);
  }

  function burst(x, y, power, n) {
    const base = cosmicHue();
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + rnd(-0.2, 0.2), sp = rnd(1.5, 5.5) * power;
      dust(x, y, Math.cos(a) * sp, Math.sin(a) * sp, base + (i % 3) * 55 + rnd(-12, 12), rnd(1.3, 3.2), rnd(35, 70));
    }
    const stars = Math.round(4 + power * 6);
    for (let i = 0; i < stars; i++) sparkleAt(x, y, 3 * power);
    rings.push({ x, y, l: 0, m: 34, max: 55 + 85 * power, h: base });
    rings.push({ x, y, l: -6, m: 34, max: 35 + 55 * power, h: base + 120 });
  }

  function star4(x, y, r, rot) {
    c.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = rot + i * Math.PI / 4, rr = i % 2 ? r * 0.28 : r;
      c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    c.closePath();
    c.fill();
  }

  function wake() {
    if (!raf && !document.hidden) { 
      lastT = performance.now(); 
      raf = requestAnimationFrame(frame); 
    }
  }

  function frame(now) {
    raf = null;
    if (document.hidden) return;
    const dt = Math.min((now - lastT) / 16.667, 3) || 1;
    lastT = now; 
    T = now;

    c.clearRect(0, 0, W, H);
    c.globalCompositeOperation = 'lighter';

    const idle = now - ptr.lastMove > 1800;
    const active = ptr.has && !ptr.hide && (ptr.down || !idle);
    const target = active ? (ptr.over ? 0.6 : 1) : 0;
    
    alpha += (target - alpha) * Math.min(0.18 * dt, 1);
    energy *= Math.pow(0.9, dt);
    orb.x += (ptr.x - orb.x) * Math.min(0.4 * dt, 1);
    orb.y += (ptr.y - orb.y) * Math.min(0.4 * dt, 1);

    const charge = ptr.down ? Math.min((now - ptr.downAt) / 1200, 1) : 0;
    if (charge > 0.12) {
      const cnt = 1 + Math.round(charge * 3);
      for (let i = 0; i < cnt; i++) {
        const a = rnd(0, TAU), r = rnd(50, 90) + charge * 30, life = 24;
        dust(ptr.x + Math.cos(a) * r, ptr.y + Math.sin(a) * r,
          -Math.cos(a) * r / life, -Math.sin(a) * r / life,
          cosmicHue(rnd(-30, 60)), rnd(1.2, 2.6), life, 0, 1, 0);
      }
    }

    if (alpha > 0.03) {
      trail.push({ x: orb.x, y: orb.y });
      if (trail.length > TRAIL_LEN) trail.shift();
    } else {
      trail.length = 0;
    }
    
    c.lineCap = 'round';
    for (let i = 1; i < trail.length; i++) {
      const a = trail[i - 1], b = trail[i], p = i / trail.length;
      c.strokeStyle = `hsla(${cosmicHue((1 - p) * 90)},100%,${58 + p * 24}%,${p * 0.85 * alpha})`;
      c.lineWidth = 1 + p * (6 + energy * 7);
      c.beginPath(); 
      c.moveTo(a.x, a.y); 
      c.lineTo(b.x, b.y); 
      c.stroke();
    }

    let w = 0;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      p.l -= dt;
      if (p.l <= 0) continue;
      
      const cs = Math.cos(p.sw * dt), sn = Math.sin(p.sw * dt), d = Math.pow(p.dr, dt);
      const vx = p.vx * cs - p.vy * sn, vy = p.vx * sn + p.vy * cs;
      p.vx = vx * d; 
      p.vy = vy * d;
      p.x += p.vx * dt; 
      p.y += p.vy * dt; 
      p.rot += p.spin * dt;
      
      const a = p.l / p.m;
      if (p.k === 0) {
        c.fillStyle = `hsla(${p.h},100%,60%,${a * 0.3})`;
        c.beginPath(); c.arc(p.x, p.y, p.s * 2.6, 0, TAU); c.fill();
        c.fillStyle = `hsla(${p.h},100%,88%,${a})`;
        c.beginPath(); c.arc(p.x, p.y, p.s, 0, TAU); c.fill();
      } else {
        const tw = 0.55 + 0.45 * Math.sin(now / 70 + p.ph);
        c.fillStyle = `hsla(${p.h},100%,${p.k === 2 ? 86 : 78}%,${a * tw})`;
        star4(p.x, p.y, p.s * (0.4 + a * 0.6) * 2, p.rot);
      }
      parts[w++] = p;
    }
    parts.length = w;

    if (alpha > 0.03) {
      const h0 = cosmicHue();
      const R = 16 + energy * 22 + charge * 34 + Math.sin(now / 120) * 2;
      const g = c.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, R);
      g.addColorStop(0, `hsla(${h0},100%,95%,${0.95 * alpha})`);
      g.addColorStop(0.25, `hsla(${h0},100%,65%,${0.55 * alpha})`);
      g.addColorStop(1, `hsla(${h0 + 40},100%,50%,0)`);
      c.fillStyle = g;
      c.beginPath(); c.arc(orb.x, orb.y, R, 0, TAU); c.fill();
      c.fillStyle = `rgba(255,255,255,${0.9 * alpha})`;
      star4(orb.x, orb.y, 6 + energy * 10 + charge * 8, now / 400);
    }

    c.globalCompositeOperation = 'source-over';

    if (alpha > 0.03 || parts.length || rings.length) {
      raf = requestAnimationFrame(frame);
    } else {
      c.clearRect(0, 0, W, H);
    }
  }

  document.addEventListener('pointermove', e => {
    const x = e.clientX, y = e.clientY;
    ptr.over = !!(e.target.closest && e.target.closest('.card'));
    ptr.hide = false;
    ptr.lastMove = performance.now();
    
    if (!ptr.has) { 
      ptr.has = true; 
      ptr.px = x; 
      ptr.py = y; 
      orb.x = x; 
      orb.y = y; 
      trail = []; 
    }
    
    const dx = x - ptr.px, dy = y - ptr.py, dist = Math.hypot(dx, dy);
    ptr.x = x; ptr.y = y;
    energy = Math.min(1, energy + dist / 300);

    const keep = ptr.over ? 0.35 : 1;              
    const n = Math.min(8, Math.ceil(dist / 5));
    
    for (let i = 0; i < n; i++) {
      if (Math.random() > keep) continue;
      const f = (i + 1) / n, sx = ptr.px + dx * f, sy = ptr.py + dy * f;
      if (Math.random() < 0.12) { sparkleAt(sx, sy); continue; }
      const ang = rnd(0, TAU), sp = rnd(0.3, 1.4) + energy * 1.6;
      dust(sx, sy, Math.cos(ang) * sp - dx * 0.03, Math.sin(ang) * sp - dy * 0.03,
        cosmicHue(rnd(-40, 70)), rnd(1, 2.8), rnd(30, 60));
    }
    ptr.px = x; ptr.py = y;
    wake();
  }, { passive: true });

  document.addEventListener('pointerdown', e => {
    ptr.x = ptr.px = e.clientX; 
    ptr.y = ptr.py = e.clientY;
    if (!ptr.has || e.pointerType === 'touch') { 
      orb.x = ptr.x; 
      orb.y = ptr.y; 
      trail = []; 
    }
    ptr.has = true; 
    ptr.hide = false; 
    ptr.down = true;
    ptr.downAt = ptr.lastMove = performance.now();
    ptr.over = !!(e.target.closest && e.target.closest('.card'));
    
    burst(ptr.x, ptr.y, 0.55, 16);
    wake();
  }, { passive: true });

  function release(e) {
    if (!ptr.down) return;
    const held = performance.now() - ptr.downAt;
    ptr.down = false;
    
    if (e.type === 'pointerup') { 
      ptr.x = e.clientX; 
      ptr.y = e.clientY; 
    }
    if (held > 350) {                         
      const ch = Math.min(held / 1200, 1);
      burst(ptr.x, ptr.y, 0.7 + ch * 1.5, Math.round(30 + ch * 60));
    }
    if (e.pointerType === 'touch' || e.type === 'pointercancel') ptr.hide = true;
    wake();
  }
  
  document.addEventListener('pointerup', release, { passive: true });
  document.addEventListener('pointercancel', release, { passive: true });
  document.documentElement.addEventListener('mouseleave', () => { ptr.hide = true; });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && raf) { 
      cancelAnimationFrame(raf); 
      raf = null; 
    }
  });
})();

document.getElementById('gameBoard').addEventListener('click', e => {
  const card = e.target.closest('.card');
  if (card) handleCardClick(card);
});

document.getElementById('restartBtn').addEventListener('click', newGame);
document.getElementById('playAgainBtn').addEventListener('click', newGame);

document.getElementById('difficulty').addEventListener('change', e => {
  totalPairs = parseInt(e.target.value, 10);
  newGame();
});

document.getElementById('muteBtn').addEventListener('click', () => {
  muted = !muted;
  if (muted) { 
    stopAllSounds(); 
  }
  
  document.getElementById('muteBtn').innerHTML = muted
    ? '<i class="fas fa-volume-off"></i> Unmute'
    : '<i class="fas fa-volume-mute"></i> Mute';
});

document.addEventListener('DOMContentLoaded', () => {
  loadBestScore();
  newGame();
});