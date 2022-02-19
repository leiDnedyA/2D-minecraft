const Chunk = require("./chunk.js");
const ChunkGeneration = require("./chunkGeneration.js");
const tileDict = require("./tileDict.json")
const ChunkMapUtilities = require("./chunkMapUtilities.js");

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

/**
 * Handles everything to do with chunks.
 */
class ChunkManager {

    /**
     * Creates an instance of ChunkManager.
     */
    constructor() {
        this.loadedChunks = {};
        this.loadedChunksLastUpdates = {}; //holds a Date.now() return at each loaded chunk's ID from the last time it was altered or when it was generated.

        this.update = this.update.bind(this);
        this.updateClient = this.updateClient.bind(this);
        this.addPlayer = this.addPlayer.bind(this);
        this.switchPlayerChunk = this.switchPlayerChunk.bind(this);
        this.removePlayer = this.removePlayer.bind(this);
        this.checkChunkExists = this.checkChunkExists.bind(this);
        this.createChunk = this.createChunk.bind(this);
        this.generateChunk = this.generateChunk.bind(this);
        this.loadChunk = this.loadChunk.bind(this);
        this.unloadChunk = this.unloadChunk.bind(this);
        this.saveChunk = this.saveChunk.bind(this);
        this.checkCollision = this.checkCollision.bind(this);
        this.solveCollision = this.solveCollision.bind(this);
        this.handleClick = this.handleClick.bind(this);


        this.loadedChunks['0x0'] = new Chunk([0, 0], newChunk('0x0'), {}, this);
        this.loadedChunksLastUpdates['0x0'] = Date.now();
    }

    update(deltaTime) {
        for (let i in this.loadedChunks) {
            this.loadedChunks[i].update(deltaTime);
        }
    }

    /**
     * Sends relevant chunk data to client.
     * 
     * @param {Client} client instance of client to update
     * @param {boolean} [sendAllChunks=false] true: sends data for all chunks, not just changed chunks
     * @returns {Object} data to send to client
     */
    updateClient(client, sendAllChunks = false) {

        let lastChunk = client.updateChunks();

        if (lastChunk !== client.currentChunkID) {
            this.switchPlayerChunk(client, lastChunk, client.currentChunkID);
        }

        let clientChunkData = [];
        let entities = [];

        if (sendAllChunks) {
            for (let i in client.currentChunkIDs) {
                let id = client.currentChunkIDs[i];
                let c = this.loadChunk(id);
                clientChunkData.push(c.getJSON());
                entities.push(...c.getEntityData());
            }
        } else {
            for (let i in client.currentChunkIDs) {
                let id = client.currentChunkIDs[i];
                let c = this.loadChunk(id);
                entities.push(...c.getEntityData());
                if (client.currentChunkLastUpdates[id] < this.loadedChunksLastUpdates[id] || client.currentChunkLastUpdates[id] == null) {
                    clientChunkData.push(c.getJSON());
                    client.currentChunkLastUpdates[id] = Date.now();
                }
            }
        }

        client.emitChunkData(clientChunkData);
        client.emitEntityData(entities);

    }

    /**
     * Adds a player game.
     * 
     * @param {Client} client instance of client holding the player and chunk info.
     */
    addPlayer(client) {
        if (this.loadedChunks.hasOwnProperty(client.currentChunkID)) {
            let chunk = this.loadedChunks[client.currentChunkID];
            chunk.entityList[client.id] = client.player;
            client.player.setCollisionCallback(this.solveCollision);
            client.setClickCallback(this.handleClick);
            this.updateClient(client, true);
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
        let nextChunk = this.loadChunk(nextChunkID);
        let lastChunk = this.loadChunk(lastChunkID);

        lastChunk.removeEntity(client.id);
        nextChunk.addEntity(client.player);
        this.updateClient(client, true)
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
     * @returns {Chunk} loaded chunk
     */
    loadChunk(id) {

        if (this.loadedChunks.hasOwnProperty(id)) {
            // console.log(`WARNING. Chunk ${id} was attempted to load but was already loaded.`);
            return this.loadedChunks[id];
        }

        this.loadedChunksLastUpdates[id] = Date.now();

        if (chunkStorage.hasOwnProperty(id)) {
            this.loadedChunks[id] = chunkStorage[id];
        } else {
            let chunk = this.createChunk(id);
            this.saveChunk(chunk, id);
            this.loadedChunks[id] = chunk;
        }
        return this.loadedChunks[id];
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
     * Saves a chunk.
     * 
     * @param {Chunk} chunk chunk to be saved
     * @param {string} id id of chunk
     */
    saveChunk(chunk, id) {
        //CHANGE TO ACTUALLY STORE IN FILE EVENTUALLY
        chunkStorage[id] = chunk;
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
        let chunk = this.loadChunk(chunkID);
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
                let chunk = this.loadChunk(chunkID);
                let subPosition = [pos[0] - chunkPosition[0] * 64, pos[1] - chunkPosition[1] * 64] //position of tile within chunk
                let tile = chunk.getTile(subPosition);

                if (tileDict[tile].collision === 'wall') {
                    return true;
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

                let chunk = this.loadChunk(chunkID);
                let subPos = [pos[0] % chunkDimensions[0], pos[1] % chunkDimensions[1]];

                for (let i in subPos) {
                    if (subPos[i] < 0) {
                        subPos[i] += chunkDimensions[i];
                    }
                }

                if (!(isLeftClick && chunk.getTile(subPos) === blockID) && !(!isLeftClick && chunk.getTile(subPos) === 0)) {
                    this.loadedChunksLastUpdates[chunkID] = Date.now();
                    if (isLeftClick) {
                        chunk.setBlock(subPos, blockID)
                    } else {
                        chunk.setBlock(subPos, 0)
                    }
                }
            }
        }
        }

}

module.exports = ChunkManager;