class GameManager {
    constructor(scene, mapData) {
        this.scene = scene;
        this.mapData = mapData;

        this.spawners = {};
        this.chests = {};
        this.monsters = {};
        this.players = {};
        
        this.playerLocations = [];
        this.chestLocations = {};
        this.monsterLocations = {};
    }

    setup() {
        this.parseMapData();
        this.setupEventListeners();
        this.setupSpawners();
        this.spawnPlayer();
    }

    parseMapData() {
        // parsing the Tiled map data
        this.mapData.forEach((layer)=> {
            if (layer.name === 'player_locations') {
                // go through all of the possible player spawn points
                layer.objects.forEach((obj) => {
                    this.playerLocations.push([obj.x + (obj.width / 2), obj.y - (obj.height / 2)]);
                });
            } else if (layer.name === 'chest_locations') {
                // go through all of the possible chest spawn points
                // store them as an object
                layer.objects.forEach((obj) => {
                    if (this.chestLocations[obj.properties.spawner]) {
                        this.chestLocations[obj.properties.spawner].push([obj.x + (obj.width / 2), obj.y - (obj.height / 2)]);
                    } else {
                        this.chestLocations[obj.properties.spawner] = [[obj.x + (obj.width / 2), obj.y - (obj.height / 2)]];
                    }
                });
            } else if (layer.name === 'monster_locations') {
                // go through all of the possible monster spawn points
                // store them as an object
                layer.objects.forEach((obj) => {
                    if (this.monsterLocations[obj.properties.spawner]) {
                        this.monsterLocations[obj.properties.spawner].push([obj.x + (obj.width / 2), obj.y - (obj.height / 2)]);
                    } else {
                    this.monsterLocations[obj.properties.spawner] = [[obj.x + (obj.width / 2), obj.y - (obj.height / 2)]];
                    }
                });
            }
        });
        //using utils to do it as not all mapping JSON format is like the above
       /* this.mapData.forEach((layer) => {
            if (layer.name === 'player_locations') {
                layer.objects.forEach((obj) => {
                    this.playerLocations.push([obj.x, obj.y]);
                });
            } else if (layer.name === 'chest_locations') {
                layer.objects.forEach((obj) => {
                    var spawner = getTiledProperty(obj, 'spawner');
                    if (this.chestLocations[spawner]) {
                        this.chestLocations[spawner].push([obj.x, obj.y]);
                    } else {
                        this.chestLocations[spawner] = [[obj.x, obj.y]];
                    }
                });
            } else if (layer.name === 'monster_locations') {
                layer.objects.forEach((obj) => {
                    var spawner = getTiledProperty(obj, 'spawner');
                    if (this.monsterLocations[spawner]) {
                        this.monsterLocations[spawner].push([obj.x, obj.y]);
                    } else {
                        this.monsterLocations[spawner] = [[obj.x, obj.y]];
                    }
                });
            }
        }); */
    }

    setupEventListeners() {
        this.scene.events.on('pickUpChest', (chestId, playerId) => {
            //Update the spawner
            if(this.chests[chestId]) {
                const { gold } = this.chests[chestId];

                //update gold
                this.players[playerId].updateGold(gold);
                this.scene.events.emit('updateCoins', this.players[playerId].gold);

                //remove the chest
                this.spawners[this.chests[chestId].spawnerId].removeObject(chestId);
                this.scene.events.emit('chestRemoved', chestId);
            }
        });

        this.scene.events.on('monsterAttacked', (monsterId, playerId) => {
            //Update the spawner
            if(this.monsters[monsterId]) {
                const { gold, attack } = this.monsters[monsterId];

                //subtract health from monster model
                this.monsters[monsterId].loseHealth();

                //check if monster is dead and if so remove object
                if(this.monsters[monsterId].health <= 0) {
                    //update players gold
                    this.players[playerId].updateGold(gold);
                    this.scene.events.emit('updateCoins', this.players[playerId].gold);

                    //remove the monster
                    this.spawners[this.monsters[monsterId].spawnerId].removeObject(monsterId);
                    this.scene.events.emit('monsterDestroyed', monsterId);

                    //add bonus health to player
                    this.players[playerId].updateHealth(2);
                    this.scene.events.emit('updatePlayerHealth', playerId, this.players[playerId].health);
                }
                else {
                    //update players health
                    this.players[playerId].updateHealth(-attack);
                    this.scene.events.emit('updatePlayerHealth', playerId, this.players[playerId].health);

                    //update monsters health
                    this.scene.events.emit('updateMonsterHealth', monsterId, this.monsters[monsterId].health);

                    //check if players health is below or equal to 0 and if so respawn
                    if(this.players[playerId].health <= 0) {
                        //update the gold to half
                        this.players[playerId].updateGold(parseInt(-this.players[playerId].gold /2), 10);
                        this.scene.events.emit('updateCoins', this.players[playerId].gold);

                        //respawn player
                        this.players[playerId].respawn();
                        this.scene.events.emit('respawnPlayer', this.players[playerId]);
                    }
                }
            }
        });
    }

    setupSpawners() {
        var spawner;
        //create chest spawners
        Object.keys(this.chestLocations).forEach((key) => {
            const config = {
                spawnInterval: 3000,
                limit: 3,
                spawnerType: SpawnerType.CHEST,
                id: `chest-${key}`,
            };

            spawner = new Spawner(
                config,
                this.chestLocations[key],
                this.addChest.bind(this),
                this.deleteChest.bind(this)
            );
            this.spawners[spawner.id] = spawner;
        });

        //create monster spawners
        Object.keys(this.monsterLocations).forEach((key) => {
            const config = {
                spawnInterval: 3000,
                limit: 3,
                spawnerType: SpawnerType.MONSTER,
                id: `monster-${key}`,
            };

            spawner = new Spawner(
                config,
                this.monsterLocations[key],
                this.addMonster.bind(this),
                this.deleteMonster.bind(this),
                this.moveMonsters.bind(this)
            );
            this.spawners[spawner.id] = spawner;
        });
    }

    spawnPlayer() {
        const player = new PlayerModel(this.playerLocations);
        this.players[player.id] = player;
        this.scene.events.emit('spawnPlayer', player);
    }

    addChest(chestId, chest) {
        this.chests[chestId] = chest;
        this.scene.events.emit('chestSpawned', chest);
    }

    deleteChest(chestId) {
        delete this.chests[chestId];
    }

    addMonster(monsterId, monster) {
        this.monsters[monsterId] = monster;
        this.scene.events.emit('monsterSpawned', monster);
    }

    moveMonsters() {
        this.scene.events.emit('monsterMovement', this.monsters);
    }

    deleteMonster(monsterId) {
        delete this.monsters[monsterId];
    }
}