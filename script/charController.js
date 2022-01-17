//BACKEND!!!

/**
 * Backend character controller.
 */
class CharController{
    
    /**
     * Creates instance of CharController.
     * @param {Entity} player instance of player to control
     */
    constructor(player){
        this.player = player;
        this.keysDown = {
            'w': false,
            'a': false,
            's': false,
            'd': false,
            ' ': false,
        };

        this.update = this.update.bind(this);
        this.setKeysDown = this.setKeysDown.bind(this);
    }


    /**
     * Performs update tasks based on current relevant inputs.
     */
    update(){

    }

    /**
     * Updates the current status of relevant inputs.
     * @param {Object} keysDown Object containing keys being pressed
     */
    setKeysDown(keysDown){
        for(let i in this.keysDown){
            if(keysDown.hasOwnProperty(i)){
                this.keysDown[i] = keysDown[i];
            }
        }
        this.update();
    }
}

module.exports = CharController;