
const Entity = require("./entity.js");
const CharController = require("./charController.js");

/**
 * ECS representation of a Player in the world.
 */
class Player extends Entity{
    /**
     * Creates a player.
     * 
     * @param {string} id Unique id string
     * @param {string} username Username string
     * @param {[number, number]} position Position of player
     */
    constructor(id, username, position = [0, 0]){
        super(id, position, 'Player');
        this.username = username;
        this.charController = new CharController(this);
        this.speedMultiplier = 2;
    
        this.update = this.update.bind(this);
    }

    update(deltaTime){
        super.update(deltaTime);
        this.charController.update(deltaTime);

        
    }
}

module.exports = Player;