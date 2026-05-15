// ===== MATRIX RAIN ANIMATION =====
class MatrixRain {
  constructor() {
    this.canvas = document.getElementById('matrix-canvas');
    if (!this.canvas) {
      this.ctx = null;
      this.drops = [];
      this.dropSpeeds = [];
      this.columnBrightness = [];
      this.animationId = null;
      return;
    }
    this.ctx = this.canvas.getContext('2d');
    this.drops = [];
    this.dropSpeeds = []; // Variable speeds per column (like the movie)
    this.columnBrightness = []; // Some columns brighter than others
    this.characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?';
    this.fontSize = 14;
    this.columns = 0;
    this.animationId = null;
    this.currentTheme = 'dark';
    
    this.init();
  }

  init() {
    if (!this.canvas || !this.ctx) return;
    this.resizeCanvas();
    this.createDrops();
    this.animate();
    
    // Handle window resize
    window.addEventListener('resize', () => {
      const oldColumns = this.columns;
      this.resizeCanvas();
      // Recreate drops, speeds, and brightness if column count changed
      if (oldColumns !== this.columns) {
        this.createDrops();
      }
    });
  }

  resizeCanvas() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    // More natural spacing like the original movie
    this.columns = Math.floor(this.canvas.width / this.fontSize);
  }

  createDrops() {
    if (!this.canvas || !this.ctx) return;
    this.drops = [];
    this.dropSpeeds = [];
    this.columnBrightness = [];
    
    // Create drops with variable speeds and brightness (like the movie)
    for (let i = 0; i < this.columns; i++) {
      // Variable speed per column (much slower for more dramatic effect)
      this.dropSpeeds[i] = Math.random() * 0.15 + 0.08; // Speed multiplier (0.08 to 0.23)
      // Some columns are brighter (like highlighted columns in the movie)
      this.columnBrightness[i] = Math.random() > 0.85 ? 1.3 : 1.0;
      // Single drop per column that resets continuously
      this.drops[i] = Math.random() * this.canvas.height;
    }
  }

  draw() {
    if (!this.canvas || !this.ctx) return;
    // Semi-transparent background for trail effect (theme-dependent)
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    this.currentTheme = theme;
    
    // Subtle background fade for trail effect (more like the movie)
    if (theme === 'light') {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    } else {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
    }
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Set font and color (theme-dependent)
    this.ctx.font = `${this.fontSize}px 'JetBrains Mono', monospace`;
    
    // Use darker green for light mode
    const baseColor = theme === 'light' ? 'rgba(0, 170, 85' : 'rgba(0, 255, 100';

    // Draw Matrix rain with authentic movie-style effect
    for (let i = 0; i < this.drops.length; i++) {
      const x = i * this.fontSize;
      const y = this.drops[i];
      const speed = this.dropSpeeds[i];
      const brightness = this.columnBrightness[i];

      // Shorter trail like the original movie (8-12 characters)
      const trailLength = Math.floor(Math.random() * 5) + 8;
      
      for (let j = 0; j < trailLength; j++) {
        const trailY = y - (j * this.fontSize);
        
        // Characters change as they fall (more authentic)
        const char = this.characters[Math.floor(Math.random() * this.characters.length)];
        
        // Authentic Matrix effect: bright white head, quick fade to green
        let opacity;
        let charColor;
        
        if (j === 0) {
          // Head character: very bright (almost white) in dark mode, bright green in light mode
          if (theme === 'light') {
            charColor = `rgba(0, 255, 150, ${0.9 * brightness})`; // Bright cyan-green
          } else {
            charColor = `rgba(255, 255, 255, ${0.95 * brightness})`; // Bright white head
          }
          opacity = 1.0;
        } else if (j === 1) {
          // Second character: bright green
          if (theme === 'light') {
            charColor = `rgba(0, 200, 100, ${0.8 * brightness})`;
          } else {
            charColor = `rgba(0, 255, 100, ${0.9 * brightness})`; // Bright green
          }
          opacity = 0.9;
        } else {
          // Trail: quick fade from bright green to dark green
          const fadeRatio = Math.max(0, (trailLength - j) / trailLength);
          opacity = fadeRatio * 0.6; // Quick fade
          
          if (theme === 'light') {
            const greenValue = Math.floor(85 + fadeRatio * 85);
            charColor = `rgba(0, ${greenValue}, ${Math.floor(greenValue * 0.6)}, ${opacity * brightness})`;
          } else {
            const greenValue = Math.floor(100 + fadeRatio * 155);
            charColor = `rgba(0, ${greenValue}, ${Math.floor(greenValue * 0.4)}, ${opacity * brightness})`;
          }
        }
        
        this.ctx.fillStyle = charColor;
        this.ctx.fillText(char, x, trailY);
      }

      // Reset drop when it goes off screen for continuous rain
      if (y > this.canvas.height + (trailLength * this.fontSize)) {
        this.drops[i] = -Math.random() * 100; // Start slightly above screen
      }

      // Move at variable speed (like the movie - different speeds per column)
      this.drops[i] += this.fontSize * speed;
    }
  }

  animate() {
    if (!this.canvas || !this.ctx) return;
    this.draw();
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// ===== SCROLL ANIMATIONS =====
class ScrollAnimations {
  constructor() {
    this.elements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');
    this.init();
  }

  init() {
    // Add animation classes to elements
    this.elements.forEach(el => {
      if (!el.classList.contains('fade-in') && 
          !el.classList.contains('slide-in-left') && 
          !el.classList.contains('slide-in-right')) {
        el.classList.add('fade-in');
      }
    });

    // Set up intersection observer
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    // Observe all elements
    this.elements.forEach(el => {
      this.observer.observe(el);
    });
  }
}

// ===== MOBILE NAVIGATION =====
class MobileNavigation {
  constructor() {
    this.hamburger = document.querySelector('.hamburger');
    this.navMenu = document.querySelector('.nav-menu');
    this.navLinks = document.querySelectorAll('.nav-link');
    
    this.init();
  }

  init() {
    if (this.hamburger && this.navMenu) {
      this.hamburger.addEventListener('click', () => this.toggleMenu());
      
      // Close menu when clicking on nav links
      this.navLinks.forEach(link => {
        link.addEventListener('click', () => this.closeMenu());
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!this.hamburger.contains(e.target) && !this.navMenu.contains(e.target)) {
          this.closeMenu();
        }
      });
    }
  }

  toggleMenu() {
    this.hamburger.classList.toggle('active');
    this.navMenu.classList.toggle('active');
  }

  closeMenu() {
    this.hamburger.classList.remove('active');
    this.navMenu.classList.remove('active');
  }
}

// ===== SMOOTH SCROLLING =====
class SmoothScrolling {
  constructor() {
    this.navLinks = document.querySelectorAll('a[href^="#"]');
    this.init();
  }

  init() {
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        
        // Handle scroll to top (empty hash or just #)
        if (targetId === '#' || targetId === '') {
          e.preventDefault();
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
          // Remove active class from all nav links when scrolling to top
          document.querySelectorAll('.nav-link').forEach(navLink => {
            navLink.classList.remove('active');
          });
          return;
        }
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          const offsetTop = targetElement.offsetTop - 68; // Account for fixed navbar
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      });
    });
  }
}

// ===== PARTICLE EFFECTS =====
class ParticleEffects {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: 0, y: 0 };
    
    this.init();
  }

  init() {
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '1';
    this.canvas.style.opacity = '0.6';
    document.body.appendChild(this.canvas);

    this.resizeCanvas();
    this.createParticles();
    this.animate();

    window.addEventListener('resize', () => this.resizeCanvas());
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < 50; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    const baseColor = theme === 'light' ? '0, 170, 85' : '0, 255, 100';

    this.particles.forEach(particle => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Mouse interaction
      const dx = this.mouse.x - particle.x;
      const dy = this.mouse.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 100) {
        const force = (100 - distance) / 100;
        particle.x -= dx * force * 0.01;
        particle.y -= dy * force * 0.01;
      }

      // Wrap around screen
      if (particle.x < 0) particle.x = this.canvas.width;
      if (particle.x > this.canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.canvas.height;
      if (particle.y > this.canvas.height) particle.y = 0;

      // Draw particle (theme-dependent)
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${baseColor}, ${particle.opacity})`;
      this.ctx.fill();
    });

    requestAnimationFrame(() => this.animate());
  }
}

// ===== NAVBAR SCROLL EFFECT =====
class NavbarScrollEffect {
  constructor() {
    this.navbar = document.querySelector('.navbar');
    this.lastScrollY = window.scrollY;
    this.sections = document.querySelectorAll('section[id]');
    this.navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    this.init();
  }

  init() {
    window.addEventListener('scroll', throttle(() => this.handleScroll(), 10));
    this.updateActiveLink();
    // Listen for theme changes
    document.addEventListener('themechange', () => this.updateNavbarColors());
    // Initial color update
    this.updateNavbarColors();
  }

  updateNavbarColors() {
    const currentScrollY = window.scrollY;
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    
    // Add shadow and stronger background when scrolled
    if (currentScrollY > 50) {
      this.navbar.style.boxShadow = '0 1px 8px rgba(0, 0, 0, 0.08)';
      if (theme === 'light') {
        this.navbar.style.background = 'rgba(240, 235, 228, 0.94)';
      } else {
        this.navbar.style.background = 'rgba(28, 33, 41, 0.94)';
      }
      this.navbar.style.backdropFilter = 'blur(16px)';
    } else {
      this.navbar.style.boxShadow = 'none';
      if (theme === 'light') {
        this.navbar.style.background = 'rgba(240, 235, 228, 0.85)';
      } else {
        this.navbar.style.background = 'rgba(28, 33, 41, 0.82)';
      }
      this.navbar.style.backdropFilter = 'blur(16px)';
    }
  }

  handleScroll() {
    const currentScrollY = window.scrollY;
    
    // Update navbar colors based on scroll position and theme
    this.updateNavbarColors();

    // Keep navbar always visible (sticky)
    this.navbar.style.transform = 'translateY(0)';
    
    // Update active link based on scroll position
    this.updateActiveLink();
    
    this.lastScrollY = currentScrollY;
  }

  updateActiveLink() {
    const scrollPosition = window.scrollY + 100; // Offset for navbar height
    
    this.sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        // Remove active class from all links
        this.navLinks.forEach(link => {
          link.classList.remove('active');
        });
        
        // Add active class to current section's link
        const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        if (activeLink) {
          activeLink.classList.add('active');
        }
      }
    });
    
    // Handle hero section (top of page)
    if (window.scrollY < 100) {
      this.navLinks.forEach(link => {
        link.classList.remove('active');
      });
    }
  }
}

// ===== THEME MANAGEMENT =====
class ThemeManager {
  constructor() {
    this.themeToggle = document.getElementById('theme-toggle');
    this.moonIcon = document.querySelector('.moon-icon');
    this.sunIcon = document.querySelector('.sun-icon');
    this.currentTheme = localStorage.getItem('theme') || 'dark';
    
    this.init();
  }

  init() {
    // Set initial theme
    this.setTheme(this.currentTheme);
    
    // Add event listener
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update icons
    if (this.moonIcon && this.sunIcon) {
      if (theme === 'light') {
        this.moonIcon.style.display = 'none';
        this.sunIcon.style.display = 'block';
      } else {
        this.moonIcon.style.display = 'block';
        this.sunIcon.style.display = 'none';
      }
    }
    
    this.currentTheme = theme;
    
    // Dispatch custom event to notify other components of theme change
    const themeChangeEvent = new CustomEvent('themechange', { 
      detail: { theme: theme } 
    });
    document.dispatchEvent(themeChangeEvent);
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  getTheme() {
    return this.currentTheme;
  }
}

// ===== INITIALIZE EVERYTHING =====
document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme manager first
  const themeManager = new ThemeManager();
  
  // Initialize all components
  new MatrixRain();
  const scrollAnimations = new ScrollAnimations();
  const mobileNav = new MobileNavigation();
  const smoothScrolling = new SmoothScrolling();
  const isWorkshopHome = document.body.classList.contains('page-workshop');
  if (!isWorkshopHome) {
    new ParticleEffects();
  }
  const navbarEffect = new NavbarScrollEffect();

  // Add some interactive hover effects
  const projectCards = document.querySelectorAll('.project-card');
  if (!isWorkshopHome) {
    projectCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px) scale(1.02)';
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
      });
    });
  }

  // Add click effects to buttons
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(button => {
    button.addEventListener('click', (e) => {
      // Create ripple effect
      const ripple = document.createElement('span');
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.classList.add('ripple');
      
      button.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });

  // Add CSS for ripple effect
  const style = document.createElement('style');
  style.textContent = `
    .btn {
      position: relative;
      overflow: hidden;
    }
    
    .ripple {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
    }
    
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  console.log('🚀 Portfolio website initialized successfully!');
  console.log('✨ Matrix rain animation active');
  console.log('🎨 Scroll animations enabled');
  console.log('📱 Mobile navigation ready');
  console.log('🎯 Interactive effects loaded');
});

// ===== PERFORMANCE OPTIMIZATION =====
// Throttle scroll events for better performance
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

// Pause animations when tab is not visible
document.addEventListener('visibilitychange', () => {
  const matrixCanvas = document.getElementById('matrix-canvas');
  if (!matrixCanvas) return;
  if (document.hidden) {
    matrixCanvas.style.animationPlayState = 'paused';
  } else {
    matrixCanvas.style.animationPlayState = 'running';
  }
});
