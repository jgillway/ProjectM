class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  init() {
    // launch allows 2 scenes to run at the same time where start shuts one down
    this.scene.launch('HUD');
  }

  create() {
    this.createMap();
    this.createAudio();
    this.createGroups();
    this.createInput();
    this.createGameManager();
  }

  createAudio() {
    // create audio
    this.goldPickupAudio = this.sound.add('goldSound', { loop: false, volume: 0.3 });
    this.playerAttackAudio = this.sound.add('playerAttack', { loop: false, volume: 0.1 });
    this.playerDamageAudio = this.sound.add('playerDamage', { loop: false, volume: 0.2 });
    this.playerDeathAudio = this.sound.add('playerDeath', { loop: false, volume: 0.2 });
    this.monsterDeathAudio = this.sound.add('enemyDeath', { loop: false, volume: 0.2 });
  }

  createPlayer(playerObject) {
    // create player
    this.player = new PlayerContainer(
      this,
      playerObject.x * 2,
      playerObject.y * 2,
      'characters',
      0,
      playerObject.health,
      playerObject.maxHealth,
      playerObject.id,
      this.playerAttackAudio,
    );
  }

  createGroups() {
    // create chest group
    this.chests = this.physics.add.group();

    // create monster group
    this.monsters = this.physics.add.group();
    this.monsters.runChildUpdate = true;
  }

  spawnChest(chestObject) {
    // loop through chests group object and get the first inactive object array if none returns null
    let chest = this.chests.getFirstDead();

    if (!chest) {
      // create chest
      chest = new Chest(this, chestObject.x * 2, chestObject.y * 2, 'items', 0, chestObject.gold, chestObject.id);
      // add new chest to chests group
      this.chests.add(chest);
    } else {
      chest.coins = chestObject.gold;
      chest.id = chestObject.id;
      chest.setPosition(chestObject.x * 2, chestObject.y * 2);
      chest.makeActive();
    }
  }

  spawnMonster(monsterObject) {
    // loop through chests group object and get the first inactive object array if none returns null
    let monster = this.monsters.getFirstDead();

    if (!monster) {
      // create monster
      monster = new Monster(this, monsterObject.x, monsterObject.y, 'monsters', monsterObject.frame, monsterObject.id, monsterObject.health, monsterObject.maxHealth);
      // add new monster to monsters group
      this.monsters.add(monster);
    } else {
      monster.id = monsterObject.id;
      monster.health = monsterObject.health;
      monster.maxHealth = monsterObject.maxHealth;
      monster.setTexture('monsters', monsterObject.frame);
      monster.setPosition(monsterObject.x, monsterObject.y);
      monster.makeActive();
    }
  }

  createInput() {
    // create player movement cursors
    this.cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });
  }

  addCollisions() {
    // collision with player and the Tiled blockedLayer
    this.physics.add.collider(this.player, this.map.blockedLayer);

    // overlap with player and chest
    this.physics.add.overlap(this.player, this.chests, this.collectChest, null, this);

    // collision with monster group and the Tiled blockedLayer
    this.physics.add.collider(this.monsters, this.map.blockedLayer);

    // overlap with player weapon and monsters in monsters group
    this.physics.add.overlap(this.player.weapon, this.monsters, this.enemyOverlap, null, this);
  }

  update() {
    if (this.player) {
      this.player.update(this.cursors);
    }
  }

  collectChest(player, chest) {
    // play gold pickup audio
    this.goldPickupAudio.play();

    this.events.emit('pickUpChest', chest.id, player.id);
  }

  enemyOverlap(weapon, enemy) {
    if (this.player.playerAttacking && !this.player.weaponHit) {
      this.player.weaponHit = true;
      this.events.emit('monsterAttacked', enemy.id, this.player.id);
    }
  }

  createMap() {
    this.map = new Map(this, 'map', 'background', 'background', 'blocked');
  }

  createGameManager() {
    this.events.on('spawnPlayer', (playerObject) => {
      this.createPlayer(playerObject);
      this.addCollisions();
    });

    this.events.on('chestSpawned', (chest) => {
      this.spawnChest(chest);
    });

    this.events.on('chestRemoved', (chestId) => {
      this.chests.getChildren().forEach((chest) => {
        if (chest.id === chestId) {
          chest.makeInactive();
        }
      });
    });

    this.events.on('monsterSpawned', (monster) => {
      this.spawnMonster(monster);
    });

    this.events.on('monsterMovement', (monsters) => {
      this.monsters.getChildren().forEach((monster) => {
        Object.keys(monsters).forEach((monsterId) => {
          if (monster.id === monsterId) {
            this.physics.moveToObject(monster, monsters[monsterId], 40);
          }
        });
      });
    });

    this.events.on('monsterDestroyed', (monsterId) => {
      this.monsters.getChildren().forEach((monster) => {
        if (monster.id === monsterId) {
          monster.makeInactive();
          this.monsterDeathAudio.play();
        }
      });
    });

    this.events.on('updateMonsterHealth', (monsterId, health) => {
      this.monsters.getChildren().forEach((monster) => {
        if (monster.id === monsterId) {
          monster.updateHealth(health);
        }
      });
    });

    this.events.on('updatePlayerHealth', (playerId, health) => {
      if (health < this.player.health) {
        this.playerDamageAudio.play();
      }
      this.player.updateHealth(health);
    });

    this.events.on('respawnPlayer', (playerObject) => {
      this.playerDeathAudio.play();
      this.player.respawn(playerObject);
    });

    this.gameManager = new GameManager(this, this.map.map.objects);
    this.gameManager.setup();
  }
}
