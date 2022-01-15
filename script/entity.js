
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

        this.getType = this.getType.bind(this);
    }

    /**
     * Gets the type of entity.
     * 
     * @returns {string} Entity type
     */
    getType(){
        return this.entityType;
    }

}

module.exports = Entity;