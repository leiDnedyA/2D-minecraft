
/* 
background color: #000210
grass color: #41c2b4
player color: #db2e2e
muted green: #7aa
*/

/**
 * Valid UI Element IDs: 
 * 'coordinates': text that holds coordinates in top left corner
 */

const gameColors = {
    background: "#000210",
    teal: "#41c2b4",
    red: "#db2e2e",
    mutedGreen: "#7aa"
}

const tileDict = {
    0: gameColors.background,
    1: gameColors.mutedGreen
}

const chunkDimensions = 64;

const motionBlur = .1;

/**
 * Renders game to canvas.
 */
class Renderer{
    /**
     * Creates instance of Renderer.
     * @param {HTMLElement} canvas Canvas to be rendered to.
     */
    constructor(canvas){
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.ctx.globalAlpha = motionBlur;

        //all the shit I have to do to solve the image scaling problem
        this.canvas.style.cssText = 'image-rendering: optimizeSpeed;' + // FireFox < 6.0
            'image-rendering: -moz-crisp-edges;' + // FireFox
            'image-rendering: -o-crisp-edges;' +  // Opera
            'image-rendering: -webkit-crisp-edges;' + // Chrome
            'image-rendering: crisp-edges;' + // Chrome
            'image-rendering: -webkit-optimize-contrast;' + // Safari
            'image-rendering: pixelated; ' + // Future browsers
            '-ms-interpolation-mode: nearest-neighbor;'; // IE

        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
        this.ctx.imageSmoothingEnabled = false;

        this.render = this.render.bind(this);
        this.cameraUpdate = this.cameraUpdate.bind(this);
        this.clear = this.clear.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.setTargetID = this.setTargetID.bind(this);
        this.cameraOffset = [0, 0];

        this.uiElements = {
            coordinates: {
                id: 'coordinates',
                text: '[420, 69]'
            }
        };

        this.targetID;
        this.lastTargetIndex = 0;

        this.unitSize = 20;

        window.addEventListener("resize", this.handleResize);
        
        this.handleResize();
    }

    /**
     * Renders.
     * @param {Array<Chunk>} chunks array of chunks to render
     */
    render(chunks){
        this.clear();

        let entities = [];
        let tileMaps = [];

        for(let i in chunks){
            let c = chunks[i];
            if(c.entityList.length > 0){
                entities = entities.concat(c.entityList);
                
            }
            tileMaps.push({tileMap: c.tileMap, chunkPos: c.chunkPos});
        }



        this.cameraUpdate(entities);

        for(let i in tileMaps){
            let map = tileMaps[i].tileMap;
            let offset = [tileMaps[i].chunkPos[0]*64, tileMaps[i].chunkPos[1]*64];
            for(let i in map){
                this.ctx.fillStyle = tileDict[map[i]];
                this.ctx.fillRect(((Math.floor(i % 64) + offset[0] + this.cameraOffset[0]) * this.unitSize), ((Math.floor(i / 64) + offset[1] + this.cameraOffset[1])*this.unitSize), this.unitSize, this.unitSize);
            }
        }

        this.ctx.fillStyle = gameColors.red;
        for(let i in entities){
            let e = entities[i];
            this.ctx.fillRect((e.position[0] + this.cameraOffset[0]) * this.unitSize, (e.position[1] + this.cameraOffset[1]) * this.unitSize, this.unitSize, this.unitSize);
        }

        for(let i in this.uiElements){
            let element = this.uiElements[i];
            if(element.id === "coordinates"){
                this.ctx.fillStyle = 'white';
                this.ctx.font = "bold 20px serif";
                this.ctx.fillText(element.text, 5, 25);
            }
        }
    }

    /**
     * Updates camera offset.
     * @param {Array<Entity>} entities position of target to follow
     */
    cameraUpdate(entities){
        let targetPos = [0, 0];
        if(this.targetID && entities.length > 0){
            if (this.targetID === entities[this.lastTargetIndex].id){
                targetPos = entities[this.lastTargetIndex].position;
            }else{
                for(let i in entities){
                    if(entities[i].id === this.targetID){
                        this.lastTargetIndex = i;
                        targetPos = entities[i].position;
                    }
                }
            }
        }
        this.cameraOffset = [-targetPos[0] + ((this.canvas.width / this.unitSize) / 2), -targetPos[1] + ((this.canvas.height / this.unitSize) / 2)];
    }

    /**
     * Clears the canvas.
     */
    clear(){
        this.ctx.fillStyle = gameColors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Changes canvas size and variables dependent on canvas size.
     */
    handleResize(){
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // let smallestDimension = (this.canvas.width < this.canvas.height) ? this.canvas.width : this.canvas.height;

        // this.unitSize = 20;
    }

    /**
     * Sets target for camera follow
     * @param {string} id entity id of target
     */
    setTargetID(id){
        this.targetID = id;
    }
}