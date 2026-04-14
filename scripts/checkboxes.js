class CheckboxToy {
  constructor() {
    this.containerId = "checkboxes-container";
    this.el = null;
    this.isMouseDown = false;
    this.drawMode = true;
    this.lastIndex = -1;

    // Exact 56x56 bitmap from Images/mystro icon.bmp
    this.LOGO_BITMAP = [
      "00000000000000000000000000000000000000000000000000000000",
      "00000000000000000000000000000000000000000000000000000000",
      "00000000000000000000000000000000000000000000000000000000",
      "00000000000000000000000000000000000000000000000000000000",
      "00000000000000000000000000000000000000000000000000000000",
      "00000000000000000000000000000000000000000000000000000000",
      "00000000000000000000000000000000000000000000000000000000",
      "00000000000000000000000001110000000000000000000000000000",
      "00000000000000000000000011111000000000000000000000000000",
      "00000000000000000000001111011000000000000000000000000000",
      "00000000000000000000111100001100000000000000000000000000",
      "00000000000000000011110000000110000000000000000000000000",
      "00000000000000011111000000000111000000000000000000000000",
      "00000000000000011100000000000011100000000000000000000000",
      "00000000000000011100000000000011100000000000000000000000",
      "00000000000000011100000000000111000000000000000000000000",
      "00000000000000011110001111000110000000000000000000000000",
      "00000000000000000110111111001110000000000000000000000000",
      "00000000000000000011111110001100000000000000000000000000",
      "00000000000000000001001110011000000000000000000000000000",
      "00000000000000000000001100011000000000000000000000000000",
      "00000000000000000000011100110000000000000000000000000000",
      "00000000000000000000011000110001100000000000000000000000",
      "00000000000000000000111001100111111100000000000000000000",
      "00000000000000000000110001111110011111000000000000000000",
      "00000000000000000001110011111000000111000000000000000000",
      "00000000000000000001100011110000000001100000000000000000",
      "00000000000000000001100111000000000001110000000000000000",
      "00000000000000000011000110000000000000110000000000000000",
      "00000000000000000011000000000000000000110000000000000000",
      "00000000000000000111000000000000000000011000000000000000",
      "00000000000000000110000000000000000000011000000000000000",
      "00000000000000000110000000000001111111101100000000000000",
      "00000000000000001100000000111111111111101100000000000000",
      "00000000000000001100000011111111010111001100000000000000",
      "00000000000000011000000111010110011110011000000000000000",
      "00000000000000011000000110110110011100111000000000000000",
      "00000000000000110000000011110011011000110000000000000000",
      "00000000000000110000110001110011111001100000000000000000",
      "00000000000001100001111001110011100011100000000000000000",
      "00000000000011100011011100111111000111000000000000000000",
      "00000000000011000111001110011100000111000110000000000000",
      "00000000000011000111000111000000010011111111000000000000",
      "00000000000011100011000011111111111001111011100000000000",
      "00000000000001110001100000111111111100100111000000000000",
      "00000000000000111000110000000000000110011110000000000000",
      "00000000000000001100110000000000000011111000000000000000",
      "00000000000000000111100000000000000011110000000000000000",
      "00000000000000000011000000000000000001000000000000000000",
      "00000000000000000000000000000000000000000000000000000000",
      "00000000000000000000000000000000000000000000000000000000",
      "00000000000000000000000000000000000000000000000000000000",
      "00000000000000000000000000000000000000000000000000000000",
      "00000000000000000000000000000000000000000000000000000000",
      "00000000000000000000000000000000000000000000000000000000",
      "00000000000000000000000000000000000000000000000000000000",
    ];

    this.FONT = {
      C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
      O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
      N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
      E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
      P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
      T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
      I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
      X: ["10001", "01010", "00100", "01010", "10001", "10001", "10001"],
      R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
      M: ["10001", "11011", "10101", "10001", "10001", "10001", "10001"],
      A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
      L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
      G: ["01110", "10001", "10000", "10111", "10001", "10001", "01110"],
      H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
    };

    this.WORDS = ["CONCEPTION", "EXPERIMENTALL", "OPEN", "MIC", "NIGHT"];

    this.resizeTimer = null;
    this.handleResize = () => {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => this.buildPoster(), 150);
    };

    this.init();
  }

  init() {
    const mainContentArea = document.querySelector(".main-content-area");
    if (!mainContentArea) return;

    this.el = document.createElement("div");
    this.el.id = this.containerId;
    this.el.style.cssText = `
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      z-index: 10; overflow: hidden;
      background-color: var(--color-cream);
      user-select: none;
    `;

    if (window.innerWidth >= 768) {
      this.el.style.touchAction = "none";
    }

    mainContentArea.appendChild(this.el);
    this.addEventListeners();
    window.addEventListener("resize", this.handleResize);
    setTimeout(() => this.buildPoster(), 0);
  }

  addEventListeners() {
    const isMobile = () => window.innerWidth < 768;

    const getIndex = (e) => {
      const target = e.target.closest("input");
      if (!target) {
        const rect = this.el.getBoundingClientRect();
        const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
        const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
        if (x < 0 || y < 0 || x > rect.width || y > rect.height) return -1;
        const c = Math.floor(x / this.STEP);
        const r = Math.floor(y / this.STEP);
        return r * this.COLS + c;
      }
      return parseInt(target.dataset.idx);
    };

    const toggle = (idx) => {
      if (idx < 0 || idx >= this.ROWS * this.COLS) return;
      const cb = this.el.children[idx];
      if (cb) cb.checked = this.drawMode;
    };

    const drawLine = (idx1, idx2) => {
      if (idx1 < 0 || idx2 < 0) return;
      const r1 = Math.floor(idx1 / this.COLS),
        c1 = idx1 % this.COLS;
      const r2 = Math.floor(idx2 / this.COLS),
        c2 = idx2 % this.COLS;

      let dr = Math.abs(r2 - r1),
        dc = Math.abs(c2 - c1);
      let sr = r1 < r2 ? 1 : -1,
        sc = c1 < c2 ? 1 : -1;
      let err = dc - dr;

      let currR = r1,
        currC = c1;
      while (true) {
        toggle(currR * this.COLS + currC);
        if (currR === r2 && currC === c2) break;
        let e2 = 2 * err;
        if (e2 > -dr) {
          err -= dr;
          currC += sc;
        }
        if (e2 < dc) {
          err += dc;
          currR += sr;
        }
      }
    };

    const onDown = (e) => {
      const idx = getIndex(e);
      if (idx === -1) return;

      this.isMouseDown = true;
      const cb = this.el.children[idx];
      this.drawMode = cb ? !cb.checked : true;
      toggle(idx);
      this.lastIndex = idx;

      if (e.pointerId && !isMobile()) {
        this.el.setPointerCapture(e.pointerId);
      }
    };

    const onMove = (e) => {
      if (!this.isMouseDown) return;
      if (isMobile() && e.pointerType === "touch") return;

      const idx = getIndex(e);
      if (idx === -1 || idx === this.lastIndex) return;
      drawLine(this.lastIndex, idx);
      this.lastIndex = idx;
    };

    const onUp = () => {
      this.isMouseDown = false;
      this.lastIndex = -1;
    };

    this.el.addEventListener("pointerdown", onDown);
    this.el.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    this._onUp = onUp;
  }

  buildPoster() {
    if (!this.el) return;
    const rect = this.el.parentElement.getBoundingClientRect();
    const w = rect.width,
      h = rect.height;
    if (w === 0 || h === 0) return;

    const isMobile = w < 768;
    this.CB = 16;
    this.STEP = this.CB;
    this.COLS = Math.floor(w / this.STEP);
    this.ROWS = Math.floor(h / this.STEP);

    this.el.style.display = "grid";
    this.el.style.width = this.COLS * this.STEP + "px";
    this.el.style.height = this.ROWS * this.STEP + "px";
    this.el.style.gridTemplateColumns = `repeat(${this.COLS}, ${this.STEP}px)`;
    this.el.style.gridTemplateRows = `repeat(${this.ROWS}, ${this.STEP}px)`;

    const checked = new Set();
    const mark = (r, c) => {
      if (r >= 0 && r < this.ROWS && c >= 0 && c < this.COLS)
        checked.add(r * this.COLS + c);
    };

    const LOGO_ROWS = this.LOGO_BITMAP.length,
      LOGO_COLS = this.LOGO_BITMAP[0].length;
    const MAX_LOGO_H = isMobile
      ? Math.floor(this.ROWS * 0.4)
      : Math.floor(this.ROWS * 0.45);
    const LOGO_SCALE = Math.max(
      1,
      Math.floor(
        Math.min((this.COLS * 0.8) / LOGO_COLS, MAX_LOGO_H / LOGO_ROWS),
      ),
    );
    const logoH = LOGO_ROWS * LOGO_SCALE;

    let logoOffR, logoOffC;

    if (isMobile) {
      logoOffR = Math.floor((this.ROWS - logoH) / 2);
      logoOffC = Math.floor((this.COLS - LOGO_COLS * LOGO_SCALE) / 2);
    } else {
      const TEXT_SCALE = Math.max(1, Math.floor(this.COLS / 100));
      const CHAR_W = 5,
        LETTER_SPC = 1,
        WORD_SPC = 3;
      const lines = [];
      let currentLine = [],
        currentWidth = 0;

      for (const word of this.WORDS) {
        const wordW =
          (word.length * CHAR_W + (word.length - 1) * LETTER_SPC) * TEXT_SCALE;
        if (
          currentLine.length === 0 ||
          currentWidth + WORD_SPC * TEXT_SCALE + wordW <= this.COLS * 0.9
        ) {
          currentLine.push(word);
          currentWidth +=
            (currentLine.length === 1 ? 0 : WORD_SPC * TEXT_SCALE) + wordW;
        } else {
          lines.push(currentLine);
          currentLine = [word];
          currentWidth = wordW;
        }
      }
      if (currentLine.length > 0) lines.push(currentLine);

      const charH = 7,
        lineSpc = 1;
      const textH =
        (lines.length * charH + (lines.length - 1) * lineSpc) * TEXT_SCALE;

      const GAP = Math.max(1, Math.floor(this.ROWS * 0.03));
      const totalH = logoH + GAP + textH;
      logoOffR = Math.floor((this.ROWS - totalH) / 2);
      const textOffR = logoOffR + logoH + GAP;
      logoOffC = Math.floor((this.COLS - LOGO_COLS * LOGO_SCALE) / 2);

      let currentR = textOffR;
      for (const line of lines) {
        let lineW = 0;
        line.forEach(
          (w, i) =>
            (lineW +=
              w.length * CHAR_W +
              (w.length - 1) * LETTER_SPC +
              (i === 0 ? 0 : WORD_SPC)),
        );
        let currentC = Math.floor((this.COLS - lineW * TEXT_SCALE) / 2);
        for (const word of line) {
          for (const char of word) {
            const bitmap = this.FONT[char] || this.FONT["A"];
            for (let r = 0; r < 7; r++)
              for (let c = 0; c < 5; c++)
                if (bitmap[r][c] === "1")
                  for (let sr = 0; sr < TEXT_SCALE; sr++)
                    for (let sc = 0; sc < TEXT_SCALE; sc++)
                      mark(
                        currentR + r * TEXT_SCALE + sr,
                        currentC + c * TEXT_SCALE + sc,
                      );
            currentC += (CHAR_W + LETTER_SPC) * TEXT_SCALE;
          }
          currentC += (WORD_SPC - LETTER_SPC) * TEXT_SCALE;
        }
        currentR += (charH + lineSpc) * TEXT_SCALE;
      }
    }

    for (let br = 0; br < LOGO_ROWS; br++) {
      for (let bc = 0; bc < LOGO_COLS; bc++) {
        if (this.LOGO_BITMAP[br][bc] === "1") {
          for (let sr = 0; sr < LOGO_SCALE; sr++)
            for (let sc = 0; sc < LOGO_SCALE; sc++)
              mark(
                logoOffR + br * LOGO_SCALE + sr,
                logoOffC + bc * LOGO_SCALE + sc,
              );
        }
      }
    }

    const total = this.ROWS * this.COLS;
    const html = new Array(total);
    const style = `margin:0;padding:0;`;

    for (let i = 0; i < total; i++) {
      const isChecked = checked.has(i);
      html[i] =
        `<input type="checkbox" data-idx="${i}" style="${style}" ${isChecked ? "checked" : ""}>`;
    }
    this.el.innerHTML = html.join("");
  }

  destroy() {
    window.removeEventListener("resize", this.handleResize);
    if (this._onUp) window.removeEventListener("pointerup", this._onUp);
    if (this.el) this.el.remove();
  }
}

window.CheckboxToy = CheckboxToy;
