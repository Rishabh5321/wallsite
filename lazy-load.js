document.addEventListener('DOMContentLoaded', () => {
    const lazyImages = document.querySelectorAll('img[data-src]');

    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null, // relative to document viewport
            rootMargin: '0px 0px 50px 0px', // trigger 50px before it enters viewport
            threshold: 0.01 // minimal visibility to trigger
        };

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const lazyImage = entry.target;
                    // Start loading the high-res image
                    lazyImage.src = lazyImage.dataset.src;

                    // When the high-res image is loaded, add the 'unblur' class for the transition
                    lazyImage.onload = () => {
                        lazyImage.classList.add('unblur');
                    };

                    // Stop observing the image once it has been triggered
                    observer.unobserve(lazyImage);
                }
            });
        }, observerOptions);

        lazyImages.forEach(image => {
            imageObserver.observe(image);
        });
    } else {
        // Fallback for older browsers that don't support IntersectionObserver
        console.warn('IntersectionObserver not supported. Loading all images immediately.');
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.classList.add('unblur');
        });
    }
});
