require("dotenv").config()

//helper functions

/**
 * Generates a unique id string based on timestamp.
 * 
 * @param {number} length length of ID
 * @returns {string} UID
 */
const generateUID = (length = 16) => {
    return parseInt(Math.ceil(Math.random() * Date.now()).toPrecision(length).toString().replace(".", ""))
}

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

const handleNewConnection = (socket)=>{
    let c = new Client(socket, generateUID());
    let id = c.id;
    clients[id] = c;
    c.createPlayer([Math.random() * 20, Math.random() * 20]);
    c.updateChunks();
    chunkManager.addPlayer(c);

    //all socket.on calls

    socket.on("clientInput", (data)=>{
        c.player.charController.setKeysDown(data.keysDown);
    })

    socket.on('disconnect', ()=>{
        chunkManager.removePlayer(c);
        delete clients[id];
    })
}



//server setup
app.use(express.static("public"));

server.listen(process.env.PORT, () => {
    console.log(`Server listening on port : ${process.env.PORT}`);
});

io.on("connection", handleNewConnection);

//game loop
setInterval(update, 1000/fps);