const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 370,
    height: 640,
    minWidth: 320,
    minHeight: 480,
    frame: false,
    transparent: true,
    vibrancy: 'under-window',
    visualEffectState: 'active',
    alwaysOnTop: false,
    hasShadow: true,
    resizable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.on('close',    () => { if (win && !win.isDestroyed()) win.close(); });
ipcMain.on('minimize', () => { if (win && !win.isDestroyed()) win.minimize(); });
ipcMain.on('pin',      (_, v) => { if (win && !win.isDestroyed()) win.setAlwaysOnTop(!!v); });
