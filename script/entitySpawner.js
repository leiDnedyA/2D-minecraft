const NPC = require("./entities/npc.js");
const generateUID = require("./uidTools.js").generateUID;
const getRandomInt = require('./numUtilities.js').getRandomInt;

const maxEntitiesPerChunk = 4;

/**
 * Handles all entity spawning and despawning for a chunkManager.
 */
class EntitySpawner{
    /**
     * Creates an instance of EntitySpawner.
     *   
     * @param {function} addEntityCallback callback to add entity to world.
     * @param {function} removeEntityCallback callback to remove entity from world.
     * @param {Object} loadedChunks Object containing currently loaded chunks
     */
    constructor(addEntityCallback, removeEntityCallback, loadedChunks){
        this.addEntity = addEntityCallback;
        this.removeEntity = removeEntityCallback;
        this.loadedChunks = loadedChunks;

        this.update = this.update.bind(this);
    }

    update(deltaTime){

        for(let i in this.loadedChunks){

            let chunk = this.loadedChunks[i];

            let containsPlayer = false;
            let npcCount = 0;

            for(let j in chunk.entityList){
                let e = chunk.entityList[j];
                if(e.entityType === "Player"){
                    containsPlayer = true;
                }else{
                    npcCount++;
                }
            }

            if(!containsPlayer){
                chunk.entityList = {}
            }else if(npcCount < maxEntitiesPerChunk && Math.random() > .9){
                let worldPos = chunk.randomWalkableTile();
                let entity = new NPC(generateUID(), worldPos, 'npc')
                this.addEntity(entity);
            }

        }

    }
    
}

module.exports = EntitySpawner;