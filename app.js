const ROWS = [
  { letter: 'W', color: 'blue',   start: 1 },
  { letter: 'A', color: 'red',    start: 16 },
  { letter: 'C', color: 'black',  start: 31 },
  { letter: 'K', color: 'green',  start: 46 },
  { letter: 'O', color: 'orange', start: 61 },
];

// 5x5 pattern grid: index = row * 5 + col, row/col are 0-4.
function cellsWhere(predicate) {
  const cells = [];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (predicate(r, c)) cells.push(r * 5 + c);
    }
  }
  return cells;
}

// Column order on the board is W, A, C, K, O (col 0-4).
function colRows(col, rows) {
  return rows.map(r => r * 5 + col);
}

const TOP_LEFT_STAMP = cellsWhere((r, c) => r <= 1 && c <= 1);
const TOP_RIGHT_STAMP = cellsWhere((r, c) => r <= 1 && c >= 3);
const BOTTOM_LEFT_STAMP = cellsWhere((r, c) => r >= 3 && c <= 1);
const BOTTOM_RIGHT_STAMP = cellsWhere((r, c) => r >= 3 && c >= 3);

function block2x3(rowStart, colStart) {
  return cellsWhere((r, c) => r >= rowStart && r < rowStart + 2 && c >= colStart && c < colStart + 3);
}

// Postage Stamp cycles a 2x2 block clockwise through all four corners.
const POSTAGE_STAMP_SEQUENCE = [
  { cells: TOP_LEFT_STAMP, caption: 'Any corner 2x2 block wins' },
  { cells: TOP_RIGHT_STAMP, caption: 'Any corner 2x2 block wins' },
  { cells: BOTTOM_RIGHT_STAMP, caption: 'Any corner 2x2 block wins' },
  { cells: BOTTOM_LEFT_STAMP, caption: 'Any corner 2x2 block wins' },
];

// Six Pack slides a 2x3 block through every position on the board, starting top-left.
const SIX_PACK_SEQUENCE = [];
for (let r = 0; r <= 3; r++) {
  for (let c = 0; c <= 2; c++) {
    SIX_PACK_SEQUENCE.push({ cells: block2x3(r, c), caption: 'Any 2x3 block of six wins' });
  }
}

// Wacko cycles through every full line, then four corners, while selected.
const LINE_WIN_CAPTION = 'Any full line or 4 corners wins';
const LINE_SEQUENCE = [
  { cells: cellsWhere((r, c) => r === 0), caption: LINE_WIN_CAPTION },
  { cells: cellsWhere((r, c) => r === 1), caption: LINE_WIN_CAPTION },
  { cells: cellsWhere((r, c) => r === 2), caption: LINE_WIN_CAPTION },
  { cells: cellsWhere((r, c) => r === 3), caption: LINE_WIN_CAPTION },
  { cells: cellsWhere((r, c) => r === 4), caption: LINE_WIN_CAPTION },
  { cells: cellsWhere((r, c) => c === 0), caption: LINE_WIN_CAPTION },
  { cells: cellsWhere((r, c) => c === 1), caption: LINE_WIN_CAPTION },
  { cells: cellsWhere((r, c) => c === 2), caption: LINE_WIN_CAPTION },
  { cells: cellsWhere((r, c) => c === 3), caption: LINE_WIN_CAPTION },
  { cells: cellsWhere((r, c) => c === 4), caption: LINE_WIN_CAPTION },
  { cells: cellsWhere((r, c) => r === c), caption: LINE_WIN_CAPTION },
  { cells: cellsWhere((r, c) => r + c === 4), caption: LINE_WIN_CAPTION },
  {
    cells: cellsWhere((r, c) => (r === 0 || r === 4) && (c === 0 || c === 4)),
    caption: LINE_WIN_CAPTION,
  },
];

// Three Stamps cycles through every combination of 3-of-4 corner 2x2 stamps.
const THREE_STAMPS_SEQUENCE = [
  {
    cells: [...TOP_LEFT_STAMP, ...TOP_RIGHT_STAMP, ...BOTTOM_LEFT_STAMP],
    caption: 'Any 3 of 4 corner stamps win',
  },
  {
    cells: [...TOP_LEFT_STAMP, ...TOP_RIGHT_STAMP, ...BOTTOM_RIGHT_STAMP],
    caption: 'Any 3 of 4 corner stamps win',
  },
  {
    cells: [...TOP_LEFT_STAMP, ...BOTTOM_LEFT_STAMP, ...BOTTOM_RIGHT_STAMP],
    caption: 'Any 3 of 4 corner stamps win',
  },
  {
    cells: [...TOP_RIGHT_STAMP, ...BOTTOM_LEFT_STAMP, ...BOTTOM_RIGHT_STAMP],
    caption: 'Any 3 of 4 corner stamps win',
  },
];

// Wacko (Any Line) always stays first; everything else is alphabetical by label.
const PATTERNS = {
  line: {
    label: 'Wacko (Line or Corners)',
    sequence: LINE_SEQUENCE,
  },
  allEven: {
    label: 'All Even Numbers',
    caption: 'All even numbers on board are called.',
    boardRule: 'coverOdd',
  },
  allOdd: {
    label: 'All Odd Numbers',
    caption: 'All odd numbers on board are called.',
    boardRule: 'coverEven',
  },
  blackout: {
    label: 'Blackout (Coverall)',
    caption: 'Every number on the card must be covered',
    cells: cellsWhere(() => true),
  },
  diamond: {
    label: 'Diamond',
    caption: '',
    cells: cellsWhere((r, c) => Math.abs(r - 2) + Math.abs(c - 2) === 2),
  },
  goalPost: {
    label: 'Goal Post with Ball',
    caption: 'Goal post uprights with the ball below',
    cells: [
      ...colRows(0, [0, 1, 2]),
      ...colRows(1, [2]),
      ...colRows(2, [0, 2, 3, 4]),
      ...colRows(3, [2]),
      ...colRows(4, [0, 1, 2]),
    ],
  },
  hotDog: {
    label: 'Hot Dog',
    caption: '',
    cells: cellsWhere((r, c) => c === 2 || (r >= 1 && r <= 3 && c >= 1 && c <= 3)),
  },
  innerPictureFrame: {
    label: 'Inner Picture Frame',
    caption: '',
    cells: cellsWhere((r, c) => r >= 1 && r <= 3 && c >= 1 && c <= 3),
  },
  letterL: {
    label: 'Letter L',
    caption: 'Left column and bottom row',
    cells: cellsWhere((r, c) => c === 0 || r === 4),
  },
  letterM: {
    label: 'Letter M',
    caption: '',
    cells: cellsWhere((r, c) => c === 0 || c === 4 || (r <= 2 && (r === c || r + c === 4))),
  },
  letterT: {
    label: 'Letter T',
    caption: 'Top row and middle column',
    cells: cellsWhere((r, c) => r === 0 || c === 2),
  },
  letterW: {
    label: 'Letter W',
    caption: '',
    cells: cellsWhere((r, c) =>
      c === 0 || c === 4 ||
      (r === 2 && c === 2) ||
      (r === 3 && (c === 1 || c === 3))
    ),
  },
  pictureFrame: {
    label: 'Picture Frame',
    caption: 'All outer border cells',
    cells: cellsWhere((r, c) => r === 0 || r === 4 || c === 0 || c === 4),
  },
  plusSign: {
    label: 'Plus Sign (Cross)',
    caption: 'Middle row and middle column',
    cells: cellsWhere((r, c) => r === 2 || c === 2),
  },
  postageStamp: {
    label: 'Postage Stamp',
    sequence: POSTAGE_STAMP_SEQUENCE,
  },
  railroad: {
    label: 'Railroad Tracks',
    caption: 'First and last columns fully filled',
    cells: cellsWhere((r, c) => c === 0 || c === 4),
  },
  sixPack: {
    label: 'Six Pack',
    sequence: SIX_PACK_SEQUENCE,
  },
  threeStamps: {
    label: 'Three Stamps',
    sequence: THREE_STAMPS_SEQUENCE,
  },
  letterX: {
    label: 'Letter X',
    caption: 'Both diagonals must be filled',
    cells: cellsWhere((r, c) => r === c || r + c === 4),
  },
  noPattern: {
    label: 'No Pattern Selected',
    caption: 'No pattern selected for current game.',
    cells: [],
  },
};

const PATTERN_ORDER = [
  'line',
  'allEven',
  'allOdd',
  'blackout',
  'diamond',
  'goalPost',
  'hotDog',
  'innerPictureFrame',
  'letterL',
  'letterM',
  'letterT',
  'letterW',
  'letterX',
  'noPattern',
  'pictureFrame',
  'plusSign',
  'postageStamp',
  'railroad',
  'sixPack',
  'threeStamps',
];

const board = document.getElementById('board');
const calledDisplay = document.getElementById('called');
const ballsCalledCount = document.getElementById('ballsCalledCount');
const ballsCalledBlock = document.getElementById('ballsCalledBlock');
const toggleBallsCountBtn = document.getElementById('toggleBallsCountBtn');
const newGameBtn = document.getElementById('newGameBtn');
const patternSelect = document.getElementById('patternSelect');
const patternPreview = document.getElementById('patternPreview');
const previewGrid = document.getElementById('previewGrid');
const previewCaption = document.getElementById('previewCaption');

const DEFAULT_PATTERN = 'noPattern';
const ANIMATION_FRAME_MS = 1300;

function buildBoard() {
  board.innerHTML = '';
  ROWS.forEach(row => {
    const rowEl = document.createElement('div');
    rowEl.className = 'row';

    const letterBtn = document.createElement('button');
    letterBtn.className = 'cell letter-cell';
    letterBtn.textContent = row.letter;
    letterBtn.style.backgroundColor = row.color;
    letterBtn.addEventListener('click', () => toggleRow(row));
    rowEl.appendChild(letterBtn);

    for (let i = 0; i < 15; i++) {
      const num = row.start + i;
      const displayNum = String(num).padStart(2, '0');
      const btn = document.createElement('button');
      btn.className = 'cell';
      btn.id = `btn${num}`;
      btn.textContent = displayNum;
      btn.dataset.num = displayNum;
      btn.dataset.called = 'false';
      btn.style.backgroundColor = 'white';
      btn.style.color = row.color;
      btn.style.border = `2px solid ${row.color}`;
      btn.addEventListener('click', () => toggleNumber(btn, row, num));
      rowEl.appendChild(btn);
    }

    board.appendChild(rowEl);
  });
  updateBallsCalledCount();
}

// Counts only actual called numbers (highlighted and still showing their
// digits) — not numbers merely hidden by a row cover or the All Even/Odd
// Numbers board rule, since those aren't real ball draws.
function updateBallsCalledCount() {
  const count = ROWS.flatMap(row => rowCells(row))
    .filter(cell => cell.dataset.called === 'true' && cell.textContent !== '')
    .length;
  ballsCalledCount.textContent = count;
}

// The counter only shows for the Blackout pattern, or when manually toggled on.
let manualCounterVisible = false;

function updateCounterVisibility() {
  const shouldShow = manualCounterVisible || patternSelect.value === 'blackout';
  ballsCalledBlock.style.display = shouldShow ? '' : 'none';
  toggleBallsCountBtn.classList.toggle('active', manualCounterVisible);
  toggleBallsCountBtn.textContent = manualCounterVisible
    ? 'Hide Number of Balls Called'
    : 'Show Number of Balls Called';
}

function toggleNumber(btn, row, num) {
  const isCalled = btn.dataset.called === 'true';
  btn.dataset.called = String(!isCalled);
  btn.style.backgroundColor = isCalled ? 'white' : row.color;
  btn.style.color = isCalled ? row.color : 'white';

  if (isCalled) {
    // Restore the number in case a row cover had blanked it out.
    btn.textContent = btn.dataset.num;
  } else {
    calledDisplay.textContent = `${row.letter}${num}`;
  }
  updateBallsCalledCount();
}

function toggleRow(row) {
  const cells = rowCells(row);
  const allCalled = cells.every(c => c.dataset.called === 'true');
  cells.forEach(cell => {
    cell.dataset.called = String(!allCalled);
    cell.style.backgroundColor = allCalled ? 'white' : row.color;
    cell.style.color = allCalled ? row.color : 'white';
    cell.textContent = allCalled ? cell.dataset.num : '';
  });
  updateBallsCalledCount();
}

function rowCells(row) {
  const cells = [];
  for (let i = 0; i < 15; i++) {
    cells.push(document.getElementById(`btn${row.start + i}`));
  }
  return cells;
}

function setCellUncalled(cell, row) {
  cell.dataset.called = 'false';
  cell.style.backgroundColor = 'white';
  cell.style.color = row.color;
  cell.textContent = cell.dataset.num;
}

function setCellCovered(cell, row) {
  cell.dataset.called = 'true';
  cell.style.backgroundColor = row.color;
  cell.style.color = 'white';
  cell.textContent = '';
}

// Covers every odd (or every even) number on the real board so only the
// other half shows. Re-applying always starts from a clean board so the
// two rules never stack on top of each other.
function applyParityCover(coverOddNumbers) {
  ROWS.forEach(row => {
    rowCells(row).forEach(cell => {
      const isOdd = Number(cell.dataset.num) % 2 === 1;
      const shouldCover = coverOddNumbers ? isOdd : !isOdd;
      if (shouldCover) {
        setCellCovered(cell, row);
      } else {
        setCellUncalled(cell, row);
      }
    });
  });
  updateBallsCalledCount();
}

function buildPreviewGrid() {
  previewGrid.innerHTML = '';
  for (let i = 0; i < 25; i++) {
    const cell = document.createElement('div');
    cell.className = 'preview-cell';
    cell.dataset.index = i;
    previewGrid.appendChild(cell);
  }
}

function populatePatternSelect() {
  PATTERN_ORDER.forEach(key => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = PATTERNS[key].label;
    patternSelect.appendChild(option);
  });
  patternSelect.value = DEFAULT_PATTERN;
}

function highlightCells(cells) {
  const previewCells = previewGrid.querySelectorAll('.preview-cell');
  previewCells.forEach(cell => {
    const idx = Number(cell.dataset.index);
    cell.classList.toggle('hit', cells.includes(idx));
  });
}

let animTimer = null;
let animIndex = 0;
let activeSequence = null;

function stopAnimation() {
  if (animTimer) {
    clearInterval(animTimer);
    animTimer = null;
  }
}

function renderAnimFrame() {
  const frame = activeSequence[animIndex];
  previewCaption.textContent = frame.caption;
  highlightCells(frame.cells);
}

function startAnimation(sequence) {
  stopAnimation();
  activeSequence = sequence;
  animIndex = 0;
  renderAnimFrame();
  animTimer = setInterval(() => {
    animIndex = (animIndex + 1) % activeSequence.length;
    renderAnimFrame();
  }, ANIMATION_FRAME_MS);
}

function showPattern(key) {
  const pattern = PATTERNS[key];
  updateCounterVisibility();
  if (pattern.sequence) {
    startAnimation(pattern.sequence);
    return;
  }
  stopAnimation();
  if (pattern.boardRule) {
    applyParityCover(pattern.boardRule === 'coverOdd');
  }
  previewCaption.textContent = pattern.caption;
  highlightCells(pattern.cells || []);
}

function newGame() {
  buildBoard();
  calledDisplay.textContent = ' ';
  patternSelect.value = DEFAULT_PATTERN;
  showPattern(DEFAULT_PATTERN);
}

newGameBtn.addEventListener('click', newGame);
patternSelect.addEventListener('change', () => showPattern(patternSelect.value));
toggleBallsCountBtn.addEventListener('click', () => {
  manualCounterVisible = !manualCounterVisible;
  updateCounterVisibility();
});

buildBoard();
buildPreviewGrid();
populatePatternSelect();
showPattern(DEFAULT_PATTERN);
