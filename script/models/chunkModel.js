const mongoose = require("mongoose");

const chunkSchema = new mongoose.Schema({
    chunkID: String,
    tileMap: {
        type: [Number],
        validate: (arr)=>{return (arr.length === 64*64)}
    },
    chunkPos: {
        type: [Number],
        validate: (arr)=>{return arr.length = 2}
    }
})

module.exports = mongoose.model("Chunk", chunkSchema);