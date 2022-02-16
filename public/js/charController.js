
/**
 * Sends user input to the server.
 */
class CharController{
    
    /**
     * Creates CharController instance.
     * @param {Socket} socket instance of socket
     * @param {HTMLElement} canvas game canvas 
     */
    constructor(socket, canvas){
        this.socket = socket;
        this.canvas = canvas;

        this.isEnabled = true;

        this.keysDown = {
            'w': false,
            'a': false,
            's': false,
            'd': false,
            ' ': false
        }
    
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.emitInput = this.emitInput.bind(this);
        this.setDisabled = this.setDisabled.bind(this);

        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        window.addEventListener('click', this.handleClick);

    }

    handleKeyDown(e){
        let key = e.key.toLowerCase();
        if(this.keysDown.hasOwnProperty(key)){
            this.keysDown[key] = true;
            this.emitInput();
        }
    }

    handleKeyUp(e){
        let key = e.key.toLowerCase();
        if (this.keysDown.hasOwnProperty(key)) {
            this.keysDown[key] = false;
            this.emitInput();
        }
    }

    handleClick(e){

    }

    /**
     * Calls socket.emit sending out this.keysDown
     */
    emitInput(){
        this.socket.emit("clientInput", {keysDown: this.keysDown});
    }

    /**
     * Enables or disables the character controller's input handling.
     * @param {boolean} enabled true = enabled, false = disabled
     */
    setDisabled(enabled = false){
        this.isEnabled = enabled;
    }

}