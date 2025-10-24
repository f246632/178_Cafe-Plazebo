/* ===================================
   CAFE PLAZEBO - GALLERY JAVASCRIPT
   Lightbox & Image Gallery Functionality
   =================================== */

document.addEventListener('DOMContentLoaded', function() {

    // ===================================
    // GALLERY LIGHTBOX
    // ===================================

    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');

    let currentImageIndex = 0;
    let images = [];

    // Collect all gallery images
    galleryItems.forEach((item, index) => {
        const imageSrc = item.getAttribute('data-image');
        const imageAlt = item.querySelector('img').getAttribute('alt');
        images.push({ src: imageSrc, alt: imageAlt });

        // Add click event to open lightbox
        item.addEventListener('click', function() {
            openLightbox(index);
        });

        // Add keyboard accessibility
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.setAttribute('aria-label', `View ${imageAlt} in lightbox`);

        item.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(index);
            }
        });
    });

    // Open lightbox
    function openLightbox(index) {
        currentImageIndex = index;
        updateLightboxImage();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling

        // Focus on close button for accessibility
        setTimeout(() => lightboxClose.focus(), 100);
    }

    // Close lightbox
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling

        // Return focus to the gallery item that was opened
        galleryItems[currentImageIndex].focus();
    }

    // Update lightbox image
    function updateLightboxImage() {
        const currentImage = images[currentImageIndex];
        lightboxImage.src = currentImage.src;
        lightboxImage.alt = currentImage.alt;

        // Preload next and previous images for smooth transitions
        preloadImage(currentImageIndex - 1);
        preloadImage(currentImageIndex + 1);
    }

    // Preload images
    function preloadImage(index) {
        if (index >= 0 && index < images.length) {
            const img = new Image();
            img.src = images[index].src;
        }
    }

    // Navigate to previous image
    function showPrevImage() {
        currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
        updateLightboxImage();
    }

    // Navigate to next image
    function showNextImage() {
        currentImageIndex = (currentImageIndex + 1) % images.length;
        updateLightboxImage();
    }

    // Event listeners for lightbox controls
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', showPrevImage);
    }

    if (lightboxNext) {
        lightboxNext.addEventListener('click', showNextImage);
    }

    // Close lightbox when clicking outside the image
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('active')) return;

        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                showPrevImage();
                break;
            case 'ArrowRight':
                showNextImage();
                break;
        }
    });

    // Touch/Swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    lightboxImage.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightboxImage.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swiped left - show next image
                showNextImage();
            } else {
                // Swiped right - show previous image
                showPrevImage();
            }
        }
    }

    // ===================================
    // GALLERY GRID MASONRY EFFECT (Optional)
    // ===================================

    function adjustGalleryLayout() {
        // This can be expanded for a masonry-style layout if needed
        // For now, CSS Grid handles the layout
    }

    window.addEventListener('resize', debounce(adjustGalleryLayout, 250));

    // ===================================
    // IMAGE LOADING ANIMATION
    // ===================================

    const galleryImages = document.querySelectorAll('.gallery-item img');

    galleryImages.forEach(img => {
        // Add loading class
        img.parentElement.classList.add('loading');

        // Remove loading class when image is loaded
        if (img.complete) {
            img.parentElement.classList.remove('loading');
        } else {
            img.addEventListener('load', function() {
                this.parentElement.classList.remove('loading');
            });

            img.addEventListener('error', function() {
                this.parentElement.classList.add('error');
                console.error('Failed to load image:', this.src);
            });
        }
    });

    // Add loading styles
    const style = document.createElement('style');
    style.textContent = `
        .gallery-item.loading::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 40px;
            height: 40px;
            border: 4px solid var(--border-color);
            border-top-color: var(--primary-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            z-index: 1;
        }

        @keyframes spin {
            to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        .gallery-item.error {
            background-color: var(--background-light);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .gallery-item.error::after {
            content: '⚠️ Image failed to load';
            color: var(--text-medium);
            font-size: 0.9rem;
            text-align: center;
            padding: var(--spacing-sm);
        }

        /* Lightbox loading animation */
        #lightboxImage {
            transition: opacity 0.3s ease;
        }

        #lightboxImage.loading {
            opacity: 0.5;
        }
    `;
    document.head.appendChild(style);

    // Add loading state to lightbox image
    lightboxImage.addEventListener('loadstart', function() {
        this.classList.add('loading');
    });

    lightboxImage.addEventListener('load', function() {
        this.classList.remove('loading');
    });

    // ===================================
    // UTILITY FUNCTIONS
    // ===================================

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // ===================================
    // ACCESSIBILITY ENHANCEMENTS
    // ===================================

    // Announce to screen readers when lightbox opens/closes
    const announcer = document.createElement('div');
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', 'polite');
    announcer.style.position = 'absolute';
    announcer.style.left = '-10000px';
    announcer.style.width = '1px';
    announcer.style.height = '1px';
    announcer.style.overflow = 'hidden';
    document.body.appendChild(announcer);

    function announce(message) {
        announcer.textContent = message;
        setTimeout(() => {
            announcer.textContent = '';
        }, 1000);
    }

    // Trap focus in lightbox
    const focusableElements = [lightboxClose, lightboxPrev, lightboxNext];

    lightbox.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('active')) return;

        if (e.key === 'Tab') {
            const firstFocusable = focusableElements[0];
            const lastFocusable = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    e.preventDefault();
                }
            }
        }
    });

    // ===================================
    // GALLERY STATISTICS (Optional)
    // ===================================

    console.log(`📸 Gallery initialized with ${images.length} images`);

    // Track which images users view most (for analytics)
    const imageViews = new Array(images.length).fill(0);

    function trackImageView(index) {
        imageViews[index]++;
        // In production, this could send analytics data
        console.log(`Image ${index + 1} viewed ${imageViews[index]} time(s)`);
    }

    // Update tracking when lightbox is opened
    const originalOpenLightbox = openLightbox;
    openLightbox = function(index) {
        trackImageView(index);
        originalOpenLightbox(index);
    };
});
