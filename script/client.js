const Player = require("./player");

/**
 * Holds all data and methods pertaining to client.
 */
class Client {
    /**
     * Creates a client instance.
     * 
     * @param {Socket} socket Client's instance of socket
     * @param {string} id unique id of client
     */
    constructor(socket, id){
        this.socket = socket;
        this.id = id;
        this.player;

        this.currentChunkIDs = [];
        this.currentChunkID;

        this.createPlayer = this.createPlayer.bind(this);
        this.updateChunks = this.updateChunks.bind(this);
        this.emitChunkData = this.emitChunkData.bind(this);
        // this.emitPlayerData = this.emitPlayerData.bind(this);
    }

    /**
     * Creates a Player instance for client.
     * 
     * @param {[x, y]]} startingPos starting world position of player 
     */
    createPlayer(startingPos){
        this.player = new Player(this.id, this.id, startingPos);
        this.currentChunkID = [startingPos[0]/64, startingPos[1]/64];
    }

    /**
     * Updates the list of current chunk IDs based on player pos.
     * @returns {string} id of player's last chunk
     */
    updateChunks(){
        let playerPos = this.player.position;
        let chunkPos = [Math.floor(this.player.position[0] / 64), Math.floor(this.player.position[1] / 64)];
        // let chunkPos = [0, 0];
        
        let mainID = `${chunkPos[0]}x${chunkPos[1]}`;

        let lastChunk = this.currentChunkID;

        this.currentChunkID = mainID;
        this.currentChunkIDs[0] = mainID;

        return lastChunk;
    }

    /**
     * Emits data about chunk[s] to client's socket.
     * 
     * @param {Object} data Chunk data generated by Chunk class 
     */
    emitChunkData(data){
        this.socket.emit("chunkData", data);
    }
}

module.exports = Client;