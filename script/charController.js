//BACKEND!!!

const e = require("express");

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
        
        let p = this.player;
        let tv = p.targetVelocity;

        //vertical movement
        if((this.keysDown['w'] && this.keysDown['s']) || !this.keysDown['w'] && !this.keysDown['s']){
            //don't move
            p.setTargetVelocity([tv[0], 0]);
        }else{
            if (this.keysDown['w']) {
                if (tv[1] !== -1) {
                    p.setTargetVelocity([tv[0], -1]);
                }
            }
            if (this.keysDown['s']) {
                if (tv[1] !== 1) {
                    p.setTargetVelocity([tv[0], 1]);
                }
            }
        }

        tv = p.targetVelocity;

        if ((this.keysDown['a'] && this.keysDown['d']) || (!this.keysDown['a'] && !this.keysDown['d'])){
            //don't move
            p.setTargetVelocity([0, tv[1]]);
        }else{
            if (this.keysDown['a']) {
                if (tv[0] !== -1) {
                    p.setTargetVelocity([-1, tv[1]]);
                }
            }
            if (this.keysDown['d']) {
                if (tv[0] !== 1) {
                    p.setTargetVelocity([1, tv[1]]);
                }
            }
        }

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