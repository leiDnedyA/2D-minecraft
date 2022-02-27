const Player = require("./player");

const {getRandomInt} = require("./numUtilities.js");

const chunkPosToID = (chunkPos)=>{
    return `${chunkPos[0]}x${chunkPos[1]}`
}

const hiraganaList = 'ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろゎわゐゑをんゔゕゖ゚゛゜ゝゞゟ゠ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロヮワヰヱヲンヴヵヶヷヸヹヺ・ーヽヾヿ㍐㍿'

const getRandomName = (length)=>{
    let name = '';
    for(let i = 0; i < length; i++){
        name += hiraganaList[getRandomInt(0, hiraganaList.length - 1)]
    }
    return name;
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

        this.username = getRandomName(getRandomInt(4, 7));

        this.currentChunkIDs = [];
        this.currentChunkID;

        this.currentChunkLastUpdates = {};

        this.clickCallback = null; //set with setClickCallback

        this.createPlayer = this.createPlayer.bind(this);
        this.updateChunks = this.updateChunks.bind(this);
        this.emitChunkData = this.emitChunkData.bind(this);
        this.emitEntityData = this.emitEntityData.bind(this);
        this.setClickCallback = this.setClickCallback.bind(this);
        this.handleClick = this.handleClick.bind(this);

        this.forceDisconnect = this.forceDisconnect.bind(this);
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
     * 
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

        //sets update timestamps for any freshly loaded chunks
        for(let i in newChunkIDs){
            let id = newChunkIDs[i];
            if(!this.currentChunkLastUpdates.hasOwnProperty(id)){
                this.currentChunkLastUpdates[id] = Date.now();
            }
        }


        //filters out chunks that aren't in view anymore from list of update timestamps
        for(let i in this.currentChunkLastUpdates){
            let inList = false;

            for(let j in newChunkIDs){
                if(newChunkIDs[j] === i){
                    inList = true;
                }
            }
            if(!inList){
                delete this.currentChunkLastUpdates[i];
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
        this.socket.emit("chunkData", {chunks: chunks, currentChunkIDs: this.currentChunkIDs, clientPos: this.player.position});
    }

    /**
     * Emits data about visible entities to socket.
     * 
     * @param {Array<Entity>} entities list of entities.
     */
    emitEntityData(entities){
        this.socket.emit('entityData', {entities: entities});
    }

    /**
     * Sets a callback for handling clicks.
     * 
     * @callback function handleClick(player, isLeftClick, position) {
         ...
     } handle clicks.
     */
    setClickCallback(callback){
        this.clickCallback = callback;
    }

    /**
     * Handles clicks/block interactions.
     * 
     * @param {boolean} isLeftClick wither or not the click is a left click
     * @param {[number, number]} pos world-position of the click
     * @param {number} blockID id of block being placed
     */
    handleClick(isLeftClick, pos, blockID = 1){
        if(this.clickCallback){
            this.clickCallback(this.player, isLeftClick, pos, blockID);
        }
    }

    forceDisconnect(){
        this.socket.disconnect();
    }
}

module.exports = Client;