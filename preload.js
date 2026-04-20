const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('widget', {
  close:          ()  => ipcRenderer.send('close'),
  minimize:       ()  => ipcRenderer.send('minimize'),
  pin:            (v) => ipcRenderer.send('pin', v),
  setAlwaysOnTop: (v) => ipcRenderer.send('setAlwaysOnTop', v),
});
