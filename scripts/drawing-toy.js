/**
 * Drawing Toy Script
 * Allows users to draw on a canvas with a pen tool
 */

class DrawingToy {
  constructor() {
    this.isDrawing = false;
    this.canvas = null;
    this.ctx = null;
    this.lastX = 0;
    this.lastY = 0;
    this.currentColor = "#000000";
    this.currentLineWidth = 3;
    this.colors = [
      "#000000",
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
      "#DDA0DD",
      "#FFB347",
      "#FFD93D",
      "#FF69B4",
      "#20B2AA",
      "#87CEEB",
      "#98FB98",
      "#F0E68C",
      "#DEB887",
    ];

    console.log("Drawing Toy: Constructor called");
    this.init();
  }

  init() {
    console.log(
      "Drawing Toy: Initializing, document state:",
      document.readyState,
    );
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.createCanvas());
    } else {
      this.createCanvas();
    }

    // Handle window resize
    window.addEventListener("resize", () => this.resizeCanvas());
  }

  createCanvas() {
    console.log("Drawing Toy: Starting createCanvas()");
    const mainContentArea = document.querySelector(".main-content-area");
    if (!mainContentArea) {
      console.error("Drawing Toy: Main content area not found");
      return;
    }

    // Create container for drawing
    const drawingContainer = document.createElement("div");
    drawingContainer.id = "drawing-container";
    drawingContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;

    // Create toolbar
    const toolbar = document.createElement("div");
    toolbar.className = "drawing-toolbar";
    toolbar.style.cssText = `
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 15px;
            padding: 10px 20px;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 25px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
            flex-wrap: wrap;
            justify-content: center;
        `;

    // Add color palette
    const colorPalette = document.createElement("div");
    colorPalette.style.cssText = `
            display: flex;
            gap: 8px;
            align-items: center;
        `;

    this.colors.forEach((color) => {
      const colorBtn = document.createElement("button");
      colorBtn.style.cssText = `
                width: 30px;
                height: 30px;
                border-radius: 50%;
                border: 2px solid ${color === this.currentColor ? "#333" : "#ccc"};
                background-color: ${color};
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            `;
      colorBtn.addEventListener("click", () => this.setColor(color));
      colorBtn.addEventListener("mouseover", () => {
        colorBtn.style.transform = "scale(1.1)";
      });
      colorBtn.addEventListener("mouseout", () => {
        colorBtn.style.transform = "scale(1)";
      });
      colorPalette.appendChild(colorBtn);
    });

    // Add brush size controls
    const brushControls = document.createElement("div");
    brushControls.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
        `;

    const sizeLabel = document.createElement("span");
    sizeLabel.textContent = "Size:";
    sizeLabel.style.cssText = `
            font-family: 'Recursive', monospace;
            font-size: 14px;
            color: #333;
        `;

    const sizeSlider = document.createElement("input");
    sizeSlider.type = "range";
    sizeSlider.min = "1";
    sizeSlider.max = "20";
    sizeSlider.value = this.currentLineWidth;
    sizeSlider.style.cssText = `
            width: 80px;
            height: 5px;
            background: #ddd;
            outline: none;
            border-radius: 5px;
        `;
    sizeSlider.addEventListener("input", (e) => {
      this.currentLineWidth = parseInt(e.target.value);
    });

    brushControls.appendChild(sizeLabel);
    brushControls.appendChild(sizeSlider);

    // Add clear button
    const clearBtn = document.createElement("button");
    clearBtn.textContent = "Clear";
    clearBtn.style.cssText = `
            padding: 8px 16px;
            background: #ff6b6b;
            color: white;
            border: none;
            border-radius: 15px;
            cursor: pointer;
            font-family: 'Recursive', monospace;
            font-size: 14px;
            transition: background 0.2s ease;
        `;
    clearBtn.addEventListener("click", () => this.clearCanvas());
    clearBtn.addEventListener("mouseover", () => {
      clearBtn.style.background = "#ff5252";
    });
    clearBtn.addEventListener("mouseout", () => {
      clearBtn.style.background = "#ff6b6b";
    });

    toolbar.appendChild(colorPalette);
    toolbar.appendChild(brushControls);
    toolbar.appendChild(clearBtn);

    // Create canvas
    this.canvas = document.createElement("canvas");
    this.canvas.style.cssText = `
            border: 3px solid #333;
            border-radius: 10px;
            background: white;
            cursor: crosshair;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            max-width: 100%;
            max-height: 70vh;
        `;

    // Set canvas size
    this.resizeCanvas();

    this.ctx = this.canvas.getContext("2d");
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";

    // Add event listeners for drawing
    this.addDrawingListeners();

    drawingContainer.appendChild(toolbar);
    drawingContainer.appendChild(this.canvas);
    mainContentArea.appendChild(drawingContainer);

    console.log("Drawing Toy: Canvas created and added to DOM");
  }

  resizeCanvas() {
    if (!this.canvas) return;

    const maxWidth = Math.min(window.innerWidth - 100, 800);
    const maxHeight = Math.min(window.innerHeight - 200, 600);

    // Maintain aspect ratio
    const aspectRatio = 4 / 3;
    let canvasWidth = maxWidth;
    let canvasHeight = maxWidth / aspectRatio;

    if (canvasHeight > maxHeight) {
      canvasHeight = maxHeight;
      canvasWidth = maxHeight * aspectRatio;
    }

    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;
    this.canvas.style.width = canvasWidth + "px";
    this.canvas.style.height = canvasHeight + "px";

    // Restore context settings after resize
    if (this.ctx) {
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";
      this.ctx.strokeStyle = this.currentColor;
      this.ctx.lineWidth = this.currentLineWidth;
    }
  }

  addDrawingListeners() {
    // Mouse events
    this.canvas.addEventListener("mousedown", (e) => this.startDrawing(e));
    this.canvas.addEventListener("mousemove", (e) => this.draw(e));
    this.canvas.addEventListener("mouseup", () => this.stopDrawing());
    this.canvas.addEventListener("mouseout", () => this.stopDrawing());

    // Touch events for mobile
    this.canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent("mousedown", {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      this.canvas.dispatchEvent(mouseEvent);
    });

    this.canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent("mousemove", {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      this.canvas.dispatchEvent(mouseEvent);
    });

    this.canvas.addEventListener("touchend", (e) => {
      e.preventDefault();
      const mouseEvent = new MouseEvent("mouseup", {});
      this.canvas.dispatchEvent(mouseEvent);
    });
  }

  startDrawing(e) {
    this.isDrawing = true;
    const rect = this.canvas.getBoundingClientRect();
    this.lastX = e.clientX - rect.left;
    this.lastY = e.clientY - rect.top;

    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineWidth = this.currentLineWidth;
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
  }

  draw(e) {
    if (!this.isDrawing) return;

    const rect = this.canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    this.ctx.lineTo(currentX, currentY);
    this.ctx.stroke();

    this.lastX = currentX;
    this.lastY = currentY;
  }

  stopDrawing() {
    this.isDrawing = false;
    this.ctx.beginPath();
  }

  setColor(color) {
    this.currentColor = color;
    this.ctx.strokeStyle = color;

    // Update color button borders
    const colorButtons = document.querySelectorAll(".drawing-toolbar button");
    colorButtons.forEach((btn, index) => {
      if (index < this.colors.length) {
        btn.style.border = `2px solid ${this.colors[index] === color ? "#333" : "#ccc"}`;
      }
    });
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  destroy() {
    const container = document.getElementById("drawing-container");
    if (container) {
      container.remove();
    }
    this.canvas = null;
    this.ctx = null;
    console.log("Drawing Toy: Destroyed");
  }
}

// Export for use by toy manager
window.DrawingToy = DrawingToy;
