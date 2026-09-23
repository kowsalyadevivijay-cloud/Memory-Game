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
let firstCard = null, secondCard = null;
let matches = 0, moves = 0;
let startTime = null, timerInterval = null;
let canFlip = true, totalPairs = 8;
let muted = false;
const sounds = {
  flip: new Audio('sounds/flip.mp3'),
  match: new Audio('sounds/match.mp3'),
  win: new Audio('sounds/win.mp3')
};
sounds.flip.volume = 0.5;
sounds.match.volume = 0.8;
sounds.win.volume = 1.0;

function playSound(name) {
  if (!muted) {
    const sound = sounds[name];
    sound.pause();
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }
}
function stopAllSounds() {
  Object.values(sounds).forEach(s => {
    s.pause();
    s.currentTime = 0;
  });
}
function shuffle(arr) { return arr.sort(() => Math.random() - 0.5); }
function buildDeck() {
  const selected = allImages.slice(0, totalPairs);
  return shuffle(selected.concat(selected));
}
function flipCard(card) { card.classList.add('flipped'); }
function unflipCard(card) { card.classList.remove('flipped'); }
function markMatched(card) { card.classList.add('matched'); }
function resetPair() { firstCard = null; secondCard = null; canFlip = true; }
function updateHUD() {
  document.getElementById('moves').textContent = moves;
  document.getElementById('matches').textContent = `${matches}/${totalPairs}`;
  if (startTime) {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    document.getElementById('time').textContent = `${mins}:${secs < 10 ? '0'+secs : secs}`;
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
  return [moves, m*60+s];
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
  const match = firstCard.dataset.image === secondCard.dataset.image;
  if (match) {
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
  document.getElementById('muteBtn').innerHTML = muted
    ? '<i class="fas fa-volume-off"></i> Unmute'
    : '<i class="fas fa-volume-mute"></i> Mute';
});
document.addEventListener("mousemove", (e) => {
  const target = e.target;
  if (target.classList.contains("card")) {
    return; 
  }
  const star = document.createElement("div");
  star.style.position = "fixed";
  star.style.width = "10px";
  star.style.height = "10px";
  star.style.borderRadius = "50%";
  star.style.background = "radial-gradient(circle, #fff, #6cf, #90f)";
  star.style.boxShadow = "0 0 15px #9cf";
  star.style.pointerEvents = "none";
  star.style.left = e.clientX + "px";
  star.style.top = e.clientY + "px";
  star.style.opacity = "1";
  star.style.transition = "opacity 1s, transform 1s";
  star.style.zIndex = "0";

  document.body.appendChild(star);
  requestAnimationFrame(() => {
    star.style.opacity = "0";
    star.style.transform = "scale(0.3)";
  });

  setTimeout(() => star.remove(), 1000);
});
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
document.addEventListener('DOMContentLoaded', () => {
  loadBestScore();
  newGame();
});