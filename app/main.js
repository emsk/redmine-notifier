'use strict';

(function() {
  require('crash-reporter').start();

  const BLACK_ICON_FILENAME_24 = 'redmine_icon_black_24.png';
  const COLOR_ICON_FILENAME_24 = 'redmine_icon_color_24.png';

  var app = require('app');
  var BrowserWindow = require('browser-window');
  var Menu = require('menu');
  var Tray = require('tray');
  var win = null;
  var quitApp = false;

  /**
   * Initialize the application menu and context menu.
   */
  function initMenu() {
    var appMenu = Menu.buildFromTemplate([
      {
        label: 'Edit',
        submenu: [
          { label: 'Undo',       accelerator: 'CmdOrCtrl+Z',       role: 'undo' },
          { label: 'Redo',       accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
          { label: 'Cut',        accelerator: 'CmdOrCtrl+X',       role: 'cut' },
          { label: 'Copy',       accelerator: 'CmdOrCtrl+C',       role: 'copy' },
          { label: 'Paste',      accelerator: 'CmdOrCtrl+V',       role: 'paste' },
          { label: 'Select All', accelerator: 'CmdOrCtrl+A',       role: 'selectall' }
        ]
      }
    ]);

    var contextMenu = Menu.buildFromTemplate([
      {
        label: 'Preferences',
        click: function() {
          win.show();
        }
      }, {
        label: 'Quit',
        click: function() {
          quitApp = true;
          app.quit();
        }
      }
    ]);

    var iconFilename = (process.platform === 'darwin')
      ? BLACK_ICON_FILENAME_24
      : COLOR_ICON_FILENAME_24;

    var tray = new Tray(__dirname + '/images/' + iconFilename);

    Menu.setApplicationMenu(appMenu);
    tray.setContextMenu(contextMenu);
  }

  app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  // Avoid the slow performance issue when renderer window is hidden
  app.commandLine.appendSwitch('disable-renderer-backgrounding');

  app.on('ready', function() {
    if (process.platform === 'darwin') {
      app.dock.hide();
    }

    initMenu();

    win = new BrowserWindow({
      width: 850,
      height: 275,
      show: false,
      frame: false,
      resizable: false
    });

    win.loadURL('file://' + __dirname + '/index.html');

    win.on('close', function(e) {
      if (!quitApp) {
        e.preventDefault();
        win.hide();
      }
    });

    win.on('closed', function() {
      win = null;
    });
  });
})();

