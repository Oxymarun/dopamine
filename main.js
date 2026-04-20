const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

let win;
let tray;

const STATE_FILE = path.join(app.getPath('userData'), 'window-state.json');
const SETTINGS_FILE = path.join(app.getPath('userData'), 'settings.json');

function loadWindowState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return { x: undefined, y: undefined, width: 370, height: 640 };
  }
}

function saveWindowState() {
  if (!win || win.isDestroyed()) return;
  const b = win.getBounds();
  fs.writeFileSync(STATE_FILE, JSON.stringify(b));
}

function loadSettings() {
  try {
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function createWindow() {
  const state = loadWindowState();
  const settings = loadSettings();

  win = new BrowserWindow({
    x: state.x,
    y: state.y,
    width: state.width || 370,
    height: state.height || 640,
    minWidth: 320,
    minHeight: 520,
    frame: false,
    transparent: true,
    vibrancy: 'under-window',
    visualEffectState: 'active',
    alwaysOnTop: !!settings.alwaysOnTop,
    hasShadow: true,
    resizable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (process.env.ELECTRON_DEV) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  win.on('move', saveWindowState);
  win.on('resize', saveWindowState);
  win.on('closed', () => { win = null; });
}

function createTray() {
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  tray.setToolTip('Dopamine');

  const menu = Menu.buildFromTemplate([
    {
      label: 'Show',
      click: () => {
        if (win) {
          win.show();
          win.focus();
        } else {
          createWindow();
        }
      },
    },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]);

  tray.setContextMenu(menu);
  tray.on('click', () => {
    if (win) {
      win.isVisible() ? win.hide() : win.show();
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  if (process.platform === 'darwin') {
    app.dock.hide();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
  else if (win) win.show();
});

ipcMain.on('close', () => {
  if (win && !win.isDestroyed()) win.hide();
});

ipcMain.on('minimize', () => {
  if (win && !win.isDestroyed()) win.minimize();
});

ipcMain.on('pin', (_, v) => {
  if (win && !win.isDestroyed()) win.setAlwaysOnTop(!!v);
});

ipcMain.on('setAlwaysOnTop', (_, v) => {
  if (win && !win.isDestroyed()) win.setAlwaysOnTop(!!v);
  try {
    const s = loadSettings();
    s.alwaysOnTop = !!v;
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(s));
  } catch {}
});
