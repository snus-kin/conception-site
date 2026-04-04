(function () {
    const letters = ['c', 'o', 'n', 'c', 'e', 'p', 't', 'i', 'o', 'n'];
    const basePath = 'Images/letter-beads/';
    let currentIndex = 0;

    // Preload all unique letter images so swaps are instant
    const uniqueLetters = [...new Set(letters)];
    uniqueLetters.forEach(function (letter) {
        const img = new Image();
        img.src = basePath + letter + '.png';
    });

    function updateFavicon() {
        const link = document.querySelector('link[rel~="icon"]');
        if (link) {
            link.href = basePath + letters[currentIndex] + '.png';
            link.type = 'image/png';
        }
        currentIndex = (currentIndex + 1) % letters.length;
    }

    function start() {
        updateFavicon();
        setInterval(updateFavicon, 600);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
