// ===== MATRIX RAIN ANIMATION =====
class MatrixRain {
  constructor() {
    this.canvas = document.getElementById('matrix-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.drops = [];
    this.characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?';
    this.fontSize = 14;
    this.columns = 0;
    this.animationId = null;
    this.currentTheme = 'dark';
    
    this.init();
  }

  init() {
    this.resizeCanvas();
    this.createDrops();
    this.animate();
    
    // Handle window resize
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.createDrops();
    });
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.columns = Math.floor(this.canvas.width / this.fontSize);
  }

  createDrops() {
    this.drops = [];
    for (let i = 0; i < this.columns; i++) {
      this.drops[i] = Math.random() * this.canvas.height;
    }
  }

  draw() {
    // Semi-transparent background for trail effect (theme-dependent)
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    this.currentTheme = theme;
    
    if (theme === 'light') {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    } else {
      this.ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
    }
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Set font and color (theme-dependent)
    this.ctx.font = `${this.fontSize}px 'JetBrains Mono', monospace`;
    
    // Use darker green for light mode
    const baseColor = theme === 'light' ? 'rgba(0, 170, 85' : 'rgba(0, 255, 100';

    // Draw characters
    for (let i = 0; i < this.drops.length; i++) {
      const char = this.characters[Math.floor(Math.random() * this.characters.length)];
      const x = i * this.fontSize;
      const y = this.drops[i];

      // Add some opacity variation
      const opacity = Math.random() * 0.8 + 0.2;
      this.ctx.fillStyle = `${baseColor}, ${opacity})`;
      
      this.ctx.fillText(char, x, y);

      // Reset drop to top with some randomness
      if (y > this.canvas.height && Math.random() > 0.975) {
        this.drops[i] = 0;
      }

      this.drops[i] += this.fontSize;
    }
  }

  animate() {
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
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
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
    this.init();
  }

  init() {
    window.addEventListener('scroll', () => this.handleScroll());
  }

  handleScroll() {
    const currentScrollY = window.scrollY;
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    
    if (currentScrollY > 100) {
      if (theme === 'light') {
        this.navbar.style.background = 'rgba(255, 255, 255, 0.98)';
      } else {
        this.navbar.style.background = 'rgba(10, 10, 10, 0.98)';
      }
      this.navbar.style.backdropFilter = 'blur(15px)';
    } else {
      if (theme === 'light') {
        this.navbar.style.background = 'rgba(255, 255, 255, 0.95)';
      } else {
        this.navbar.style.background = 'rgba(10, 10, 10, 0.95)';
      }
      this.navbar.style.backdropFilter = 'blur(10px)';
    }

    // Hide/show navbar on scroll
    if (currentScrollY > this.lastScrollY && currentScrollY > 200) {
      this.navbar.style.transform = 'translateY(-100%)';
    } else {
      this.navbar.style.transform = 'translateY(0)';
    }

    this.lastScrollY = currentScrollY;
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
    this.themeToggle.addEventListener('click', () => this.toggleTheme());
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update icons
    if (theme === 'light') {
      this.moonIcon.style.display = 'none';
      this.sunIcon.style.display = 'block';
    } else {
      this.moonIcon.style.display = 'block';
      this.sunIcon.style.display = 'none';
    }
    
    this.currentTheme = theme;
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
  const matrixRain = new MatrixRain();
  const scrollAnimations = new ScrollAnimations();
  const mobileNav = new MobileNavigation();
  const smoothScrolling = new SmoothScrolling();
  const particleEffects = new ParticleEffects();
  const navbarEffect = new NavbarScrollEffect();

  // Add some interactive hover effects
  const projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) scale(1)';
    });
  });

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
  if (document.hidden) {
    matrixCanvas.style.animationPlayState = 'paused';
  } else {
    matrixCanvas.style.animationPlayState = 'running';
  }
});
