class CheckboxToy {
  constructor() {
    this.containerId = "checkboxes-container";
    this.el = null;
    this.isMouseDown = false;
    this.isDragging = false;
    this.drawMode = true;
    this.lastIndex = -1;
    this.startX = 0;
    this.startY = 0;
    this.DRAG_THRESHOLD = 5;

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

    // Pre-calculate logo bounding box for trimming
    this.LOGO_BOUNDS = this.calculateLogoBounds();

    this.resizeTimer = null;
    this.handleResize = () => {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => this.buildPoster(), 150);
    };

    this.init();
  }

  calculateLogoBounds() {
    let minR = this.LOGO_BITMAP.length, maxR = 0, minC = this.LOGO_BITMAP[0].length, maxC = 0;
    let found = false;
    for (let r = 0; r < this.LOGO_BITMAP.length; r++) {
      for (let c = 0; c < this.LOGO_BITMAP[r].length; c++) {
        if (this.LOGO_BITMAP[r][c] === "1") {
          found = true;
          if (r < minR) minR = r;
          if (r > maxR) maxR = r;
          if (c < minC) minC = c;
          if (c > maxC) maxC = c;
        }
      }
    }
    return found ? { minR, maxR, minC, maxC, w: maxC - minC + 1, h: maxR - minR + 1 } : null;
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
      display: grid;
      justify-content: center;
      align-content: center;
    `;

    mainContentArea.appendChild(this.el);
    this.addEventListeners();
    window.addEventListener("resize", this.handleResize);
    setTimeout(() => this.buildPoster(), 0);
  }

  addEventListeners() {
    const isMobile = () => window.innerWidth < 768;

    const getIndex = (e) => {
      const target = e.target.closest("input");
      if (target) return parseInt(target.dataset.idx);

      const rect = this.el.getBoundingClientRect();
      const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
      const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
      const c = Math.floor(x / this.STEP);
      const r = Math.floor(y / this.STEP);
      if (c < 0 || c >= this.COLS || r < 0 || r >= this.ROWS) return -1;
      return r * this.COLS + c;
    };

    const setChecked = (idx, val) => {
      if (idx < 0 || idx >= this.ROWS * this.COLS) return;
      const cb = this.el.children[idx];
      if (cb) cb.checked = val;
    };

    const drawLine = (idx1, idx2) => {
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
        setChecked(currR * this.COLS + currC, this.drawMode);
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

    this.el.addEventListener("pointerdown", (e) => {
      if (e.target.tagName !== "INPUT") return;

      this.isMouseDown = true;
      this.isDragging = false;
      this.startX = e.clientX;
      this.startY = e.clientY;
      this.lastIndex = getIndex(e);

      // Capture intent based on current state before native toggle happens
      this.drawMode = !e.target.checked;

      if (!isMobile() && e.pointerId) {
        this.el.setPointerCapture(e.pointerId);
      }
    });

    this.el.addEventListener("pointermove", (e) => {
      if (!this.isMouseDown) return;
      if (isMobile()) return;

      if (!this.isDragging) {
        const dist = Math.hypot(
          e.clientX - this.startX,
          e.clientY - this.startY,
        );
        if (dist > this.DRAG_THRESHOLD) {
          this.isDragging = true;
        } else {
          return;
        }
      }

      const idx = getIndex(e);
      if (idx !== -1 && idx !== this.lastIndex) {
        drawLine(this.lastIndex, idx);
        this.lastIndex = idx;
      }
    });

    // Prevent default ONLY if we were dragging
    this.el.addEventListener(
      "click",
      (e) => {
        if (this.isDragging) e.preventDefault();
      },
      true,
    );

    const onUp = () => {
      this.isMouseDown = false;
      this.lastIndex = -1;
    };

    window.addEventListener("pointerup", onUp);
    this._onUp = onUp;
  }

  buildPoster() {
    if (!this.el) return;
    const parent = this.el.parentElement;
    const rect = parent.getBoundingClientRect();
    const w = rect.width,
      h = rect.height;
    if (w === 0 || h === 0) return;

    const isMobile = w < 768;
    const LOGO_ROWS = this.LOGO_BITMAP.length,
      LOGO_COLS = this.LOGO_BITMAP[0].length;

    if (isMobile && this.LOGO_BOUNDS) {
      // On mobile, trim to logo content + 2 rows above and below
      this.COLS = this.LOGO_BOUNDS.w;
      this.ROWS = this.LOGO_BOUNDS.h + 4; // 2 above, 2 below
      this.STEP = Math.floor(w / this.COLS);

      this.el.style.position = "relative";
      this.el.style.height = this.ROWS * this.STEP + "px";
      this.el.style.alignContent = "start";
      this.el.style.display = "grid";
      this.el.style.gap = "0"; // Ensure no gaps between checkboxes
      parent.style.setProperty("padding", "0", "important");
      parent.style.flex = "none";
    } else {
      // Desktop: use original logic (or full bitmap width)
      this.COLS = isMobile ? 56 : Math.floor(w / 16);
      this.STEP = Math.floor(w / this.COLS);
      
      if (isMobile) {
        this.ROWS = LOGO_ROWS + 4;
        parent.style.setProperty("padding", "0", "important");
        parent.style.flex = "none";
      } else {
        this.ROWS = Math.floor(h / this.STEP);
        parent.style.removeProperty("padding");
        parent.style.removeProperty("flex");
      }

      this.el.style.position = isMobile ? "relative" : "absolute";
      this.el.style.height = isMobile ? (this.ROWS * this.STEP + "px") : "100%";
      this.el.style.alignContent = isMobile ? "start" : "center";
    }

    const checked = new Set();
    const mark = (r, c) => {
      if (r >= 0 && r < this.ROWS && c >= 0 && c < this.COLS)
        checked.add(r * this.COLS + c);
    };

    if (isMobile && this.LOGO_BOUNDS) {
      // Draw trimmed logo with 2 row offset
      const b = this.LOGO_BOUNDS;
      for (let br = 0; br < b.h; br++) {
        for (let bc = 0; bc < b.w; bc++) {
          if (this.LOGO_BITMAP[b.minR + br][b.minC + bc] === "1")
            mark(br + 2, bc); // +2 for the top 2 rows
        }
      }
    } else if (isMobile) {
      // Fallback for mobile if bounds not found
      const logoOffR = 2;
      const logoOffC = Math.floor((this.COLS - LOGO_COLS) / 2);
      for (let br = 0; br < LOGO_ROWS; br++) {
        for (let bc = 0; bc < LOGO_COLS; bc++) {
          if (this.LOGO_BITMAP[br][bc] === "1")
            mark(logoOffR + br, logoOffC + bc);
        }
      }
    } else {
      // Desktop logo + text logic
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
      const totalContentH = LOGO_ROWS + GAP + textH;

      const logoOffR = Math.floor((this.ROWS - totalContentH) / 2);
      const logoOffC = Math.floor((this.COLS - LOGO_COLS) / 2);
      const textOffR = logoOffR + LOGO_ROWS + GAP;

      for (let br = 0; br < LOGO_ROWS; br++) {
        for (let bc = 0; bc < LOGO_COLS; bc++) {
          if (this.LOGO_BITMAP[br][bc] === "1")
            mark(logoOffR + br, logoOffC + bc);
        }
      }

      let currentR = textOffR;
      for (const line of lines) {
        let lineW = 0;
        line.forEach(
          (word, i) =>
            (lineW +=
              word.length * CHAR_W +
              (word.length - 1) * LETTER_SPC +
              (i === 0 ? 0 : WORD_SPC)),
        );
        let currentC = Math.floor((this.COLS - lineW * TEXT_SCALE) / 2);
        for (const word of line) {
          for (const char of word) {
            const bitmap = this.FONT[char] || this.FONT["A"];
            for (let r = 0; r < 7; r++) {
              for (let c = 0; c < 5; c++) {
                if (bitmap[r][c] === "1") {
                  for (let sr = 0; sr < TEXT_SCALE; sr++) {
                    for (let sc = 0; sc < TEXT_SCALE; sc++) {
                      mark(
                        currentR + r * TEXT_SCALE + sr,
                        currentC + c * TEXT_SCALE + sc,
                      );
                    }
                  }
                }
              }
            }
            currentC += (CHAR_W + LETTER_SPC) * TEXT_SCALE;
          }
          currentC += (WORD_SPC - LETTER_SPC) * TEXT_SCALE;
        }
        currentR += (charH + lineSpc) * TEXT_SCALE;
      }
    }

    this.el.style.gridTemplateColumns = `repeat(${this.COLS}, ${this.STEP}px)`;
    this.el.style.gridTemplateRows = `repeat(${this.ROWS}, ${this.STEP}px)`;

    const total = this.ROWS * this.COLS;
    let htmlArr = new Array(total);
    const cbSize = `${this.STEP}px`;
    for (let i = 0; i < total; i++) {
      htmlArr[i] =
        `<input type="checkbox" data-idx="${i}" style="margin:0;width:${cbSize};height:${cbSize};" ${checked.has(i) ? "checked" : ""}>`;
    }
    this.el.innerHTML = htmlArr.join("");
  }

  destroy() {
    window.removeEventListener("resize", this.handleResize);
    if (this._onUp) window.removeEventListener("pointerup", this._onUp);
    if (this.el) {
      const parent = this.el.parentElement;
      if (parent) {
        parent.style.removeProperty("padding");
        parent.style.removeProperty("flex");
        parent.style.removeProperty("align-content");
      }
      this.el.remove();
    }
  }
}

window.CheckboxToy = CheckboxToy;
