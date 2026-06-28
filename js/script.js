/**
 * AETHER - Luxury Immersive Technology Studio
 * Premium JavaScript Framework
 * Designed & Developed by Oltion Shumolli
 */

// ============================================
// MODULE PATTERN - Core Application
// ============================================

const AetherApp = (() => {
    'use strict';

    // ============================================
    // CONFIGURATION
    // ============================================

    const CONFIG = {
        scrollOffset: 100,
        animationDuration: 800,
        staggerDelay: 100,
        heroParticles: 50,
        statsParticles: 30,
        cursorSmoothing: 0.15,
        debounceDelay: 150
    };

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================

    const utils = {
        // Debounce function for performance
        debounce: (func, wait) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        // Throttle function for scroll events
        throttle: (func, limit) => {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        // Check if element is in viewport
        isInViewport: (element, threshold = 0.1) => {
            const rect = element.getBoundingClientRect();
            return (
                rect.top <= (window.innerHeight * (1 - threshold)) &&
                rect.bottom >= (window.innerHeight * threshold)
            );
        },

        // Animate number counting
        animateCounter: (element, target, duration = 2000) => {
            const start = performance.now();
            const startValue = 0;
            
            const updateCounter = (currentTime) => {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function (ease-out-cubic)
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(startValue + (target - startValue) * easeOut);
                
                element.textContent = current;
                
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    element.textContent = target;
                }
            };
            
            requestAnimationFrame(updateCounter);
        }
    };

    // ============================================
    // LOADING SCREEN
    // ============================================

    const LoadingScreen = {
        element: null,
        
        init() {
            this.element = document.getElementById('loading-screen');
            if (!this.element) return;
            
            // Simulate loading completion
            setTimeout(() => {
                this.hide();
            }, 2500);
        },
        
        hide() {
            this.element.classList.add('loaded');
            
            // Remove from DOM after transition
            setTimeout(() => {
                if (this.element && this.element.parentNode) {
                    this.element.parentNode.removeChild(this.element);
                }
                // Initialize scroll reveal after loading
                ScrollReveal.init();
            }, 600);
        }
    };

    // ============================================
    // SCROLL PROGRESS INDICATOR
    // ============================================

    const ScrollProgress = {
        bar: null,
        progressElement: null,
        
        init() {
            this.bar = document.querySelector('.scroll-progress-bar');
            this.progressElement = document.querySelector('.scroll-progress');
            if (!this.bar) return;
            
            window.addEventListener('scroll', utils.throttle(() => {
                this.update();
            }, 50));
        },
        
        update() {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrollTop / docHeight) * 100;
            
            this.bar.style.width = `${progress}%`;
            
            // Update ARIA
            if (this.progressElement) {
                this.progressElement.setAttribute('aria-valuenow', Math.round(progress));
            }
        }
    };

    // ============================================
    // CUSTOM CURSOR
    // ============================================

    const CustomCursor = {
        cursor: null,
        dot: null,
        outline: null,
        mouseX: 0,
        mouseY: 0,
        outlineX: 0,
        outlineY: 0,
        isTouch: false,
        
        init() {
            // Check for touch device
            this.isTouch = window.matchMedia('(pointer: coarse)').matches;
            if (this.isTouch) return;
            
            this.cursor = document.querySelector('.custom-cursor');
            this.dot = document.querySelector('.cursor-dot');
            this.outline = document.querySelector('.cursor-outline');
            
            if (!this.cursor || !this.dot || !this.outline) return;
            
            // Show cursor
            this.cursor.style.display = 'block';
            
            // Track mouse movement
            document.addEventListener('mousemove', (e) => {
                this.mouseX = e.clientX;
                this.mouseY = e.clientY;
                
                // Update dot position immediately
                this.dot.style.left = `${this.mouseX}px`;
                this.dot.style.top = `${this.mouseY}px`;
            });
            
            // Smooth outline animation
            this.animateOutline();
            
            // Handle hover states
            this.setupHoverEffects();
            
            // Hide when mouse leaves window
            document.addEventListener('mouseleave', () => {
                this.cursor.style.opacity = '0';
            });
            
            document.addEventListener('mouseenter', () => {
                this.cursor.style.opacity = '1';
            });
        },
        
        animateOutline() {
            const animate = () => {
                this.outlineX += (this.mouseX - this.outlineX) * CONFIG.cursorSmoothing;
                this.outlineY += (this.mouseY - this.outlineY) * CONFIG.cursorSmoothing;
                
                this.outline.style.left = `${this.outlineX}px`;
                this.outline.style.top = `${this.outlineY}px`;
                
                requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
        },
        
        setupHoverEffects() {
            const interactiveElements = document.querySelectorAll('a, button, .portfolio-item, .service-card, .team-card, .filter-btn');
            
            interactiveElements.forEach(el => {
                el.addEventListener('mouseenter', () => {
                    this.cursor.classList.add('hover');
                });
                
                el.addEventListener('mouseleave', () => {
                    this.cursor.classList.remove('hover');
                });
            });
        }
    };

    // ============================================
    // HEADER & NAVIGATION
    // ============================================

    const Navigation = {
        header: null,
        mobileToggle: null,
        mobileNav: null,
        
        init() {
            this.header = document.querySelector('.site-header');
            this.mobileToggle = document.getElementById('mobile-menu-toggle');
            this.mobileNav = document.getElementById('mobile-nav');
            
            // Scroll handler for header
            window.addEventListener('scroll', utils.throttle(() => {
                this.handleScroll();
            }, 100));
            
            // Mobile menu toggle
            if (this.mobileToggle) {
                this.mobileToggle.addEventListener('click', () => {
                    this.toggleMobileMenu();
                });
            }
            
            // Close mobile nav on link click
            const mobileLinks = document.querySelectorAll('.mobile-nav-link');
            mobileLinks.forEach(link => {
                link.addEventListener('click', () => {
                    this.closeMobileMenu();
                });
            });
            
            // Smooth scroll for anchor links
            this.setupSmoothScroll();
        },
        
        handleScroll() {
            if (window.scrollY > 50) {
                this.header.classList.add('scrolled');
            } else {
                this.header.classList.remove('scrolled');
            }
        },
        
        toggleMobileMenu() {
            const isOpen = this.mobileNav.classList.contains('active');
            
            if (isOpen) {
                this.closeMobileMenu();
            } else {
                this.openMobileMenu();
            }
        },
        
        openMobileMenu() {
            this.mobileNav.classList.add('active');
            this.mobileToggle.classList.add('active');
            this.mobileToggle.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        },
        
        closeMobileMenu() {
            this.mobileNav.classList.remove('active');
            this.mobileToggle.classList.remove('active');
            this.mobileToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        },
        
        setupSmoothScroll() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    const targetId = this.getAttribute('href');
                    if (targetId === '#') return;
                    
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        e.preventDefault();
                        const headerOffset = 80;
                        const elementPosition = targetElement.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                        
                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }
                });
            });
        }
    };

    // ============================================
    // THEME TOGGLE (Dark/Light Mode)
    // ============================================

    const ThemeManager = {
        toggle: null,
        html: null,
        STORAGE_KEY: 'aether-theme',
        
        init() {
            this.toggle = document.getElementById('theme-toggle');
            this.html = document.documentElement;
            
            if (!this.toggle) return;
            
            // Load saved theme or default to dark
            const savedTheme = localStorage.getItem(this.STORAGE_KEY) || 'dark';
            this.setTheme(savedTheme);
            
            this.toggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        },
        
        setTheme(theme) {
            this.html.setAttribute('data-theme', theme);
            localStorage.setItem(this.STORAGE_KEY, theme);
        },
        
        toggleTheme() {
            const currentTheme = this.html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            this.setTheme(newTheme);
        }
    };

    // ============================================
    // HERO PARTICLES
    // ============================================

    const HeroParticles = {
        container: null,
        particles: [],
        
        init() {
            this.container = document.getElementById('hero-particles');
            if (!this.container) return;
            
            this.createParticles(CONFIG.heroParticles);
        },
        
        createParticles(count) {
            for (let i = 0; i < count; i++) {
                const particle = document.createElement('div');
                particle.className = 'hero-particle';
                
                // Random properties
                const size = Math.random() * 3 + 1;
                const left = Math.random() * 100;
                const delay = Math.random() * 15;
                const duration = Math.random() * 10 + 10;
                const opacity = Math.random() * 0.5 + 0.2;
                
                particle.style.cssText = `
                    width: ${size}px;
                    height: ${size}px;
                    left: ${left}%;
                    animation-delay: ${delay}s;
                    animation-duration: ${duration}s;
                    opacity: ${opacity};
                `;
                
                this.container.appendChild(particle);
            }
        }
    };

    // ============================================
    // STATS PARTICLES
    // ============================================

    const StatsParticles = {
        container: null,
        
        init() {
            this.container = document.getElementById('stats-particles');
            if (!this.container) return;
            
            this.createParticles(CONFIG.statsParticles);
        },
        
        createParticles(count) {
            for (let i = 0; i < count; i++) {
                const particle = document.createElement('div');
                particle.className = 'hero-particle';
                
                const size = Math.random() * 2 + 1;
                const left = Math.random() * 100;
                const top = Math.random() * 100;
                const delay = Math.random() * 10;
                const duration = Math.random() * 8 + 8;
                
                particle.style.cssText = `
                    width: ${size}px;
                    height: ${size}px;
                    left: ${left}%;
                    top: ${top}%;
                    animation: particleFloat ${duration}s linear ${delay}s infinite;
                `;
                
                this.container.appendChild(particle);
            }
        }
    };

    // ============================================
    // SCROLL REVEAL
    // ============================================

    const ScrollReveal = {
        elements: [],
        observer: null,
        
        init() {
            this.elements = document.querySelectorAll('[data-reveal]');
            if (this.elements.length === 0) return;
            
            // Create intersection observer
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const delay = entry.target.dataset.delay || 0;
                        
                        setTimeout(() => {
                            entry.target.classList.add('revealed');
                        }, parseInt(delay));
                        
                        this.observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });
            
            this.elements.forEach(el => {
                this.observer.observe(el);
            });
        }
    };

    // ============================================
    // ANIMATED COUNTERS
    // ============================================

    const AnimatedCounters = {
        counters: [],
        observer: null,
        hasAnimated: false,
        
        init() {
            this.counters = document.querySelectorAll('[data-count]');
            if (this.counters.length === 0) return;
            
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.hasAnimated) {
                        this.animateAll();
                        this.hasAnimated = true;
                    }
                });
            }, { threshold: 0.5 });
            
            // Observe the first stats container
            const statsSection = document.getElementById('statistics');
            if (statsSection) {
                this.observer.observe(statsSection);
            }
            
            // Also observe hero stats
            const heroStats = document.querySelector('.hero-stats');
            if (heroStats) {
                const heroObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.animateHeroCounters();
                            heroObserver.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.5 });
                
                heroObserver.observe(heroStats);
            }
        },
        
        animateAll() {
            this.counters.forEach((counter, index) => {
                const target = parseInt(counter.dataset.count);
                
                setTimeout(() => {
                    utils.animateCounter(counter, target, 2000);
                }, index * 200);
            });
        },
        
        animateHeroCounters() {
            const heroCounters = document.querySelectorAll('.hero-stats [data-count]');
            heroCounters.forEach((counter, index) => {
                const target = parseInt(counter.dataset.count);
                
                setTimeout(() => {
                    utils.animateCounter(counter, target, 2000);
                }, index * 200);
            });
        }
    };

    // ============================================
    // PORTFOLIO FILTER
    // ============================================

    const PortfolioFilter = {
        buttons: [],
        items: [],
        
        init() {
            this.buttons = document.querySelectorAll('.filter-btn');
            this.items = document.querySelectorAll('.portfolio-item');
            
            if (this.buttons.length === 0 || this.items.length === 0) return;
            
            this.buttons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const filter = e.target.dataset.filter;
                    this.filterItems(filter);
                    this.updateActiveButton(e.target);
                });
            });
        },
        
        filterItems(category) {
            this.items.forEach(item => {
                const itemCategory = item.dataset.category;
                
                if (category === 'all' || itemCategory === category) {
                    item.classList.remove('hidden');
                    // Trigger reflow for animation
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    
                    requestAnimationFrame(() => {
                        item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    });
                } else {
                    item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        item.classList.add('hidden');
                    }, 300);
                }
            });
        },
        
        updateActiveButton(activeButton) {
            this.buttons.forEach(button => {
                button.classList.remove('active');
                button.setAttribute('aria-selected', 'false');
            });
            
            activeButton.classList.add('active');
            activeButton.setAttribute('aria-selected', 'true');
        }
    };

    // ============================================
    // TESTIMONIALS SLIDER
    // ============================================

    const TestimonialsSlider = {
        track: null,
        cards: [],
        prevBtn: null,
        nextBtn: null,
        dots: [],
        currentIndex: 0,
        totalSlides: 0,
        autoplayInterval: null,
        
        init() {
            this.track = document.getElementById('testimonials-track');
            this.cards = document.querySelectorAll('.testimonial-card');
            this.prevBtn = document.getElementById('testimonial-prev');
            this.nextBtn = document.getElementById('testimonial-next');
            this.dots = document.querySelectorAll('.testimonials-dots .dot');
            
            if (!this.track || this.cards.length === 0) return;
            
            this.totalSlides = this.cards.length;
            
            // Event listeners
            if (this.prevBtn) {
                this.prevBtn.addEventListener('click', () => this.prev());
            }
            
            if (this.nextBtn) {
                this.nextBtn.addEventListener('click', () => this.next());
            }
            
            this.dots.forEach((dot, index) => {
                dot.addEventListener('click', () => this.goTo(index));
            });
            
            // Keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') this.prev();
                if (e.key === 'ArrowRight') this.next();
            });
            
            // Autoplay
            this.startAutoplay();
            
            // Pause on hover
            const slider = document.querySelector('.testimonials-slider');
            if (slider) {
                slider.addEventListener('mouseenter', () => this.stopAutoplay());
                slider.addEventListener('mouseleave', () => this.startAutoplay());
            }
        },
        
        goTo(index) {
            if (index < 0) index = this.totalSlides - 1;
            if (index >= this.totalSlides) index = 0;
            
            this.currentIndex = index;
            this.updateSlider();
        },
        
        next() {
            this.goTo(this.currentIndex + 1);
        },
        
        prev() {
            this.goTo(this.currentIndex - 1);
        },
        
        updateSlider() {
            const translateX = -(this.currentIndex * 100);
            this.track.style.transform = `translateX(${translateX}%)`;
            
            // Update dots
            this.dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === this.currentIndex);
                dot.setAttribute('aria-selected', index === this.currentIndex ? 'true' : 'false');
            });
        },
        
        startAutoplay() {
            this.stopAutoplay();
            this.autoplayInterval = setInterval(() => {
                this.next();
            }, 5000);
        },
        
        stopAutoplay() {
            if (this.autoplayInterval) {
                clearInterval(this.autoplayInterval);
                this.autoplayInterval = null;
            }
        }
    };

    // ============================================
    // PROCESS TIMELINE
    // ============================================

    const ProcessTimeline = {
        progressLine: null,
        observer: null,
        
        init() {
            this.progressLine = document.querySelector('.process-line-progress');
            if (!this.progressLine) return;
            
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateProgress();
                    }
                });
            }, { threshold: 0.3 });
            
            const timeline = document.querySelector('.process-timeline');
            if (timeline) {
                this.observer.observe(timeline);
            }
        },
        
        animateProgress() {
            this.progressLine.style.height = '100%';
        }
    };

    // ============================================
    // BACK TO TOP
    // ============================================

    const BackToTop = {
        button: null,
        
        init() {
            this.button = document.getElementById('back-to-top');
            if (!this.button) return;
            
            window.addEventListener('scroll', utils.throttle(() => {
                this.toggleVisibility();
            }, 100));
            
            this.button.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        },
        
        toggleVisibility() {
            if (window.scrollY > 500) {
                this.button.classList.add('visible');
            } else {
                this.button.classList.remove('visible');
            }
        }
    };

    // ============================================
    // FORM VALIDATION
    // ============================================

    const FormValidation = {
        contactForm: null,
        newsletterForm: null,
        
        init() {
            this.contactForm = document.getElementById('contact-form');
            this.newsletterForm = document.getElementById('newsletter-form');
            
            if (this.contactForm) {
                this.contactForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleContactSubmit();
                });
            }
            
            if (this.newsletterForm) {
                this.newsletterForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleNewsletterSubmit();
                });
            }
        },
        
        validateEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        },
        
        handleContactSubmit() {
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');
            
            let isValid = true;
            
            // Validate name
            if (!nameInput.value.trim()) {
                nameInput.classList.add('error');
                isValid = false;
            } else {
                nameInput.classList.remove('error');
            }
            
            // Validate email
            if (!this.validateEmail(emailInput.value)) {
                emailInput.classList.add('error');
                isValid = false;
            } else {
                emailInput.classList.remove('error');
            }
            
            // Validate message
            if (!messageInput.value.trim()) {
                messageInput.classList.add('error');
                isValid = false;
            } else {
                messageInput.classList.remove('error');
            }
            
            if (isValid) {
                // Show loading state
                const submitBtn = this.contactForm.querySelector('.btn-submit');
                submitBtn.classList.add('loading');
                
                // Simulate form submission
                setTimeout(() => {
                    submitBtn.classList.remove('loading');
                    this.contactForm.classList.add('success');
                }, 1500);
            }
        },
        
        handleNewsletterSubmit() {
            const emailInput = document.getElementById('newsletter-email');
            const errorMsg = document.getElementById('newsletter-error');
            const successMsg = document.getElementById('newsletter-success');
            
            if (!this.validateEmail(emailInput.value)) {
                errorMsg.style.display = 'block';
                successMsg.style.display = 'none';
            } else {
                errorMsg.style.display = 'none';
                successMsg.style.display = 'block';
                emailInput.value = '';
                
                // Hide success message after 5 seconds
                setTimeout(() => {
                    successMsg.style.display = 'none';
                }, 5000);
            }
        }
    };

    // ============================================
    // FAQ ACCORDION
    // ============================================

    const FAQAccordion = {
        items: [],
        
        init() {
            this.items = document.querySelectorAll('.faq-item');
            
            this.items.forEach(item => {
                const summary = item.querySelector('summary');
                
                summary.addEventListener('click', () => {
                    // Close other items
                    this.items.forEach(otherItem => {
                        if (otherItem !== item && otherItem.hasAttribute('open')) {
                            otherItem.removeAttribute('open');
                        }
                    });
                });
            });
        }
    };

    // ============================================
    // PARALLAX EFFECTS
    // ============================================

    const ParallaxEffects = {
        elements: [],
        
        init() {
            // Hero background parallax
            const heroBg = document.querySelector('.hero-bg img');
            if (heroBg) {
                window.addEventListener('scroll', utils.throttle(() => {
                    const scrolled = window.pageYOffset;
                    const rate = scrolled * 0.3;
                    heroBg.style.transform = `translateY(${rate}px) scale(1.1)`;
                }, 50));
            }
        }
    };

    // ============================================
    // CTA PARTICLES
    // ============================================

    const CTAParticles = {
        container: null,
        
        init() {
            this.container = document.getElementById('cta-particles');
            if (!this.container) return;
            
            for (let i = 0; i < 20; i++) {
                const particle = document.createElement('div');
                particle.className = 'hero-particle';
                
                const size = Math.random() * 2 + 1;
                const left = Math.random() * 100;
                const delay = Math.random() * 8;
                const duration = Math.random() * 6 + 6;
                
                particle.style.cssText = `
                    width: ${size}px;
                    height: ${size}px;
                    left: ${left}%;
                    animation-delay: ${delay}s;
                    animation-duration: ${duration}s;
                `;
                
                this.container.appendChild(particle);
            }
        }
    };

    // ============================================
    // ACTIVE NAV LINK HIGHLIGHTING
    // ============================================

    const ActiveNavLink = {
        sections: [],
        navLinks: [],
        
        init() {
            this.sections = document.querySelectorAll('section[id]');
            this.navLinks = document.querySelectorAll('.nav-link[href^="#"]');
            
            if (this.sections.length === 0 || this.navLinks.length === 0) return;
            
            window.addEventListener('scroll', utils.throttle(() => {
                this.highlightActiveLink();
            }, 100));
        },
        
        highlightActiveLink() {
            const scrollPosition = window.scrollY + 150;
            
            this.sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    this.navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${sectionId}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }
    };

    // ============================================
    // INITIALIZATION
    // ============================================

    const init = () => {
        // Initialize loading screen first
        LoadingScreen.init();
        
        // Initialize core functionality
        ScrollProgress.init();
        CustomCursor.init();
        Navigation.init();
        ThemeManager.init();
        
        // Initialize visual effects
        HeroParticles.init();
        StatsParticles.init();
        CTAParticles.init();
        
        // Initialize scroll-based features
        // ScrollReveal is initialized after loading screen hides
        AnimatedCounters.init();
        ParallaxEffects.init();
        BackToTop.init();
        ActiveNavLink.init();
        
        // Initialize interactive components
        PortfolioFilter.init();
        TestimonialsSlider.init();
        ProcessTimeline.init();
        FormValidation.init();
        FAQAccordion.init();
        
        console.log('%c AETHER ', 'background: linear-gradient(135deg, #D4AF37, #F4E4BC); color: #0A0A0F; font-size: 24px; font-weight: bold; padding: 10px 20px; border-radius: 8px;');
        console.log('%c Luxury Immersive Technology Studio ', 'color: #D4AF37; font-size: 14px;');
        console.log('%c Designed & Developed by Oltion Shumolli ', 'color: #6A6A6A; font-size: 12px;');
    };

    // Public API
    return { init };
})();

// ============================================
// DOM READY INITIALIZATION
// ============================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        AetherApp.init();
    });
} else {
    AetherApp.init();
}

// ============================================
// SERVICE WORKER (for PWA capability)
// ============================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service worker can be registered here for offline support
        // Currently disabled for static deployment
    });
}
