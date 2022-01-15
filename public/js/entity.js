
/**
 * The lowest level abstraction for any game object.
 */
class Entity{
    /**
     * Creates an entity.
     * @param {[number, number]} position [x, y] position of entity
     */
    constructor(position = [0, 0]){
        this.position = position;
    }
}