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
    
    let emit = (isLeftClick)=>{
        socket.emit('clientCick', {isLeftClick: isLeftClick, clickPos: renderer.mouseWorldPos});
    }

    window.addEventListener('click', (e)=>{
        emit(false);
    })

    window.addEventListener('contextmenu', (e)=>{
        e.preventDefault();
        emit(true);
    })

})

socket.on("chunkData", (data)=>{
    chunks = data.chunks;
    clientData.position = data.clientPos;
    renderer.uiElements.coordinates.text = `[${clientData.position[0].toFixed(3)}, ${clientData.position[1].toFixed(3)}]`;
})

//game loop
setInterval(update, 1000/fps);