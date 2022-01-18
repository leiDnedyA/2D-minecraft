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

//server component imports
const express = require("express");
const http = require("http");
const Socket = require("socket.io");

//server component instances
const app = express();
const server = http.createServer(app);
const io = new Socket.Server(server);


//game data
const clients = {};
const entities = {};
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

    for(let i in entities){
        let e = entities[i];
        e.update(deltaTime);
        entityData.push({id: e.id, position: e.position, type: e.getType()});
    }

    for(let i in clients){
        let c = clients[i];

        let data = {chunk: 0, entities: entityData};

        c.socket.emit('entityData', data);
    }
}

const handleNewConnection = (socket)=>{
    let c = new Client(socket, generateUID());
    let id = c.id;
    clients[id] = c;
    c.createPlayer([Math.random() * 20, Math.random() * 20]);
    entities[id] = c.player;

    //all socket.on calls

    socket.on("clientInput", (data)=>{
        c.player.charController.setKeysDown(data.keysDown);
    })

    socket.on('disconnect', ()=>{
        delete clients[id];
        delete entities[id];
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