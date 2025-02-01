import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private controls!: any;
  private playerAttacks!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private bosses!: Phaser.Physics.Arcade.Group;
  private collectables!: Phaser.Physics.Arcade.Group;
  private corpses!: Phaser.Physics.Arcade.Group;
  private obstacles!: Phaser.Physics.Arcade.Group;
  private grid!: Phaser.GameObjects.Graphics;
  private notificationLabel!: Phaser.GameObjects.Text;
  private xpLabel!: Phaser.GameObjects.Text;
  private healthLabel!: Phaser.GameObjects.Text;
  private goldLabel!: Phaser.GameObjects.Text;
  private spellLabel!: Phaser.GameObjects.Text;
  private gold: number = 0;
  private xp: number = 0;
  private xpToNext: number = 20;
  private spellCooldown: number = 0;
  private playerLevel: number = 1;
  private playerHealth: number = 100;
  private playerMaxHealth: number = 100;
  private playerSpeed: number = 200;
  private playerStrength: number = 20;
  private isGameOver: boolean = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    // Load all game assets
    this.load.spritesheet('characters', '/assets/images/characters.png', { 
      frameWidth: 16, 
      frameHeight: 16 
    });
    this.load.spritesheet('dragons', '/assets/images/dragons.png', { 
      frameWidth: 32, 
      frameHeight: 32 
    });
    this.load.spritesheet('things', '/assets/images/things.png', { 
      frameWidth: 16, 
      frameHeight: 16 
    });
    this.load.spritesheet('potions', '/assets/images/potions.png', { 
      frameWidth: 16, 
      frameHeight: 16 
    });
    this.load.spritesheet('dead', '/assets/images/dead.png', { 
      frameWidth: 16, 
      frameHeight: 16 
    });
    this.load.spritesheet('tiles', '/assets/images/tiles.png', {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.image('sword', '/assets/images/sword.png');
    this.load.image('spell', '/assets/images/spell.png');
    this.load.image('fireball', '/assets/images/fireball.png');
    this.load.image('flame', '/assets/images/flame.png');
    this.load.image('spell-particle', '/assets/images/spell-particle.png');
  }

  create() {
    if (this.isGameOver) return;

    // Set world bounds
    const worldSize = 1920;
    this.physics.world.setBounds(0, 0, worldSize, worldSize);

    // Create groups
    this.enemies = this.physics.add.group();
    this.bosses = this.physics.add.group();
    this.collectables = this.physics.add.group();
    this.playerAttacks = this.physics.add.group();
    this.corpses = this.physics.add.group();
    this.obstacles = this.physics.add.staticGroup();

    // Create environment
    this.generateGrid(worldSize);
    this.createBackground(worldSize);
    this.generateObstacles();
    this.generateCollectables();

    // Create player
    this.createPlayer();

    // Setup camera
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, worldSize, worldSize);

    // Setup controls
    this.setupControls();

    // Setup collisions
    this.setupCollisions();

    // Create initial enemies
    this.createEnemies(5);

    // Setup UI
    this.showLabels();
  }

  private createBackground(worldSize: number) {
    const background = this.add.tileSprite(0, 0, worldSize, worldSize, 'tiles', 65);
    background.setOrigin(0, 0);
    background.setScale(2);

    // Add dirt patches for variety
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, worldSize);
      const y = Phaser.Math.Between(0, worldSize);
      const dirtPatch = this.add.sprite(x, y, 'tiles', 64);
      dirtPatch.setScale(2);
    }
  }

  private createPlayer() {
    this.player = this.physics.add.sprite(
      this.physics.world.bounds.centerX,
      this.physics.world.bounds.centerY,
      'characters'
    );
    this.player.setScale(2);
    this.player.setCollideWorldBounds(true);
    
    // Set player properties
    this.player.health = this.playerHealth;
    this.player.maxHealth = this.playerMaxHealth;
    this.player.speed = this.playerSpeed;
    this.player.strength = this.playerStrength;
    
    // Create player animations
    this.createPlayerAnimations();
    this.player.play('player-down');
  }

  private createPlayerAnimations() {
    const animations = [
      { key: 'player-down', frames: [3, 4, 5] },
      { key: 'player-left', frames: [15, 16, 17] },
      { key: 'player-right', frames: [27, 28, 29] },
      { key: 'player-up', frames: [39, 40, 41] }
    ];

    animations.forEach(anim => {
      this.anims.create({
        key: anim.key,
        frames: this.anims.generateFrameNumbers('characters', { frames: anim.frames }),
        frameRate: 10,
        repeat: -1
      });
    });
  }

  private setupControls() {
    this.controls = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      attack: Phaser.Input.Keyboard.KeyCodes.SPACE,
      spell: Phaser.Input.Keyboard.KeyCodes.SHIFT
    });
  }

  private setupCollisions() {
    this.physics.add.collider(this.player, this.enemies, this.handleEnemyCollision, undefined, this);
    this.physics.add.collider(this.player, this.bosses, this.handleBossCollision, undefined, this);
    this.physics.add.collider(this.player, this.obstacles);
    this.physics.add.overlap(this.player, this.collectables, this.handleCollectItem, undefined, this);
    this.physics.add.collider(this.playerAttacks, this.enemies, this.handleAttackHit, undefined, this);
    this.physics.add.collider(this.playerAttacks, this.bosses, this.handleBossHit, undefined, this);
    this.physics.add.collider(this.playerAttacks, this.obstacles, (attack) => attack.destroy());
  }

  update() {
    if (this.isGameOver) return;

    this.handlePlayerMovement();
    this.handleEnemyMovement();
    this.handleBossMovement();
    this.handleAttacks();
    this.updateLabels();
    this.checkGameOver();
  }

  private handleAttacks() {
    if (this.controls.attack.isDown && !this.player.attacking) {
      this.performSwordAttack();
    }

    if (Phaser.Input.Keyboard.JustDown(this.controls.spell) && this.spellCooldown <= 0) {
      this.castSpell();
    }

    if (this.spellCooldown > 0) {
      this.spellCooldown--;
    }
  }

  private performSwordAttack() {
    this.player.attacking = true;
    
    const direction = this.player.anims.currentAnim.key.split('-')[1];
    const offset = this.getDirectionOffset(direction, 20);
    
    const attack = this.playerAttacks.create(
      this.player.x + offset.x,
      this.player.y + offset.y,
      'sword'
    );
    
    attack.setScale(1.5);
    attack.damage = this.playerStrength;
    attack.lifespan = 200;

    this.time.delayedCall(200, () => {
      this.player.attacking = false;
    });
  }

  private castSpell() {
    const direction = this.player.anims.currentAnim.key.split('-')[1];
    const speed = 300;
    const velocity = this.getDirectionOffset(direction, speed);

    // Create spell projectile
    const spell = this.playerAttacks.create(this.player.x, this.player.y, 'spell') as Phaser.Physics.Arcade.Sprite;
    spell.setScale(1.5);
    spell.damage = this.playerStrength * 2;
    spell.isSpell = true;
    spell.setVelocity(velocity.x, velocity.y);

    // Create particle manager and emitter for trail effect
    const manager = this.add.particles('spell-particle');
    const emitter = manager.createEmitter({
      follow: spell,
      quantity: 1,
      frequency: 50,
      scale: { start: 0.5, end: 0 },
      speed: { min: -50, max: 50 },
      lifespan: 500,
      blendMode: 'ADD',
      alpha: { start: 0.6, end: 0 }
    });

    // Cleanup when spell is destroyed
    spell.on('destroy', () => {
      manager.destroy();
    });

    spell.lifespan = 1000;
    this.spellCooldown = 100;

    // Add collision handlers
    this.physics.add.collider(spell, this.enemies, (spell, enemy) => {
      this.handleSpellHit(spell, enemy);
    });
    this.physics.add.collider(spell, this.bosses, (spell, boss) => {
      this.handleSpellHit(spell, boss);
    });
    this.physics.add.collider(spell, this.obstacles, (spell) => {
      manager.destroy();
      spell.destroy();
    });
  }

  private handleSpellHit(spell: any, target: any) {
    // Create hit effect
    const manager = this.add.particles('spell-particle');
    const emitter = manager.createEmitter({
      x: target.x,
      y: target.y,
      quantity: 15,
      speed: { min: -100, max: 100 },
      scale: { start: 0.5, end: 0 },
      lifespan: 300,
      blendMode: 'ADD',
      alpha: { start: 0.8, end: 0 }
    });

    // Set timeout to destroy particles
    this.time.delayedCall(300, () => {
      manager.destroy();
    });

    // Apply damage and show number
    if (target.health) {
      target.health -= spell.damage;
      this.showDamageNumber(target, spell.damage);

      if (target.health <= 0) {
        this.deathHandler(target);
      }
    }

    // Cleanup
    spell.destroy();
  }

  private getDirectionOffset(direction: string, magnitude: number): { x: number, y: number } {
    const offset = { x: 0, y: 0 };
    switch (direction) {
      case 'up':
        offset.y = -magnitude;
        break;
      case 'down':
        offset.y = magnitude;
        break;
      case 'left':
        offset.x = -magnitude;
        break;
      case 'right':
        offset.x = magnitude;
        break;
    }
    return offset;
  }

  private showDamageNumber(target: any, damage: number) {
    const damageText = this.add.text(target.x, target.y - 20, damage.toString(), {
      fontSize: '20px',
      color: '#ff0000'
    });

    this.tweens.add({
      targets: damageText,
      y: target.y - 50,
      alpha: 0,
      duration: 800,
      onComplete: () => damageText.destroy()
    });
  }

  private checkGameOver() {
    if (this.player.health <= 0 && !this.isGameOver) {
      this.isGameOver = true;
      this.showGameOver();
    }
  }

  private showGameOver() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    const gameOverText = this.add.text(centerX, centerY, 'Game Over', {
      fontSize: '64px',
      color: '#ff0000'
    });
    gameOverText.setOrigin(0.5);
    gameOverText.setScrollFactor(0);

    const restartText = this.add.text(centerX, centerY + 70, 'Press R to Restart', {
      fontSize: '32px',
      color: '#ffffff'
    });
    restartText.setOrigin(0.5);
    restartText.setScrollFactor(0);

    this.input.keyboard.once('keydown-R', () => {
      this.scene.restart();
    });
  }

  private generateGrid(worldSize: number) {
    this.grid = this.add.graphics();
    this.grid.lineStyle(1, 0x000000, 0.2);

    // Draw vertical lines
    for (let x = 0; x < worldSize; x += 64) {
      this.grid.moveTo(x, 0);
      this.grid.lineTo(x, worldSize);
    }

    // Draw horizontal lines
    for (let y = 0; y < worldSize; y += 64) {
      this.grid.moveTo(0, y);
      this.grid.lineTo(worldSize, y);
    }

    this.grid.strokePath();
  }

  private generateObstacles() {
    const amount = 300;
    const obstacleTypes = [
      { name: 'tree', frame: 38, weight: 4 },
      { name: 'shrub', frame: 20, weight: 2 },
      { name: 'pine', frame: 30, weight: 2 },
      { name: 'column', frame: 39, weight: 1 },
      { name: 'rock', frame: 40, weight: 2 },
      { name: 'stump', frame: 21, weight: 1 },
      { name: 'flowers', frame: 22, weight: 1 }
    ];

    // Calculate total weight
    const totalWeight = obstacleTypes.reduce((sum, type) => sum + type.weight, 0);

    for (let i = 0; i < amount; i++) {
      const x = Phaser.Math.Between(100, 1820);
      const y = Phaser.Math.Between(100, 1820);
      
      // Select obstacle type based on weight
      let random = Math.random() * totalWeight;
      let selectedType = obstacleTypes[0];
      
      for (const type of obstacleTypes) {
        if (random <= type.weight) {
          selectedType = type;
          break;
        }
        random -= type.weight;
      }

      // Create obstacle with selected type
      const obstacle = this.obstacles.create(x, y, 'tiles', selectedType.frame);
      obstacle.setScale(2);
      
      // Adjust hitbox based on obstacle type
      if (selectedType.name === 'tree' || selectedType.name === 'pine') {
        (obstacle.body as Phaser.Physics.Arcade.Body).setSize(8, 8);
        (obstacle.body as Phaser.Physics.Arcade.Body).setOffset(4, 8);
      } else {
        (obstacle.body as Phaser.Physics.Arcade.Body).setSize(8, 8);
        (obstacle.body as Phaser.Physics.Arcade.Body).setOffset(4, 4);
      }

      // Add some variation
      if (Math.random() < 0.3) {
        obstacle.flipX = true;
      }
      if (Math.random() < 0.1) {
        obstacle.setScale(1.5);
      }
    }

    // Create some clusters of obstacles for more natural looking environment
    const clusterCount = 10;
    for (let i = 0; i < clusterCount; i++) {
      const centerX = Phaser.Math.Between(200, 1720);
      const centerY = Phaser.Math.Between(200, 1720);
      const clusterSize = Phaser.Math.Between(3, 6);

      for (let j = 0; j < clusterSize; j++) {
        const offsetX = Phaser.Math.Between(-30, 30);
        const offsetY = Phaser.Math.Between(-30, 30);
        const obstacle = this.obstacles.create(
          centerX + offsetX,
          centerY + offsetY,
          'tiles',
          obstacleTypes[0].frame // Use trees for clusters
        );
        obstacle.setScale(2);
        (obstacle.body as Phaser.Physics.Arcade.Body).setSize(8, 8);
        (obstacle.body as Phaser.Physics.Arcade.Body).setOffset(4, 8);
      }
    }
  }

  private generateCollectables() {
    const amount = 100;
    for (let i = 0; i < amount; i++) {
      const x = Phaser.Math.Between(100, 1820);
      const y = Phaser.Math.Between(100, 1820);
      
      const chest = this.collectables.create(x, y, 'things', 6);
      chest.setScale(2);
      (chest as any).value = Math.floor(Math.random() * 150);
      (chest as any).name = 'chest';
    }
  }

  private showLabels() {
    const style = { 
      fontFamily: 'Arial', 
      fontSize: '20px',
      color: '#ffffff',
      align: 'center'
    };

    this.notificationLabel = this.add.text(25, 25, '', {
      ...style,
      fontSize: '16px'
    });
    this.notificationLabel.setScrollFactor(0);

    this.xpLabel = this.add.text(25, this.game.canvas.height - 25, '0 XP', {
      ...style,
      color: '#ffd700'
    });
    this.xpLabel.setScrollFactor(0);

    this.healthLabel = this.add.text(225, this.game.canvas.height - 50, '100 HP', {
      ...style,
      fontSize: '24px',
      color: '#ff0000'
    });
    this.healthLabel.setScrollFactor(0);

    this.goldLabel = this.add.text(this.game.canvas.width - 75, this.game.canvas.height - 25, '0 Gold', style);
    this.goldLabel.setScrollFactor(0);

    this.spellLabel = this.add.text(230, this.game.canvas.height - 25, 'Ready', style);
    this.spellLabel.setScrollFactor(0);
  }

  private handlePlayerMovement() {
    const speed = 200;
    let velocityX = 0;
    let velocityY = 0;
    
    if (this.controls.left.isDown) {
      velocityX = -speed;
      this.player.play('player-left', true);
    } else if (this.controls.right.isDown) {
      velocityX = speed;
      this.player.play('player-right', true);
    }

    if (this.controls.up.isDown) {
      velocityY = -speed;
      if (velocityX === 0) this.player.play('player-up', true);
    } else if (this.controls.down.isDown) {
      velocityY = speed;
      if (velocityX === 0) this.player.play('player-down', true);
    }

    this.player.setVelocity(velocityX, velocityY);
    
    // Stop animation if not moving
    if (velocityX === 0 && velocityY === 0) {
      this.player.anims.stop();
    }
  }

  private handleEnemyMovement() {
    this.enemies.children.iterate((enemy: any) => {
      if (enemy && enemy.active) {
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        const speed = enemy.speed || 100;
        enemy.setVelocityX(Math.cos(angle) * speed);
        enemy.setVelocityY(Math.sin(angle) * speed);
      }
    });
  }

  private handleBossMovement() {
    this.bosses.children.iterate((boss: any) => {
      if (boss && boss.active) {
        const angle = Phaser.Math.Angle.Between(boss.x, boss.y, this.player.x, this.player.y);
        const speed = 50;
        boss.setVelocityX(Math.cos(angle) * speed);
        boss.setVelocityY(Math.sin(angle) * speed);
      }
    });
  }

  private updateLabels() {
    this.xpLabel.setText(`${this.xp}/${this.xpToNext} XP`);
    this.healthLabel.setText(`${(this.player as any).health || 100} HP`);
    this.goldLabel.setText(`${this.gold} Gold`);
    this.spellLabel.setText(this.spellCooldown > 0 ? `${this.spellCooldown}` : 'Ready');
  }

  private handleEnemyCollision(player: any, enemy: any) {
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    const speed = 400;
    player.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
  }

  private handleBossCollision(player: any, boss: any) {
    const angle = Phaser.Math.Angle.Between(boss.x, boss.y, player.x, player.y);
    const speed = 600;
    player.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
  }

  private handleCollectItem(player: any, item: any) {
    item.destroy();
    this.gold += 10;
    this.xp += 5;
    
    if (this.xp >= this.xpToNext) {
      this.levelUp();
    }
  }

  private handleAttackHit(attack: any, enemy: any) {
    attack.destroy();
    
    // Create corpse sprite
    const corpse = this.corpses.create(enemy.x, enemy.y, 'dead');
    corpse.setScale(2);
    corpse.setDepth(-1);
    
    enemy.destroy();
    this.xp += 10;
    
    if (this.xp >= this.xpToNext) {
      this.levelUp();
    }

    // Spawn collectible
    if (Phaser.Math.Between(0, 100) < 30) {
      const collectible = this.collectables.create(enemy.x, enemy.y, 'things', 0);
      collectible.setScale(2);
    }
  }

  private handleBossHit(attack: any, boss: any) {
    attack.destroy();
    if (!boss.health) boss.health = 10;
    boss.health -= 1;
    
    if (boss.health <= 0) {
      const corpse = this.corpses.create(boss.x, boss.y, 'dead');
      corpse.setScale(4);
      corpse.setDepth(-1);
      
      boss.destroy();
      this.xp += 50;
      this.gold += 100;
      
      if (this.xp >= this.xpToNext) {
        this.levelUp();
      }
    }
  }

  private levelUp() {
    this.playerLevel++;
    this.playerMaxHealth += 20;
    this.playerHealth = this.playerMaxHealth;
    this.playerStrength += 5;
    this.xp = 0;
    this.xpToNext *= 1.5;
    
    // Level up effect
    const manager = this.add.particles('spell-particle');
    const emitter = manager.createEmitter({
      x: this.player.x,
      y: this.player.y,
      quantity: 20,
      speed: { min: -150, max: 150 },
      scale: { start: 1, end: 0 },
      lifespan: 1000,
      blendMode: 'ADD',
      alpha: { start: 1, end: 0 }
    });

    // Cleanup after effect
    this.time.delayedCall(1000, () => {
      manager.destroy();
    });
  }

  private createEnemies(count: number) {
    const enemyTypes = [
      { name: 'Skeleton', frames: [9, 10, 11], health: 100, speed: 70, strength: 20 },
      { name: 'Slime', frames: [48, 49, 50], health: 300, speed: 40, strength: 50 },
      { name: 'Bat', frames: [51, 52, 53], health: 20, speed: 200, strength: 10 },
      { name: 'Ghost', frames: [54, 55, 56], health: 200, speed: 60, strength: 30 },
      { name: 'Spider', frames: [57, 58, 59], health: 50, speed: 120, strength: 12 }
    ];

    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(100, 1820);
      const y = Phaser.Math.Between(100, 1820);
      const typeIndex = Phaser.Math.Between(0, enemyTypes.length - 1);
      const enemyType = enemyTypes[typeIndex];
      
      const enemy = this.enemies.create(x, y, 'characters') as Phaser.Physics.Arcade.Sprite;
      enemy.setScale(2);
      
      // Create enemy animation
      const animKey = `${enemyType.name.toLowerCase()}-down`;
      if (!this.anims.exists(animKey)) {
        this.anims.create({
          key: animKey,
          frames: this.anims.generateFrameNumbers('characters', { frames: enemyType.frames }),
          frameRate: 10,
          repeat: -1
        });
      }
      
      enemy.play(animKey);
      enemy.setCollideWorldBounds(true);
      
      // Set enemy properties
      (enemy as any).health = enemyType.health;
      (enemy as any).speed = enemyType.speed;
      (enemy as any).strength = enemyType.strength;
      (enemy as any).name = enemyType.name;
    }
  }

  private deathHandler(target: any) {
    // Create corpse sprite
    const corpse = this.corpses.create(target.x, target.y, 'dead');
    corpse.setScale(2);
    corpse.setDepth(-1);
    
    target.destroy();
  }
}
