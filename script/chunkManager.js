const Chunk = require("./chunk.js");

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
        this.removePlayer = this.removePlayer.bind(this);
        this.checkChunkExists = this.checkChunkExists.bind(this);
        this.createChunk = this.createChunk.bind(this);
        this.generateChunk = this.generateChunk.bind(this);
        this.loadChunk = this.loadChunk.bind(this);
        this.unloadChunk = this.unloadChunk.bind(this);
        this.saveChunk = this.saveChunk.bind(this);

        let sampleMap = [];
        for(let i = 0; i < 64; i++){
            sampleMap.push(0);
        }

        this.loadedChunks['0x0'] = new Chunk([0, 0], sampleMap, {}, this);
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
        client.updateChunks();

        for (let i in client.currentChunkIDs){
            let id = client.currentChunkIDs[i];

            if (this.loadedChunks.hasOwnProperty(id)){
                client.emitChunkData(this.loadedChunks[id].getJSON());
            }else if(this.checkChunkExists(id)){

            }
        }

    }

    /**
     * Adds a player to a chunk based on a Client instance.
     * 
     * @param {Client} client instance of client holding the player and chunk info.
     */
    addPlayer(client){
        if(this.loadedChunks.hasOwnProperty(client.currentChunkID)){
            let chunk = this.loadedChunks[client.currentChunkID];
            chunk.entityList[client.id] = client.player;
        }
    }

    /**
     * Removes a player to a chunk based on a Client instance.
     * 
     * @param {Client} client instance of client holding the player and chunk info.
     */
    removePlayer(client){
        if (this.loadedChunks.hasOwnProperty(client.currentChunkID)) {
            let chunk = this.loadedChunks[client.currentChunkID];
            delete chunk.entityList[client.id];
        }
    }

    checkChunkExists(id){

    }

    createChunk(){

    }

    generateChunk(){

    }

    loadChunk(){

    }

    unloadChunk(){

    }

    saveChunk(){

    }
}

module.exports = ChunkManager;