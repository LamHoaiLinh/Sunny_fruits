import { create as createSpotDiff } from './games/spot-diff.js';
import { create as createColorMatch } from './games/color-match.js';
import { create as createMaze } from './games/maze.js';
import { create as createObstacle } from './games/obstacle.js';
import { create as createShock } from './games/shock.js';
import { create as createSchulte } from './games/schulte.js';

const GAMES = [
  { id: 'spot-diff', name: '找不同', icon: '🔍', desc: '点击或画圈找出两图不同，支持上传图片和免费 AI 生成', color: '#ffe0b2', create: createSpotDiff },
  { id: 'color-match', name: '找相近颜色', icon: '🎨', desc: '在一堆相近颜色里，找到唯一不一样的那一个', color: '#d1c4e9', create: createColorMatch },
  { id: 'maze', name: '走迷宫', icon: '🌀', desc: '用手指拖动小球，穿过迷宫到达终点', color: '#b2dfdb', create: createMaze },
  { id: 'obstacle', name: '过障碍', icon: '🦘', desc: '点击屏幕让小青蛙跳过障碍物，越跳越远', color: '#c8e6c9', create: createObstacle },
  { id: 'shock', name: '防触电', icon: '⚡', desc: '小蜜蜂送花蜜：按住慢慢滑，别碰带电的蜘蛛网', color: '#ffcdd2', create: createShock },
  { id: 'schulte', name: '舒尔特方格', icon: '🔢', desc: '按顺序从 1 点到最后，训练注意力和反应力', color: '#b3e5fc', create: createSchulte },
];

const root = document.getElementById('root');
let currentCleanup = null;

// Every Sunny Mouse game is a first-level navigation item.
// Direct launch avoids showing the old Kids Focus intermediate game grid.
const gameId = new URLSearchParams(window.location.search).get('game');

function returnToSunnyMouse() {
  if (currentCleanup) { currentCleanup(); currentCleanup = null; }
  window.location.assign('../index.html');
}

function openGame(id) {
  const selected = GAMES.find(game => game.id === id);
  if (!selected) { returnToSunnyMouse(); return; }
  if (currentCleanup) { currentCleanup(); currentCleanup = null; }
  root.innerHTML = '';
  document.title = 'Sunny Mouse · ' + document.querySelector('[data-sunny-game="' + id + '"]')?.textContent?.trim();
  document.querySelectorAll('[data-sunny-game]').forEach(link => {
    const isActive=link.dataset.sunnyGame===id;
    link.classList.toggle('active',isActive);
    if (isActive) link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  });
  // The callbacks formerly returned to an intermediate Kids Focus grid.
  // Return to the top-level Sunny Mouse menu instead; gameplay remains intact.
  currentCleanup = selected.create(root, returnToSunnyMouse) || null;
  // In the small-screen horizontal tab strip, keep the selected game in view.
  const nav = document.querySelector('.sunny-flat-nav');
  const active = document.querySelector('[data-sunny-game="' + id + '"]');
  if(nav && active && nav.scrollWidth > nav.clientWidth)
    nav.scrollLeft = Math.max(0,active.offsetLeft - nav.offsetLeft - (nav.clientWidth-active.offsetWidth)/2);
  window.scrollTo({ top: 0 });
}

document.getElementById('btn-home').addEventListener('click', event => {
  event.preventDefault();
  returnToSunnyMouse();
});

if (GAMES.some(game => game.id === gameId)) openGame(gameId);
else returnToSunnyMouse();
