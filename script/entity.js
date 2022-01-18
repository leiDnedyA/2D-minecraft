
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

        this.update = this.update.bind(this);
        this.getType = this.getType.bind(this);
        this.setVelocity = this.setVelocity.bind(this);
        this.setTargetVelocity = this.setTargetVelocity.bind(this);
    }

    update(deltaTime){
        for (let i in this.velocity) {
            if (this.velocity[i] !== this.targetVelocity[i]) {
                this.velocity[i] = lerp(this.velocity[i], this.targetVelocity[i], .25);
            }
        }

        //eventually replace this part
        for (let i in this.position) {
            this.position[i] += this.velocity[i] * deltaTime * this.velocityMultiplier;
            // console.log(deltaTime);
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

}

module.exports = Entity;