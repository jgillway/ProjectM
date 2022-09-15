export default class GameMap {
  constructor(scene, key, tileSetName, backgroundLayerName, blockedLayerName) {
    // scene the map belongs to
    this.scene = scene;
    // Tiled JSON file key name
    this.key = key;
    // tiled tileset image key name
    this.tileSetName = tileSetName;
    // name of the layer in Tiled for map background
    this.backgroundLayerName = backgroundLayerName;
    // name of the layer in Tiled for the blocked areas
    this.blockedLayerName = blockedLayerName;

    this.createMap();
  }

  createMap() {
    // create tilemap
    this.tileMap = this.scene.make.tilemap({ key: this.key });

    // add tileset image to map
    this.tiles = this.tileMap.addTilesetImage(this.tileSetName, this.tileSetName, 32, 32, 1, 2);

    // create background layer
    this.backgroundLayer = this.tileMap.createStaticLayer(this.backgroundLayerName, this.tiles, 0, 0);
    this.backgroundLayer.setScale(2);

    // create blocked layer
    this.blockedLayer = this.tileMap.createLayer(this.blockedLayerName, this.tiles, 0, 0);
    this.blockedLayer.setScale(2);
    this.blockedLayer.setCollisionByExclusion([-1]);

    // update world bounds
    this.scene.physics.world.bounds.width = this.tileMap.widthInPixels * 2;
    this.scene.physics.world.bounds.height = this.tileMap.heightInPixels * 2;

    // limit camera to the size of our map
    this.scene.cameras.main.setBounds(0, 0, this.tileMap.widthInPixels * 2, this.tileMap.heightInPixels * 2);
  }
}
