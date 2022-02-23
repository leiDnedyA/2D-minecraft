const Chunk = require("./chunk.js");
const ChunkGeneration = require("./chunkGeneration.js");
const tileDict = require("./tileDict.json")
const ChunkMapUtilities = require("./chunkMapUtilities.js");
const EntitySpawner = require("./entitySpawner.js");
const NPC = require("./entities/npc.js");
const DatabaseManager = require("./databaseManager");

const chunkStorage = {};

const chunkDimensions = ChunkMapUtilities.chunkDimensions;

const posToIndex = ChunkMapUtilities.posToIndex;
const indexToPos = ChunkMapUtilities.indexToPos;

// UNCOMMENT ONE OF THESE VVV

// VVV Random noise chunk
// const newChunk = ChunkGeneration.generateNoise;

// VVV Chunk based on a walker
const newChunk = ChunkGeneration.generateWithWalker;


const chunkPosToID = (pos) => {
    return `${pos[0]}x${pos[1]}`;
}

const chunkIDToPos = (id) => {
    return id.split('x').map((v) => {
        return parseFloat(v);
    });
}

const getChunkPos = (pos) =>{
    return [Math.floor(pos[0]/64), Math.floor(pos[1]/64)];
}

/**
 * Handles everything to do with chunks.
 */
class ChunkManager {

    /**
     * Creates an instance of ChunkManager.
     */
    constructor() {
        this.loadedChunks = {};
        this.processedChunks = {}; //holds a boolean at a key of every object that's had its loading started.
        this.loadedChunksLastUpdates = {}; //holds a Date.now() return at each loaded chunk's ID from the last time it was altered or when it was generated.

        this.globalEntities = {};

        this.clientsToUpdate = []; //clients awaiting chunk loading
        this.entitiesToAdd = []; //entities awaiting chunk loading

        this.update = this.update.bind(this);
        this.updateClient = this.updateClient.bind(this);
        this.addPlayer = this.addPlayer.bind(this);
        this.addEntity = this.addEntity.bind(this);
        this.switchPlayerChunk = this.switchPlayerChunk.bind(this);
        this.removePlayer = this.removePlayer.bind(this);
        this.checkChunkExists = this.checkChunkExists.bind(this);
        this.createChunk = this.createChunk.bind(this);
        this.generateChunk = this.generateChunk.bind(this);
        this.loadChunk = this.loadChunk.bind(this);
        this.unloadChunk = this.unloadChunk.bind(this);
        this.checkCollision = this.checkCollision.bind(this);
        this.solveCollision = this.solveCollision.bind(this);
        this.handleClick = this.handleClick.bind(this);

        this.entitySpawner = new EntitySpawner(this.addEntity, this.removeEntity, this.loadedChunks);
        this.databaseManager = new DatabaseManager(this);

        this.loadChunk('0x0');
    }

    update(deltaTime) {
        this.entitySpawner.update(deltaTime);
        
        for (let i in this.loadedChunks) {
            this.loadedChunks[i].update(deltaTime);
        }

        for(let i in this.clientsToUpdate){
            let finished = this.updateClient(this.clientsToUpdate[i], true);
            if(finished){
                this.clientsToUpdate.splice(i, 1);
            }
        }

        for(let i in this.entitiesToAdd){
            let finished = this.addEntity(this.entitiesToAdd[i]);
            if(finished){
                this.entitiesToAdd.splice(i, 1);
            }
        }

    }

    /**
     * Sends relevant chunk data to client.
     * 
     * @param {Client} client instance of client to update
     * @param {boolean} [sendAllChunks=false] true: sends data for all chunks, not just changed chunks
     * @returns {Boolean} whether or not all chunks could be sent to client
     */
    updateClient(client, sendAllChunks = false) {

        let lastChunk = client.updateChunks();

        if (lastChunk !== client.currentChunkID) {
            this.switchPlayerChunk(client, lastChunk, client.currentChunkID);
        }

        let clientChunkData = [];
        let entities = [];

        let finished = true;

        if (sendAllChunks) {
            for (let i in client.currentChunkIDs) {
                let id = client.currentChunkIDs[i];
                if(this.loadedChunks.hasOwnProperty(id)){
                    let c = this.loadedChunks[id];
                    clientChunkData.push(c.getJSON());
                    entities.push(...c.getEntityData());
                }else{
                    this.loadChunk(id);
                    finished = false;
                }
            }
        } else {
            for (let i in client.currentChunkIDs) {
                let id = client.currentChunkIDs[i];
                if(this.loadedChunks.hasOwnProperty(id)){
                    let c = this.loadedChunks[id];
                    entities.push(...c.getEntityData());
                    if (client.currentChunkLastUpdates[id] < this.loadedChunksLastUpdates[id] || client.currentChunkLastUpdates[id] == null) {
                        clientChunkData.push(c.getJSON());
                        client.currentChunkLastUpdates[id] = Date.now();
                    }
                }else{
                    this.loadChunk(id);
                    finished = false;
                }
            }
        }

        client.emitChunkData(clientChunkData);
        client.emitEntityData(entities);

        return finished;

    }

    /**
     * Adds a player game.
     * 
     * @param {Client} client instance of client holding the player and chunk info.
     */
    addPlayer(client) {
        if (this.loadedChunks.hasOwnProperty(client.currentChunkID)) {
            let chunk = this.loadedChunks[client.currentChunkID];
            chunk.addEntity(client.player);
            client.player.setCollisionCallback(this.solveCollision);
            client.setClickCallback(this.handleClick);
            let updated = this.updateClient(client, true);
            if(!updated){
                this.clientsToUpdate.push(client);
            }
        }
    }

    /**
     * Adds an entity to chunk based on entity's position.
     * 
     * 
     * @param {Entity} entity 
     * @returns {Boolean} whether or not the action finished
     */
    addEntity(entity){
        let chunkID = chunkPosToID(getChunkPos(entity.position));

        if(this.loadedChunks.hasOwnProperty(chunkID)){
            entity.setCollisionCallback(this.solveCollision);
            this.loadedChunks[chunkID].addEntity(entity);
            return true;
        }else{
            this.loadChunk(chunkID);
            this.entitiesToAdd.push(entity);
            return false;
        }
    }

    removeEntity(id, chunkID){
        if(this.loadedChunks.hasOwnProperty(chunkID)){
            this.loadedChunks[chunkID].removeEntity(id);
        }
    }

    /**
     * Removes a player from game.
     * 
     * @param {Client} client instance of client holding the player and chunk info.
     */
    removePlayer(client) {
        if (this.loadedChunks.hasOwnProperty(client.currentChunkID)) {
            let chunk = this.loadedChunks[client.currentChunkID];
            delete chunk.entityList[client.id];
        }
    }

    /**
     * Takes a player from one chunk and moves it to another.
     * 
     * @param {Client} client instance of client.
     * @param {string} lastChunkID id of previous chunk.
     * @param {string} nextChunkID id of next chunk.
     */
    switchPlayerChunk(client, lastChunkID, nextChunkID) {
        // console.log(`Chunk ${nextChunkID} ${(this.checkChunkExists(nextChunkID))? 'exists' : `doesn't exist`}.`);
        let nextChunk = this.loadedChunks[nextChunkID];
        let lastChunk = this.loadedChunks[lastChunkID];

        lastChunk.removeEntity(client.id);
        nextChunk.addEntity(client.player);
        let updated = this.updateClient(client, true);
        if (!updated) {
            this.clientsToUpdate.push(client);
        }
    }

    checkChunkExists(id) {
        if (this.loadedChunks.hasOwnProperty(id)) {
            return true;
        }
        if (chunkStorage.hasOwnProperty(id)) { //CHANGE THIS TO CHECK ACTUAL WORLD FILE
            return true;
        }
        return false;
    }

    /**
     * Creates a chunk.
     * 
     * @param {string} id chunk ID
     * @returns {Chunk} chunk created.
     */
    createChunk(id) {
        let pos = id.split('x').map((v) => {
            return parseFloat(v);
        })
        return new Chunk(pos, newChunk(id), {}, this);
    }

    generateChunk() {

    }

    /**
     * Loads a chunk.
     * 
     * @param {string} id id of requested chunk
     * @param {function} callback called after chunk is loaded
     */
    loadChunk(id, callback) {


        if (this.loadedChunks.hasOwnProperty(id) || this.processedChunks.hasOwnProperty(id)) return;

        this.processedChunks[id] = true;

        this.databaseManager.loadOrCreateChunk(id, (chunk) => { this.loadedChunks[id] = chunk }, this.createChunk, callback);

        this.loadedChunksLastUpdates[id] = Date.now();


    }

    /**
     * Unloads a chunk.
     * 
     * @param {string} id id of chunk to unload. 
     */
    unloadChunk(id) {
        if (this.loadedChunks.hasOwnProperty(id)) {
            delete this.loadedChunks[id];
        }
    }

    /**
     * [USE solveCollision] Checks whether a tile will cause a collision based on global position.
     * 
     * @param {[number, number]} position position of tile to check
     * @returns {boolean} true: collision occured
     */
    checkCollision(position) {
        let chunkPosition = [Math.floor(position[0] / 64), Math.floor(position[1] / 64)];
        let chunkID = chunkPosToID(chunkPosition);
        
        if(this.loadedChunks.hasOwnProperty(chunkID)){

            let chunk = this.loadedChunks[chunkID];

            let subPosition = [position[0] - chunkPosition[0] * 64, position[1] - chunkPosition[1] * 64] //position of tile within chunk
            let tile = chunk.getTile(subPosition);

            /**
                     * give represents the 'wiggle room' given to the entity to solve 
                     * the problem of hallways being impossible to go down
                     */
            let give = .07;

            let floorGive = num => (Math.floor(num + give))
            let ceilGive = num => (Math.ceil(num - give));

            //represents which tile each corner of a 1x1 entity at the position parameter will be in
            let corners = {
                'top': {
                    'left': [floorGive(position[0]), floorGive(position[1])],
                    'right': [ceilGive(position[0]), floorGive(position[1])]
                },
                'bottom': {
                    left: [floorGive(position[0]), ceilGive(position[1])],
                    right: [ceilGive(position[0]), ceilGive(position[1])]
                }
            }

            for (let i in corners) {
                for (let j in corners[i]) {
                    let pos = corners[i][j];

                    let chunkPosition = [Math.floor(pos[0] / 64), Math.floor(pos[1] / 64)];
                    let chunkID = chunkPosToID(chunkPosition);
                    if (this.loadedChunks.hasOwnProperty(chunkID)) {
                        let chunk = this.loadedChunks[chunkID];
                        let subPosition = [pos[0] - chunkPosition[0] * 64, pos[1] - chunkPosition[1] * 64] //position of tile within chunk
                        let tile = chunk.getTile(subPosition);

                        if (tileDict[tile].collision === 'wall') {
                            return true;
                        }
                    } else {
                        return false;
                    }

                }
            }
        }

        return false;
    }

    /**
     * Checks for collisions and outputs where the entity should go.
     * 
     * @param {[number, number]} potentialPos Position that entity would move to in the case of no collision.
     * @param {[number, number]} currentPos Current position of entity.
     * @returns {{position: [number, number], collisionOccured: [boolean, boolean]}}
     */
    solveCollision(potentialPos, currentPos) {

        let result = {
            position: potentialPos,
            collisionOccured: [false, false]
        }


        //checks for collisions in both directions
        if (this.checkCollision([potentialPos[0], currentPos[1]])) {

            result.collisionOccured[0] = true;

            if (potentialPos[0] > currentPos[0]) {
                let ceilPos = Math.ceil(currentPos[0])
                result.position[0] = (this.checkCollision([ceilPos, currentPos[1]])) ? currentPos[0] : ceilPos;

            } else {
                let floorPos = Math.floor(currentPos[0]);
                result.position[0] = (this.checkCollision([floorPos, currentPos[1]])) ? currentPos[0] : floorPos;

            }

        }

        if (this.checkCollision([currentPos[0], potentialPos[1]])) {
            result.collisionOccured[1] = true;
            if (potentialPos[1] > currentPos[1]) {
                let ceilPos = Math.ceil(currentPos[1])
                result.position[1] = (this.checkCollision([currentPos[0], ceilPos])) ? currentPos[1] : ceilPos;
            } else {
                let floorPos = Math.floor(currentPos[1])
                result.position[1] = (this.checkCollision([currentPos[0], floorPos])) ? currentPos[1] : floorPos;
            }
        }

        /**
         * If this evaluates to true, the player is walking into a corner.
         * This section will round the player's position in whichever direction it's moving fastest.
         */
        if (this.checkCollision(result.position)) {
            // result.position = currentPos;

            if (Math.abs(potentialPos[0] - currentPos[0]) > Math.abs(potentialPos[1] - currentPos[1])) {
                // //move horizontally
                // if (potentialPos[0] > currentPos[0]) {
                //     // let ceilPos = Math.ceil(currentPos[0])
                //     result.position[0] = (this.checkCollision([ceilPos, currentPos[1]])) ? currentPos[0] : ceilPos;

                // } else {
                //     let floorPos = Math.floor(currentPos[0]);
                //     result.position[0] = (this.checkCollision([floorPos, currentPos[1]])) ? currentPos[0] : floorPos;
                // }
                result.position = [potentialPos[0], currentPos[1]];
            } else {
                // if (potentialPos[1] > currentPos[1]) {
                //     let ceilPos = Math.ceil(currentPos[1])
                //     result.position[1] = (this.checkCollision([currentPos[0], ceilPos])) ? currentPos[1] : ceilPos;
                // } else {
                //     let floorPos = Math.floor(currentPos[1])
                //     result.position[1] = (this.checkCollision([currentPos[0], floorPos])) ? currentPos[1] : floorPos;
                // }
                result.position = [currentPos[0], potentialPos[1]];
            }

        }

        return result
    }

    /**
     * Handles clicks/block interactions.
     * 
     * @param {Player} player 
     * @param {boolean} isLeftClick 
     * @param {[number, number]} pos 
     * @param {number} blockID
     */
    handleClick(player, isLeftClick, pos, blockID = 1) {

        let maxDistance = 7;

        if(tileDict.hasOwnProperty(blockID)){
            if (Math.abs(player.position[0] - pos[0]) < maxDistance && Math.abs(player.position[1] - pos[1]) < maxDistance) {

                let chunkID = chunkPosToID([Math.floor(pos[0] / chunkDimensions[0]), Math.floor(pos[1] / chunkDimensions[1])]);

                if(this.loadedChunks.hasOwnProperty(chunkID)){

                    let chunk = this.loadedChunks[chunkID];
                    let subPos = [pos[0] % chunkDimensions[0], pos[1] % chunkDimensions[1]];

                    for (let i in subPos) {
                        if (subPos[i] < 0) {
                            subPos[i] += chunkDimensions[i];
                        }
                    }

                    if (!(isLeftClick && chunk.getTile(subPos) === blockID) && !(!isLeftClick && chunk.getTile(subPos) === 0)) {
                        this.loadedChunksLastUpdates[chunkID] = Date.now();

                        let changed = false;

                        if (isLeftClick) {
                            chunk.setBlock(subPos, blockID)
                            changed = true;
                        } else {
                            chunk.setBlock(subPos, 0)
                            changed = true;
                        }

                        if(changed){
                            this.databaseManager.updateChunk(chunk);
                        }
                    }
                }
            }
        }
        }

}

module.exports = ChunkManager;