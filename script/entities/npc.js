
const Entity = require('../entity.js');

/**
 * A simple character that wanders around aimlessly.
 */
class NPC extends Entity{
    /**
     * Creates an instance of NPC.
     * 
     * @param {string} id 
     * @param {[number, number]} position 
     * @param {string} name 
     */
    constructor(id, position, name = "npc"){
        super(id, position, "NPC");
    
        this.update = this.update.bind(this);
    }

    /**
     * Standardized update function.
     * 
     * @param {number} deltaTime 
     */
    update(deltaTime){
        if(Math.random() > .95){
            this.velocity[(Math.random() > .5) ? 0 : 1] = Math.random();
        }
        super.update(deltaTime);
    }
}

module.exports = NPC;