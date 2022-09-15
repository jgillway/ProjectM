import * as Phaser from 'phaser';

export default class Chest extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y, key, frame, coins, id) {
    super(scene, x, y, key, frame);

    // store ref to scene
    this.scene = scene;
    // ammount of coins the chest contains
    this.coins = coins;
    this.id = id;

    // enable physics
    this.scene.physics.world.enable(this);
    // add chest to our existing scene
    this.scene.add.existing(this);
    // scale the schest game object
    this.setScale(2);
  }

  makeActive() {
    this.setActive(true);
    this.setVisible(true);
    this.body.checkCollision.none = false;
  }

  makeInactive() {
    this.setActive(false);
    this.setVisible(false);
    this.body.checkCollision.none = true;
  }
}
