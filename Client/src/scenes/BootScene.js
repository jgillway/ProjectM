import * as Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    this.loadImages();
    this.loadSpritesheets();
    this.loadAudio();
    this.loadTilemap();
  }

  loadImages() {
    // load images
    this.load.image('button1', 'assets/images/blue_button01.png');
    this.load.image('button2', 'assets/images/blue_button02.png');
    // load the map tileset image
    this.load.image('background', 'assets/level/background-extruded.png');
  }

  loadSpritesheets() {
    // load spritesheets
    this.load.spritesheet('items', 'assets/images/items.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('characters', 'assets/images/characters.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('monsters', 'assets/images/monsters.png', { frameWidth: 32, frameHeight: 32 });
  }

  loadAudio() {
    // load audio
    this.load.audio('goldSound', ['assets/audio/Pickup.wav']);
    this.load.audio('enemyDeath', ['assets/audio/EnemyDeath.wav']);
    this.load.audio('playerAttack', ['assets/audio/PlayerAttack.wav']);
    this.load.audio('playerDamage', ['assets/audio/PlayerDamage.wav']);
    this.load.audio('playerDeath', ['assets/audio/PlayerDeath.wav']);
  }

  loadTilemap() {
    // load map made in Tiled with JSON format
    this.load.tilemapTiledJSON('map', 'assets/level/large_level.json');
  }

  create() {
    this.scene.start('Title');
  }
}
