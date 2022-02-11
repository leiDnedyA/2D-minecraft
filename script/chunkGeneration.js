const ChunkMapUtilities = require('./chunkMapUtilities.js');

const chunkDimensions = ChunkMapUtilities.chunkDimensions;
const posToIndex = ChunkMapUtilities.posToIndex;
const indexToPos = ChunkMapUtilities.indexToPos;

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