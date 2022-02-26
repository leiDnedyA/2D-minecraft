const electron = require("electron");
const { app, BrowserWindow, ipcMain } = electron;
const path = require('path');
const url = require('url');

let win = null;

/**
 * Initializes GUI.
 * 
 * @param {[{eventName: String, callback: function}]} eventHandlerArray array of objects containing an event name and a corresponding callback function
 */
const init = (eventHandlerArray) => {

    win = new BrowserWindow({
        width: 800,
        height: 600,
        resizable: false,
        title: "Aydencraft ServerTools",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    win.setAlwaysOnTop(true, 'screen');

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'gui.html'),
        protocol: 'file:',
        slashes: true
    }))

    for(let i in eventHandlerArray){
        let handler = eventHandlerArray[i];
        ipcMain.on(handler.eventName, handler.callback);
    }


}

const sendData = (eventName, data) =>{
    win.webContents.send(eventName, data);
}


module.exports = { app, init, sendData}