//socket
const socket = io();

//DOM elements
const gameCanvas = document.querySelector("#gameCanvas");

//important constants
const blockDict = {};

//modules
const renderer = new Renderer(gameCanvas);
const charController = new CharController(socket, gameCanvas);
const inventoryController = new InventoryController();

//constant variables
const fps = 30;

//dynamic variables
var deltaTime = Date.now();
const clientData = {};

//world variables
var entities = [];
var chunks = {};

const update = ()=>{
    deltaTime = Date.now() - deltaTime;
    renderer.render(chunks, entities);
}

socket.on('init', (data)=>{

    tileDict = data.tileDict;
    renderer.setTileDict(tileDict);
    let inv = [];
    for(let i in tileDict){
        inv.push(new Block(tileDict[i].color, i, tileDict[i].collision));
    }

    inventoryController.setInventory(inv);
    inventoryController.start();

    clientData.id = data.clientID;
    renderer.setTargetID(clientData.id);
    inventoryController.start();

    let emit = (isLeftClick, blockID = 1)=>{

        let data = { isLeftClick: isLeftClick, clickPos: renderer.mouseWorldPos };

        if(isLeftClick){
            data.blockID = blockID;
        }

        socket.emit('clientCick', data);
    }

    window.addEventListener('click', (e)=>{
        emit(false);
    })

    window.addEventListener('contextmenu', (e)=>{
        e.preventDefault();

        let currentBlock = inventoryController.getCurrentBlockID();
        emit(true, currentBlock);
    })

})

socket.on("chunkData", (data)=>{
    let newIDList = data.currentChunkIDs;
    let oldIDList = Object.keys(chunks);

    let newChunkData = data.chunks;

    for(let i in oldIDList){
        let onList = false;
        let oldID = oldIDList[i];
        for(let j in newIDList){
            let newID = newIDList[j];
            if(oldID === newID){
                onList = true;
            }
        }
        if(!onList){
            delete chunks[oldID];
        }
    }

    for(let i in newChunkData){
        let c = newChunkData[i];
        chunks[c.id] = c;
    }


    clientData.position = data.clientPos;
    renderer.uiElements.coordinates.text = `[${clientData.position[0].toFixed(3)}, ${clientData.position[1].toFixed(3)}]`;
})

socket.on("entityData", (data)=>{
    entities = data.entities;
})

//game loop
setInterval(update, 1000/fps);