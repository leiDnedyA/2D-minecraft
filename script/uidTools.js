/**
 * Generates a unique id string based on timestamp.
 * 
 * @param {number} [length = 16] length of ID
 * @returns {string} UID
 */
const generateUID = (length = 16) => {
    return parseInt(Math.ceil(Math.random() * Date.now()).toPrecision(length).toString().replace(".", ""))
}

module.exports = {generateUID};