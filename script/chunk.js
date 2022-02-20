
const dimensions = [64, 64];

const getRandomInt = require('./numUtilities').getRandomInt;

const posToIndex = (position) => {
    return Math.floor(position[1] * dimensions[0]) + Math.floor(position[0])
}

/**
 * Converts a sub-chunk pos into a global position based on the chunkPos (position of the chunk relative to other chunks)
 * 
 * @param {[number, number]} subPos 
 * @param {[number, number]} chunkPos 
 * @returns {[number, number]} worldPos
 */
const getWorldPos = (subPos, chunkPos)=>{
    return [subPos[0] + (chunkPos[0] * dimensions[0]), subPos[1] + (chunkPos[1] * dimensions[1])];
}

const tileDict = require('./tileDict.json');

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
        this.setBlock = this.setBlock.bind(this);
        this.addEntity = this.addEntity.bind(this);
        this.getShortJSON = this.getShortJSON.bind(this);
        this.randomWalkableTile = this.randomWalkableTile.bind(this);
        this.getJSON = this.getJSON.bind(this);
        this.getEntityData = this.getEntityData.bind(this);
        this.getTile = this.getTile.bind(this);
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
     * Changes a certain block.
     * 
     * @param {[number, number]} pos position of block within chunk 
     * @param {number} block block id
     */
    setBlock(pos, block){
        this.tileMap[posToIndex(pos)] = block;
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
     * Returns a random walkable tile from the chunk. If no walkable tile is found, it will return position [0, 0].
     * 
     * @returns {[number, number]} position of tile.
     */
    randomWalkableTile(){
        let maxAttempts = 100;
        for(let i = 0; i < maxAttempts; i++){
            let pos = [getRandomInt(0, dimensions[0]), getRandomInt(0, dimensions[1])];
            if(tileDict[this.getTile(pos)].collision === "floor"){
                return getWorldPos(pos, this.chunkPos);
            }
        }
        return getWorldPos([0, 0], this.chunkPos);
    }

    /**
     * Returns JSON representation of chunk.
     * @returns {tileMap: Array<number>, entityList: Array<Entity>, chunkPos: Array<number>} JSON representation of Chunk
     */
    getJSON(){
        
        return { tileMap: this.tileMap, chunkPos: this.chunkPos, id: `${this.chunkPos[0]}x${this.chunkPos[1]}`};
    }

    /**
     * Returns list of all entity data.
     * @returns {Array<Entity>}
     */
    getEntityData(){
        let eList = [];
        for (let i in this.entityList) {
            let e = this.entityList[i];
            eList.push({ type: e.getType(), position: e.position, id: e.id });
        }
        return eList;
    }

    /**
     * Gets a tile within the chunk based on position.
     * 
     * @param {[number, number]} position position of desired tile
     */
    getTile(position){
        return this.tileMap[posToIndex([Math.floor(position[0]), Math.floor(position[1])])];
    }
}

module.exports = Chunk;