// Fix for Firefox mobile viewport height changes when URL bar hides/shows
// Sets a CSS custom property --vh that represents 1% of the stable inner height
(function() {
    function setViewportHeight() {
        // Use window.innerHeight which is stable on initial load
        // We only set this once to prevent the jumping issue
        var vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', vh + 'px');
    }

    // Set on initial load only
    setViewportHeight();

    // Only update on orientation change, not on scroll/resize
    // This prevents the footer from jumping when the URL bar hides
    window.addEventListener('orientationchange', function() {
        // Small delay to let the browser settle after orientation change
        setTimeout(setViewportHeight, 100);
    });
})();
