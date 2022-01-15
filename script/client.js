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

        this.createPlayer = this.createPlayer.bind(this);
    }

    /**
     * Creates a Player instance for client.
     * 
     * @param {[x, y]]} startingPos starting world position of player 
     */
    createPlayer(startingPos){
        this.player = new Player(this.id, this.id, startingPos);
    }
}

module.exports = Client;