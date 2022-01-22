//socket
const socket = io();

//DOM elements
const gameCanvas = document.querySelector("#gameCanvas");

//modules
const renderer = new Renderer(gameCanvas);
const charController = new CharController(socket, gameCanvas);

//constant variables
const fps = 30;

//dynamic variables
var deltaTime = Date.now();
const clientData = {};

//world variables
var entities = [];
var tileMap = [];
var tileMapOffset = [0, 0];

const update = ()=>{
    deltaTime = Date.now() - deltaTime;
    renderer.render(entities, [{tileMap: tileMap, offset: tileMapOffset}]);
}

socket.on('init', (data)=>{
    clientData.id = data.clientID;
    renderer.setTargetID(clientData.id);
})

socket.on("chunkData", (data)=>{
    entities = data.entityList;
    tileMapOffset[0] = data.chunkPos[0] * 64;
    tileMapOffset[1] = data.chunkPos[1] * 64;
    if(data.hasOwnProperty("tileMap")){
        console.log(data.tileMap)
        tileMap = data.tileMap;
        console.log(tileMapOffset);
    }
})

//game loop
setInterval(update, 1000/fps);