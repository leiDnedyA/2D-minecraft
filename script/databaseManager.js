require("dotenv").config();
const mongoose = require("mongoose");
const ChunkModel = require("./models/chunkModel.js");

mongoose.connect(process.env.DATABASE);

/**
 * Handles all mongoDB database stuff.
 */
class DatabaseManager{

    /**
     * Creates a DatabaseManager instance.
     */
    constructor(){
        
    }

    /**
     * Checks database for a chunk instance based on the chunkID.
     * 
     * @param {String} chunkID
     * @param {function} callback what to do with the chunk obj once gotten
     * @returns {{exists: Boolean, result: Chunk}} if exists is false, there is no chunk with the given ID. 
     */
    getChunk(chunkID, callback){

    }

    /**
     * Uploads a chunk to the database.
     * 
     * @param {Chunk} chunk 
     */
    saveChunk(chunk){

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

    }

}

module.exports = DatabaseManager;