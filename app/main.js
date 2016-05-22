'use strict';

(() => {
  const electron = require('electron');
  const app = electron.app;
  const BrowserWindow = electron.BrowserWindow;
  let win = null;

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  // Avoid the slow performance issue when renderer window is hidden
  app.commandLine.appendSwitch('disable-renderer-backgrounding');

  app.on('ready', () => {
    if (process.platform === 'darwin') {
      app.dock.hide();
    }

    win = new BrowserWindow({
      width: 850,
      height: 300,
      show: false,
      frame: false,
      resizable: false
    });

    win.loadURL(`file://${__dirname}/index.html`);

    win.on('closed', () => {
      win = null;
    });
  });
})();

