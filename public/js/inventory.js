
//controls the UI for the inventory and contains all variables
class InventoryController{

    /**
     * Creates an instance of InventoryController.
     */
    constructor(){

        this.inventory; //set with setInventory()

        this.hotbarElement = document.querySelector("#hotbar");
        
        this.slotElements = [];

        let hotbarSize = 9;

        for(let i = 0; i < hotbarSize; i++){
            let slotElement = document.createElement('div');
            let blockNameElement = document.createElement('p');

            slotElement.classList.add('invSlot');
            
            slotElement.appendChild(blockNameElement);

            this.hotbarElement.appendChild(slotElement);
            this.slotElements.push(slotElement);

            document.body.addEventListener("mousedown", (e)=>{e.preventDefault()});

            slotElement.addEventListener('click', ()=>{
                this.setCurrentSlotIndex(i);
            })

        }

        this.currentSlotIndex = 0;
    

        this.hotbarElement.addEventListener('wheel', (e) => {
            
            let potentialIndex = this.currentSlotIndex + (e.deltaY / 100);

            if (potentialIndex >= hotbarSize){
                this.setCurrentSlotIndex(0);
            } else if (potentialIndex < 0){
                this.setCurrentSlotIndex(hotbarSize - 1);
            }else{
                this.setCurrentSlotIndex(potentialIndex);
            }
        })

        this.start = this.start.bind(this);
        this.setCurrentSlotIndex = this.setCurrentSlotIndex.bind(this);
        this.setInventory = this.setInventory.bind(this);
    }


    /**
     * Sets up all inventory stuff.
     */
    start(){
        for(let i in this.inventory){
            if(i < this.slotElements.length){
                this.slotElements[i].style.backgroundColor = this.inventory[i].color;
                this.slotElements[i].firstChild.innerHTML = this.inventory[i].name;
            }
        }
        this.setCurrentSlotIndex(this.currentSlotIndex);
    }

    setInventory(inventory){
        this.inventory = inventory;
    }

    /**
     * Sets the active hotbar slot based on an index.
     * 
     * @param {number} index 
     */
    setCurrentSlotIndex(index){

        if(this.slotElements[this.currentSlotIndex].classList.contains('currentInvSlot')){
            this.slotElements[this.currentSlotIndex].classList.remove('currentInvSlot');
        }
    
        this.currentSlotIndex = index;
        this.slotElements[this.currentSlotIndex].classList.add('currentInvSlot');
    }

    getCurrentBlockID(){
        return this.inventory[this.currentSlotIndex].id;
    }

}

//contains data about a block
class Block{

    /**
     * Creates a Block instance.
     * 
     * @param {string} color 
     * @param {number} id 
     * @param {string} [name = "block_name"] 
     */
    constructor(color, id, name = 'block_name'){
        this.color = color;
        this.id = id;
        this.name = name;
    }
}