// ===== SPACE GAME =====

// Player class
class Player {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = 40;
    this.height = 30;
    this.x = canvas.width / 2 - this.width / 2;
    this.y = canvas.height - this.height - 30;
    this.speed = 2;
    this.lives = 3;
    this.shootCooldown = 0;
    this.shootDelay = 15;
    this.powerUps = {
      rapidFire: false,
      doubleShot: false,
      shield: false
    };
    this.invincible = false;
  }

  update(keys, touchX = 0, touchY = 0) {
    // Movement - keyboard or touch
    // For touch, use the normalized values directly; for keyboard, use -1/0/1
    const moveX = keys['ArrowLeft'] || keys['a'] || keys['A'] ? -1 : 
                  keys['ArrowRight'] || keys['d'] || keys['D'] ? 1 : touchX;
    const moveY = keys['ArrowUp'] || keys['w'] || keys['W'] ? -1 : 
                  keys['ArrowDown'] || keys['s'] || keys['S'] ? 1 : touchY;
    
    // Use slightly higher speed multiplier for touch to compensate for smaller movement range
    const speedMultiplier = (touchX !== 0 || touchY !== 0) ? 1.5 : 1;
    
    if (moveX !== 0) {
      this.x = Math.max(0, Math.min(this.canvas.width - this.width, this.x + moveX * this.speed * speedMultiplier));
    }
    if (moveY !== 0) {
      this.y = Math.max(0, Math.min(this.canvas.height - this.height, this.y + moveY * this.speed * speedMultiplier));
    }

    // Shooting cooldown
    if (this.shootCooldown > 0) {
      this.shootCooldown--;
    }

    // Shield no longer has a timer - it stays until hit
  }

  shoot() {
    if (this.shootCooldown <= 0) {
      const delay = this.powerUps.rapidFire ? 8 : this.shootDelay;
      this.shootCooldown = delay;
      
      const bullets = [];
      if (this.powerUps.doubleShot) {
        bullets.push(new Bullet(this.x + this.width / 2 - 5, this.y, -8, 'player'));
        bullets.push(new Bullet(this.x + this.width / 2 + 5, this.y, -8, 'player'));
      } else {
        bullets.push(new Bullet(this.x + this.width / 2, this.y, -8, 'player'));
      }
      return bullets;
    }
    return [];
  }

  takeDamage() {
    if (this.invincible) return false;
    
    // If player has shield, remove it instead of taking damage
    if (this.powerUps.shield) {
      this.powerUps.shield = false;
      this.invincible = true;
      setTimeout(() => {
        this.invincible = false;
      }, 2000);
      return false;
    }
    
    this.lives--;
    this.invincible = true;
    setTimeout(() => {
      this.invincible = false;
    }, 2000);
    return this.lives <= 0;
  }
  
  // Method to trigger damage visual effects (called from game when damage occurs)
  triggerDamageVisuals(game) {
    // Trigger damage flash
    game.damageFlash = 30; // Flash for 30 frames (~0.5 seconds at 60fps)
    
    // Trigger screen shake (more intense for better visibility)
    game.screenShake.intensity = 15;
    
    // Create damage particles at ship center
    const shipCenterX = this.x + this.width / 2;
    const shipCenterY = this.y + this.height / 2;
    
    // Create red/orange damage particles
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const speed = Math.random() * 3 + 2;
      const particle = new DamageParticle(
        shipCenterX,
        shipCenterY,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      );
      game.particles.push(particle);
    }
    
    // Create sparks
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 2;
      const spark = new SparkParticle(
        shipCenterX + (Math.random() - 0.5) * this.width,
        shipCenterY + (Math.random() - 0.5) * this.height,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      );
      game.particles.push(spark);
    }
  }

  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }

  draw(ctx) {
    ctx.save();
    
    // Shield effect
    if (this.powerUps.shield || this.invincible) {
      ctx.strokeStyle = '#87CEEB';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2 + 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#87CEEB';
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Rocket ship design
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    const rocketWidth = this.width * 0.6;
    const rocketHeight = this.height * 0.9;
    
    // Colors
    const rocketBodyColor = '#9da5a8'; // Metallic grey
    const rocketAccentColor = '#7a8a8f'; // Darker grey
    const rocketHighlightColor = '#b8c5c9'; // Lighter grey
    const cannonColor = '#5a6a6f'; // Dark grey for cannons
    
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#6a7a7f';
    
    // Exhaust jet (animated flames at the bottom)
    const exhaustY = this.y + this.height;
    const exhaustWidth = rocketWidth * 0.7;
    const time = Date.now() * 0.01; // For animation
    const flameVariation = Math.sin(time) * 2 + Math.cos(time * 1.5) * 1.5;
    
    // Outer flame (orange/yellow)
    ctx.fillStyle = '#ff8800';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff8800';
    ctx.beginPath();
    ctx.moveTo(centerX - exhaustWidth / 2, exhaustY);
    ctx.lineTo(centerX - exhaustWidth / 3, exhaustY + 8 + flameVariation);
    ctx.lineTo(centerX, exhaustY + 12 + flameVariation * 1.2);
    ctx.lineTo(centerX + exhaustWidth / 3, exhaustY + 8 + flameVariation);
    ctx.lineTo(centerX + exhaustWidth / 2, exhaustY);
    ctx.closePath();
    ctx.fill();
    
    // Inner flame (bright yellow/white)
    ctx.fillStyle = '#ffcc00';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ffcc00';
    ctx.beginPath();
    ctx.moveTo(centerX - exhaustWidth / 3, exhaustY);
    ctx.lineTo(centerX - exhaustWidth / 5, exhaustY + 6 + flameVariation * 0.8);
    ctx.lineTo(centerX, exhaustY + 9 + flameVariation);
    ctx.lineTo(centerX + exhaustWidth / 5, exhaustY + 6 + flameVariation * 0.8);
    ctx.lineTo(centerX + exhaustWidth / 3, exhaustY);
    ctx.closePath();
    ctx.fill();
    
    // Core flame (white hot)
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(centerX - exhaustWidth / 5, exhaustY);
    ctx.lineTo(centerX, exhaustY + 5 + flameVariation * 0.6);
    ctx.lineTo(centerX + exhaustWidth / 5, exhaustY);
    ctx.closePath();
    ctx.fill();
    
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#6a7a7f';
    
    // Main rocket body (pointed at top, wider at bottom)
    ctx.fillStyle = rocketBodyColor;
    ctx.beginPath();
    ctx.moveTo(centerX, this.y); // Top point
    ctx.lineTo(this.x + this.width * 0.3, this.y + rocketHeight * 0.4); // Left side top
    ctx.lineTo(this.x + this.width * 0.25, this.y + rocketHeight * 0.9); // Left side bottom
    ctx.lineTo(centerX, exhaustY - 2); // Bottom center
    ctx.lineTo(this.x + this.width * 0.75, this.y + rocketHeight * 0.9); // Right side bottom
    ctx.lineTo(this.x + this.width * 0.7, this.y + rocketHeight * 0.4); // Right side top
    ctx.closePath();
    ctx.fill();
    
    // Rocket body highlight (lighter section)
    ctx.fillStyle = rocketHighlightColor;
    ctx.beginPath();
    ctx.moveTo(centerX, this.y + rocketHeight * 0.1);
    ctx.lineTo(this.x + this.width * 0.35, this.y + rocketHeight * 0.5);
    ctx.lineTo(centerX, this.y + rocketHeight * 0.85);
    ctx.lineTo(this.x + this.width * 0.65, this.y + rocketHeight * 0.5);
    ctx.closePath();
    ctx.fill();
    
    // Cockpit window (near the top)
    ctx.fillStyle = '#4a5a5f';
    ctx.shadowBlur = 3;
    ctx.beginPath();
    ctx.arc(centerX, this.y + rocketHeight * 0.25, rocketWidth * 0.15, 0, Math.PI * 2);
    ctx.fill();
    
    // Cockpit window highlight
    ctx.fillStyle = '#6a8a9f';
    ctx.beginPath();
    ctx.arc(centerX, this.y + rocketHeight * 0.25, rocketWidth * 0.1, 0, Math.PI * 2);
    ctx.fill();
    
    // Panel lines on rocket body
    ctx.strokeStyle = rocketAccentColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX, this.y + rocketHeight * 0.3);
    ctx.lineTo(centerX, this.y + rocketHeight * 0.8);
    ctx.stroke();
    
    // Small wings on the sides
    const wingWidth = this.width * 0.15;
    const wingHeight = this.height * 0.25;
    const wingY = this.y + rocketHeight * 0.6;
    
    // Left wing
    ctx.fillStyle = rocketBodyColor;
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.moveTo(this.x + this.width * 0.25, wingY);
    ctx.lineTo(this.x + this.width * 0.1, wingY + wingHeight * 0.5);
    ctx.lineTo(this.x + this.width * 0.2, wingY + wingHeight);
    ctx.lineTo(this.x + this.width * 0.3, wingY + wingHeight * 0.7);
    ctx.closePath();
    ctx.fill();
    
    // Left wing detail
    ctx.strokeStyle = rocketAccentColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x + this.width * 0.25, wingY);
    ctx.lineTo(this.x + this.width * 0.2, wingY + wingHeight);
    ctx.stroke();
    
    // Right wing
    ctx.fillStyle = rocketBodyColor;
    ctx.beginPath();
    ctx.moveTo(this.x + this.width * 0.75, wingY);
    ctx.lineTo(this.x + this.width * 0.9, wingY + wingHeight * 0.5);
    ctx.lineTo(this.x + this.width * 0.8, wingY + wingHeight);
    ctx.lineTo(this.x + this.width * 0.7, wingY + wingHeight * 0.7);
    ctx.closePath();
    ctx.fill();
    
    // Right wing detail
    ctx.beginPath();
    ctx.moveTo(this.x + this.width * 0.75, wingY);
    ctx.lineTo(this.x + this.width * 0.8, wingY + wingHeight);
    ctx.stroke();
    
    // Cannons on the sides
    const cannonSize = 3;
    const cannonY = this.y + rocketHeight * 0.5;
    
    // Left cannon
    ctx.fillStyle = cannonColor;
    ctx.shadowBlur = 3;
    ctx.shadowColor = '#4a5a5f';
    ctx.beginPath();
    ctx.arc(this.x + this.width * 0.2, cannonY, cannonSize, 0, Math.PI * 2);
    ctx.fill();
    // Cannon barrel
    ctx.fillRect(this.x + this.width * 0.2 - cannonSize, cannonY - cannonSize / 2, cannonSize * 2, cannonSize);
    
    // Right cannon
    ctx.beginPath();
    ctx.arc(this.x + this.width * 0.8, cannonY, cannonSize, 0, Math.PI * 2);
    ctx.fill();
    // Cannon barrel
    ctx.fillRect(this.x + this.width * 0.8 - cannonSize, cannonY - cannonSize / 2, cannonSize * 2, cannonSize);
    
    // Front center cannon (smaller)
    ctx.beginPath();
    ctx.arc(centerX, this.y + rocketHeight * 0.7, cannonSize * 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(centerX - cannonSize * 0.7, this.y + rocketHeight * 0.7 - cannonSize * 0.35, cannonSize * 1.4, cannonSize * 0.7);

    ctx.restore();
  }

  reset() {
    this.x = this.canvas.width / 2 - this.width / 2;
    this.y = this.canvas.height - this.height - 30;
    this.lives = 3;
    this.powerUps = {
      rapidFire: false,
      doubleShot: false,
      shield: false
    };
    this.invincible = false;
  }
}

// Bullet class
class Bullet {
  constructor(x, y, speed, type) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.type = type; // 'player' or 'enemy'
    this.width = 4;
    this.height = 10;
    this.active = true;
  }

  update() {
    this.y += this.speed;
    
    // Remove if off screen
    if (this.y < -this.height || this.y > window.innerHeight) {
      this.active = false;
    }
  }

  draw(ctx) {
    ctx.save();
    if (this.type === 'player') {
      // Glowing red projectiles for player
      ctx.fillStyle = '#ff0000';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ff0000';
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // Draw glowing projectile
      ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
      
      // Add extra glow effect
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(this.x - this.width / 2 - 1, this.y - 1, this.width + 2, this.height + 2);
      ctx.globalAlpha = 1;
    } else {
      // Enemy bullets stay the same
      ctx.fillStyle = '#ff0064';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#ff0064';
      ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
    }
    ctx.restore();
  }

  getBounds() {
    return {
      x: this.x - this.width / 2,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }
}

// Enemy class
class Enemy {
  constructor(x, y, type = 'basic', speedMultiplier = 1) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.width = 30;
    this.height = 30;
    // Base speeds are slower, then multiplied by stage-based multiplier
    const baseSpeed = type === 'fast' ? 0.5 : 0.25;
    this.speed = baseSpeed * speedMultiplier;
    this.active = true;
    this.shootCooldown = 0;
    this.shootDelay = type === 'shooter' ? 120 : Infinity;
    this.zigzagOffset = 0;
    this.zigzagSpeed = 0.1;
    this.points = type === 'fast' ? 20 : type === 'shooter' ? 30 : 10;
  }

  update() {
    // Movement patterns
    if (this.type === 'fast') {
      this.y += this.speed;
      this.zigzagOffset += this.zigzagSpeed;
      this.x += Math.sin(this.zigzagOffset) * 2;
    } else {
      this.y += this.speed;
    }

    // Shooting
    if (this.type === 'shooter' && this.shootCooldown > 0) {
      this.shootCooldown--;
    }

    // Remove if off screen
    if (this.y > window.innerHeight + 50) {
      this.active = false;
    }
  }

  shoot() {
    if (this.type === 'shooter' && this.shootCooldown <= 0) {
      this.shootCooldown = this.shootDelay;
      return [new Bullet(this.x + this.width / 2, this.y + this.height, 4, 'enemy')];
    }
    return [];
  }

  draw(ctx) {
    ctx.save();
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    
    // Different ship designs for different enemy types
    if (this.type === 'fast') {
      // Sleek interceptor fighter - angular and fast-looking
      ctx.fillStyle = '#4a9eff'; // Blue fighter
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#4a9eff';
      
      // Main body (arrowhead shape)
      ctx.beginPath();
      ctx.moveTo(centerX, this.y); // Top point
      ctx.lineTo(this.x + this.width * 0.2, this.y + this.height * 0.6); // Left side
      ctx.lineTo(this.x + this.width * 0.3, this.y + this.height); // Left bottom
      ctx.lineTo(this.x + this.width * 0.7, this.y + this.height); // Right bottom
      ctx.lineTo(this.x + this.width * 0.8, this.y + this.height * 0.6); // Right side
      ctx.closePath();
      ctx.fill();
      
      // Side wings
      ctx.fillStyle = '#3a8eef';
      ctx.beginPath();
      ctx.moveTo(this.x + this.width * 0.15, this.y + this.height * 0.5);
      ctx.lineTo(this.x - this.width * 0.1, this.y + this.height * 0.7);
      ctx.lineTo(this.x + this.width * 0.2, this.y + this.height * 0.65);
      ctx.closePath();
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(this.x + this.width * 0.85, this.y + this.height * 0.5);
      ctx.lineTo(this.x + this.width * 1.1, this.y + this.height * 0.7);
      ctx.lineTo(this.x + this.width * 0.8, this.y + this.height * 0.65);
      ctx.closePath();
      ctx.fill();
      
      // Cockpit detail
      ctx.fillStyle = '#2a7edf';
      ctx.beginPath();
      ctx.arc(centerX, this.y + this.height * 0.3, 3, 0, Math.PI * 2);
      ctx.fill();
      
    } else if (this.type === 'shooter') {
      // Heavy gunship - larger, more menacing
      ctx.fillStyle = '#ff6b4a'; // Red-orange gunship
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ff6b4a';
      
      // Main hull (wider, more substantial)
      ctx.beginPath();
      ctx.moveTo(this.x + this.width * 0.2, this.y);
      ctx.lineTo(this.x + this.width * 0.8, this.y);
      ctx.lineTo(this.x + this.width, this.y + this.height * 0.3);
      ctx.lineTo(this.x + this.width, this.y + this.height * 0.7);
      ctx.lineTo(this.x + this.width * 0.8, this.y + this.height);
      ctx.lineTo(this.x + this.width * 0.2, this.y + this.height);
      ctx.lineTo(this.x, this.y + this.height * 0.7);
      ctx.lineTo(this.x, this.y + this.height * 0.3);
      ctx.closePath();
      ctx.fill();
      
      // Central weapon pod
      ctx.fillStyle = '#ff4a2a';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, this.width * 0.3, this.height * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Side weapon mounts
      ctx.fillStyle = '#ff4a2a';
      ctx.fillRect(this.x + this.width * 0.1, this.y + this.height * 0.4, 4, 6);
      ctx.fillRect(this.x + this.width * 0.9 - 4, this.y + this.height * 0.4, 4, 6);
      
      // Weapon barrels
      ctx.fillStyle = '#cc3a1a';
      ctx.fillRect(this.x + this.width * 0.1 - 2, this.y + this.height * 0.45, 2, 4);
      ctx.fillRect(this.x + this.width * 0.9, this.y + this.height * 0.45, 2, 4);
      ctx.fillRect(centerX - 1, this.y + this.height * 0.8, 2, 4);
      
      // Details
      ctx.strokeStyle = '#ff8a6a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(this.x + this.width * 0.3, this.y + this.height * 0.2);
      ctx.lineTo(this.x + this.width * 0.7, this.y + this.height * 0.2);
      ctx.stroke();
      
    } else {
      // Basic scout ship - simple but distinct
      ctx.fillStyle = '#00ff64'; // Green scout
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00ff64';
      
      // Main body (rounded triangle)
      ctx.beginPath();
      ctx.moveTo(centerX, this.y + this.height * 0.1); // Top
      ctx.quadraticCurveTo(this.x, this.y + this.height * 0.5, centerX, this.y + this.height * 0.9);
      ctx.quadraticCurveTo(this.x + this.width, this.y + this.height * 0.5, centerX, this.y + this.height * 0.1);
      ctx.closePath();
      ctx.fill();
      
      // Side fins
      ctx.fillStyle = '#00cc50';
      ctx.beginPath();
      ctx.moveTo(this.x + this.width * 0.15, this.y + this.height * 0.4);
      ctx.lineTo(this.x - this.width * 0.05, this.y + this.height * 0.5);
      ctx.lineTo(this.x + this.width * 0.2, this.y + this.height * 0.6);
      ctx.closePath();
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(this.x + this.width * 0.85, this.y + this.height * 0.4);
      ctx.lineTo(this.x + this.width * 1.05, this.y + this.height * 0.5);
      ctx.lineTo(this.x + this.width * 0.8, this.y + this.height * 0.6);
      ctx.closePath();
      ctx.fill();
      
      // Central detail
      ctx.fillStyle = '#00aa40';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Engine glow
      ctx.fillStyle = '#00ff88';
      ctx.globalAlpha = 0.6;
      ctx.fillRect(centerX - 2, this.y + this.height * 0.85, 4, 3);
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }
}

// PowerUp class
class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type; // 'rapidFire', 'doubleShot', 'shield', 'oneUp'
    this.width = 20;
    this.height = 20;
    this.speed = 2;
    this.active = true;
    this.rotation = 0;
  }

  update() {
    this.y += this.speed;
    this.rotation += 0.1;
    
    if (this.y > window.innerHeight + 50) {
      this.active = false;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(this.rotation);
    
    ctx.fillStyle = '#FFA500';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#FFA500';
    
    // Different shapes for different power-ups
    if (this.type === 'rapidFire') {
      // Lightning bolt shape
      ctx.beginPath();
      ctx.moveTo(-this.width / 2, -this.height / 2);
      ctx.lineTo(0, 0);
      ctx.lineTo(-this.width / 4, this.height / 2);
      ctx.lineTo(this.width / 4, -this.height / 2);
      ctx.lineTo(0, 0);
      ctx.lineTo(this.width / 2, this.height / 2);
      ctx.closePath();
      ctx.fill();
    } else if (this.type === 'doubleShot') {
      // Two circles
      ctx.beginPath();
      ctx.arc(-5, 0, 5, 0, Math.PI * 2);
      ctx.arc(5, 0, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'shield') {
      // Shield shape
      ctx.beginPath();
      ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
      ctx.strokeStyle = '#FFA500';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fill();
    } else if (this.type === 'oneUp') {
      // Plus sign for extra life (one-up)
      ctx.fillStyle = '#ff0064';
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#ff0064';
      // Draw a plus sign
      const barWidth = this.width / 4;
      const barLength = this.width * 0.7;
      // Vertical bar
      ctx.fillRect(-barWidth / 2, -barLength / 2, barWidth, barLength);
      // Horizontal bar
      ctx.fillRect(-barLength / 2, -barWidth / 2, barLength, barWidth);
      // Add outer glow
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#ff4488';
      ctx.fillRect(-barWidth / 2 - 1, -barLength / 2 - 1, barWidth + 2, barLength + 2);
      ctx.fillRect(-barLength / 2 - 1, -barWidth / 2 - 1, barLength + 2, barWidth + 2);
      ctx.globalAlpha = 1;
    }
    
    ctx.restore();
  }

  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }
}

// WaveManager class
class WaveManager {
  constructor() {
    this.currentStage = 0;
    this.maxStages = Infinity; // Unlimited stages
    this.enemiesPerStage = 3;
    this.enemiesSpawned = 0;
    this.spawnTimer = 0;
    this.spawnDelay = 90;
    this.maxEnemiesOnScreen = 8; // Cap to prevent screen overcrowding
    this.stageCompleted = false; // Flag to prevent multiple completion checks
  }

  startStage() {
    this.currentStage++;
    this.enemiesSpawned = 0;
    this.spawnTimer = 0;
    this.stageCompleted = false; // Reset completion flag for new stage
    
    // Gradually increase enemies per stage, but cap it
    // Stages 1-10: 6 enemies
    // Stages 11-20: 8 enemies
    // Stages 21-30: 10 enemies
    // Stages 31-40: 12 enemies
    // Stages 41-50: 14 enemies
    if (this.currentStage <= 10) {
      this.enemiesPerStage = 6;
    } else if (this.currentStage <= 20) {
      this.enemiesPerStage = 8;
    } else if (this.currentStage <= 30) {
      this.enemiesPerStage = 10;
    } else if (this.currentStage <= 40) {
      this.enemiesPerStage = 12;
    } else {
      this.enemiesPerStage = 14;
    }
    
    // Increase spawn delay to make stages last longer
    // Base delay is higher, and decreases more slowly as stages progress
    this.spawnDelay = Math.max(80, 120 - (this.currentStage - 1) * 1.5);
  }

  shouldSpawn(currentEnemyCount) {
    // Don't spawn if we've reached the cap for this stage or max on screen
    return this.enemiesSpawned < this.enemiesPerStage && 
           currentEnemyCount < this.maxEnemiesOnScreen &&
           this.spawnTimer <= 0;
  }

  spawnEnemy(canvas, currentEnemyCount) {
    if (this.shouldSpawn(currentEnemyCount)) {
      this.enemiesSpawned++;
      this.spawnTimer = this.spawnDelay;
      
      const x = Math.random() * (canvas.width - 30);
      const y = -30;
      
      // Determine enemy type based on stage progression
      let type = 'basic';
      const rand = Math.random();
      const stage = this.currentStage;
      
      if (stage <= 5) {
        // Stages 1-5: Only basic enemies
        type = 'basic';
      } else if (stage <= 15) {
        // Stages 6-15: Mix of basic and fast enemies
        if (rand < 0.35) {
          type = 'fast';
        } else {
          type = 'basic';
        }
      } else if (stage <= 30) {
        // Stages 16-30: All types, more balanced
        if (rand < 0.25) {
          type = 'fast';
        } else if (rand < 0.5) {
          type = 'shooter';
        } else {
          type = 'basic';
        }
      } else {
        // Stages 31-50: More challenging mix
        if (rand < 0.3) {
          type = 'fast';
        } else if (rand < 0.6) {
          type = 'shooter';
        } else {
          type = 'basic';
        }
      }
      
      // Calculate speed multiplier: increases every 5 stages, capped at 2.0
      // Stage 1-5: multiplier 1.0
      // Stage 6-10: multiplier 1.1
      // Stage 11-15: multiplier 1.2
      // Stage 16-20: multiplier 1.3
      // ... continues up to stage 46-50: multiplier 2.0
      const speedMultiplier = Math.min(1.0 + (Math.floor((this.currentStage - 1) / 5) * 0.1), 2.0);
      
      return new Enemy(x, y, type, speedMultiplier);
    }
    return null;
  }

  update() {
    if (this.spawnTimer > 0) {
      this.spawnTimer--;
    }
  }

  isStageComplete(enemies) {
    // Stage is complete only if:
    // 1. No enemies on screen
    // 2. We've spawned at least the required number of enemies for this stage
    // 3. We've actually started a stage (currentStage > 0)
    return this.currentStage > 0 && 
           enemies.length === 0 && 
           this.enemiesSpawned >= this.enemiesPerStage &&
           this.enemiesPerStage > 0;
  }

  isGameComplete() {
    return false; // Game never completes - unlimited stages
  }
}

// Particle class for effects
class Particle {
  constructor(x, y, color = '#00ff64') {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;
    this.life = 30;
    this.maxLife = 30;
    this.color = color;
    this.size = Math.random() * 3 + 2;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
  }

  draw(ctx) {
    ctx.save();
    const alpha = this.life / this.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 5;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  isDead() {
    return this.life <= 0;
  }
}

// Fire particle for explosions
class FireParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    // More circular/round distribution - random angle in full circle, but upward bias
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 2 + 1.5; // Smaller, slower particles
    this.vx = Math.cos(angle) * speed * 0.6; // Reduced horizontal spread
    this.vy = Math.sin(angle) * speed - 0.5; // Slight upward bias
    this.life = 35;
    this.maxLife = 35;
    this.size = Math.random() * 2.5 + 2; // Smaller particles
    // Fire colors transition from white/yellow to orange to red
    this.colorPhase = Math.random();
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    // Slow down over time
    this.vx *= 0.97;
    this.vy *= 0.97;
    this.life--;
    // Fire grows then shrinks (less dramatic)
    if (this.life > this.maxLife * 0.5) {
      this.size += 0.15;
    } else {
      this.size -= 0.25;
    }
  }

  draw(ctx) {
    ctx.save();
    const alpha = this.life / this.maxLife;
    const lifeRatio = 1 - (this.life / this.maxLife);
    
    // Color transitions: white -> yellow -> orange -> red -> dark red
    let color;
    if (lifeRatio < 0.2) {
      // White to yellow
      const t = lifeRatio / 0.2;
      color = `rgb(255, ${255 - t * 100}, ${255 - t * 200})`;
    } else if (lifeRatio < 0.5) {
      // Yellow to orange
      const t = (lifeRatio - 0.2) / 0.3;
      color = `rgb(255, ${155 - t * 55}, ${155 - t * 155})`;
    } else if (lifeRatio < 0.8) {
      // Orange to red
      const t = (lifeRatio - 0.5) / 0.3;
      color = `rgb(255, ${100 - t * 100}, 0)`;
    } else {
      // Red to dark red
      const t = (lifeRatio - 0.8) / 0.2;
      color = `rgb(${255 - t * 155}, ${0}, 0)`;
    }
    
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.shadowBlur = this.size * 2;
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  isDead() {
    return this.life <= 0 || this.size <= 0;
  }
}

// Debris particle for breaking parts
class DebrisParticle {
  constructor(x, y, color = '#9da5a8') {
    this.x = x;
    this.y = y;
    // Debris flies in all directions
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 4 + 1.5; // Slower, smaller spread
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.3;
    this.life = 45;
    this.maxLife = 45;
    this.size = Math.random() * 2.5 + 1.5; // Smaller debris
    this.color = color;
    this.shape = Math.random() < 0.5 ? 'rect' : 'circle'; // Random shape
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotationSpeed;
    // Gravity effect
    this.vy += 0.15;
    // Friction
    this.vx *= 0.98;
    this.vy *= 0.98;
    this.life--;
  }

  draw(ctx) {
    ctx.save();
    const alpha = this.life / this.maxLife;
    ctx.globalAlpha = alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 3;
    ctx.shadowColor = this.color;
    
    if (this.shape === 'rect') {
      // Rectangular debris piece
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    } else {
      // Circular debris piece
      ctx.beginPath();
      ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }

  isDead() {
    return this.life <= 0;
  }
}

// Damage particle for player damage visualization
class DamageParticle {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = 20;
    this.maxLife = 20;
    this.size = Math.random() * 3 + 2;
    this.color = '#ff4444'; // Red damage color
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.95; // Slow down
    this.vy *= 0.95;
    this.life--;
  }

  draw(ctx) {
    ctx.save();
    const alpha = this.life / this.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  isDead() {
    return this.life <= 0;
  }
}

// Spark particle for damage effect
class SparkParticle {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = 15;
    this.maxLife = 15;
    this.size = Math.random() * 2 + 1;
    // Yellow/white spark color
    this.color = Math.random() < 0.5 ? '#ffff00' : '#ffffff';
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.92;
    this.vy *= 0.92;
    this.life--;
  }

  draw(ctx) {
    ctx.save();
    const alpha = this.life / this.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 6;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  isDead() {
    return this.life <= 0;
  }
}

// Smoke particle for explosions
class SmokeParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    // Smoke rises upward with slight random spread
    const angle = (Math.random() - 0.5) * Math.PI * 0.4; // -20 to 20 degrees
    const speed = Math.random() * 1.5 + 1;
    this.vx = Math.sin(angle) * speed * 0.5;
    this.vy = -Math.abs(Math.cos(angle) * speed) - 0.8; // Strong upward movement
    this.life = 60;
    this.maxLife = 60;
    this.size = Math.random() * 3 + 4; // Larger than fire particles
    this.maxSize = this.size * 1.5; // Smoke expands as it rises
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    // Slow down over time
    this.vx *= 0.95;
    this.vy *= 0.96;
    this.life--;
    // Smoke expands as it rises
    if (this.size < this.maxSize) {
      this.size += 0.2;
    }
  }

  draw(ctx) {
    ctx.save();
    const alpha = Math.min(this.life / this.maxLife, 0.6); // Smoke is semi-transparent
    ctx.globalAlpha = alpha;
    
    // Smoke color transitions from dark grey to lighter grey
    const lifeRatio = 1 - (this.life / this.maxLife);
    const greyValue = Math.floor(40 + lifeRatio * 60); // 40 to 100
    const color = `rgb(${greyValue}, ${greyValue}, ${greyValue})`;
    
    ctx.fillStyle = color;
    ctx.shadowBlur = this.size * 1.5;
    ctx.shadowColor = `rgba(${greyValue}, ${greyValue}, ${greyValue}, 0.5)`;
    
    // Draw smoke as a soft circle
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Add a second layer for more depth
    ctx.globalAlpha = alpha * 0.5;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 0.7, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }

  isDead() {
    return this.life <= 0;
  }
}

// Star class for starfield background
class Star {
  constructor(canvas) {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speed = Math.random() * 0.5 + 0.2;
    this.brightness = Math.random() * 0.5 + 0.5;
    this.canvas = canvas;
  }

  update() {
    this.y += this.speed;
    // Reset star to top when it goes off screen
    if (this.y > this.canvas.height) {
      this.y = 0;
      this.x = Math.random() * this.canvas.width;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = `rgba(255, 255, 255, ${this.brightness})`;
    ctx.shadowBlur = this.size * 2;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Main Game class
class SpaceGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = 'menu'; // menu, playing, paused, gameover, victory
    
    this.player = new Player(canvas);
    this.enemies = [];
    this.bullets = [];
    this.enemyBullets = [];
    this.powerUps = [];
    this.particles = [];
    this.waveManager = new WaveManager();
    
    // Initialize starfield
    this.stars = [];
    const starCount = 100;
    for (let i = 0; i < starCount; i++) {
      this.stars.push(new Star(canvas));
    }
    
    this.score = 0;
    this.bestScore = 0;
    try { this.bestScore = Number(localStorage.getItem('space-game-best')) || 0; } catch {}
    this.keys = {};
    this.lastShot = false;
    this.oneUpTimer = 0;
    this.oneUpSpawnInterval = 10800; // Spawn one-up every ~180 seconds (3 minutes) at 60fps
    this.damageFlash = 0; // Track damage flash effect (0-30 frames)
    this.screenShake = { x: 0, y: 0, intensity: 0 }; // Screen shake effect
    
    // Start button position and dimensions (for canvas click detection)
    this.startButton = {
      x: 0,
      y: 0,
      width: 200,
      height: 50
    };
    
    document.getElementById('start-game')?.addEventListener('click', () => this.state === 'menu' ? this.start() : this.restart());
    document.getElementById('pause-game')?.addEventListener('click', () => {
      if (this.state === 'playing') this.state = 'paused';
      else if (this.state === 'paused') this.state = 'playing';
    });
    const releaseControls = () => {
      this.keys = {};
      this.isTouching = false;
      this.touchX = this.touchY = 0;
      if (this.state === 'playing') this.state = 'paused';
    };
    window.addEventListener('blur', releaseControls);
    document.addEventListener('visibilitychange', () => { if (document.hidden) releaseControls(); });
    this.setupEventListeners();
    this.setupFullscreen();
    this.setupExitButton();
    this.setupMobileControls();
    this.setupCanvasClick();
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  setupCanvasClick() {
    // Handle clicks and touches on canvas for start button
    const handleStartButton = (e) => {
      if (this.state === 'menu') {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        let x, y;
        
        // Get coordinates from click or touch event
        if (e.type === 'touchstart' || e.type === 'touchend') {
          const touch = e.touches && e.touches.length > 0 ? e.touches[0] : 
                       e.changedTouches && e.changedTouches.length > 0 ? e.changedTouches[0] : null;
          if (!touch) return false;
          // Convert screen coordinates to canvas coordinates
          x = (touch.clientX - rect.left) * scaleX;
          y = (touch.clientY - rect.top) * scaleY;
        } else {
          // Convert screen coordinates to canvas coordinates
          x = (e.clientX - rect.left) * scaleX;
          y = (e.clientY - rect.top) * scaleY;
        }
        
        // Check if click/touch is on start button
        // Button coordinates are set in drawMenu() in canvas coordinates
        if (this.startButton.width > 0 && this.startButton.height > 0) {
          if (x >= this.startButton.x && x <= this.startButton.x + this.startButton.width &&
              y >= this.startButton.y && y <= this.startButton.y + this.startButton.height) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            this.start();
            return true;
          }
        }
      }
      return false;
    };

    // Add click handler
    this.canvas.addEventListener('click', handleStartButton, { capture: true });

    // Add touch handlers (use capture phase to run before other handlers)
    this.canvas.addEventListener('touchstart', handleStartButton, { passive: false, capture: true });
    this.canvas.addEventListener('touchend', handleStartButton, { passive: false, capture: true });
  }

  setupExitButton() {
    const exitBtn = document.getElementById('exit-btn');
    if (!exitBtn) return;

    exitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.exitGame();
    });
  }


  setupMobileControls() {
    // Touch movement tracking
    this.touchX = 0;
    this.touchY = 0;
    this.isTouching = false;
    this.movementArea = document.getElementById('movement-area');
    this.joystick = document.getElementById('joystick');
    this.shootButton = document.getElementById('mobile-shoot-btn');
    this.mobileControls = document.getElementById('mobile-controls');
    
    // Enhanced mobile device detection
    const isTouchDevice = this.isMobileDevice();
    
    if (this.mobileControls) {
      // Always start hidden - visibility will be controlled by updateMobileControlsVisibility()
      this.mobileControls.style.display = 'none';
      this.mobileControls.style.visibility = 'hidden';
      // Set up initial visibility based on state
      if (isTouchDevice) {
        this.updateMobileControlsVisibility();
      }
    }

    if (!this.movementArea || !this.joystick) return;

    // Movement area touch handlers
    const handleTouchStart = (e) => {
      if (this.state !== 'playing' && this.state !== 'paused') return;
      e.preventDefault();
      e.stopPropagation();
      this.isTouching = true;
      const rect = this.movementArea.getBoundingClientRect();
      const touch = e.touches[0] || e.changedTouches[0];
      this.updateTouchPosition(touch.clientX - rect.left, touch.clientY - rect.top, rect);
    };

    const handleTouchMove = (e) => {
      if (!this.isTouching || (this.state !== 'playing' && this.state !== 'paused')) return;
      e.preventDefault();
      e.stopPropagation();
      const rect = this.movementArea.getBoundingClientRect();
      const touch = e.touches[0] || e.changedTouches[0];
      this.updateTouchPosition(touch.clientX - rect.left, touch.clientY - rect.top, rect);
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.isTouching = false;
      this.touchX = 0;
      this.touchY = 0;
      if (this.joystick) {
        this.joystick.style.transform = 'translate(-50%, -50%)';
      }
    };

    this.movementArea.addEventListener('touchstart', handleTouchStart, { passive: false });
    this.movementArea.addEventListener('touchmove', handleTouchMove, { passive: false });
    this.movementArea.addEventListener('touchend', handleTouchEnd, { passive: false });
    this.movementArea.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    // Mouse support for testing on desktop (only if touch device)
    if (isTouchDevice) {
      this.movementArea.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.isTouching = true;
        const rect = this.movementArea.getBoundingClientRect();
        this.updateTouchPosition(e.clientX - rect.left, e.clientY - rect.top, rect);
      });

      document.addEventListener('mousemove', (e) => {
        if (!this.isTouching) return;
        e.preventDefault();
        const rect = this.movementArea.getBoundingClientRect();
        this.updateTouchPosition(e.clientX - rect.left, e.clientY - rect.top, rect);
      });

      document.addEventListener('mouseup', () => {
        this.isTouching = false;
        this.touchX = 0;
        this.touchY = 0;
        if (this.joystick) {
          this.joystick.style.transform = 'translate(-50%, -50%)';
        }
      });
    }

    // Shoot button
    if (this.shootButton) {
      this.shootButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (this.state === 'playing') {
          const newBullets = this.player.shoot();
          this.bullets.push(...newBullets);
        }
      }, { passive: false });

      this.shootButton.addEventListener('mousedown', (e) => {
        e.preventDefault();
        if (this.state === 'playing') {
          const newBullets = this.player.shoot();
          this.bullets.push(...newBullets);
        }
      });

      // Auto-shoot while holding
      let shootInterval = null;
      const startShooting = () => {
        if (this.state === 'playing') {
          const shoot = () => {
            if (this.state === 'playing') {
              const newBullets = this.player.shoot();
              this.bullets.push(...newBullets);
            }
          };
          shoot(); // Shoot immediately
          shootInterval = setInterval(shoot, 100); // Then shoot every 100ms
        }
      };
      const stopShooting = () => {
        if (shootInterval) {
          clearInterval(shootInterval);
          shootInterval = null;
        }
      };

      this.shootButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        startShooting();
      }, { passive: false });
      this.shootButton.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        stopShooting();
      });
      this.shootButton.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        e.stopPropagation();
        stopShooting();
      });
      this.shootButton.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        startShooting();
      });
      this.shootButton.addEventListener('mouseup', (e) => {
        e.preventDefault();
        e.stopPropagation();
        stopShooting();
      });
      this.shootButton.addEventListener('mouseleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        stopShooting();
      });
    }

    // Prevent scrolling/zooming on canvas during gameplay (mobile only)
    if (isTouchDevice) {
      this.canvas.addEventListener('touchstart', (e) => {
        // Don't prevent if touching mobile controls
        const target = e.target;
        if (target === this.movementArea || target === this.joystick || target === this.shootButton || 
            this.movementArea.contains(target) || this.shootButton.contains(target)) {
          return;
        }
        // Don't prevent if on menu screen (start button needs to work)
        if (this.state === 'menu') {
          return;
        }
        if (this.state === 'playing' || this.state === 'paused') {
          e.preventDefault();
        }
      }, { passive: false });

      this.canvas.addEventListener('touchmove', (e) => {
        // Don't prevent if touching mobile controls
        const target = e.target;
        if (target === this.movementArea || target === this.joystick || target === this.shootButton || 
            this.movementArea.contains(target) || this.shootButton.contains(target)) {
          return;
        }
        if (this.state === 'playing' || this.state === 'paused') {
          e.preventDefault();
        }
      }, { passive: false });

      // Prevent context menu on long press
      this.canvas.addEventListener('contextmenu', (e) => {
        if (this.state === 'playing' || this.state === 'paused') {
          e.preventDefault();
        }
      });

      // Prevent double-tap zoom on mobile
      let lastTouchEnd = 0;
      this.canvas.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
          e.preventDefault();
        }
        lastTouchEnd = now;
      }, false);
    }
  }

  updateTouchPosition(x, y, rect) {
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate distance from center
    const deltaX = x - centerX;
    const deltaY = y - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = Math.min(centerX, centerY) - 25; // Leave some margin for better feel
    
    // Normalize to -1 to 1 range
    if (distance > maxDistance) {
      // Clamp to max distance (joystick stays within bounds)
      this.touchX = (deltaX / distance) * maxDistance / centerX;
      this.touchY = (deltaY / distance) * maxDistance / centerY;
      
      // Update joystick visual position (clamped)
      const joystickX = (deltaX / distance) * maxDistance;
      const joystickY = (deltaY / distance) * maxDistance;
      if (this.joystick) {
        this.joystick.style.transform = `translate(calc(-50% + ${joystickX}px), calc(-50% + ${joystickY}px))`;
      }
    } else {
      // Within bounds - free movement
      this.touchX = deltaX / centerX;
      this.touchY = deltaY / centerY;
      
      // Update joystick visual position
      if (this.joystick) {
        this.joystick.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;
      }
    }
  }

  exitGame() {
    // Stop the game and return to menu
    if (this.state === 'playing' || this.state === 'paused') {
      // Reset game state
      this.player.reset();
      this.enemies = [];
      this.bullets = [];
      this.enemyBullets = [];
      this.powerUps = [];
      this.particles = [];
      this.waveManager = new WaveManager();
      this.score = 0;
      this.oneUpTimer = 0;
      this.lastShot = false;
      this.keys = {};
      this.damageFlash = 0;
      this.screenShake = { x: 0, y: 0, intensity: 0 };
      // Reset stars
      this.stars = [];
      const starCount = 100;
      for (let i = 0; i < starCount; i++) {
        this.stars.push(new Star(this.canvas));
      }
      
      // Return to menu
      this.state = 'menu';
      
      // Hide mobile controls when returning to menu
      this.updateMobileControlsVisibility();
      
      // Exit fullscreen if active
      const isFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      
      if (isFullscreen) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    }
  }

  setupFullscreen() {
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const fullscreenIcon = fullscreenBtn?.querySelector('.fullscreen-icon');
    const fullscreenExitIcon = fullscreenBtn?.querySelector('.fullscreen-exit-icon');
    
    if (!fullscreenBtn) return;

    // Check if currently in fullscreen mode
    const isFullscreenActive = () => {
      const container = this.canvas.parentElement;
      return !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement ||
        (container && (
          container === document.fullscreenElement ||
          container === document.webkitFullscreenElement ||
          container === document.mozFullScreenElement ||
          container === document.msFullscreenElement
        ))
      );
    };

    const enterFullscreen = async () => {
      const container = this.canvas.parentElement;
      
      if (!container) {
        console.error('Canvas container not found');
        return;
      }
      
      try {
        if (container.requestFullscreen) {
          await container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
          await container.webkitRequestFullscreen();
        } else if (container.mozRequestFullScreen) {
          await container.mozRequestFullScreen();
        } else if (container.msRequestFullscreen) {
          await container.msRequestFullscreen();
        } else {
          console.warn('Fullscreen API not supported in this browser');
          alert('Fullscreen is not supported in your browser. Please try a modern browser like Chrome, Firefox, or Edge.');
        }
      } catch (error) {
        console.error('Error entering fullscreen:', error);
        // Some browsers require fullscreen to be triggered by user interaction
        // If it fails, try requesting fullscreen on the canvas directly
        try {
          if (this.canvas.requestFullscreen) {
            await this.canvas.requestFullscreen();
          } else if (this.canvas.webkitRequestFullscreen) {
            await this.canvas.webkitRequestFullscreen();
          } else if (this.canvas.mozRequestFullScreen) {
            await this.canvas.mozRequestFullScreen();
          } else if (this.canvas.msRequestFullscreen) {
            await this.canvas.msRequestFullscreen();
          }
        } catch (err) {
          console.error('Error entering fullscreen on canvas:', err);
        }
      }
    };

    const exitFullscreen = async () => {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          await document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
      } catch (error) {
        console.error('Error exiting fullscreen:', error);
      }
    };

    const toggleFullscreen = async () => {
      if (isFullscreenActive()) {
        await exitFullscreen();
      } else {
        await enterFullscreen();
      }
    };

    // Update button icon based on fullscreen state
    const updateFullscreenIcon = () => {
      const isFullscreen = isFullscreenActive();
      if (isFullscreen) {
        if (fullscreenIcon) fullscreenIcon.style.display = 'none';
        if (fullscreenExitIcon) fullscreenExitIcon.style.display = 'block';
      } else {
        if (fullscreenIcon) fullscreenIcon.style.display = 'block';
        if (fullscreenExitIcon) fullscreenExitIcon.style.display = 'none';
      }
      // Resize canvas when fullscreen changes
      setTimeout(() => this.resizeCanvas(), 100);
    };

    // Initial icon state
    updateFullscreenIcon();

    // Button click handler
    fullscreenBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      toggleFullscreen().catch(err => {
        console.error('Fullscreen toggle failed:', err);
      });
    });

    // Listen for fullscreen changes
    document.addEventListener('fullscreenchange', updateFullscreenIcon);
    document.addEventListener('webkitfullscreenchange', updateFullscreenIcon);
    document.addEventListener('mozfullscreenchange', updateFullscreenIcon);
    document.addEventListener('MSFullscreenChange', updateFullscreenIcon);

    // Keyboard shortcut (F key for fullscreen)
    document.addEventListener('keydown', (e) => {
      if (document.activeElement !== this.canvas) return;
      if (e.repeat && ['p', 'P', 'r', 'R', 'f', 'F'].includes(e.key)) return;
      if ((e.key === 'f' || e.key === 'F') && (this.state === 'playing' || this.state === 'paused' || this.state === 'menu')) {
        e.preventDefault();
        toggleFullscreen();
      }
    });
  }

  resizeCanvas() {
    const container = this.canvas.parentElement;
    const isFullscreen = !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement ||
      (container && (
        container === document.fullscreenElement ||
        container === document.webkitFullscreenElement ||
        container === document.mozFullScreenElement ||
        container === document.msFullscreenElement
      ))
    );

    if (isFullscreen) {
      // In fullscreen, use the full viewport
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    } else {
      // Normal mode: maintain aspect ratio with max width
      const maxWidth = Math.max(240, Math.min(800, container.clientWidth));
      this.canvas.width = maxWidth;
      this.canvas.height = 600;
    }
    
    // Update stars for new canvas size
    if (this.stars) {
      this.stars.forEach(star => {
        star.canvas = this.canvas;
        // Redistribute stars if canvas size changed significantly
        if (star.x > this.canvas.width) star.x = Math.random() * this.canvas.width;
        if (star.y > this.canvas.height) star.y = Math.random() * this.canvas.height;
      });
    }
    
    if (this.player) {
      this.player.canvas = this.canvas;
      // Ensure player stays within bounds
      this.player.x = Math.max(0, Math.min(this.player.x, this.canvas.width - this.player.width));
      this.player.y = Math.max(0, Math.min(this.player.y, this.canvas.height - this.player.height));
    }
    
  }

  setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      if (document.activeElement !== this.canvas) return;
      if (e.repeat && ['p', 'P', 'r', 'R', 'f', 'F'].includes(e.key)) return;
      
      // Prevent default behavior for game controls to avoid page scrolling
      // Only prevent when game is active (playing, paused, or menu states)
      const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'W', 'a', 'A', 's', 'S', 'd', 'D'];
      if (document.activeElement === this.canvas && gameKeys.includes(e.key) && (this.state === 'playing' || this.state === 'paused' || this.state === 'menu')) {
        e.preventDefault();
      }
      
      this.keys[e.key] = true;
      
      if (e.key === ' ' && this.state === 'playing') {
        const newBullets = this.player.shoot();
        this.bullets.push(...newBullets);
      }
      
      if (e.key === 'p' || e.key === 'P') {
        if (this.state === 'playing') {
          this.state = 'paused';
        } else if (this.state === 'paused') {
          this.state = 'playing';
        }
      }
      
      if (e.key === 'r' || e.key === 'R') {
        // Allow restart from any state except menu (menu uses spacebar to start)
        if (this.state !== 'menu') {
          e.preventDefault();
          this.restart();
        }
      }
    });

    document.addEventListener('keyup', (e) => {
      // Release keys even if focus has moved outside the canvas.
      const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'W', 'a', 'A', 's', 'S', 'd', 'D'];
      if (document.activeElement === this.canvas && gameKeys.includes(e.key) && (this.state === 'playing' || this.state === 'paused' || this.state === 'menu')) {
        e.preventDefault();
      }
      
      this.keys[e.key] = false;
    });
  }

  start() {
    this.state = 'playing';
    this.waveManager.startStage();
    // Update mobile controls visibility when game starts
    this.updateMobileControlsVisibility();
    // Focus the canvas to ensure keyboard events are captured
    this.canvas.focus();
  }

  restart() {
    this.player.reset();
    this.enemies = [];
    this.bullets = [];
    this.enemyBullets = [];
    this.powerUps = [];
      this.particles = [];
      this.waveManager = new WaveManager();
      this.score = 0;
      this.oneUpTimer = 0;
      this.lastShot = false;
      this.keys = {}; // Reset all keys
      this.damageFlash = 0;
      this.screenShake = { x: 0, y: 0, intensity: 0 };
      // Reset stars
      this.stars = [];
      const starCount = 100;
      for (let i = 0; i < starCount; i++) {
        this.stars.push(new Star(this.canvas));
      }
    
    this.state = 'playing';
    this.waveManager.startStage();
    // Update mobile controls visibility when game restarts
    this.updateMobileControlsVisibility();
    // Focus canvas to ensure keyboard events work
    this.canvas.focus();
  }

  update() {
    // Always update stars for continuous animation
    this.stars.forEach(star => star.update());
    
    if (this.state !== 'playing') return;

    // Update damage flash effect
    if (this.damageFlash > 0) {
      this.damageFlash--;
    }
    
    // Update screen shake
    if (this.screenShake.intensity > 0) {
      // Generate random shake offset based on intensity
      this.screenShake.x = (Math.random() - 0.5) * this.screenShake.intensity;
      this.screenShake.y = (Math.random() - 0.5) * this.screenShake.intensity;
      // Decay shake intensity gradually
      this.screenShake.intensity *= 0.88; // Slightly slower decay for more noticeable effect
      if (this.screenShake.intensity < 0.5) {
        this.screenShake.intensity = 0;
        this.screenShake.x = 0;
        this.screenShake.y = 0;
      }
    }

    // Update player with keyboard and touch controls
    this.player.update(this.keys, this.touchX || 0, this.touchY || 0);

    // Spawn enemies (check current count to prevent overcrowding)
    const newEnemy = this.waveManager.spawnEnemy(this.canvas, this.enemies.length);
    if (newEnemy) {
      this.enemies.push(newEnemy);
    }
    this.waveManager.update();

    // Check for stage completion (only process once per stage)
    if (this.waveManager.isStageComplete(this.enemies) && !this.waveManager.stageCompleted) {
      this.waveManager.stageCompleted = true; // Mark this stage as processed
      
      // Continue to next stage (unlimited stages)
      if (this.waveManager.currentStage > 0) {
        this.score += 100 * this.waveManager.currentStage;
        setTimeout(() => {
          // Start next stage (startStage will increment currentStage)
          this.waveManager.startStage();
        }, 2000);
      }
    }

    // Update enemies
    this.enemies.forEach(enemy => {
      enemy.update();
      const enemyBullets = enemy.shoot();
      this.enemyBullets.push(...enemyBullets);
    });
    this.enemies = this.enemies.filter(e => e.active);

    // Update bullets
    this.bullets.forEach(bullet => bullet.update());
    this.bullets = this.bullets.filter(b => b.active);

    // Update enemy bullets
    this.enemyBullets.forEach(bullet => bullet.update());
    this.enemyBullets = this.enemyBullets.filter(b => b.active);

    // Update power-ups
    this.powerUps.forEach(powerUp => powerUp.update());
    this.powerUps = this.powerUps.filter(p => p.active);

    // Spawn one-up periodically
    this.oneUpTimer++;
    if (this.oneUpTimer >= this.oneUpSpawnInterval) {
      this.oneUpTimer = 0;
      // Spawn one-up at random x position from top of screen
      const x = Math.random() * (this.canvas.width - 20);
      this.powerUps.push(new PowerUp(x, -20, 'oneUp'));
    }

    // Update particles
    this.particles.forEach(particle => particle.update());
    this.particles = this.particles.filter(p => !p.isDead());

    // Collision detection: player bullets vs enemies
    this.bullets.forEach((bullet, bi) => {
      this.enemies.forEach((enemy, ei) => {
        if (this.checkCollision(bullet.getBounds(), enemy.getBounds())) {
          bullet.active = false;
          enemy.active = false;
          this.score += enemy.points;
          
          // Create realistic explosion with fire, debris, and smoke
          const explosionX = enemy.x + enemy.width / 2;
          const explosionY = enemy.y + enemy.height / 2;
          
          // Create fire particles (smaller, more round explosion - 4-6 particles)
          const fireCount = Math.floor(Math.random() * 3) + 4;
          for (let i = 0; i < fireCount; i++) {
            this.particles.push(new FireParticle(explosionX, explosionY));
          }
          
          // Create debris particles (fewer particles - 3-5 particles)
          const debrisCount = Math.floor(Math.random() * 3) + 3;
          const debrisColors = ['#9da5a8', '#7a8a8f', '#b8c5c9', '#5a6a6f', '#4a5a5f'];
          for (let i = 0; i < debrisCount; i++) {
            const color = debrisColors[Math.floor(Math.random() * debrisColors.length)];
            this.particles.push(new DebrisParticle(explosionX, explosionY, color));
          }
          
          // Create smoke particles (3-5 particles)
          const smokeCount = Math.floor(Math.random() * 3) + 3;
          for (let i = 0; i < smokeCount; i++) {
            this.particles.push(new SmokeParticle(explosionX, explosionY));
          }
          
          // Chance to spawn power-up
          if (Math.random() < 0.15) {
            const types = ['rapidFire', 'doubleShot', 'shield'];
            const type = types[Math.floor(Math.random() * types.length)];
            this.powerUps.push(new PowerUp(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, type));
          }
        }
      });
    });

    // Collision detection: enemy bullets vs player
    this.enemyBullets.forEach((bullet, bi) => {
      if (this.checkCollision(bullet.getBounds(), this.player.getBounds())) {
        bullet.active = false;
        const wasInvincible = this.player.invincible;
        const isDead = this.player.takeDamage();
        // Only trigger visuals if damage was actually taken (not blocked by invincibility)
        if (!wasInvincible) {
          this.player.triggerDamageVisuals(this);
        }
        if (isDead) {
          this.state = 'gameover';
        }
      }
    });

    // Collision detection: enemies vs player
    this.enemies.forEach(enemy => {
      if (this.checkCollision(enemy.getBounds(), this.player.getBounds())) {
        enemy.active = false;
        
        // Create explosion when enemy hits player
        const explosionX = enemy.x + enemy.width / 2;
        const explosionY = enemy.y + enemy.height / 2;
        
        // Create fire particles (smaller, more round explosion - 4-6 particles)
        const fireCount = Math.floor(Math.random() * 3) + 4;
        for (let i = 0; i < fireCount; i++) {
          this.particles.push(new FireParticle(explosionX, explosionY));
        }
        
        // Create debris particles (fewer particles - 3-5 particles)
        const debrisCount = Math.floor(Math.random() * 3) + 3;
        const debrisColors = ['#9da5a8', '#7a8a8f', '#b8c5c9', '#5a6a6f', '#4a5a5f'];
        for (let i = 0; i < debrisCount; i++) {
          const color = debrisColors[Math.floor(Math.random() * debrisColors.length)];
          this.particles.push(new DebrisParticle(explosionX, explosionY, color));
        }
        
        // Create smoke particles (3-5 particles)
        const smokeCount = Math.floor(Math.random() * 3) + 3;
        for (let i = 0; i < smokeCount; i++) {
          this.particles.push(new SmokeParticle(explosionX, explosionY));
        }
        
        const wasInvincible = this.player.invincible;
        const isDead = this.player.takeDamage();
        // Only trigger visuals if damage was actually taken (not blocked by invincibility)
        if (!wasInvincible) {
          this.player.triggerDamageVisuals(this);
        }
        if (isDead) {
          this.state = 'gameover';
        }
      }
    });

    // Collision detection: player vs power-ups
    this.powerUps.forEach((powerUp, pi) => {
      if (this.checkCollision(powerUp.getBounds(), this.player.getBounds())) {
        powerUp.active = false;
        this.applyPowerUp(powerUp.type);
        
        // Collection particles
        for (let i = 0; i < 5; i++) {
          this.particles.push(new Particle(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2, '#FFA500'));
        }
      }
    });
  }

  checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }


  applyPowerUp(type) {
    if (type === 'rapidFire') {
      // Permanent power-up - no timeout
      this.player.powerUps.rapidFire = true;
    } else if (type === 'doubleShot') {
      // Permanent power-up - no timeout
      this.player.powerUps.doubleShot = true;
    } else if (type === 'shield') {
      // Shield stays until player gets hit
      this.player.powerUps.shield = true;
      // Give brief invincibility when picking up shield
      this.player.invincible = true;
      setTimeout(() => {
        // Remove invincibility after brief period, shield remains active
        this.player.invincible = false;
      }, 2000);
    } else if (type === 'oneUp') {
      // Add an extra life
      this.player.lives++;
    }
  }

  isMobileDevice() {
    // Enhanced mobile device detection
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    
    // Show mobile controls if it's a touch device AND (small screen OR mobile user agent)
    return hasTouch && (isSmallScreen || isMobileUA);
  }

  updateMobileControlsVisibility() {
    if (!this.mobileControls) return;
    const isTouchDevice = this.isMobileDevice();
    if (isTouchDevice) {
      // Show controls only when playing or paused
      const shouldShow = (this.state === 'playing' || this.state === 'paused');
      if (shouldShow) {
        this.mobileControls.style.display = 'flex';
        this.mobileControls.style.visibility = 'visible';
        this.mobileControls.style.opacity = '1';
        // Force reflow to ensure display change takes effect
        this.mobileControls.offsetHeight;
      } else {
        this.mobileControls.style.display = 'none';
        this.mobileControls.style.visibility = 'hidden';
        this.mobileControls.style.opacity = '0';
      }
    } else {
      this.mobileControls.style.display = 'none';
      this.mobileControls.style.visibility = 'hidden';
    }
  }

  draw() {
    // Update mobile controls visibility
    this.updateMobileControlsVisibility();

    if (this.state === 'menu') {
      // Clear canvas with opaque black background
      this.ctx.fillStyle = '#000000';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      // Draw stars
      this.stars.forEach(star => star.draw(this.ctx));
      this.drawMenu();
      return;
    }

    // For game states, apply screen shake before clearing
    this.ctx.save();
    this.ctx.translate(this.screenShake.x, this.screenShake.y);
    
    // Clear canvas with opaque black background
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw stars (with shake transform applied)
    this.stars.forEach(star => star.draw(this.ctx));
    
    if (this.state === 'paused') {
      this.drawGame();
      this.ctx.restore(); // Restore before drawing UI
      this.drawPauseScreen();
      return;
    }

    if (this.state === 'gameover') {
      this.drawGame();
      this.ctx.restore(); // Restore before drawing UI
      this.drawGameOverScreen();
      return;
    }

    if (this.state === 'victory') {
      this.drawGame();
      this.ctx.restore(); // Restore before drawing UI
      this.drawVictoryScreen();
      return;
    }

    // Draw game elements (shake transform already applied)
    this.drawGame();
    this.ctx.restore(); // Restore before drawing UI and flash overlay
    
    // Draw damage flash overlay (after restoring transform so it covers everything)
    if (this.damageFlash > 0) {
      const flashAlpha = (this.damageFlash / 30) * 0.4; // Fade from 0.4 to 0
      this.ctx.fillStyle = `rgba(255, 0, 0, ${flashAlpha})`;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Draw UI (not affected by shake)
    this.drawUI();
  }

  drawGame() {
    // Screen shake transform is already applied in draw() method
    
    // Draw particles
    this.particles.forEach(particle => particle.draw(this.ctx));

    // Draw power-ups
    this.powerUps.forEach(powerUp => powerUp.draw(this.ctx));

    // Draw enemies
    this.enemies.forEach(enemy => enemy.draw(this.ctx));

    // Draw bullets
    this.bullets.forEach(bullet => bullet.draw(this.ctx));
    this.enemyBullets.forEach(bullet => bullet.draw(this.ctx));

    // Draw player
    this.player.draw(this.ctx);
  }

  drawUI() {
    this.ctx.save();
    this.ctx.fillStyle = '#00ff64';
    this.ctx.font = '16px monospace';
    this.ctx.shadowBlur = 5;
    this.ctx.shadowColor = '#00ff64';
    
    // Score
    this.ctx.fillText(`Score: ${this.score}`, 10, 25);
    
    // Lives
    this.ctx.fillText(`Lives: ${this.player.lives}`, 10, 50);
    
    // Stage progress (unlimited stages)
    this.ctx.fillText(`Stage: ${this.waveManager.currentStage}`, 10, 75);
    
    this.ctx.restore();
  }

  drawMenu() {
    this.ctx.save();
    this.ctx.fillStyle = '#00ff64';
    this.ctx.font = 'bold 28px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = '#00ff64';
    
    this.ctx.fillText('SPACE GAME', this.canvas.width / 2, this.canvas.height / 2 - 80);
    
    this.ctx.font = '16px Arial';
    this.ctx.fillText('Press SPACEBAR to Start', this.canvas.width / 2, this.canvas.height / 2 - 20);
    this.ctx.fillText('Arrow Keys / WASD: Move', this.canvas.width / 2, this.canvas.height / 2 + 10);
    this.ctx.fillText('SPACEBAR: Shoot', this.canvas.width / 2, this.canvas.height / 2 + 40);
    this.ctx.fillText('P: Pause', this.canvas.width / 2, this.canvas.height / 2 + 70);
    
    // Draw Start Game button
    const buttonX = this.canvas.width / 2;
    const buttonY = this.canvas.height / 2 + 120;
    const buttonWidth = 200;
    const buttonHeight = 50;
    
    // Store button position for click detection
    this.startButton.x = buttonX - buttonWidth / 2;
    this.startButton.y = buttonY - buttonHeight / 2;
    this.startButton.width = buttonWidth;
    this.startButton.height = buttonHeight;
    
    // Draw button background
    this.ctx.fillStyle = '#ff0000';
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = '#ff0000';
    this.ctx.fillRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight);
    
    // Draw button border
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight);
    
    // Draw button text
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 18px monospace';
    this.ctx.shadowBlur = 5;
    this.ctx.shadowColor = '#ffffff';
    this.ctx.fillText('START GAME', buttonX, buttonY + 7);
    
    this.ctx.restore();
  }

  drawPauseScreen() {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#00ff64';
    this.ctx.font = 'bold 28px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = '#00ff64';
    this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.font = '16px Arial';
    this.ctx.fillText('Press P to Resume', this.canvas.width / 2, this.canvas.height / 2 + 40);
    
    this.ctx.restore();
  }

  drawGameOverScreen() {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#00ff64';
    this.ctx.font = 'bold 28px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = '#00ff64';
    this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 50);
    
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
    
    const isNewHighScore = this.score > 0 && this.score >= this.bestScore;
    
    if (isNewHighScore && this.score > 0) {
      this.ctx.fillText('NEW HIGH SCORE!', this.canvas.width / 2, this.canvas.height / 2 + 40);
    }
    
    this.ctx.font = '16px Arial';
    this.ctx.fillText('Press R to Restart', this.canvas.width / 2, this.canvas.height / 2 + 80);
    
    this.ctx.restore();
  }

  drawVictoryScreen() {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#00ff64';
    this.ctx.font = 'bold 28px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = '#00ff64';
    this.ctx.fillText('VICTORY!', this.canvas.width / 2, this.canvas.height / 2 - 80);
    
    this.ctx.font = '20px Arial';
    this.ctx.fillText('All 50 Stages Completed!', this.canvas.width / 2, this.canvas.height / 2 - 30);
    this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
    
    this.ctx.font = '16px Arial';
    this.ctx.fillText('Press R to Restart', this.canvas.width / 2, this.canvas.height / 2 + 60);
    
    this.ctx.restore();
  }

  gameLoop(timestamp = 0) {
    requestAnimationFrame(time => this.gameLoop(time));
    if (document.hidden || timestamp - (this.lastFrame || 0) < 1000 / 60 - 1) return;
    this.lastFrame = timestamp;
    this.update();
    if (this.state !== this.lastReportedState) {
      if (this.state === 'gameover' && this.score > this.bestScore) {
        this.bestScore = this.score;
        try { localStorage.setItem('space-game-best', String(this.bestScore)); } catch {}
      }
      const status = document.querySelector('.game-status');
      const messages = { menu: 'Choose Start, or focus the playfield and press Space. Touch controls appear when playing.', playing: 'Playing. Move with arrows or WASD, shoot with Space. Touchscreens: joystick to move, button to shoot.', paused: 'Paused. Choose Pause / Resume, or press P in the playfield.', gameover: `Game over. Score: ${this.score}. Best: ${this.bestScore}. Choose Start / Restart to try again.` };
      if (status) status.textContent = messages[this.state] || '';
      this.lastReportedState = this.state;
    }
    this.draw();
    
    if (this.state === 'menu' && (this.keys[' '] || this.keys['Spacebar'])) {
      this.start();
    }
    

  }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('space-game-canvas');
  if (canvas) {
    const game = new SpaceGame(canvas);
    // Focus canvas when clicked to ensure keyboard events work
    canvas.addEventListener('click', () => {
      canvas.focus();
    });
    game.gameLoop();
  }
});

