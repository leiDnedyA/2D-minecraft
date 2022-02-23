const mongoose = require("mongoose");

const chunkSchema = new mongoose.Schema({
    chunkID: String,
    tiles: {
        type: [Number],
        validate: (arr)=>{return (arr.length === 64*64)}
    }
})

module.exports = mongoose.model("Chunk", chunkSchema);