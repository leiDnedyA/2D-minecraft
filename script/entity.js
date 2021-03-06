
const chunkMapUtilities = require('./chunkMapUtilities.js')

const worldPosToChunkID = chunkMapUtilities.worldPosToChunkID;

const lerp = (start, end, amt)=>{
    return (1-amt)*start+amt*end;
}



/**
 * The base of all Entities in the Entity Component System.
 */
class Entity{
    /**
     * Creates an entity.
     * 
     * @param {string} id Entity's unique id
     * @param {[number, number]} position position of entity 
     * @param {string} entityType Type of entity e.g: Player, Cow, Moose...
     */
    constructor(id, position, entityType="entity"){
        this.id = id;
        this.position = position;
        this.entityType = entityType;
        this.velocity = [0, 0];
        this.targetVelocity = [0, 0];
        this.velocityMultiplier = .5;

        this.collisionCallback;
        this.chunkSwitchCallback;

        this.update = this.update.bind(this);
        this.getType = this.getType.bind(this);
        this.setVelocity = this.setVelocity.bind(this);
        this.setTargetVelocity = this.setTargetVelocity.bind(this);
        this.setCollisionCallback = this.setCollisionCallback.bind(this);
    }

    update(deltaTime){
        for (let i in this.velocity) {
            if (this.velocity[i] !== this.targetVelocity[i]) {
                this.velocity[i] = lerp(this.velocity[i], this.targetVelocity[i], .25);
            }
        }

        let potentialPos = [0, 0]
        let startPos = this.position;
        let startChunkID = worldPosToChunkID(this.position);

        //eventually replace this part
        for (let i in potentialPos) {
            potentialPos[i] = this.position[i] + this.velocity[i] * deltaTime * this.velocityMultiplier;
            // console.log(deltaTime);
        }
        
        if(this.collisionCallback == null){
            this.position = potentialPos;
        }else{
            let collisionCheck = this.collisionCallback(potentialPos, this.position); 
            this.position = collisionCheck.position;
            for (let i in collisionCheck.collisionOccured){
                if (collisionCheck.collisionOccured[i]){
                    this.velocity[i] = 0;
                }
            }
        }

        let endChunkID = worldPosToChunkID(this.position);

        if(startChunkID !== endChunkID && this.entityType !== "Player" && this.chunkSwitchCallback != null){
            this.chunkSwitchCallback(this, startChunkID, endChunkID, startPos);
        }

    }

    /**
     * Gets the type of entity.
     * 
     * @returns {string} Entity type
     */
    getType(){
        return this.entityType;
    }

    /**
     * Sets new velocity for entity. (How fast the entity is moving, not how fast it can move)
     * 
     * @param {[number, number]} v [x, y] 
     */
    setVelocity(v){
        this.velocity = v;
    }

    /**
     * Sets new target velocity for entity for linear interpolation. (How fast the entity is moving, not how fast it can move)
     * 
     * @param {[number, number]} v [x, y] 
     */
    setTargetVelocity(v){
        this.targetVelocity = v;
    }

    /**
     * Checks whether or not a speicified tile will result in collision.
     * e.g function callback(position){
     *  return //true = don't walk, false = walk
     * }
     * 
     * @param {function} c function to check whether or not a specified tile will result in a collision 
     */
    setCollisionCallback(c){
        this.collisionCallback = c;
    }

    /**
     * Sets callback for when entity moves from one chunk to another.
     * 
     * function callback (entity, lastChunkID, nextChunkID, startPos){
     *  ... do magic here
     * }
     * 
     * @param {function} c 
     */
    setChunkSwitchCallback(c){
        this.chunkSwitchCallback = c;
    }

}

module.exports = Entity;