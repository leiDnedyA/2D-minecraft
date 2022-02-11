
const chunkDimensions = [64, 64];

const posToIndex = (pos) => {
    return Math.floor(pos[1]) * chunkDimensions[1] + Math.floor(pos[2]);
}

const indexToPos = (i) => {
    return [i % chunkDimensions[1], Math.floor(i / chunkDimensions[1])];
}

module.exports = {posToIndex, indexToPos, chunkDimensions};