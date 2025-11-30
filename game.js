// ===== SPACE GAME =====

// Player class
class Player {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = 40;
    this.height = 30;
    this.x = canvas.width / 2 - this.width / 2;
    this.y = canvas.height - this.height - 30;
    this.speed = 3;
    this.lives = 3;
    this.shootCooldown = 0;
    this.shootDelay = 15;
    this.powerUps = {
      rapidFire: false,
      doubleShot: false,
      shield: false
    };
    this.shieldTimer = 0;
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

    // Shield timer
    if (this.shieldTimer > 0) {
      this.shieldTimer--;
      if (this.shieldTimer === 0) {
        this.powerUps.shield = false;
        this.invincible = false;
      }
    }
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

    // Ship body
    ctx.fillStyle = '#00ff64';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00ff64';
    
    // Draw triangular ship
    ctx.beginPath();
    ctx.moveTo(this.x + this.width / 2, this.y);
    ctx.lineTo(this.x, this.y + this.height);
    ctx.lineTo(this.x + this.width, this.y + this.height);
    ctx.closePath();
    ctx.fill();

    // Ship details
    ctx.fillStyle = '#00cc50';
    ctx.fillRect(this.x + this.width / 2 - 2, this.y + 5, 4, 10);

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
    this.shieldTimer = 0;
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
    ctx.fillStyle = this.type === 'player' ? '#00ff64' : '#ff0064';
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.type === 'player' ? '#00ff64' : '#ff0064';
    ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
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
  constructor(x, y, type = 'basic') {
    this.x = x;
    this.y = y;
    this.type = type;
    this.width = 30;
    this.height = 30;
    this.speed = type === 'fast' ? 2 : 1;
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
    ctx.fillStyle = '#00ff64';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#00ff64';
    
    // Different shapes for different enemy types
    if (this.type === 'fast') {
      // Diamond shape
      ctx.beginPath();
      ctx.moveTo(this.x + this.width / 2, this.y);
      ctx.lineTo(this.x + this.width, this.y + this.height / 2);
      ctx.lineTo(this.x + this.width / 2, this.y + this.height);
      ctx.lineTo(this.x, this.y + this.height / 2);
      ctx.closePath();
      ctx.fill();
    } else if (this.type === 'shooter') {
      // Square with cross
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.strokeStyle = '#00cc50';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + this.width, this.y + this.height);
      ctx.moveTo(this.x + this.width, this.y);
      ctx.lineTo(this.x, this.y + this.height);
      ctx.stroke();
    } else {
      // Basic rectangle
      ctx.fillRect(this.x, this.y, this.width, this.height);
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
    this.type = type; // 'rapidFire', 'doubleShot', 'shield'
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
    this.maxStages = 20;
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
    // Stages 1-5: 3-4 enemies
    // Stages 6-10: 4-5 enemies
    // Stages 11-15: 5-6 enemies
    // Stages 16-20: 6-7 enemies
    if (this.currentStage <= 5) {
      this.enemiesPerStage = 3;
    } else if (this.currentStage <= 10) {
      this.enemiesPerStage = 4;
    } else if (this.currentStage <= 15) {
      this.enemiesPerStage = 5;
    } else {
      this.enemiesPerStage = 6;
    }
    
    // Increase spawn delay slightly as stages progress for better pacing
    this.spawnDelay = Math.max(70, 90 - (this.currentStage - 1) * 2);
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
      
      if (stage <= 3) {
        // Stages 1-3: Only basic enemies
        type = 'basic';
      } else if (stage <= 7) {
        // Stages 4-7: Mix of basic and fast enemies
        if (rand < 0.35) {
          type = 'fast';
        } else {
          type = 'basic';
        }
      } else if (stage <= 12) {
        // Stages 8-12: All types, more balanced
        if (rand < 0.25) {
          type = 'fast';
        } else if (rand < 0.5) {
          type = 'shooter';
        } else {
          type = 'basic';
        }
      } else {
        // Stages 13-20: More challenging mix
        if (rand < 0.3) {
          type = 'fast';
        } else if (rand < 0.6) {
          type = 'shooter';
        } else {
          type = 'basic';
        }
      }
      
      return new Enemy(x, y, type);
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
    return this.currentStage >= this.maxStages;
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
    
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('spaceGameHighScore') || '0');
    this.keys = {};
    this.lastShot = false;
    
    this.setupEventListeners();
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    const container = this.canvas.parentElement;
    const maxWidth = Math.min(800, window.innerWidth - 40);
    this.canvas.width = maxWidth;
    this.canvas.height = 600;
    
    if (this.player) {
      this.player.canvas = this.canvas;
      this.player.x = Math.min(this.player.x, this.canvas.width - this.player.width);
      this.player.y = Math.min(this.player.y, this.canvas.height - this.player.height);
    }
  }

  setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      
      if (e.key === ' ' && this.state === 'playing') {
        e.preventDefault();
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
        if (this.state === 'gameover' || this.state === 'victory') {
          this.restart();
        }
      }
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });
  }

  start() {
    this.state = 'playing';
    this.waveManager.startStage();
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
    this.state = 'playing';
    this.waveManager.startStage();
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
      
      // Only check for victory if we've actually completed at least one stage with enemies
      // and we've completed all stages (currentStage represents the stage we just completed)
      // After completing stage 20, currentStage will be 20, which equals maxStages
      if (this.waveManager.currentStage > 0 && 
          this.waveManager.currentStage === this.waveManager.maxStages &&
          this.waveManager.enemiesSpawned > 0) {
        this.state = 'victory';
        if (this.score > this.highScore) {
          this.highScore = this.score;
          localStorage.setItem('spaceGameHighScore', this.highScore.toString());
        }
      } else if (this.waveManager.currentStage > 0) {
        // We haven't completed all stages yet, so continue to next stage
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
          
          // Create explosion particles
          for (let i = 0; i < 10; i++) {
            this.particles.push(new Particle(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2));
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
          if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('spaceGameHighScore', this.highScore.toString());
          }
        }
      }
    });

    // Collision detection: enemies vs player
    this.enemies.forEach(enemy => {
      if (this.checkCollision(enemy.getBounds(), this.player.getBounds())) {
        enemy.active = false;
        const isDead = this.player.takeDamage();
        if (isDead) {
          this.state = 'gameover';
          if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('spaceGameHighScore', this.highScore.toString());
          }
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

  applyPowerUp(type) {
    if (type === 'rapidFire') {
      this.player.powerUps.rapidFire = true;
      setTimeout(() => {
        this.player.powerUps.rapidFire = false;
      }, 10000);
    } else if (type === 'doubleShot') {
      this.player.powerUps.doubleShot = true;
      setTimeout(() => {
        this.player.powerUps.doubleShot = false;
      }, 10000);
    } else if (type === 'shield') {
      this.player.powerUps.shield = true;
      this.player.invincible = true;
      this.player.shieldTimer = 600; // 10 seconds at 60fps
    }
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = 'rgba(10, 10, 10, 0.3)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

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
    
    // Stage progress
    this.ctx.fillText(`Stage: ${this.waveManager.currentStage}/${this.waveManager.maxStages}`, 10, 100);
    
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
    
    if (this.score === this.highScore && this.score > 0) {
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
    this.ctx.fillText('All 20 Stages Completed!', this.canvas.width / 2, this.canvas.height / 2 - 30);
    this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
    
    if (this.score === this.highScore && this.score > 0) {
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
    game.gameLoop();
  }
});

