// 1. Asegúrate de importar "Notification" e "ipcMain" desde electron
const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');

app.setAppUserModelId('com.marco.gestordetareas'); 

function crearVentana(){
    const ventanaPrincipal = new BrowserWindow({
        width: 350,
        height: 630,
        resizable: true,
        minWidth: 320,  
        minHeight: 500, 
        icon: path.join(__dirname, "tomato.ico"),
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            sandbox: false
        }
    });

    ventanaPrincipal.loadFile(path.join(__dirname, 'Index.html'));

    ventanaPrincipal.once("ready-to-show", () => {
        ventanaPrincipal.show();
    });

    globalShortcut.register("F10", () => {
        ventanaPrincipal.webContents.openDevTools();
    });
}

const ejecutar = async () => {
    await app.whenReady();
    crearVentana();
}

ejecutar();

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});