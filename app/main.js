'use strict';

(() => {
  const {app, BrowserWindow} = require('electron');

  const isMac = process.platform === 'darwin';

  let win = null;

  app.on('window-all-closed', () => {
    if (!isMac) {
      app.quit();
    }
  });

  // Avoid the slow performance issue when renderer window is hidden
  app.commandLine.appendSwitch('disable-renderer-backgrounding');

  app.on('ready', () => {
    if (isMac) {
      app.dock.hide();
    }

    win = new BrowserWindow({
      width: 850,
      height: 300,
      show: false,
      frame: false,
      resizable: false,
      maximizable: false
    });

    win.loadFile(`${__dirname}/index.html`);

    win.on('closed', () => {
      win = null;
    });
  });
})();

