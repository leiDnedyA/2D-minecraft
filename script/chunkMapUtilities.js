
const chunkDimensions = [64, 64];

const posToIndex = (pos) => {
    return Math.floor(pos[1] * chunkDimensions[1]) + Math.floor(pos[0]);
}

const indexToPos = (i) => {
    return [Math.floor(i % chunkDimensions[1]), Math.floor(i / chunkDimensions[1])];
}

/**
 * Converts a global position to the id of the containing chunk.
 * 
 * @param {[Number]} pos world position 
 * @returns {String} '{chunkPos[0]}x{chunkPos[1]}'
 */
const worldPosToChunkID = (pos)=>{
    return `${Math.floor(pos[0] / chunkDimensions[0])}x${Math.floor(Math.floor(pos[1] / chunkDimensions[1]))}`
}

module.exports = {posToIndex, indexToPos, chunkDimensions, worldPosToChunkID};