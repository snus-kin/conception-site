/**
 * Letter Beads Distribution Script
 * Displays draggable letter bead images following Scrabble letter distribution
 */

class LetterBeads {
  constructor() {
    // Character distribution including letters, numbers, and punctuation
    this.characterDistribution = {
      // Letters only (a-z)
      A: 15,
      B: 4,
      C: 4,
      D: 6,
      E: 20,
      F: 4,
      G: 5,
      H: 4,
      I: 15,
      J: 2,
      K: 2,
      L: 6,
      M: 4,
      N: 10,
      O: 12,
      P: 4,
      Q: 2,
      R: 10,
      S: 8,
      T: 10,
      U: 6,
      V: 3,
      W: 3,
      X: 2,
      Y: 4,
      Z: 2,
    };

    // Character to filename mapping (empty since we only use a-z now)
    this.filenameMap = {};

    this.beadSize = 60; // Base size of beads in pixels (larger)
    this.margin = 50; // Margin from edges
    this.beads = []; // Array to store bead elements
    this.isDragging = false;
    this.currentDragBead = null;
    this.offset = { x: 0, y: 0 };
    this.colors = [
      "#DD0000",
      "#009999",
      "#0000CC",
      "#00AA00",
      "#DD6600",
      "#AA00AA",
      "#EE4400",
      "#AAAA00",
      "#DD0066",
      "#008888",
      "#0000AA",
      "#00AA55",
      "#CC4400",
      "#BB0000",
      "#7700BB",
      "#00BB00",
      "#CCAA00",
      "#CC0000",
      "#006666",
      "#5500AA",
    ];

    console.log("Letter Beads: Constructor called");
    this.init();
  }

  init() {
    console.log(
      "Letter Beads: Initializing, document state:",
      document.readyState,
    );
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.createBeads());
    } else {
      this.createBeads();
    }

    // Handle window resize
    window.addEventListener("resize", () => this.repositionBeads());
  }

  createBeads() {
    console.log("Letter Beads: Starting createBeads()");
    const mainContentArea = document.querySelector(".main-content-area");
    if (!mainContentArea) {
      console.error("Letter Beads: Main content area not found");
      return;
    }
    console.log("Letter Beads: Found main content area", mainContentArea);

    // Create container for beads
    const beadContainer = document.createElement("div");
    beadContainer.id = "letter-beads-container";
    beadContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 10;
        `;
    mainContentArea.appendChild(beadContainer);

    // Check device width
    const isMobile = window.innerWidth <= 768;
    const isVeryNarrow = window.innerWidth <= 480;

    // Skip all bead creation on very narrow screens
    if (isVeryNarrow) {
      console.log("Letter Beads: Skipping bead creation on very narrow screen");
      return;
    }

    // Calculate reasonable number of beads based on viewport size
    const viewportArea = window.innerWidth * window.innerHeight;
    const beadArea = this.beadSize * this.beadSize;
    const maxBeads = isMobile
      ? Math.min(100, Math.floor(viewportArea / (beadArea * 20)))
      : Math.min(300, Math.floor(viewportArea / (beadArea * 12)));

    // First, create CONCEPTION word arrangement
    this.createConceptionWord(beadContainer);

    // Only create random beads on desktop
    if (!isMobile) {
      const characters = this.generateCharacterArray(maxBeads);
      console.log("Letter Beads: Generated characters array", characters);

      characters.forEach((character) => {
        this.createBead(character, beadContainer);
      });
    }
  }

  generateCharacterArray(totalBeads) {
    const characters = [];
    const totalDistribution = Object.values(this.characterDistribution).reduce(
      (a, b) => a + b,
      0,
    );

    // Calculate how many of each character to create
    Object.entries(this.characterDistribution).forEach(([char, frequency]) => {
      const count = Math.max(
        1,
        Math.round((frequency / totalDistribution) * totalBeads),
      );
      for (let i = 0; i < count; i++) {
        characters.push(char);
      }
    });

    // Shuffle array
    for (let i = characters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [characters[i], characters[j]] = [characters[j], characters[i]];
    }

    return characters.slice(0, totalBeads);
  }

  createConceptionWord(container) {
    const mainContentArea = document.querySelector(".main-content-area");
    const containerRect = mainContentArea.getBoundingClientRect();
    const isMobile = window.innerWidth <= 768;
    const isVeryNarrow = window.innerWidth <= 480;

    // Skip word creation on very narrow screens
    if (isVeryNarrow) {
      return;
    }

    // Dynamic line breaking based on container width
    const words = ["CONCEPTION", "EXPERIMENTALL", "OPEN", "MIC", "NIGHT"];
    const availableWidth = containerRect.width - 40; // 20px margin on each side
    const letterSpacing = this.beadSize + 15;

    let lines = [];

    for (const word of words) {
      if (word === "") {
        lines.push("");
        continue;
      }

      const wordWidth = word.length * letterSpacing;

      if (wordWidth <= availableWidth) {
        lines.push(word);
      } else if (isMobile) {
        // Break long words into chunks that fit
        const maxCharsPerLine = Math.floor(availableWidth / letterSpacing);
        for (let i = 0; i < word.length; i += maxCharsPerLine) {
          const chunk = word.slice(i, i + maxCharsPerLine);
          lines.push(chunk);
        }
      } else {
        lines.push(word);
      }
    }

    // Calculate starting position (centered horizontally, upper third vertically)
    const baseY = isMobile
      ? containerRect.height * 0.15
      : containerRect.height * 0.3;
    const lineSpacing = this.beadSize + 25; // Vertical spacing between lines

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];

      // Skip empty lines
      if (line === "") continue;

      const totalLineWidth = line.length * letterSpacing;
      const startX = (containerRect.width - totalLineWidth) / 2;
      const currentY = baseY + lineIndex * lineSpacing;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        // Skip spaces and dashes (but keep their spacing)
        if (char === " " || char === "-") {
          continue;
        }

        const baseX = startX + i * (this.beadSize + 15);

        // Try to find a valid position with overlap detection
        let attempts = 0;
        let finalX,
          finalY,
          validPosition = false;

        do {
          // Add random offset (±20px in each direction for tighter grouping)
          const offsetX = (Math.random() - 0.5) * 40;
          const offsetY = (Math.random() - 0.5) * 40;

          finalX = baseX + offsetX;
          finalY = currentY + offsetY;

          // Check bounds to prevent overflow
          const maxX = containerRect.width - this.beadSize - 20;
          const maxY = containerRect.height - this.beadSize - 20;

          if (
            finalX >= 20 &&
            finalX <= maxX &&
            finalY >= 20 &&
            finalY <= maxY
          ) {
            validPosition = this.checkWordBeadOverlap(
              finalX,
              finalY,
              this.beadSize,
            );
          }
          attempts++;
        } while (!validPosition && attempts < 20);

        // If we found a valid position, create the bead
        if (validPosition) {
          this.createBeadAtPosition(char, container, finalX, finalY);
        }
      }
    }
  }

  createBeadAtPosition(character, container, x, y) {
    console.log(
      "Letter Beads: Creating positioned bead for character",
      character,
    );
    const bead = document.createElement("img");

    // Get filename for character
    const filename = this.getFilename(character);
    bead.src = `Images/letter-beads/${filename}.png`;
    bead.alt = `Character ${character}`;
    bead.className = "letter-bead";
    bead.draggable = false; // Prevent default drag behavior
    bead.dataset.character = character; // Store character for reference

    // Use consistent size for all beads
    const actualSize = this.beadSize;

    // Get random color for this bead
    const randomColor =
      this.colors[Math.floor(Math.random() * this.colors.length)];

    // Generate random rotation between -45 and 45 degrees
    const rotation = (Math.random() - 0.5) * 90; // Random value between -45 and 45

    // Create wrapper
    const colorWrapper = document.createElement("div");
    colorWrapper.style.cssText = `
        position: absolute;
        display: inline-block;
        width: ${actualSize}px;
        height: ${actualSize}px;
        border-radius: 50%;
        box-shadow: 3px 3px 12px rgba(0,0,0,0.25);
        left: ${x}px;
        top: ${y}px;
        transform: rotate(${rotation}deg);
        overflow: hidden;
    `;

    bead.style.cssText = `
        width: 100%;
        height: 100%;
        cursor: grab;
        pointer-events: all;
        user-select: none;
        border-radius: 50%;
    `;
    bead.className = "letter-bead";

    // Add event listeners for dragging
    this.addDragListeners(colorWrapper);

    // Add hover effect (preserve current rotation)
    colorWrapper.addEventListener("mouseenter", () => {
      if (!this.isDragging) {
        const currentTransform =
          colorWrapper.style.transform || `rotate(${rotation}deg)`;
        const currentRotation =
          currentTransform.match(/rotate\(([^)]+)\)/)?.[1] || `${rotation}deg`;
        colorWrapper.style.transform = `rotate(${currentRotation}) scale(1.1)`;
      }
    });

    colorWrapper.addEventListener("mouseleave", () => {
      if (!this.isDragging) {
        const currentTransform =
          colorWrapper.style.transform || `rotate(${rotation}deg)`;
        const currentRotation =
          currentTransform.match(/rotate\(([^)]+)\)/)?.[1] || `${rotation}deg`;
        colorWrapper.style.transform = `rotate(${currentRotation}) scale(1)`;
      }
    });

    // Handle image load error (fallback to text)
    bead.addEventListener("error", () => {
      console.warn(
        "Letter Beads: Image failed to load for character",
        character,
        "- using text fallback",
      );
      this.createTextBead(character, container, x + "px", y + "px", actualSize);
      container.removeChild(colorWrapper);
    });

    // Handle successful image load
    bead.addEventListener("load", () => {
      console.log(
        "Letter Beads: Successfully loaded image for character",
        character,
      );

      // Image loaded successfully
    });

    // Add bead to wrapper
    colorWrapper.appendChild(bead);
    container.appendChild(colorWrapper);
    this.beads.push(colorWrapper);
  }

  createBead(character, container) {
    console.log("Letter Beads: Creating bead for character", character);
    const bead = document.createElement("img");

    // Get filename for character
    const filename = this.getFilename(character);
    bead.src = `Images/letter-beads/${filename}.png`;
    bead.alt = `Character ${character}`;
    bead.className = "letter-bead";
    bead.draggable = false; // Prevent default drag behavior
    bead.dataset.character = character; // Store character for reference

    // Use consistent size for all beads
    const actualSize = this.beadSize;

    // Get random color for this bead
    const randomColor =
      this.colors[Math.floor(Math.random() * this.colors.length)];

    // Generate random rotation between -45 and 45 degrees
    const rotation = (Math.random() - 0.5) * 90; // Random value between -45 and 45

    // Create wrapper
    const colorWrapper = document.createElement("div");
    colorWrapper.style.cssText = `
        position: absolute;
        display: inline-block;
        width: ${actualSize}px;
        height: ${actualSize}px;
        border-radius: 50%;
        box-shadow: 3px 3px 12px rgba(0,0,0,0.25);
        transform: rotate(${rotation}deg);
        overflow: hidden;
    `;

    bead.style.cssText = `
        width: 100%;
        height: 100%;
        cursor: grab;
        pointer-events: all;
        user-select: none;
        border-radius: 50%;
    `;
    bead.className = "letter-bead";

    // Set random initial position directly on wrapper
    this.setRandomPosition(colorWrapper, actualSize);

    // Add event listeners for dragging
    this.addDragListeners(colorWrapper);

    // Add hover effect (preserve current rotation)
    colorWrapper.addEventListener("mouseenter", () => {
      if (!this.isDragging) {
        const currentTransform =
          colorWrapper.style.transform || `rotate(${rotation}deg)`;
        const currentRotation =
          currentTransform.match(/rotate\(([^)]+)\)/)?.[1] || `${rotation}deg`;
        colorWrapper.style.transform = `rotate(${currentRotation}) scale(1.1)`;
      }
    });

    colorWrapper.addEventListener("mouseleave", () => {
      if (!this.isDragging) {
        const currentTransform =
          colorWrapper.style.transform || `rotate(${rotation}deg)`;
        const currentRotation =
          currentTransform.match(/rotate\(([^)]+)\)/)?.[1] || `${rotation}deg`;
        colorWrapper.style.transform = `rotate(${currentRotation}) scale(1)`;
      }
    });

    // Handle image load error (fallback to text)
    bead.addEventListener("error", () => {
      console.warn(
        "Letter Beads: Image failed to load for character",
        character,
        "- using text fallback",
      );
      this.createTextBead(
        character,
        container,
        bead.style.left,
        bead.style.top,
        actualSize,
      );
      container.removeChild(bead);
    });

    // Handle successful image load
    bead.addEventListener("load", () => {
      console.log(
        "Letter Beads: Successfully loaded image for character",
        character,
      );

      // Image loaded successfully
    });

    // Add bead to wrapper
    colorWrapper.appendChild(bead);
    container.appendChild(colorWrapper);
    this.beads.push(colorWrapper);
  }

  createTextBead(character, container, left, top, size) {
    const textBead = document.createElement("div");
    textBead.textContent = character;
    textBead.className = "letter-bead text-bead";
    textBead.dataset.character = character;

    // Get random color for this bead
    const randomColor =
      this.colors[Math.floor(Math.random() * this.colors.length)];
    const lighterColor = this.lightenColor(randomColor, 20);

    textBead.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${left};
            top: ${top};
            background: linear-gradient(135deg, ${randomColor}, ${lighterColor});
            border: 2px solid ${this.darkenColor(randomColor, 20)};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: "Recursive", monospace;
            font-weight: bold;
            font-size: ${size * 0.5}px;
            color: white;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
            cursor: grab;
            pointer-events: all;
            user-select: none;
            box-shadow: 2px 2px 8px rgba(0,0,0,0.1);
            z-index: 1;
        `;

    this.addDragListeners(textBead);
    container.appendChild(textBead);
    this.beads.push(textBead);
  }

  setRandomPosition(element, size) {
    const container = document.querySelector(".main-content-area");
    const containerRect = container.getBoundingClientRect();

    const maxX = Math.max(0, containerRect.width - size - this.margin);
    const maxY = Math.max(0, containerRect.height - size - this.margin);

    let attempts = 0;
    let x, y, validPosition;

    do {
      x = this.margin + Math.random() * (maxX - this.margin);
      y = this.margin + Math.random() * (maxY - this.margin);

      validPosition = this.checkPositionOverlap(x, y, size);
      attempts++;
    } while (!validPosition && attempts < 30);

    // Ensure bead doesn't go outside container bounds
    x = Math.max(
      this.margin,
      Math.min(x, containerRect.width - size - this.margin),
    );
    y = Math.max(
      this.margin,
      Math.min(y, containerRect.height - size - this.margin),
    );

    element.style.left = x + "px";
    element.style.top = y + "px";
  }

  checkPositionOverlap(x, y, size) {
    const buffer = 10; // Minimum distance between beads

    // Increased protection around title and tagline text
    const mainContentArea = document.querySelector(".main-content-area");
    const containerRect = mainContentArea.getBoundingClientRect();
    const textAreaY = containerRect.height * 0.2;
    const textAreaHeight = 6 * (this.beadSize + 25) + 80; // More padding around text
    const textAreaStartX = containerRect.width * 0.1;
    const textAreaEndX = containerRect.width * 0.9;

    // Avoid title and tagline area with generous buffer
    if (
      y > textAreaY - 40 &&
      y < textAreaY + textAreaHeight &&
      x > textAreaStartX &&
      x < textAreaEndX
    ) {
      return false; // Too close to text area
    }

    for (const bead of this.beads) {
      const beadX = parseFloat(bead.style.left || "0");
      const beadY = parseFloat(bead.style.top || "0");

      const distance = Math.sqrt(
        Math.pow(x - beadX, 2) + Math.pow(y - beadY, 2),
      );

      if (distance < size + buffer) {
        return false; // Too close to existing bead
      }
    }

    return true; // Position is valid
  }

  checkWordBeadOverlap(x, y, size) {
    const buffer = 10; // Minimum distance between beads

    // Only check for bead-to-bead overlap, not text area protection
    for (const bead of this.beads) {
      const beadX = parseFloat(bead.style.left || "0");
      const beadY = parseFloat(bead.style.top || "0");

      const distance = Math.sqrt(
        Math.pow(x - beadX, 2) + Math.pow(y - beadY, 2),
      );

      if (distance < size + buffer) {
        return false; // Too close to existing bead
      }
    }

    return true; // Position is valid
  }

  getFilename(character) {
    // Return mapped filename or lowercase character
    if (this.filenameMap[character]) {
      return this.filenameMap[character];
    }
    // For letters and numbers, use lowercase
    return character.toLowerCase();
  }

  addDragListeners(element) {
    // Mouse events
    element.addEventListener("mousedown", (e) => this.startDrag(e, element));

    // Touch events for mobile
    element.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this.startDrag(e.touches[0], element);
    });

    // Global mouse events
    document.addEventListener("mousemove", (e) => this.drag(e));
    document.addEventListener("mouseup", () => this.endDrag());

    // Global touch events
    document.addEventListener("touchmove", (e) => {
      if (this.isDragging) {
        e.preventDefault();
        this.drag(e.touches[0]);
      }
    });
    document.addEventListener("touchend", () => this.endDrag());
  }

  startDrag(e, element) {
    this.isDragging = true;
    this.currentDragBead = element;

    const rect = element.getBoundingClientRect();
    this.offset.x = e.clientX - rect.left;
    this.offset.y = e.clientY - rect.top;

    // Preserve current rotation while scaling
    const currentTransform = element.style.transform || "";
    const currentRotation =
      currentTransform.match(/rotate\(([^)]+)\)/)?.[1] || "0deg";

    element.style.cursor = "grabbing";
    element.style.zIndex = "100";
    element.style.transform = `rotate(${currentRotation}) scale(1.1)`;
    element.style.transition = "none";
  }

  drag(e) {
    if (!this.isDragging || !this.currentDragBead) return;

    // Get the element under the mouse to check if we're over the sidebar
    const elementUnder = document.elementFromPoint(e.clientX, e.clientY);
    const sidebar = document.querySelector(".universal-sidebar");
    const isOverSidebar = sidebar && sidebar.contains(elementUnder);

    if (isOverSidebar) {
      // Allow dragging anywhere on the page if over sidebar
      this.currentDragBead.style.position = "fixed";
      this.currentDragBead.style.left = e.clientX - this.offset.x + "px";
      this.currentDragBead.style.top = e.clientY - this.offset.y + "px";
      this.currentDragBead.style.zIndex = "10000";
    } else {
      // Constrain to main content area
      const container = this.currentDragBead.parentNode;
      const containerRect = container.getBoundingClientRect();
      const beadRect = this.currentDragBead.getBoundingClientRect();

      this.currentDragBead.style.position = "absolute";
      let x = e.clientX - containerRect.left - this.offset.x;
      let y = e.clientY - containerRect.top - this.offset.y;

      // Constrain to container bounds
      x = Math.max(0, Math.min(x, containerRect.width - beadRect.width));
      y = Math.max(0, Math.min(y, containerRect.height - beadRect.height));

      this.currentDragBead.style.left = x + "px";
      this.currentDragBead.style.top = y + "px";
      this.currentDragBead.style.zIndex = "1000";
    }
  }

  endDrag() {
    if (!this.isDragging || !this.currentDragBead) return;

    const sidebar = document.querySelector(".universal-sidebar");
    const beadRect = this.currentDragBead.getBoundingClientRect();
    const sidebarRect = sidebar.getBoundingClientRect();

    // If bead is dropped over sidebar, keep it fixed position
    if (
      beadRect.left + beadRect.width / 2 > sidebarRect.left &&
      beadRect.left + beadRect.width / 2 < sidebarRect.right &&
      beadRect.top + beadRect.height / 2 > sidebarRect.top &&
      beadRect.top + beadRect.height / 2 < sidebarRect.bottom
    ) {
      // Keep fixed positioning for beads in sidebar
      this.currentDragBead.style.position = "fixed";
      this.currentDragBead.style.zIndex = "1000";
    } else {
      // Return to normal positioning for main content area
      this.currentDragBead.style.position = "absolute";
      this.currentDragBead.style.zIndex = "1";

      // Convert fixed position back to absolute if needed
      if (this.currentDragBead.style.position === "fixed") {
        const mainContent = document.querySelector(".main-content-area");
        const mainRect = mainContent.getBoundingClientRect();
        const currentRect = this.currentDragBead.getBoundingClientRect();

        this.currentDragBead.style.left =
          currentRect.left - mainRect.left + "px";
        this.currentDragBead.style.top = currentRect.top - mainRect.top + "px";
        this.currentDragBead.style.position = "absolute";
      }
    }

    // Generate a new random rotation when dropped
    const newRotation = (Math.random() - 0.5) * 90; // Random value between -45 and 45

    this.currentDragBead.style.cursor = "grab";
    this.currentDragBead.style.transform = `rotate(${newRotation}deg) scale(1)`;
    this.currentDragBead.style.transition = "transform 0.3s ease";

    this.isDragging = false;
    this.currentDragBead = null;
  }

  repositionBeads() {
    // Reposition beads that are outside the new viewport
    this.beads.forEach((bead) => {
      const container = bead.parentNode;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const beadRect = bead.getBoundingClientRect();
      const currentX = parseFloat(bead.style.left);
      const currentY = parseFloat(bead.style.top);

      let newX = currentX;
      let newY = currentY;

      // Check if bead is outside container bounds
      if (currentX + beadRect.width > containerRect.width) {
        newX = Math.max(0, containerRect.width - beadRect.width - this.margin);
      }
      if (currentY + beadRect.height > containerRect.height) {
        newY = Math.max(
          0,
          containerRect.height - beadRect.height - this.margin,
        );
      }

      if (newX !== currentX || newY !== currentY) {
        bead.style.left = newX + "px";
        bead.style.top = newY + "px";
      }
    });
  }

  // Public method to add more beads
  addBeads(count = 10) {
    const container = document.getElementById("letter-beads-container");
    if (!container) return;

    const newCharacters = this.generateCharacterArray(count);
    newCharacters.forEach((character, index) => {
      setTimeout(() => this.createBead(character, container), index * 100);
    });
  }

  // Public method to clear all beads
  clearBeads() {
    const container = document.getElementById("letter-beads-container");
    if (container) {
      container.innerHTML = "";
      this.beads = [];
    }
  }

  // Helper function to lighten a color
  lightenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;
    return (
      "#" +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
    );
  }

  // Helper function to darken a color
  darkenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = ((num >> 8) & 0x00ff) - amt;
    const B = (num & 0x0000ff) - amt;
    return (
      "#" +
      (
        0x1000000 +
        (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
        (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
        (B > 255 ? 255 : B < 0 ? 0 : B)
      )
        .toString(16)
        .slice(1)
    );
  }
}

// Add destroy method for toy manager compatibility
LetterBeads.prototype.destroy = function () {
  const container = document.getElementById("letter-beads-container");
  if (container) {
    container.remove();
  }
  this.beads = [];
  console.log("Letter Beads: Destroyed");
};

// Don't auto-initialize - let toy manager handle it
console.log("Letter Beads: Script loading...");

// Expose to global scope for toy manager
window.LetterBeads = LetterBeads;
