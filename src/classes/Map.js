class Map {
    constructor (scene, key, tileSetName, backgroundLayerName, blockedLayerName) {
        //scene the map belongs to
        this.scene = scene;
        //Tiled JSON file key name
        this.key = key;
        //tiled tileset image key name
        this.tileSetName = tileSetName;
        //name of the layer in Tiled for map background
        this.backgroundLayerName = backgroundLayerName;
        //name of the layer in Tiled for the blocked areas
        this.blockedLayerName = blockedLayerName;

        this.createMap();
    }

    createMap() {
        //create tilemap
        this.map = this.scene.make.tilemap({ key: this.key });

        //add tileset image to map 
        this.tiles = this.map.addTilesetImage(this.tileSetName, this.tileSetName, 32, 32, 1, 2);

        //create background layer
        this.backgroundLayer = this.map.createStaticLayer(this.backgroundLayerName, this.tiles, 0, 0);
        this.backgroundLayer.setScale(2);

        //create blocked layer
        this.blockedLayer = this.map.createLayer(this.blockedLayerName, this.tiles, 0, 0);
        this.blockedLayer.setScale(2);
        this.blockedLayer.setCollisionByExclusion([-1]);

        //update world bounds
        this.scene.physics.world.bounds.width = this.map.widthInPixels * 2;
        this.scene.physics.world.bounds.height = this.map.heightInPixels * 2;

        //limit camera to the size of our map 
        this.scene.cameras.main.setBounds(0, 0, this.map.widthInPixels * 2, this.map.heightInPixels * 2);
    }
}