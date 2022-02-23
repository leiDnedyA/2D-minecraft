require("dotenv").config();
const mongoose = require("mongoose");
const ChunkModel = require("./models/chunkModel.js");
const Chunk = require("./chunk.js");

mongoose.connect(process.env.DATABASE);

/**
 * Handles all mongoDB database stuff.
 */
class DatabaseManager{

    /**
     * Creates a DatabaseManager instance.
     */
    constructor(chunkManager){
        
        this.chunkManager = chunkManager;

        this.loadOrCreateChunk = this.loadOrCreateChunk.bind(this);
        this.saveChunk = this.saveChunk.bind(this);
        this.updateChunk = this.updateChunk.bind(this);

    }

    /**
     * Checks database for a chunk instance based on the chunkID.
     * 
     * @param {String} chunkID
     * @param {function} existsCallback what to do with the chunk obj once gotten (gets passed chunk object as parameter)
     * @param {function} dneCallback what to do if the chunk doesn't exist (probably )
     * @returns {{exists: Boolean, result: Chunk}} if exists is false, there is no chunk with the given ID. 
     */
    getChunk(chunkID, callback){

    }

    /**
     * Loads or creates a chunk. If a chunk at the given chunkID already exists in the DB, it will be 
     * loaded and if not, a new one will be created based on the createCallback function.
     * 
     * @param {String} chunkID 
     * @param {function} addCallback Used to add a chunk to list of loaded chunks, passed in a ChunkInstance argument. 
     * @param {function} createCallback function to create a chunk. Passed id as parameter and must return a chunk object.
     */
    async loadOrCreateChunk(chunkID, addCallback, createCallback){
        ChunkModel.findOne({chunkID: chunkID}).then(
            (chunkVal)=>{
                if (chunkVal !== null) {
                    addCallback(new Chunk(chunkVal.chunkPos, chunkVal.tileMap, {}, this.chunkManager));
                } else {
                    let chunk = createCallback(chunkID);
                    addCallback(chunk);
                    this.saveChunk(chunk);
                }
            }
        );
        
    }

    /**
     * Uploads a chunk to the database.
     * 
     * @param {Chunk} chunk 
     */
    saveChunk(chunk){
        const chunkInstance = new ChunkModel({chunkID: chunk.getChunkID(), chunkPos: chunk.chunkPos, tileMap: chunk.tileMap});
        chunkInstance.save();
    }

    /**
     * Checks if a chunk exists in the DB with a given chunkID.
     * 
     * @param {String} chunkID 
     * @param {function} existsCallback runs if the chunk exists
     * @param {function} dneCallback runs if chunk doesn't exist
     */
    checkChunkExists(chunkID, existsCallback, dneCallback){

    }

    /**
     * Updates a preexisting chunk in the database.
     * 
     * @param {Chunk} chunk 
     */
    updateChunk(chunk){
        ChunkModel.updateOne({'chunkID': chunk.getChunkID()}, {tileMap: chunk.tileMap});
    }

}

module.exports = DatabaseManager;