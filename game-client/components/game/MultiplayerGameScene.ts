import Phaser from 'phaser';

interface Player {
  id: string;
  name: string;
  sprite?: Phaser.GameObjects.Sprite;
  label?: Phaser.GameObjects.Text;
  position: {
    x: number;
    y: number;
  };
}

export class MultiplayerGameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private playerLabel!: Phaser.GameObjects.Text;
  private otherPlayers: Map<string, Player> = new Map();
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private playerSpeed: number = 200;
  private onPositionUpdate?: (x: number, y: number) => void;
  private playerId: string = '';

  constructor() {
    super({ key: 'MultiplayerGameScene' });
  }

  init(data: { onPositionUpdate?: (x: number, y: number) => void }) {
    this.onPositionUpdate = data.onPositionUpdate;
  }

  preload() {
    // Load character sprite
    this.load.spritesheet('character', '/assets/character.png', {
      frameWidth: 32,
      frameHeight: 48
    });
  }

  create() {
    // Create player sprite
    this.player = this.add.sprite(400, 300, 'character');
    this.playerLabel = this.add.text(400, 270, 'You', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 }
    });
    this.playerLabel.setOrigin(0.5);

    // Set up animations
    this.createAnimations();

    // Set up keyboard input
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  createAnimations() {
    // Create idle animations
    this.anims.create({
      key: 'idle-down',
      frames: [{ key: 'character', frame: 0 }],
      frameRate: 10,
    });

    this.anims.create({
      key: 'idle-up',
      frames: [{ key: 'character', frame: 1 }],
      frameRate: 10,
    });

    this.anims.create({
      key: 'idle-left',
      frames: [{ key: 'character', frame: 2 }],
      frameRate: 10,
    });

    this.anims.create({
      key: 'idle-right',
      frames: [{ key: 'character', frame: 3 }],
      frameRate: 10,
    });

    // Create walking animations
    this.anims.create({
      key: 'walk-down',
      frames: this.anims.generateFrameNumbers('character', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'walk-up',
      frames: this.anims.generateFrameNumbers('character', { start: 4, end: 7 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'walk-left',
      frames: this.anims.generateFrameNumbers('character', { start: 8, end: 11 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'walk-right',
      frames: this.anims.generateFrameNumbers('character', { start: 12, end: 15 }),
      frameRate: 10,
      repeat: -1
    });
  }

  addOtherPlayer(player: Player) {
    const sprite = this.add.sprite(player.position.x, player.position.y, 'character');
    const label = this.add.text(player.position.x, player.position.y - 30, player.name, {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 }
    });
    label.setOrigin(0.5);

    this.otherPlayers.set(player.id, {
      ...player,
      sprite,
      label
    });
  }

  removeOtherPlayer(playerId: string) {
    const player = this.otherPlayers.get(playerId);
    if (player) {
      player.sprite?.destroy();
      player.label?.destroy();
      this.otherPlayers.delete(playerId);
    }
  }

  updateOtherPlayerPosition(playerId: string, position: { x: number, y: number }) {
    const player = this.otherPlayers.get(playerId);
    if (player && player.sprite && player.label) {
      player.sprite.setPosition(position.x, position.y);
      player.label.setPosition(position.x, position.y - 30);
    }
  }

  setPositionUpdateCallback(callback: (x: number, y: number) => void) {
    this.onPositionUpdate = callback;
  }

  getPlayerId(): string {
    return this.playerId;
  }

  setPlayerId(id: string) {
    this.playerId = id;
  }

  update() {
    if (this.cursors) {
      let velocityX = 0;
      let velocityY = 0;

      // Handle horizontal movement
      if (this.cursors.left.isDown) {
        velocityX = -this.playerSpeed;
        this.player.anims.play('walk-left', true);
      } else if (this.cursors.right.isDown) {
        velocityX = this.playerSpeed;
        this.player.anims.play('walk-right', true);
      }

      // Handle vertical movement
      if (this.cursors.up.isDown) {
        velocityY = -this.playerSpeed;
        if (velocityX === 0) this.player.anims.play('walk-up', true);
      } else if (this.cursors.down.isDown) {
        velocityY = this.playerSpeed;
        if (velocityX === 0) this.player.anims.play('walk-down', true);
      }

      // Update player position
      this.player.x += velocityX * (1/60);
      this.player.y += velocityY * (1/60);

      // Update player label position
      this.playerLabel.setPosition(this.player.x, this.player.y - 30);

      // Emit position update
      if (velocityX !== 0 || velocityY !== 0) {
        this.onPositionUpdate?.(this.player.x, this.player.y);
      }

      // Set idle animation if not moving
      if (velocityX === 0 && velocityY === 0) {
        const currentAnim = this.player.anims.currentAnim;
        if (currentAnim) {
          const direction = currentAnim.key.split('-')[1];
          this.player.anims.play(`idle-${direction}`, true);
        }
      }
    }
  }
}
