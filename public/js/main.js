//socket
const socket = io();

//DOM elements
const gameCanvas = document.querySelector("#gameCanvas");

//modules
const renderer = new Renderer(gameCanvas);

//constant variables
const fps = 30;

//dynamic variables
var deltaTime = Date.now();

//world variables
var entities = [];

const update = ()=>{
    deltaTime = Date.now() - deltaTime;
    renderer.render(entities);
}

//socket interactions
socket.on("entityData", (data)=>{
entities = data.entities;
console.log(entities);
})

//game loop
setInterval(update, 1000/fps);