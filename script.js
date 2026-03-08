/* ════════════════════════════════════════════════
   STATE
════════════════════════════════════════════════ */
const TOTAL_SCENES = 10;
let currentScene = 0;
let isTransitioning = false;

/* ════════════════════════════════════════════════
   SCENE NAVIGATION
════════════════════════════════════════════════ */
function goToScene(index, direction = 1) {
  if (isTransitioning) return;
  if (index < 0 || index >= TOTAL_SCENES) return;
  if (index === currentScene) return;

  isTransitioning = true;

  const outEl = document.getElementById(`scene-${currentScene}`);
  const inEl = document.getElementById(`scene-${index}`);

  // Reset stagger children in destination scene
  resetStagger(inEl);

  // Scroll destination to top
  const inner = inEl.querySelector('.scene-inner');
  if (inner) inner.scrollTop = 0;

  // Exit current
  outEl.classList.add('exit');
  setTimeout(() => {
    outEl.classList.remove('active', 'exit');
  }, 550);

  // Enter new
  setTimeout(() => {
    inEl.classList.add('active');
    currentScene = index;
    updateProgress();
    updateBackBtn();
    handleSceneEnter(index);
    setTimeout(() => { isTransitioning = false; }, 650);
  }, 180);
}

function nextScene() { goToScene(currentScene + 1, 1); }
function prevScene() { goToScene(currentScene - 1, -1); }
function restartJourney() { goToScene(0, -1); }

function resetStagger(sceneEl) {
  sceneEl.querySelectorAll('[class*="stagger-"]').forEach(el => {
    // Force animation restart
    el.style.animation = 'none';
    el.style.opacity = '0';
    void el.offsetWidth; // reflow
    el.style.animation = '';
    el.style.opacity = '';
  });
}

/* ════════════════════════════════════════════════
   PROGRESS DOTS
════════════════════════════════════════════════ */
function buildProgress() {
  const nav = document.getElementById('progressNav');
  for (let i = 0; i < TOTAL_SCENES; i++) {
    const btn = document.createElement('button');
    btn.className = 'progress-dot' + (i === 0 ? ' active' : '');
    btn.setAttribute('aria-label', `Go to scene ${i + 1}`);
    btn.addEventListener('click', () => goToScene(i));
    nav.appendChild(btn);
  }
}

function updateProgress() {
  document.querySelectorAll('.progress-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentScene);
  });
}

function updateBackBtn() {
  const btn = document.getElementById('backBtn');
  btn.classList.toggle('visible', currentScene > 0);
}

/* ════════════════════════════════════════════════
   SCENE ENTER CALLBACKS
════════════════════════════════════════════════ */
function handleSceneEnter(index) {
  if (index === 9) {
    triggerConfetti();
  }
  if (index === 1) {
    // Subtle sparkle pulse on reveal
    setTimeout(() => pulseReveal(), 400);
  }
}

function pulseReveal() {
  const name = document.querySelector('#scene-1 .big-name');
  if (!name) return;
  name.style.transition = 'text-shadow 0.6s ease';
  name.style.textShadow = '0 0 60px rgba(201, 123, 144, 0.5)';
  setTimeout(() => {
    name.style.textShadow = '0 4px 24px rgba(201, 123, 144, 0.2)';
  }, 800);
}

/* ════════════════════════════════════════════════
   GIFT BOX INTERACTION
════════════════════════════════════════════════ */
document.getElementById('openGiftBtn').addEventListener('click', function (e) {
  e.stopPropagation();
  const lid = document.getElementById('giftLid');
  const burst = document.getElementById('giftBurst');

  // 1. Lid opens
  lid.classList.add('opened');

  // 2. Burst
  setTimeout(() => {
    burst.classList.add('exploding');
  }, 300);

  // 3. Scatter petals from box position
  const box = document.getElementById('giftWrapper');
  const rect = box.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  spawnFlowers(cx, cy, 10);

  // 4. Transition to scene 1
  setTimeout(() => {
    goToScene(1, 1);
    // Reset lid after transition
    setTimeout(() => {
      lid.classList.remove('opened');
      burst.classList.remove('exploding');
    }, 1000);
  }, 900);
});

/* ════════════════════════════════════════════════
   BACK BUTTON
════════════════════════════════════════════════ */
document.getElementById('backBtn').addEventListener('click', prevScene);

/* ════════════════════════════════════════════════
   CUSTOM CURSOR (COMET TRAIL)
════════════════════════════════════════════════ */
const cursorDot = document.getElementById('cursorDot');
const trailContainer = document.getElementById('cursorTrailContainer');

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let cursorX = mouseX;
let cursorY = mouseY;

// Create trail dots
const trailDots = [];
const trailCount = 12; // Length of the comet tail
for (let i = 0; i < trailCount; i++) {
  const dot = document.createElement('div');
  dot.className = 'cursor-trail';
  trailContainer.appendChild(dot);
  trailDots.push({
    element: dot,
    x: cursorX,
    y: cursorY
  });
}

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateCursor() {
  // Move main dot smoothly
  cursorX += (mouseX - cursorX) * 0.3;
  cursorY += (mouseY - cursorY) * 0.3;

  cursorDot.style.left = cursorX + 'px';
  cursorDot.style.top = cursorY + 'px';

  // Animate trail 
  let leadX = cursorX;
  let leadY = cursorY;

  for (let i = 0; i < trailCount; i++) {
    const pt = trailDots[i];

    // Spring physics per dot following the lead
    pt.x += (leadX - pt.x) * 0.4;
    pt.y += (leadY - pt.y) * 0.4;

    pt.element.style.left = pt.x + 'px';
    pt.element.style.top = pt.y + 'px';

    // Scale and opacity tapering off
    const scale = 1 - (i / trailCount);
    pt.element.style.width = (10 * scale) + 'px';
    pt.element.style.height = (10 * scale) + 'px';
    pt.element.style.opacity = scale * 0.6;

    leadX = pt.x;
    leadY = pt.y;
  }

  requestAnimationFrame(animateCursor);
}
animateCursor();

// Scale cursor on hover of interactive elements
const interactables = 'button, a, .q-card, .pillar, .inspo-card, .pride-card, .study-pill, .music-btn';
document.addEventListener('mouseover', e => {
  if (e.target.closest(interactables)) {
    cursorDot.style.transform = 'translate(-50%, -50%) scale(2.5)';
    cursorDot.style.background = 'transparent';
    cursorDot.style.border = '1.5px solid var(--white)';

    // Fade out trail on hover
    trailContainer.style.opacity = '0';
    trailContainer.style.transition = 'opacity 0.2s';
  }
});
document.addEventListener('mouseout', e => {
  if (e.target.closest(interactables)) {
    cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
    cursorDot.style.background = 'var(--white)';
    cursorDot.style.border = 'none';

    // Fade in trail after hover
    trailContainer.style.opacity = '1';
  }
});

/* ════════════════════════════════════════════════
   FLOATING PETAL CANVAS
════════════════════════════════════════════════ */
const petalCanvas = document.getElementById('petal-canvas');
const pctx = petalCanvas.getContext('2d');
let PW, PH, petals = [];

function resizePetalCanvas() {
  PW = petalCanvas.width = window.innerWidth;
  PH = petalCanvas.height = window.innerHeight;
}
resizePetalCanvas();
window.addEventListener('resize', resizePetalCanvas);

const PETAL_COLORS = [
  'rgba(249, 212, 224, 0.7)',
  'rgba(232, 165, 184, 0.6)',
  'rgba(216, 200, 237, 0.5)',
  'rgba(201, 123, 144, 0.4)',
  'rgba(249, 224, 236, 0.65)',
  'rgba(232, 213, 163, 0.4)',
];

class Petal {
  constructor(randomY = false) {
    this.reset(randomY);
  }
  reset(randomY = false) {
    this.x = Math.random() * PW;
    this.y = randomY ? Math.random() * PH : PH + 20;
    this.size = Math.random() * 5 + 2;
    this.speed = Math.random() * 0.6 + 0.25;
    this.drift = (Math.random() - 0.5) * 0.5;
    this.opacity = Math.random() * 0.5 + 0.2;
    this.color = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
    this.angle = Math.random() * Math.PI * 2;
    this.spin = (Math.random() - 0.5) * 0.03;
    this.twinkle = Math.random() * Math.PI * 2;
  }
  update() {
    this.y -= this.speed;
    this.x += this.drift + Math.sin(this.angle) * 0.4;
    this.angle += 0.015;
    this.twinkle += 0.025;
    this.spin = (Math.random() - 0.5) * 0.03;
    if (this.y < -20) this.reset();
  }
  draw() {
    const op = this.opacity * (0.75 + 0.25 * Math.sin(this.twinkle));
    pctx.save();
    pctx.globalAlpha = op;
    pctx.fillStyle = this.color;
    pctx.translate(this.x, this.y);
    pctx.rotate(this.angle);

    // Draw a soft petal shape
    pctx.beginPath();
    pctx.ellipse(0, 0, this.size, this.size * 1.6, 0, 0, Math.PI * 2);
    pctx.fill();

    // Shimmer for larger petals
    if (this.size > 4) {
      pctx.globalAlpha = op * 0.3;
      pctx.fillStyle = 'rgba(255,255,255,0.8)';
      pctx.beginPath();
      pctx.ellipse(-1, -1, this.size * 0.3, this.size * 0.5, -0.5, 0, Math.PI * 2);
      pctx.fill();
    }
    pctx.restore();
  }
}

for (let i = 0; i < 70; i++) petals.push(new Petal(true));

(function animatePetals() {
  pctx.clearRect(0, 0, PW, PH);
  petals.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animatePetals);
})();

/* ════════════════════════════════════════════════
   CONFETTI (SCENE 9)
════════════════════════════════════════════════ */
const confCanvas = document.getElementById('confetti-canvas');
const cctx = confCanvas.getContext('2d');
let confPieces = [];
let confRunning = false;

function resizeConfCanvas() {
  confCanvas.width = window.innerWidth;
  confCanvas.height = window.innerHeight;
}
resizeConfCanvas();
window.addEventListener('resize', resizeConfCanvas);

const CONF_COLORS = [
  '#F9C6D0', '#E8A5B8', '#D8C8ED', '#C9A96E',
  '#E8D5A3', '#F0B8CA', '#FFD6E0', '#C9A8E8',
];

class ConfPiece {
  constructor() {
    this.x = Math.random() * confCanvas.width;
    this.y = -20;
    this.size = Math.random() * 8 + 4;
    this.speedY = Math.random() * 3 + 2;
    this.speedX = (Math.random() - 0.5) * 2.5;
    this.spin = (Math.random() - 0.5) * 0.15;
    this.angle = 0;
    this.color = CONF_COLORS[Math.floor(Math.random() * CONF_COLORS.length)];
    this.shape = Math.random() > 0.5 ? 'rect' : 'circle';
    this.opacity = 1;
  }
  update() {
    this.y += this.speedY;
    this.x += this.speedX;
    this.angle += this.spin;
    if (this.y > confCanvas.height + 20) this.opacity = 0;
  }
  draw() {
    cctx.save();
    cctx.globalAlpha = this.opacity;
    cctx.fillStyle = this.color;
    cctx.translate(this.x, this.y);
    cctx.rotate(this.angle);
    if (this.shape === 'rect') {
      cctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
    } else {
      cctx.beginPath();
      cctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
      cctx.fill();
    }
    cctx.restore();
  }
}

function triggerConfetti() {
  confCanvas.classList.add('active');
  confPieces = [];
  for (let i = 0; i < 180; i++) {
    const p = new ConfPiece();
    p.y = -Math.random() * 400; // stagger start heights
    confPieces.push(p);
  }
  confRunning = true;
  animateConf();
}

function animateConf() {
  if (!confRunning) return;
  cctx.clearRect(0, 0, confCanvas.width, confCanvas.height);
  confPieces.forEach(p => { p.update(); p.draw(); });
  confPieces = confPieces.filter(p => p.opacity > 0);
  if (confPieces.length > 0) {
    requestAnimationFrame(animateConf);
  } else {
    confRunning = false;
    confCanvas.classList.remove('active');
    cctx.clearRect(0, 0, confCanvas.width, confCanvas.height);
  }
}

/* ════════════════════════════════════════════════
   FLOWER BLOOM ON CLICK
════════════════════════════════════════════════ */
const FLOWERS = ['🌸', '🌺', '✿', '❀', '🌼', '🌷', '💮'];

function spawnFlowers(x, y, count = 1) {
  for (let i = 0; i < count; i++) {
    const f = document.createElement('div');
    f.className = 'flower-click';
    f.textContent = FLOWERS[Math.floor(Math.random() * FLOWERS.length)];
    const offset = count > 1 ? (Math.random() - 0.5) * 60 : 0;
    f.style.left = (x + offset - 12) + 'px';
    f.style.top = (y + (Math.random() - 0.5) * 40 - 12) + 'px';
    f.style.fontSize = (14 + Math.random() * 16) + 'px';
    f.style.animationDelay = (Math.random() * 0.2) + 's';
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 2800);
  }
}

document.addEventListener('click', e => {
  // Skip if clicking a button to avoid double triggers
  if (!e.target.closest('button')) {
    spawnFlowers(e.clientX, e.clientY, 1);
  }
});

/* ════════════════════════════════════════════════
   AMBIENT MUSIC (Web Audio API)
════════════════════════════════════════════════ */
const musicBtn = document.getElementById('musicBtn');
const bgMusic = document.getElementById('bgMusic');
let audioCtx, playing = false, gainNode, oscillators = [];

function createAmbience() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  gainNode = audioCtx.createGain();
  gainNode.gain.value = 0;
  gainNode.connect(audioCtx.destination);

  // Soft chord: F major 9 (updated for a more ethereal sound)
  const freqs = [174.61, 220.00, 261.63, 329.63, 392.00];
  freqs.forEach(freq => {
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    g.gain.value = 0.035;
    osc.connect(g);
    g.connect(gainNode);
    osc.start();
    oscillators.push(osc);
  });
}

musicBtn.addEventListener('click', () => {
  playing = !playing;

  // Check if there is an actual audio source loaded
  const hasAudioSource = bgMusic && bgMusic.getAttribute('src') && bgMusic.getAttribute('src') !== '';

  if (hasAudioSource && (bgMusic.src.includes('.mp3') || bgMusic.src.includes('.ogg'))) {
    // Play custom song
    if (playing) {
      bgMusic.play().catch(() => console.log('Audio play failed, maybe no file found'));
    } else {
      bgMusic.pause();
    }
  } else {
    // Fallback to ambient synthesized sound
    createAmbience();
    gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      playing ? 0.85 : 0,
      audioCtx.currentTime + 1.5
    );
  }

  musicBtn.textContent = playing ? '♫' : '♪';
  musicBtn.classList.toggle('playing', playing);

  const songTitleBtn = document.getElementById('songTitle');
  if (songTitleBtn) {
    songTitleBtn.classList.toggle('playing', playing);
  }
});

/* ════════════════════════════════════════════════
   KEYBOARD NAVIGATION
════════════════════════════════════════════════ */
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextScene();
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prevScene();
});

/* ════════════════════════════════════════════════
   TOUCH / SWIPE NAVIGATION
════════════════════════════════════════════════ */
let touchStartX = 0, touchStartY = 0;
document.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  // Only horizontal swipe that's clearly more horizontal than vertical
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
    if (dx < 0) nextScene();
    else prevScene();
  }
}, { passive: true });

/* ════════════════════════════════════════════════
   TEXT ANIMATION UTILITIES
════════════════════════════════════════════════ */
function splitTextNodes(node, type, delayOffset) {
  let count = delayOffset;
  const fragment = document.createDocumentFragment();

  Array.from(node.childNodes).forEach(child => {
    if (child.nodeType === 3) { // TEXT_NODE
      const text = child.textContent;
      if (type === 'letters') {
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          if (char === '\n' || char === '\r') continue;
          if (char === ' ' || char === '\t') {
            fragment.appendChild(document.createTextNode(char));
          } else {
            const span = document.createElement('span');
            span.textContent = char;
            span.className = 'char-span';
            span.style.animationDelay = (count * 0.02) + 's';
            count++;
            fragment.appendChild(span);
          }
        }
      } else if (type === 'words') {
        const words = text.split(/(\s+)/);
        words.forEach(word => {
          if (!word) return;
          if (word.trim().length === 0) {
            fragment.appendChild(document.createTextNode(word));
          } else {
            const span = document.createElement('span');
            span.textContent = word;
            span.className = 'word-span';
            span.style.animationDelay = (count * 0.04) + 's';
            fragment.appendChild(span);
            count++;
          }
        });
      }
    } else if (child.nodeType === 1) { // ELEMENT_NODE
      if (child.tagName.toLowerCase() === 'br') {
        fragment.appendChild(child.cloneNode());
      } else {
        const clone = child.cloneNode(false);
        const res = splitTextNodes(child, type, count);
        clone.appendChild(res.fragment);
        fragment.appendChild(clone);
        count = res.count;
      }
    }
  });
  return { fragment, count };
}

// Wait until DOM is fully loaded to run splitters
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.animate-word').forEach(el => {
    const res = splitTextNodes(el, 'words', 0);
    el.innerHTML = '';
    el.appendChild(res.fragment);
  });
  document.querySelectorAll('.animate-letter').forEach(el => {
    const res = splitTextNodes(el, 'letters', 0);
    el.innerHTML = '';
    el.appendChild(res.fragment);
  });
});

/* ════════════════════════════════════════════════
   INIT
════════════════════════════════════════════════ */
buildProgress();
updateBackBtn();