// Color randomization for sidebar
(function () {
  "use strict";

  // Nice muted color palette - darker, sophisticated tones
  const colorPalette = [
    "#2c3e50", // Dark blue-gray
    "#34495e", // Slate gray
    "#27ae60", // Muted green
    "#2980b9", // Deep blue
    "#8e44ad", // Deep purple
    "#16a085", // Teal
    "#d35400", // Burnt orange
    "#c0392b", // Deep red
    "#7f8c8d", // Gray
    "#2c2c54", // Dark navy
    "#40407a", // Deep indigo
    "#706fd3", // Soft purple
    "#474787", // Purple-gray
    "#aaa69d", // Warm gray
    "#227093", // Steel blue
    "#218c74", // Forest green
    "#b33939", // Burgundy
    "#cd6133", // Terra cotta
    "#535c68", // Cool gray
    "#1e3799", // Royal blue
  ];

  function getRandomColor() {
    const randomIndex = Math.floor(Math.random() * colorPalette.length);
    return colorPalette[randomIndex];
  }

  function setSidebarColor() {
    const randomColor = getRandomColor();
    document.documentElement.style.setProperty(
      "--color-sidebar-dynamic",
      randomColor,
    );

    // Also apply to mobile header if it exists
    const mobileHeader = document.querySelector(".mobile-header");
    if (mobileHeader) {
      mobileHeader.style.backgroundColor = randomColor;
    }

    // Optional: Store in sessionStorage to maintain color during navigation
    // sessionStorage.setItem('sidebarColor', randomColor);
  }

  // Set color when DOM is loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setSidebarColor);
  } else {
    setSidebarColor();
  }

  // Optional: Restore stored color (uncomment if you want persistence during session)
  /*
    function restoreStoredColor() {
        const storedColor = sessionStorage.getItem('sidebarColor');
        if (storedColor) {
            document.documentElement.style.setProperty('--color-sidebar-dynamic', storedColor);
        } else {
            setSidebarColor();
        }
    }
    */
})();
