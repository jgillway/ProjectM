class Player extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y, key, frame) {
        super(scene, x, y, key, frame);

        //store ref to scene
        this.scene = scene;
   

        //enable physics
        this.scene.physics.world.enable(this);
        //set immovable if another object collides
        this.setImmovable(true);
        //scale player
        this.setScale(2);
        //add player to our existing scene
        this.scene.add.existing(this);
    }
}