
const chunkDimensions = [64, 64];

const posToIndex = (pos) => {
    return Math.floor(pos[1] * chunkDimensions[1]) + Math.floor(pos[0]);
}

const indexToPos = (i) => {
    return [Math.floor(i % chunkDimensions[1]), Math.floor(i / chunkDimensions[1])];
}

module.exports = {posToIndex, indexToPos, chunkDimensions};