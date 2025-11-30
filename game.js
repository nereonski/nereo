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

  update(keys) {
    // Movement
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
      this.x = Math.max(0, this.x - this.speed);
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
      this.x = Math.min(this.canvas.width - this.width, this.x + this.speed);
    }
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
      this.y = Math.max(0, this.y - this.speed);
    }
    if (keys['ArrowDown'] || keys['s'] || keys['S']) {
      this.y = Math.min(this.canvas.height - this.height, this.y + this.speed);
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
      ctx.strokeStyle = '#00ff64';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2 + 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#00ff64';
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
    
    ctx.fillStyle = '#00ff64';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00ff64';
    
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
      ctx.strokeStyle = '#00ff64';
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

// Main Game class
class SpaceGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = 'menu'; // menu, nickname, playing, paused, gameover, victory
    
    this.player = new Player(canvas);
    this.enemies = [];
    this.bullets = [];
    this.enemyBullets = [];
    this.powerUps = [];
    this.particles = [];
    this.waveManager = new WaveManager();
    
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('spaceGameHighScore') || '0');
    this.keys = {};
    this.lastShot = false;
    this.oneUpTimer = 0;
    this.oneUpSpawnInterval = 10800; // Spawn one-up every ~180 seconds (3 minutes) at 60fps
    this.playerNickname = '';
    this.nicknameInput = '';
    this.showNicknamePrompt = false;
    this.cursorBlinkTimer = 0;
    
    // Leaderboard canvas
    this.leaderboardCanvas = document.getElementById('leaderboard-canvas');
    this.leaderboardCtx = this.leaderboardCanvas ? this.leaderboardCanvas.getContext('2d') : null;
    
    this.setupEventListeners();
    this.setupFullscreen();
    this.setupExitButton();
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    this.loadLeaderboard();
    this.drawLeaderboard();
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
      
      // Return to menu
      this.state = 'menu';
      
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
      const maxWidth = Math.min(800, window.innerWidth - 40);
      this.canvas.width = maxWidth;
      this.canvas.height = 600;
    }
    
    if (this.player) {
      this.player.canvas = this.canvas;
      // Ensure player stays within bounds
      this.player.x = Math.max(0, Math.min(this.player.x, this.canvas.width - this.player.width));
      this.player.y = Math.max(0, Math.min(this.player.y, this.canvas.height - this.player.height));
    }
    
    // Resize leaderboard canvas
    if (this.leaderboardCanvas) {
      const maxWidth = Math.min(800, window.innerWidth - 40);
      this.leaderboardCanvas.width = maxWidth;
      this.leaderboardCanvas.height = 300;
      this.drawLeaderboard();
    }
  }

  setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      // Handle nickname input
      if (this.state === 'nickname') {
        if (e.key === 'Enter' && this.nicknameInput.trim().length > 0) {
          this.playerNickname = this.nicknameInput.trim().substring(0, 15); // Limit to 15 chars
          this.nicknameInput = '';
          this.state = 'menu';
          return;
        } else if (e.key === 'Backspace') {
          this.nicknameInput = this.nicknameInput.slice(0, -1);
          return;
        } else if (e.key.length === 1 && /[a-zA-Z0-9_\- ]/.test(e.key)) {
          if (this.nicknameInput.length < 15) {
            this.nicknameInput += e.key;
          }
          return;
        }
      }
      
      // Prevent default behavior for game controls to avoid page scrolling
      // Only prevent when game is active (playing, paused, or menu states)
      const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'W', 'a', 'A', 's', 'S', 'd', 'D'];
      if (gameKeys.includes(e.key) && (this.state === 'playing' || this.state === 'paused' || this.state === 'menu')) {
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
        if (this.state !== 'menu' && this.state !== 'nickname') {
          e.preventDefault();
          this.restart();
        }
      }
    });

    document.addEventListener('keyup', (e) => {
      // Prevent default behavior for game controls
      const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'W', 'a', 'A', 's', 'S', 'd', 'D'];
      if (gameKeys.includes(e.key) && (this.state === 'playing' || this.state === 'paused' || this.state === 'menu')) {
        e.preventDefault();
      }
      
      this.keys[e.key] = false;
    });
  }

  start() {
    // Check if nickname is set, if not prompt for it
    if (!this.playerNickname) {
      this.state = 'nickname';
      this.nicknameInput = '';
      return;
    }
    
    this.state = 'playing';
    this.waveManager.startStage();
    // Focus the canvas to ensure keyboard events are captured
    this.canvas.focus();
    this.gameLoop();
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
    
    // Check if nickname is set, if not prompt for it
    if (!this.playerNickname) {
      this.state = 'nickname';
      this.nicknameInput = '';
      return;
    }
    
    this.state = 'playing';
    this.waveManager.startStage();
    // Focus canvas to ensure keyboard events work
    this.canvas.focus();
  }

  update() {
    if (this.state !== 'playing') return;

    // Update player
    this.player.update(this.keys);

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
        const isDead = this.player.takeDamage();
        if (isDead) {
          this.state = 'gameover';
          this.saveScore();
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
        
        const isDead = this.player.takeDamage();
        if (isDead) {
          this.state = 'gameover';
          this.saveScore();
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
          this.particles.push(new Particle(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2, '#00ff64'));
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

  saveScore() {
    if (this.score > 0 && this.playerNickname) {
      const leaderboard = this.loadLeaderboard();
      leaderboard.push({
        nickname: this.playerNickname,
        score: this.score,
        date: new Date().toISOString()
      });
      
      // Sort by score descending and keep top 10
      leaderboard.sort((a, b) => b.score - a.score);
      const top10 = leaderboard.slice(0, 10);
      
      localStorage.setItem('spaceGameLeaderboard', JSON.stringify(top10));
      
      // Update high score
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('spaceGameHighScore', this.highScore.toString());
      }
      
      this.drawLeaderboard();
    }
  }

  loadLeaderboard() {
    try {
      const stored = localStorage.getItem('spaceGameLeaderboard');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  resetHighScores() {
    // Clear leaderboard and high score from localStorage
    localStorage.removeItem('spaceGameLeaderboard');
    localStorage.removeItem('spaceGameHighScore');
    
    // Reset in-game high score
    this.highScore = 0;
    
    // Redraw leaderboard to show empty state
    this.drawLeaderboard();
  }

  drawLeaderboard() {
    if (!this.leaderboardCtx || !this.leaderboardCanvas) return;
    
    const ctx = this.leaderboardCtx;
    const canvas = this.leaderboardCanvas;
    
    // Clear canvas
    ctx.fillStyle = 'rgba(10, 10, 10, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const leaderboard = this.loadLeaderboard();
    
    if (leaderboard.length === 0) {
      ctx.save();
      ctx.fillStyle = '#00ff64';
      ctx.font = '16px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 5;
      ctx.shadowColor = '#00ff64';
      ctx.fillText('No scores yet. Be the first!', canvas.width / 2, canvas.height / 2);
      ctx.restore();
      return;
    }
    
    ctx.save();
    ctx.fillStyle = '#00ff64';
    ctx.font = 'bold 18px JetBrains Mono';
    ctx.textAlign = 'left';
    ctx.shadowBlur = 5;
    ctx.shadowColor = '#00ff64';
    
    // Draw header
    const headerY = 30;
    ctx.fillText('Rank', 20, headerY);
    ctx.fillText('Nickname', 100, headerY);
    ctx.fillText('Score', canvas.width - 150, headerY);
    
    // Draw separator line
    ctx.strokeStyle = '#00ff64';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, headerY + 10);
    ctx.lineTo(canvas.width - 20, headerY + 10);
    ctx.stroke();
    
    // Draw entries
    ctx.font = '14px JetBrains Mono';
    const startY = headerY + 35;
    const lineHeight = 25;
    const maxEntries = Math.min(10, leaderboard.length);
    
    for (let i = 0; i < maxEntries; i++) {
      const entry = leaderboard[i];
      const y = startY + i * lineHeight;
      
      // Highlight top 3
      if (i < 3) {
        ctx.fillStyle = i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : '#cd7f32';
        ctx.shadowColor = i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : '#cd7f32';
      } else {
        ctx.fillStyle = '#00ff64';
        ctx.shadowColor = '#00ff64';
      }
      
      // Rank
      ctx.fillText(`${i + 1}.`, 20, y);
      
      // Nickname (truncate if too long)
      const nickname = entry.nickname.length > 20 ? entry.nickname.substring(0, 17) + '...' : entry.nickname;
      ctx.fillText(nickname, 100, y);
      
      // Score
      ctx.textAlign = 'right';
      ctx.fillText(entry.score.toLocaleString(), canvas.width - 20, y);
      ctx.textAlign = 'left';
    }
    
    ctx.restore();
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

  draw() {
    // Clear canvas
    this.ctx.fillStyle = 'rgba(10, 10, 10, 0.3)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.state === 'nickname') {
      this.drawNicknamePrompt();
      return;
    }

    if (this.state === 'menu') {
      this.drawMenu();
      return;
    }

    if (this.state === 'paused') {
      this.drawGame();
      this.drawPauseScreen();
      return;
    }

    if (this.state === 'gameover') {
      this.drawGame();
      this.drawGameOverScreen();
      return;
    }

    if (this.state === 'victory') {
      this.drawGame();
      this.drawVictoryScreen();
      return;
    }

    // Draw game elements
    this.drawGame();
  }

  drawGame() {
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

    // Draw UI
    this.drawUI();
  }

  drawUI() {
    this.ctx.save();
    this.ctx.fillStyle = '#00ff64';
    this.ctx.font = '16px JetBrains Mono';
    this.ctx.shadowBlur = 5;
    this.ctx.shadowColor = '#00ff64';
    
    // Score
    this.ctx.fillText(`Score: ${this.score}`, 10, 25);
    
    // High score
    this.ctx.fillText(`High: ${this.highScore}`, 10, 50);
    
    // Lives
    this.ctx.fillText(`Lives: ${this.player.lives}`, 10, 75);
    
    // Stage progress (unlimited stages)
    this.ctx.fillText(`Stage: ${this.waveManager.currentStage}`, 10, 100);
    
    this.ctx.restore();
  }

  drawNicknamePrompt() {
    this.cursorBlinkTimer++;
    const showCursor = Math.floor(this.cursorBlinkTimer / 30) % 2 === 0;
    
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(10, 10, 10, 0.9)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#00ff64';
    this.ctx.font = 'bold 28px JetBrains Mono';
    this.ctx.textAlign = 'center';
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = '#00ff64';
    
    this.ctx.fillText('ENTER YOUR NICKNAME', this.canvas.width / 2, this.canvas.height / 2 - 60);
    
    this.ctx.font = '20px JetBrains Mono';
    const displayText = this.nicknameInput || '';
    const inputX = this.canvas.width / 2;
    const inputY = this.canvas.height / 2;
    
    // Draw input box
    this.ctx.strokeStyle = '#00ff64';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(inputX - 200, inputY - 20, 400, 40);
    
    // Draw nickname text
    if (displayText) {
      this.ctx.fillText(displayText, inputX, inputY + 8);
    }
    
    // Draw blinking cursor
    if (showCursor) {
      const textWidth = displayText ? this.ctx.measureText(displayText).width : 0;
      const cursorX = inputX - textWidth / 2 + textWidth;
      this.ctx.fillRect(cursorX, inputY - 10, 2, 20);
    }
    
    this.ctx.font = '16px Inter';
    this.ctx.fillText('Press ENTER to confirm', this.canvas.width / 2, this.canvas.height / 2 + 50);
    this.ctx.fillText('Max 15 characters', this.canvas.width / 2, this.canvas.height / 2 + 80);
    
    this.ctx.restore();
  }

  drawMenu() {
    this.ctx.save();
    this.ctx.fillStyle = '#00ff64';
    this.ctx.font = 'bold 32px JetBrains Mono';
    this.ctx.textAlign = 'center';
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = '#00ff64';
    
    this.ctx.fillText('SPACE GAME', this.canvas.width / 2, this.canvas.height / 2 - 50);
    
    this.ctx.font = '18px Inter';
    this.ctx.fillText('Press SPACEBAR to Start', this.canvas.width / 2, this.canvas.height / 2 + 20);
    this.ctx.fillText('Arrow Keys / WASD: Move', this.canvas.width / 2, this.canvas.height / 2 + 50);
    this.ctx.fillText('SPACEBAR: Shoot', this.canvas.width / 2, this.canvas.height / 2 + 80);
    this.ctx.fillText('P: Pause', this.canvas.width / 2, this.canvas.height / 2 + 110);
    
    if (this.highScore > 0) {
      this.ctx.fillText(`High Score: ${this.highScore}`, this.canvas.width / 2, this.canvas.height / 2 + 150);
    }
    
    this.ctx.restore();
  }

  drawPauseScreen() {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(10, 10, 10, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#00ff64';
    this.ctx.font = 'bold 32px JetBrains Mono';
    this.ctx.textAlign = 'center';
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = '#00ff64';
    this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.font = '18px Inter';
    this.ctx.fillText('Press P to Resume', this.canvas.width / 2, this.canvas.height / 2 + 40);
    
    this.ctx.restore();
  }

  drawGameOverScreen() {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(10, 10, 10, 0.9)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#00ff64';
    this.ctx.font = 'bold 32px JetBrains Mono';
    this.ctx.textAlign = 'center';
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = '#00ff64';
    this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 50);
    
    this.ctx.font = '20px Inter';
    this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
    
    const leaderboard = this.loadLeaderboard();
    const isNewHighScore = leaderboard.length > 0 && leaderboard[0].score === this.score && leaderboard[0].nickname === this.playerNickname;
    
    if (isNewHighScore && this.score > 0) {
      this.ctx.fillText('NEW HIGH SCORE!', this.canvas.width / 2, this.canvas.height / 2 + 40);
    }
    
    this.ctx.font = '18px Inter';
    this.ctx.fillText('Press R to Restart', this.canvas.width / 2, this.canvas.height / 2 + 80);
    
    this.ctx.restore();
  }

  drawVictoryScreen() {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(10, 10, 10, 0.9)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#00ff64';
    this.ctx.font = 'bold 32px JetBrains Mono';
    this.ctx.textAlign = 'center';
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = '#00ff64';
    this.ctx.fillText('VICTORY!', this.canvas.width / 2, this.canvas.height / 2 - 80);
    
    this.ctx.font = '20px Inter';
    this.ctx.fillText('All 50 Stages Completed!', this.canvas.width / 2, this.canvas.height / 2 - 30);
    this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
    
    const leaderboard = this.loadLeaderboard();
    const isNewHighScore = leaderboard.length > 0 && leaderboard[0].score === this.score && leaderboard[0].nickname === this.playerNickname;
    
    if (isNewHighScore && this.score > 0) {
      this.ctx.fillText('NEW HIGH SCORE!', this.canvas.width / 2, this.canvas.height / 2 + 60);
    }
    
    this.ctx.font = '18px Inter';
    this.ctx.fillText('Press R to Restart', this.canvas.width / 2, this.canvas.height / 2 + 100);
    
    this.ctx.restore();
  }

  gameLoop() {
    this.update();
    this.draw();
    
    if (this.state === 'menu' && (this.keys[' '] || this.keys['Spacebar'])) {
      this.start();
    }
    
    requestAnimationFrame(() => this.gameLoop());
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

