
/* 
background color: #000210
grass color: #41c2b4
player color: #db2e2e
muted green: #7aa
*/

const gameColors = {
    background: "#000210",
    teal: "#41c2b4",
    red: "#db2e2e",
    mutedGreen: "#7aa"
}

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

        this.render = this.render.bind(this);
        this.clear = this.clear.bind(this);
        this.handleResize = this.handleResize.bind(this);

        this.unitSize = 20;

        window.addEventListener("resize", this.handleResize);
        
        this.handleResize();
    }

    /**
     * Renders.
     * @param {Array<Entity>} entities array of entities to render
     */
    render(entities){
        this.clear();
        this.ctx.fillStyle = gameColors.red;
        for(let i in entities){
            let e = entities[i];
            this.ctx.fillRect(e.position[0] * this.unitSize, e.position[1] * this.unitSize, this.unitSize, this.unitSize);
        }
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
}