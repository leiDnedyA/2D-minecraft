require("dotenv").config()

//helper functions
const generateUID = require('./script/uidTools.js').generateUID;

//game component imports
const Client = require("./script/client.js");
const Entity = require("./script/entity.js");
const ChunkManager = require("./script/chunkManager.js");

//server component imports
const express = require("express");
const http = require("http");
const Socket = require("socket.io");

//server component instances
const app = express();
const server = http.createServer(app);
const io = new Socket.Server(server);

//game modules
const chunkManager = new ChunkManager();

//JSON configuration stuff
const tileDict = require("./script/tileDict.json");

//game data
const clients = {};
const loadedChunks = {};

//game loop variables
const fps = 30;
var lastUpdate = Date.now();

//game functions
const update = ()=>{
    let now = Date.now();
    let deltaTime = (now - lastUpdate) / (1000/fps);
    lastUpdate = now;

    let entityData = [];

    chunkManager.update(deltaTime);

    for(let i in clients){
        chunkManager.updateClient(clients[i]);
    }

}

const justinsIP = '';

const handleNewConnection = (socket)=>{
    console.log(`${socket.handshake.address} joined at ${Date.now()}`);
    if(socket.handshake.address !== justinsIP){

        let c = new Client(socket, generateUID());
        let id = c.id;
        clients[id] = c;
        c.createPlayer([32, 32]);
        c.updateChunks();
        chunkManager.addPlayer(c);

        //all socket.on calls

        socket.emit('init', { clientID: id , tileDict: tileDict});

        socket.on("clientInput", (data) => {
            c.player.charController.setKeysDown(data.keysDown);
        })

        socket.on("clientCick", (data) => {
            /**
             * structure of 'data': {isLeftClick: boolean, clickPos: position of block, blockID: id of block being placed}
             */

            c.handleClick(data.isLeftClick, data.clickPos, data.blockID);

        })

        socket.on('disconnect', () => {
            chunkManager.removePlayer(c);
            delete clients[id];
        })
    }
    
}



//server setup
app.use(express.static("public"));

server.listen(process.env.PORT, () => {
    console.log(`Server listening on port : ${process.env.PORT}`);
});

io.on("connection", handleNewConnection);

//game loop
setInterval(update, 1000/fps);