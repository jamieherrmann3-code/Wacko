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

// Wacko cycles through every possible line, in this order, while selected.
const LINE_SEQUENCE = [
  { cells: cellsWhere((r, c) => r === 0), caption: 'Top row' },
  { cells: cellsWhere((r, c) => r === 1), caption: 'Row 2' },
  { cells: cellsWhere((r, c) => r === 2), caption: 'Row 3' },
  { cells: cellsWhere((r, c) => r === 3), caption: 'Row 4' },
  { cells: cellsWhere((r, c) => r === 4), caption: 'Bottom row' },
  { cells: cellsWhere((r, c) => c === 0), caption: 'Left column' },
  { cells: cellsWhere((r, c) => c === 1), caption: 'Column 2' },
  { cells: cellsWhere((r, c) => c === 2), caption: 'Column 3' },
  { cells: cellsWhere((r, c) => c === 3), caption: 'Column 4' },
  { cells: cellsWhere((r, c) => c === 4), caption: 'Right column' },
  { cells: cellsWhere((r, c) => r === c), caption: 'Diagonal, top-left to bottom-right' },
  { cells: cellsWhere((r, c) => r + c === 4), caption: 'Diagonal, top-right to bottom-left' },
];
const LINE_FRAME_MS = 1300;

// Order here is the order shown in the dropdown — Wacko (Line) stays first.
const PATTERNS = {
  line: {
    label: 'Wacko (Any Line)',
    animated: true,
  },
  fourCorners: {
    label: 'Four Corners',
    caption: 'All four corners must be filled',
    cells: cellsWhere((r, c) => (r === 0 || r === 4) && (c === 0 || c === 4)),
  },
  x: {
    label: 'X (Double X)',
    caption: 'Both diagonals must be filled',
    cells: cellsWhere((r, c) => r === c || r + c === 4),
  },
  postageStamp: {
    label: 'Postage Stamp',
    caption: 'A 2x2 block in any corner — top-left shown',
    cells: cellsWhere((r, c) => r <= 1 && c <= 1),
  },
  smallDiamond: {
    label: 'Small Diamond',
    caption: 'Diamond ring around the center',
    cells: cellsWhere((r, c) => Math.abs(r - 2) + Math.abs(c - 2) === 2),
  },
  plusSign: {
    label: 'Plus Sign (Cross)',
    caption: 'Middle row and middle column',
    cells: cellsWhere((r, c) => r === 2 || c === 2),
  },
  letterT: {
    label: 'Letter T',
    caption: 'Top row and middle column',
    cells: cellsWhere((r, c) => r === 0 || c === 2),
  },
  letterL: {
    label: 'Letter L',
    caption: 'Left column and bottom row',
    cells: cellsWhere((r, c) => c === 0 || r === 4),
  },
  frame: {
    label: 'Frame (Outside Edge)',
    caption: 'All outer border cells',
    cells: cellsWhere((r, c) => r === 0 || r === 4 || c === 0 || c === 4),
  },
  railroad: {
    label: 'Railroad Tracks',
    caption: 'First and last columns fully filled',
    cells: cellsWhere((r, c) => c === 0 || c === 4),
  },
  sixPack: {
    label: 'Six Pack',
    caption: 'Any 2x3 block — center-left shown',
    cells: cellsWhere((r, c) => r >= 1 && r <= 2 && c >= 1 && c <= 3),
  },
  blackout: {
    label: 'Blackout (Coverall)',
    caption: 'Every cell on the card must be filled',
    cells: cellsWhere(() => true),
  },
};

const board = document.getElementById('board');
const calledDisplay = document.getElementById('called');
const newGameBtn = document.getElementById('newGameBtn');
const patternSelect = document.getElementById('patternSelect');
const patternPreview = document.getElementById('patternPreview');
const previewGrid = document.getElementById('previewGrid');
const previewCaption = document.getElementById('previewCaption');

const DEFAULT_PATTERN = 'line';

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
      const btn = document.createElement('button');
      btn.className = 'cell';
      btn.id = `btn${num}`;
      btn.textContent = num;
      btn.dataset.called = 'false';
      btn.style.backgroundColor = 'white';
      btn.style.color = row.color;
      btn.style.border = `2px solid ${row.color}`;
      btn.addEventListener('click', () => toggleNumber(btn, row, num));
      rowEl.appendChild(btn);
    }

    board.appendChild(rowEl);
  });
}

function toggleNumber(btn, row, num) {
  const isCalled = btn.dataset.called === 'true';
  btn.dataset.called = String(!isCalled);
  btn.style.backgroundColor = isCalled ? 'white' : row.color;
  btn.style.color = isCalled ? row.color : 'white';

  if (!isCalled) {
    calledDisplay.textContent = `${row.letter}${num}`;
  }
}

function toggleRow(row) {
  const cells = rowCells(row);
  const allCalled = cells.every(c => c.dataset.called === 'true');
  cells.forEach(cell => {
    cell.dataset.called = String(!allCalled);
    cell.style.backgroundColor = allCalled ? 'white' : row.color;
    cell.style.color = allCalled ? row.color : 'white';
  });
}

function rowCells(row) {
  const cells = [];
  for (let i = 0; i < 15; i++) {
    cells.push(document.getElementById(`btn${row.start + i}`));
  }
  return cells;
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
  Object.entries(PATTERNS).forEach(([key, pattern]) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = pattern.label;
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

let lineTimer = null;
let lineIndex = 0;

function stopLineCycle() {
  if (lineTimer) {
    clearInterval(lineTimer);
    lineTimer = null;
  }
}

function renderLineFrame() {
  const frame = LINE_SEQUENCE[lineIndex];
  previewCaption.textContent = `${frame.caption} — any full line wins`;
  highlightCells(frame.cells);
}

function startLineCycle() {
  stopLineCycle();
  lineIndex = 0;
  renderLineFrame();
  lineTimer = setInterval(() => {
    lineIndex = (lineIndex + 1) % LINE_SEQUENCE.length;
    renderLineFrame();
  }, LINE_FRAME_MS);
}

function showPattern(key) {
  if (PATTERNS[key].animated) {
    startLineCycle();
    return;
  }
  stopLineCycle();
  const pattern = PATTERNS[key];
  previewCaption.textContent = pattern.caption;
  highlightCells(pattern.cells);
}

function newGame() {
  buildBoard();
  calledDisplay.textContent = ' ';
  patternSelect.value = DEFAULT_PATTERN;
  showPattern(DEFAULT_PATTERN);
}

newGameBtn.addEventListener('click', newGame);
patternSelect.addEventListener('change', () => showPattern(patternSelect.value));

buildBoard();
buildPreviewGrid();
populatePatternSelect();
showPattern(DEFAULT_PATTERN);
