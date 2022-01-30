const Chunk = require("./chunk.js");
const tileDict = require("./tileDict.json")

const chunkStorage = {};

const sampleMap = ()=>{
    let m = [];
    for (let i = 0; i < 4096; i++) {
        m.push((Math.floor(Math.random() * 10) > .5) ? 0 : 1);
    }
    return m;
};

const chunkPosToID = (pos)=>{
    return `${pos[0]}x${pos[1]}`;
}

const chunkIDToPos = (id)=>{
    return id.split('x').map((v) => {
        return parseFloat(v);
    });
}

/**
 * Handles everything to do with chunks.
 */
class ChunkManager{
    
    /**
     * Creates an instance of ChunkManager.
     */
    constructor(){
        this.loadedChunks = {};
        
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

        

        this.loadedChunks['0x0'] = new Chunk([0, 0], sampleMap(), {}, this);
    }

    update(deltaTime){
        for (let i in this.loadedChunks){
            this.loadedChunks[i].update(deltaTime);
        }
    }

    /**
     * Sends relevant chunk data to client.
     * 
     * @param {Client} client instance of client to update 
     * @returns {Object} data to send to client
     */
    updateClient(client){

        let lastChunk = client.updateChunks();

        if(lastChunk !== client.currentChunkID){
            this.switchPlayerChunk(client, lastChunk, client.currentChunkID);
        }

        let clientChunkData = [];

        for (let i in client.currentChunkIDs){
            let id = client.currentChunkIDs[i];
            // clientChunkData.push(this.loadChunk(id).getShortJSON()); put this back when optomizing
            clientChunkData.push(this.loadChunk(id).getJSON());
        }

        client.emitChunkData(clientChunkData);

    }

    /**
     * Adds a player game.
     * 
     * @param {Client} client instance of client holding the player and chunk info.
     */
    addPlayer(client){
        if(this.loadedChunks.hasOwnProperty(client.currentChunkID)){
            let chunk = this.loadedChunks[client.currentChunkID];
            chunk.entityList[client.id] = client.player;
            client.emitChunkData([chunk.getJSON()])
            client.player.setCollisionCallback(this.checkCollision);
        }
    }

    /**
     * Removes a player from game.
     * 
     * @param {Client} client instance of client holding the player and chunk info.
     */
    removePlayer(client){
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
    switchPlayerChunk(client, lastChunkID, nextChunkID){
        // console.log(`Chunk ${nextChunkID} ${(this.checkChunkExists(nextChunkID))? 'exists' : `doesn't exist`}.`);
        let nextChunk = this.loadChunk(nextChunkID);
        let lastChunk = this.loadChunk(lastChunkID);

        lastChunk.removeEntity(client.id);
        nextChunk.addEntity(client.player);
        client.emitChunkData(nextChunk.getJSON());
    }

    checkChunkExists(id){
        if(this.loadedChunks.hasOwnProperty(id)){
            return true;
        }
        if(chunkStorage.hasOwnProperty(id)){ //CHANGE THIS TO CHECK ACTUAL WORLD FILE
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
    createChunk(id){
        let pos = id.split('x').map((v)=>{
            return parseFloat(v);
        }) 
        return new Chunk(pos, sampleMap(), {}, this);
    }

    generateChunk(){

    }

    /**
     * Loads a chunk.
     * 
     * @param {string} id id of requested chunk
     * @returns {Chunk} loaded chunk
     */
    loadChunk(id){

        if(this.loadedChunks.hasOwnProperty(id)){
            // console.log(`WARNING. Chunk ${id} was attempted to load but was already loaded.`);
            return this.loadedChunks[id];
        }

        if(chunkStorage.hasOwnProperty(id)){
            this.loadedChunks[id] = chunkStorage[id];
        }else{
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
    unloadChunk(id){
        if(this.loadedChunks.hasOwnProperty(id)){
            delete this.loadedChunks[id];
        }
    }

    /**
     * Saves a chunk.
     * 
     * @param {Chunk} chunk chunk to be saved
     * @param {string} id id of chunk
     */
    saveChunk(chunk, id){
        //CHANGE TO ACTUALLY STORE IN FILE EVENTUALLY
        chunkStorage[id] = chunk;
    }

    /**
     * Checks whether a tile will cause a collision based on global position.
     * 
     * @param {[number, number]} position position of tile to check
     */
    checkCollision(position){
        let chunkPosition = [Math.floor(position[0] / 64), Math.floor(position[1]/64)];
        let chunkID = chunkPosToID(chunkPosition);
        let chunk = this.loadChunk(chunkID);
        let subPosition = [position[0] - chunkPosition[0] * 64, position[1] - chunkPosition[1] * 64] //position of tile within chunk
        let tile = chunk.getTile(subPosition);
        
        // console.log(subPosition);

        return (tileDict[`${tile}`] == 'wall');
    }
}

module.exports = ChunkManager;