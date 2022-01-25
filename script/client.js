const Player = require("./player");

const chunkPosToID = (chunkPos)=>{
    return `${chunkPos[0]}x${chunkPos[1]}`
}

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
     * @returns {string} the last chunk that the player inhabited
     */
    updateChunks(){
        let playerPos = this.player.position;
        let chunkPos = [Math.floor(playerPos[0] / 64), Math.floor(playerPos[1] / 64)];
        
        let mainID = chunkPosToID(chunkPos);

        let newChunkIDs = [mainID];

        for(let i = -1; i <= 1; i++){
            for(let j = -1; j <= 1; j++){
                if(i !== 0 || j !== 0){
                    newChunkIDs.push(chunkPosToID([chunkPos[0]+i, chunkPos[1]+j]));
                }
            }
        }

        let lastChunk = this.currentChunkID;

        this.currentChunkID = mainID;
        this.currentChunkIDs = newChunkIDs;

        return lastChunk;
    }

    /**
     * Emits data about chunk[s] to client's socket.
     * 
     * @param {Array<{tileMap: [], chunkPos: []}>} chunks List of data for each chunk that the player has loaded  
     */
    emitChunkData(chunks){
        this.socket.emit("chunkData", {chunks: chunks, clientPos: this.player.position});
    }
}

module.exports = Client;