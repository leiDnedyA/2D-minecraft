
/**
 * Holds information about and handles events within an individual chunk.
 */
class Chunk {

    /**
     * Creates a chunk.
     * 
     * @param {[number, number]} chunkPos NOT WORLD POS, position relative to other chunks 
     * @param {Array<number>} tileMap tilemap with width and height assumed to be 64 
     * @param {Object<Entity>} entityList list of entities within the chunk
     * @param {ChunkManager} manager instance of chunk manager for callback purposes
     * 
     */
    constructor(chunkPos, tileMap, entityList, manager){
        this.chunkPos = chunkPos;
        this.tileMap = tileMap;
        this.entityList = entityList;
        this.manager = manager;
        this.lastJSON = {};

        this.update = this.update.bind(this);
        this.removeEntity = this.removeEntity.bind(this);
        this.addEntity = this.addEntity.bind(this);
        this.getShortJSON = this.getShortJSON.bind(this);
        this.getJSON = this.getJSON.bind(this);
    }

    update(deltaTime){
        for(let i in this.entityList){
            this.entityList[i].update(deltaTime);
        }
    }

    /**
     * Removes an entity from the chunk.
     * 
     * @param {string} id id of entity to remove
     */
    removeEntity(id){
        if(this.entityList.hasOwnProperty(id)){
            delete this.entityList[id];
        }else{
            console.log(`WARNING: removal of entity at chunk [${this.chunkPos[0]}, ${this.chunkPos[1]}] failed because there is no entity with the requested ID`);
        }
    }

    /**
     * Adds an entity to the chunk.
     * 
     * @param {Entity} entity instance of entity to add
     */
    addEntity(entity){
        if (!this.entityList.hasOwnProperty(entity.id)) {
            this.entityList[entity.id] = entity;
        } else {
            console.log(`WARNING: addition of entity at chunk [${this.chunkPos[0]}, ${this.chunkPos[1]}] failed because there is already entity with the requested ID`);
        }
    }

    /**
     * Returns JSON representation of chunk containing entities and tileMap changes, but not the entire tileMap.
     * @returns {mapChanges: Array<Object>, entityList: Array<Entity>, chunkPos: Array<number>}
     */
    getShortJSON(){
        let eList = [];
        for (let i in this.entityList) {
            let e = this.entityList[i];
            eList.push({ type: e.getType(), position: e.position, id: e.id });
        }
        return { mapChanges: [], entityList: eList, chunkPos: this.chunkPos };
        
    }

    /**
     * Returns JSON representation of chunk.
     * @returns {tileMap: Array<number>, entityList: Array<Entity>, chunkPos: Array<number>} JSON representation of Chunk
     */
    getJSON(){
        let eList = [];
        for(let i in this.entityList){
            let e = this.entityList[i];
            eList.push({type: e.getType(), position: e.position, id: e.id});
        }
        return { tileMap: this.tileMap, entityList: eList, chunkPos: this.chunkPos };
    }
}

module.exports = Chunk;