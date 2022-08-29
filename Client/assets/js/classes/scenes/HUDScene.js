class HUDScene extends Phaser.Scene {
    constructor() {
        super('HUD');
    }

    init() {
        //grab reference to gameScene
        this.gameScene = this.scene.get('Game');
    }

    create() {
        this.setupHUDElements();
        this.setupEvents();
    }

    setupHUDElements() {
        //create coin icon
        this.coinIcon = this.add.image(15, 15, 'items', 3);
        //create score text object
        this.coinText = this.add.text(35, 8, 'Coins: 0', { fontSize: '16px', fill: '#fff' });
    }

    setupEvents() {
        //listen for updateCoin event from gameScene
        this.gameScene.events.on('updateCoins', (coins) => {
            this.coinText.setText(`Coins: ${coins}`);
        });
    }
}