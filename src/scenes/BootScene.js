class BootScene extends Phaser.Scene {
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
        //load images
        this.load.image('button1', 'src/assets/images/blue_button01.png');
        this.load.image('button2', 'src/assets/images/blue_button02.png');
        //load the map tileset image
        this.load.image('background', 'src/assets/level/background-extruded.png');
    }

    loadSpritesheets() {
        //load spritesheets
        this.load.spritesheet('items', 'src/assets/images/items.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('characters', 'src/assets/images/characters.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('monsters', 'src/assets/images/monsters.png', { frameWidth: 32, frameHeight: 32 });
    }

    loadAudio() {
        //load audio
        this.load.audio('goldSound', ['src/assets/audio/Pickup.wav']);
        this.load.audio('enemyDeath', ['src/assets/audio/EnemyDeath.wav']);
        this.load.audio('playerAttack', ['src/assets/audio/PlayerAttack.wav']);
        this.load.audio('playerDamage', ['src/assets/audio/PlayerDamage.wav']);
        this.load.audio('playerDeath', ['src/assets/audio/PlayerDeath.wav']);
    }

    loadTilemap() {
        //load map made in Tiled with JSON format
        this.load.tilemapTiledJSON('map', 'src/assets/level/large_level.json');
    }

    create() {
        this.scene.start('Title');
    }
}