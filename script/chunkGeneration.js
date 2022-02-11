const ChunkMapUtilities = require('./chunkMapUtilities.js');

const chunkDimensions = ChunkMapUtilities.chunkDimensions;
const posToIndex = ChunkMapUtilities.posToIndex;
const indexToPos = ChunkMapUtilities.indexToPos;

const getRandomInt = (min, max)=>{
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Returns a list of the tiles surrounding a specified tile in a chunk.
 * indexes:     0, 1, 2,
 *              3, x, 4
 *              5, 6, 7
 * 
 * @param {Array<number>} map 
 * @param {[number, number]} pos 
 */
const getNeighbors = (map, pos) => {

    let neighbors = [];
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            let tPos = [pos[0] + i, pos[1] + j];
            if (tPos != pos) {
                let t = map[posToIndex(tPos)];
                neighbors.push(t)
            }
        }
    }
    return neighbors;
}

const generateWithWalker = (id, getChunk)=>{

    let walkerPos = [32, 32]; //this is where the walker will start, and this var will hold the current walker position
    let stepHistory = [];
    let maxSteps = 1000000;
    let wallsHit = 0;

    const move = { //functions to move walker up, down, left, or right
        up: (pos)=>{
            return [pos[0], pos[1]-1]
        },
        down: (pos)=>{
            return [pos[0], pos[1]+1]
        },
        left: (pos)=>{
            return [pos[0]-1, pos[1]]
        },
        right: (pos)=>{
            return [pos[0]+1, pos[1]]
        }
    }

    let directions = Object.keys(move);

    let map = [] //will be map filled fully with walls
    for(let i = 0; i < chunkDimensions[0]*chunkDimensions[1]; i++){
        map.push(1);
    }

    for(let stepCount = 0; stepCount <= maxSteps; stepCount++){
        map[posToIndex(walkerPos)] = 0;
        let potentialPos = move[directions[getRandomInt(0, directions.length - 1)]](walkerPos);
        if((potentialPos[0] >= 0 && potentialPos[1] >= 0) && (potentialPos[0] < chunkDimensions[0] && potentialPos[1] < chunkDimensions[1])){
            walkerPos = potentialPos;
        }else{
            wallsHit++;
        }

        if(wallsHit >= 20){
            break;
        }

    }

    return map;

}

/**
 * Generates a chunk, and returns a 64x64 map.
 * 
 * @param {string} id id of chunk
 * @callback getChunk allows function to look at other chunks (param: id {string})
 * @returns {Array<number>}
 */
const generateNoise = (id, getChunk) => {
    let noise = [];
    let map = [];
    for (let i = 0; i < chunkDimensions[0]*chunkDimensions[1]; i++) {
        noise.push((Math.floor(Math.random() * 10) > .5) ? 0 : 1);
    }
    for (let i = 0; i < noise.length; i++) {
        let neighbors = getNeighbors(noise, indexToPos(i));
        let wallCount = 0;
        for (let j in neighbors) {
            if (neighbors[j] == 0) {
                wallCount++;
            }
        }
        if (wallCount > 6) {
            map.push(0);
        } else {
            map.push(1);
        }
    }
    return noise;
};

module.exports = {generateWithWalker, generateNoise};