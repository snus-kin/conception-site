/**
 * Simple Toy Manager - Cycles toys when "TOY" is typed
 */

class ToyManager {
  constructor() {
    this.currentToy = null;
    this.toys = ["beads", "drawing", "checkboxes"];
    this.toyInstances = {};
    this.keySequence = [];
    this.targetSequence = ["KeyT", "KeyO", "KeyY"];

    this.init();
  }

  init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    // Start with beads
    this.switchToToy("beads");

    // Listen for key presses
    document.addEventListener("keydown", (e) => this.handleKeyPress(e));
  }

  handleKeyPress(e) {
    // Ignore if typing in input fields
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
      return;
    }

    this.keySequence.push(e.code);

    // Keep only last 3 keys
    if (this.keySequence.length > 3) {
      this.keySequence.shift();
    }

    // Check if we have TOY sequence
    if (
      this.keySequence.length === 3 &&
      this.keySequence[0] === "KeyT" &&
      this.keySequence[1] === "KeyO" &&
      this.keySequence[2] === "KeyY"
    ) {
      this.cycleToys();
      this.keySequence = []; // Reset
    }
  }

  cycleToys() {
    const currentIndex = this.toys.indexOf(this.currentToy);
    const nextIndex = (currentIndex + 1) % this.toys.length;
    const nextToy = this.toys[nextIndex];

    this.switchToToy(nextToy);
  }

  switchToToy(toyName) {
    // Destroy current toy
    if (this.currentToy && this.toyInstances[this.currentToy]) {
      if (this.toyInstances[this.currentToy].destroy) {
        this.toyInstances[this.currentToy].destroy();
      }
      this.toyInstances[this.currentToy] = null;
    }

    // Clear containers
    [
      "letter-beads-container",
      "drawing-container",
      "checkboxes-container",
    ].forEach((id) => {
      const container = document.getElementById(id);
      if (container) container.remove();
    });

    // Create new toy
    if (toyName === "beads" && window.LetterBeads) {
      this.toyInstances.beads = new window.LetterBeads();
    } else if (toyName === "drawing" && window.DrawingToy) {
      this.toyInstances.drawing = new window.DrawingToy();
    } else if (toyName === "checkboxes" && window.CheckboxToy) {
      this.toyInstances.checkboxes = new window.CheckboxToy();
    }

    this.currentToy = toyName;
  }
}

// Initialize
new ToyManager();
