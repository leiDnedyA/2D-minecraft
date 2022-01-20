
/**
 * Holds information about and handles events within an individual chunk.
 */
class Chunk {

    /**
     * Creates a chunk.
     * 
     * @param {[number, number]} chunkPos NOT WORLD POS, position relative to other chunks 
     * @param {Array<number>} tileMap tilemap with width and height assumed to be 64 
     * @param {Array<Entity>} entityList list of entities within the chunk
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
        this.getJSON = this.getJSON.bind(this);
    }

    update(deltaTime){
        for(let i in this.entityList){
            this.entityList[i].update(deltaTime);
        }
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
        this.lastJSON = {tileMap: this.tileMap, entityList: eList, chunkPos: this.chunkPos};
        return this.lastJSON;
    }
}

module.exports = Chunk;