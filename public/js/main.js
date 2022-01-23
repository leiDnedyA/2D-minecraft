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
var chunks = [];

const update = ()=>{
    deltaTime = Date.now() - deltaTime;
    renderer.render(chunks);
}

socket.on('init', (data)=>{
    clientData.id = data.clientID;
    renderer.setTargetID(clientData.id);
})

socket.on("chunkData", (data)=>{
    chunks = data;
})

//game loop
setInterval(update, 1000/fps);