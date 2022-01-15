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
var deltaTime = Date.now();

//game functions
const update = ()=>{
    deltaTime = Date.now() - deltaTime;

    let entityData = [];

    for(let i in entities){
        let e = entities[i];
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
    c.createPlayer([Math.random() * 5, Math.random() * 5]);
    entities[id] = c.player;

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