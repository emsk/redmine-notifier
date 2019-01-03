'use strict';

(() => {
  const isMac = process.platform === 'darwin';
  const defaultFetchIntervalSec = 600;
  const notieDisplaySec = 1.5;
  const colorIconFilename64 = 'redmine_icon_color_64.png';
  const blackIconFilename24 = 'redmine_icon_black_24.png';
  const blackIconFilename24Notification = 'redmine_icon_black_24_notification.png';
  const colorIconFilename24 = 'redmine_icon_color_24.png';
  const colorIconFilename24Notification = 'redmine_icon_color_24_notification.png';
  const fetchMode = Object.freeze({time: 'TIME', date: 'DATE'});

  const {remote} = require('electron');
  const {app, dialog, shell, Menu, Tray} = remote;
  const fs = require('fs');
  const notie = require('notie');

  const appName = app.getName();
  const appCopyright = 'Copyright (c) 2015-2019 emsk';

  let appDir = `${__dirname}.unpacked`; // Production
  try {
    fs.statSync(appDir);
  } catch (err) {
    appDir = __dirname; // Development
  }

  let nodeNotifier = require('node-notifier');
  if (isMac) {
    nodeNotifier = new nodeNotifier.NotificationCenter({
      customPath: `${appDir}/custom/terminal-notifier.app/Contents/MacOS/terminal-notifier`
    });
  } else {
    nodeNotifier = new nodeNotifier.WindowsToaster({
      customPath: `${appDir}/custom/SnoreToast.exe`
    });
  }

  const appIconFilePath = isMac ? null : `${appDir}/images/${colorIconFilename64}`;

  let notifierScreen = null;

  /**
   * Class to check updated issues.
   */
  class RedmineNotifier {
    /**
     * Initialize the RedmineNotifier object.
     * @constructor
     * @param {number} index - Index of the object.
     */
    constructor(index) {
      this._newFlag = false;
      this._index = index;
      this._lastExecutionTime = null;
      this._settings = null;
      this._fetchTimer = null;
      this._fetchMode = null;
      this._mostRecentIssueId = null;
    }

    /**
     * Set flag of whether the object is new.
     * @param {boolean} newFlag - true if the object is new.
     * @return {Object} Current object.
     */
    setNewFlag(newFlag) {
      this._newFlag = newFlag;
      return this;
    }

    /**
     * Display the settings on the screen.
     * @return {Object} Current object.
     */
    displaySettings() {
      document.getElementById('url').value = this._settings.url;
      document.getElementById('api-key').value = this._settings.apiKey;
      document.getElementById('project-id').value = this._settings.projectId;
      document.getElementById('fetch-interval-sec').value = this._settings.fetchIntervalSec;
      return this;
    }

    /**
     * Get the settings from the screen.
     * @return {Object} Settings.
     */
    getPageSettings() {
      return {
        url: document.getElementById('url').value,
        apiKey: document.getElementById('api-key').value,
        projectId: document.getElementById('project-id').value,
        fetchIntervalSec: document.getElementById('fetch-interval-sec').value
      };
    }

    /**
     * Read the settings from the screen.
     * @return {Object} Current object.
     */
    readScreenSettings() {
      this._settings = this.getPageSettings();
      return this;
    }

    /**
     * Read the settings from the localStorage.
     * @return {Object} Current object.
     */
    readStoredSettings() {
      this._settings = {
        url: localStorage.getItem(`url${this._index}`),
        apiKey: localStorage.getItem(`apiKey${this._index}`),
        projectId: localStorage.getItem(`projectId${this._index}`),
        fetchIntervalSec: localStorage.getItem(`fetchIntervalSec${this._index}`)
      };

      return this;
    }

    /**
     * Get the setting from the localStorage.
     * @param {string} key - Setting key.
     * @return {string} Setting value.
     */
    getStoredSetting(key) {
      return localStorage.getItem(`${key}${this._index}`);
    }

    /**
     * Update the stored last execution time.
     * @return {Object} Current object.
     */
    updateLastExecutionTime() {
      this._lastExecutionTime = (new Date()).toISOString().replace(/\.\d+Z$/, 'Z');
      localStorage.setItem(`lastExecutionTime${this._index}`, this._lastExecutionTime);
      return this;
    }

    /**
     * Update the stored settings.
     * @return {Object} Current object.
     */
    updateSettings() {
      localStorage.setItem(`url${this._index}`, this._settings.url);
      localStorage.setItem(`apiKey${this._index}`, this._settings.apiKey);
      localStorage.setItem(`projectId${this._index}`, this._settings.projectId);
      localStorage.setItem(`fetchIntervalSec${this._index}`, this._settings.fetchIntervalSec);
      return this;
    }

    /**
     * Delete the settings.
     * @return {Object} Current object.
     */
    deleteStoredSettings() {
      localStorage.removeItem(`url${this._index}`);
      localStorage.removeItem(`apiKey${this._index}`);
      localStorage.removeItem(`projectId${this._index}`);
      localStorage.removeItem(`fetchIntervalSec${this._index}`);
      return this;
    }

    /**
     * Validate the settings.
     * @return {boolean} true if valid.
     */
    validateSettings() {
      if (this._settings.url && this._settings.apiKey) {
        return true;
      }
      notie.alert({
        type: 'error',
        text: 'Please enter required fields.',
        time: notieDisplaySec
      });
      return false;
    }

    /**
     * Initialize the fetch function.
     * @return {Object} Current object.
     */
    initFetch() {
      const intervalMsec = 1000 * (this._settings.fetchIntervalSec || defaultFetchIntervalSec);

      clearInterval(this._fetchTimer);

      this._fetchTimer = setInterval(() => {
        this.fetch(this._fetchMode || fetchMode.time);
      }, intervalMsec);

      return this;
    }

    /**
     * Fetch updated issues by using Redmine REST API.
     * @param {string} mode - Time or date.
     * @return {Object} Current object.
     */
    fetch(mode) {
      const xhr = new XMLHttpRequest();

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          this.handleResponseFetch(mode, xhr.status, xhr.responseText);
        }
      };

      xhr.open('GET', `${this._settings.url}/issues.json${this.getRequestParams(mode, this._settings.projectId)}`);
      xhr.setRequestHeader('X-Redmine-API-Key', this._settings.apiKey);
      xhr.send();

      return this;
    }

    /**
     * Handle the response for the fetch.
     * @param {string} mode - Time or date.
     * @param {number} status - Response status.
     * @param {string} responseText - Response text.
     * @return {Object} Current object.
     */
    handleResponseFetch(mode, status, responseText) {
      if (mode === fetchMode.time) {
        if (status === 200) {
          const response = JSON.parse(responseText);
          this.notify(response.issues, this.isOverPage(response))
            .updateLastExecutionTime();
        } else if (status === 422) {
          // Retry with date mode if Redmine API doesn't accept time format
          this._fetchMode = fetchMode.date;
          this.fetch(fetchMode.date);
        }
      } else {
        if (status === 200) {
          const response = JSON.parse(responseText);
          this.notify(this.pickIssues(response.issues), this.isOverPage(response));
        }

        this.updateLastExecutionTime();
      }

      return this;
    }

    /**
     * Check whether issues over 1 page.
     * @param {Object} response - Response.
     * @return {boolean} true if over 1 page.
     */
    isOverPage(response) {
      return response.total_count > response.limit;
    }

    /**
     * Get issues which were updated after last execution time.
     * @param {string} responseIssues - Response issues.
     * @return {Object[]} Processed issues.
     */
    pickIssues(responseIssues) {
      const lastExecutionTime = new Date(this._lastExecutionTime).getTime();

      const issues = responseIssues.filter(issue => {
        const updatedTime = new Date(issue.updated_on).getTime();
        return updatedTime >= lastExecutionTime;
      });

      return issues;
    }

    /**
     * Test the connection to the Redmine.
     * @param {string} mode - Time or date.
     * @return {Object} Current object.
     */
    testConnection(mode) {
      const xhr = new XMLHttpRequest();
      const pageSettings = this.getPageSettings();

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          this.handleResponseTestConnection(mode, xhr.status);
        }
      };

      xhr.open('GET', `${pageSettings.url}/issues.json${this.getRequestParams(mode, pageSettings.projectId)}`);
      xhr.setRequestHeader('X-Redmine-API-Key', pageSettings.apiKey);
      xhr.send();

      return this;
    }

    /**
     * Handle the response for the test connection.
     * @param {string} mode - Time or date.
     * @param {number} status - Response status.
     * @return {Object} Current object.
     */
    handleResponseTestConnection(mode, status) {
      if (status === 200) {
        notie.alert({
          type: 'success',
          text: 'Connection succeeded.',
          time: notieDisplaySec
        });
        return this;
      }

      // Retry with date mode if Redmine API doesn't accept time format
      if (mode === fetchMode.time && status === 422) {
        this.testConnection(fetchMode.date);
        return this;
      }

      notie.alert({
        type: 'error',
        text: 'Connection failed.',
        time: notieDisplaySec
      });

      return this;
    }

    /**
     * Get the request parameters.
     * @param {string} mode - Time or date.
     * @param {string} projectId - Project ID (a numeric value, not a project identifier).
     * @return {string} Request parameters.
     */
    getRequestParams(mode, projectId) {
      const params = [
        `updated_on=%3E%3D${this.getLastExecutionTime(mode)}`,
        'status_id=*',
        'sort=updated_on:desc',
        'limit=100'
      ];

      if (typeof projectId === 'string' && projectId !== '') {
        params.unshift(`project_id=${projectId}`);
      }

      return `?${params.join('&')}`;
    }

    /**
     * Get last execution time by mode.
     * @param {string} mode - Time or date.
     * @return {string} Last execution time.
     */
    getLastExecutionTime(mode) {
      if (mode === fetchMode.time) {
        return this._lastExecutionTime;
      }
      return this._lastExecutionTime.replace(/T.*/, ''); // Date
    }

    /**
     * Send the desktop notification.
     * @param {Object} issues - All of updated issues.
     * @param {boolean} isOverPage - true if over 1 page.
     * @return {Object} Current object.
     */
    notify(issues, isOverPage) {
      const issueCount = issues.length;

      if (issueCount === 0) {
        return this;
      }

      this._mostRecentIssueId = issues[0].id;
      notifierScreen.setNotificationIcon(this._index);

      // Display the latest issue's subject only
      nodeNotifier.notify({
        title: this.buildNotificationTitle(issueCount, isOverPage),
        message: issues[0].subject,
        wait: true
      });

      nodeNotifier.removeAllListeners();

      nodeNotifier.once('click', () => {
        shell.openExternal(`${this._settings.url}/issues/${this._mostRecentIssueId}`);
        notifierScreen.setNormalIcon();
        nodeNotifier.removeAllListeners();
      });

      nodeNotifier.once('timeout', () => {
        nodeNotifier.removeAllListeners();
      });

      return this;
    }

    /**
     * Build a notification title.
     * @param {number} issueCount - Count of issues.
     * @param {boolean} isOverPage - true if over 1 page.
     * @return {string} Notification title.
     */
    buildNotificationTitle(issueCount, isOverPage) {
      let title = `(${issueCount}`;
      if (isOverPage) {
        title += '+';
      }
      title += ') Redmine Notifier';

      return title;
    }
  }

  /**
   * Class to handle settings screen.
   */
  class RedmineNotifierScreen {
    /**
     * Initialize the RedmineNotifierScreen object.
     * @constructor
     */
    constructor() {
      this._notifiers = null;
      this._currentNotifierIndex = null;
      this._tray = null;
      this._contextMenu = null;
      this._mostRecentNotifierIndex = null;

      if (isMac) {
        this._iconFilePath = `${__dirname}/images/${blackIconFilename24}`;
        this._notificationIconFilePath = `${__dirname}/images/${blackIconFilename24Notification}`;
      } else {
        this._iconFilePath = `${__dirname}/images/${colorIconFilename24}`;
        this._notificationIconFilePath = `${__dirname}/images/${colorIconFilename24Notification}`;
      }
    }

    /**
     * Initialize the RedmineNotifier objects.
     * @param {RedmineNotifier[]} notifiers - RedmineNotifier objects.
     * @return {Object} Current object.
     */
    initNotifiers(notifiers) {
      this._notifiers = notifiers;
      this._currentNotifierIndex = Number(localStorage.getItem('lastDisplayedNotifierIndex'));

      const notifier = this._notifiers[this._currentNotifierIndex];
      notifier.displaySettings();

      return this;
    }

    /**
     * Initialize the application menu and context menu.
     * @return {Object} Current object.
     */
    initMenu() {
      const appMenu = Menu.buildFromTemplate([
        {
          label: 'Edit',
          submenu: [
            {role: 'undo'},
            {role: 'redo'},
            {role: 'cut'},
            {role: 'copy'},
            {role: 'paste'},
            {role: 'selectall'}
          ]
        }
      ]);

      let aboutMenuItem;
      if (isMac) {
        aboutMenuItem = {role: 'about'};
      } else {
        aboutMenuItem = {
          label: `About ${appName}`,
          click: () => {
            dialog.showMessageBox({
              title: `About ${appName}`,
              message: `${appName} ${app.getVersion()}`,
              detail: appCopyright,
              icon: appIconFilePath,
              buttons: []
            });
          }
        };
      }

      this._contextMenu = Menu.buildFromTemplate([
        {
          label: 'Open Most Recent Issue in Browser',
          click: () => {
            const notifier = this._notifiers[this._mostRecentNotifierIndex];
            shell.openExternal(`${notifier._settings.url}/issues/${notifier._mostRecentIssueId}`);
            notifierScreen.setNormalIcon();
          },
          enabled: false
        },
        {
          label: 'Preferences',
          click: () => {
            remote.getCurrentWindow().show();
          }
        },
        {
          type: 'separator'
        },
        aboutMenuItem,
        {
          type: 'separator'
        },
        {
          label: 'Quit',
          click: () => {
            const notifier = this._notifiers[this._currentNotifierIndex];
            if (!notifier._newFlag) {
              this.updateLastDisplayedNotifierIndex();
            }

            remote.app.quit();
          }
        }
      ]);

      Menu.setApplicationMenu(appMenu);

      this._tray = new Tray(this._iconFilePath);
      this._tray.setContextMenu(this._contextMenu);

      return this;
    }

    /**
     * Initialize the event listeners.
     * @return {Object} Current object.
     */
    initEventListener() {
      document.getElementById('save-button').addEventListener('click', () => {
        const notifier = this._notifiers[this._currentNotifierIndex];
        notifier.readScreenSettings();

        if (notifier.validateSettings()) {
          notifier.initFetch()
            .updateSettings();
          this.updateNotifierCount();

          if (notifier._newFlag) {
            this.updateLastDisplayedNotifierIndex();
            notifier.setNewFlag(false);
          }

          notie.alert({
            type: 'success',
            text: 'Settings have been saved.',
            time: notieDisplaySec
          });
        } else {
          notifier.readStoredSettings();
        }
      });

      document.getElementById('close-button').addEventListener('click', () => {
        const notifier = this._notifiers[this._currentNotifierIndex];
        notifier.readStoredSettings()
          .displaySettings();
        remote.getCurrentWindow().hide();
      });

      document.getElementById('test-connection-button').addEventListener('click', () => {
        const notifier = this._notifiers[this._currentNotifierIndex];
        notifier.testConnection(fetchMode.time);
      });

      document.getElementById('new-url-button').addEventListener('click', () => {
        const lastNotifier = this._notifiers[this._notifiers.length - 1];
        if (lastNotifier._settings.url === null) {
          return;
        }

        this._currentNotifierIndex = this._notifiers.length;
        this.addNotifier(this._currentNotifierIndex)
          .displaySettings();
      });

      document.getElementById('other-urls-button').addEventListener('click', () => {
        this.openURLMenu();

        if (this._notifiers.length === 0) {
          this.addNotifier(0);
        }
      });

      document.getElementById('delete-button').addEventListener('click', () => {
        notie.confirm({
          text: 'Are you sure you want to delete this setting?',
          cancelText: 'No',
          submitCallback: () => {
            this.deleteCurrentNotifierSettings()
              .resetAllSettings()
              .updateNotifierCount()
              .displaySettingsAfterDelete();

            notie.alert({
              type: 'success',
              text: 'Settings have been deleted.',
              time: notieDisplaySec
            });
          }
        });
      });

      return this;
    }

    /**
     * Display the default settings on the screen.
     * @return {Object} Current object.
     */
    displayDefaultSettings() {
      document.getElementById('default-fetch-interval-sec').innerHTML = defaultFetchIntervalSec;
      return this;
    }

    /**
     * Update the stored count of RedmineNotifier objects.
     * @return {Object} Current object.
     */
    updateNotifierCount() {
      localStorage.setItem('notifierCount', this._notifiers.length);
      return this;
    }

    /**
     * Update the stored index of last displayed RedmineNotifier object.
     * @return {Object} Current object.
     */
    updateLastDisplayedNotifierIndex() {
      localStorage.setItem('lastDisplayedNotifierIndex', this._currentNotifierIndex);
      return this;
    }

    /**
     * Add a RedmineNotifier object.
     * @param {number} index - Index of the object.
     * @return {Object} The RedmineNotifier object.
     */
    addNotifier(index) {
      const notifier = new RedmineNotifier(index);
      notifier.updateLastExecutionTime()
        .readStoredSettings()
        .setNewFlag(true);
      this._notifiers.push(notifier);
      return notifier;
    }

    /**
     * Select valid RedmineNotifier objects.
     * @return {RedmineNotifier[]} Valid RedmineNotifier objects.
     */
    selectValidNotifiers() {
      return this._notifiers.filter(notifier => {
        return notifier._settings.url !== null;
      });
    }

    /**
     * Open the URL menu.
     * @return {Object} Current object.
     */
    openURLMenu() {
      const choices = [];

      const notifiers = this.selectValidNotifiers();
      notifiers.forEach((notifier, index) => {
        choices.push({
          text: notifier.getStoredSetting('url'),
          handler: () => {
            this._currentNotifierIndex = index;
            this.updateLastDisplayedNotifierIndex();
            notifier.readStoredSettings()
              .displaySettings();

            this._notifiers = this.selectValidNotifiers();
          }
        });
      });

      notie.select({
        text: 'Stored URLs',
        choices
      });

      this.wrapURLMenuItems();

      return this;
    }

    /**
     * Wrap an HTMLElement around URL menu item elements.
     * @return {Object} Current object.
     */
    wrapURLMenuItems() {
      const selectContainer = document.createElement('div');
      selectContainer.className = 'notie-select-container';

      const selectChoices = Array.prototype.slice.call(document.getElementsByClassName('notie-select-choice'));
      const notieContainer = selectChoices[0].parentNode;

      selectChoices.forEach(choice => {
        selectContainer.appendChild(choice);
      });

      const {cancelButton} = notieContainer.getElementsByClassName('notie-background-neutral notie-button');
      notieContainer.insertBefore(selectContainer, cancelButton);

      return this;
    }

    /**
     * Delete the settings of current RedmineNotifier object.
     * @return {Object} Current object.
     */
    deleteCurrentNotifierSettings() {
      const notifier = this._notifiers[this._currentNotifierIndex];
      notifier.deleteStoredSettings()
        .readStoredSettings();
      return this;
    }

    /**
     * Reset all settings.
     * @return {Object} Current object.
     */
    resetAllSettings() {
      this._notifiers = this.selectValidNotifiers();

      localStorage.clear();

      this._notifiers.forEach((notifier, index) => {
        notifier._index = index;
        notifier.updateSettings();
      });

      return this;
    }

    /**
     * Display settings after deleting.
     * @return {Object} Current object.
     */
    displaySettingsAfterDelete() {
      if (this._notifiers.length === 0) {
        // Display the first settings
        this._currentNotifierIndex = 0;
        this.addNotifier(this._currentNotifierIndex);
      } else if (this._notifiers[this._currentNotifierIndex] === undefined) {
        // Display the previous settings
        this._currentNotifierIndex = this._currentNotifierIndex - 1;
      }

      const notifier = this._notifiers[this._currentNotifierIndex];
      notifier.displaySettings();

      return this;
    }

    /**
     * Set normal icon and disable "Open Most Recent Issue in Browser" in context menu.
     * @return {Object} Current object.
     */
    setNormalIcon() {
      this._tray.setImage(this._iconFilePath);
      this._contextMenu.items[0].enabled = false;
      this._mostRecentNotifierIndex = null;
      return this;
    }

    /**
     * Set notification icon and enable "Open Most Recent Issue in Browser" in context menu.
     * @param {number} index - Index of the most recent RedmineNotifier object.
     * @return {Object} Current object.
     */
    setNotificationIcon(index) {
      this._tray.setImage(this._notificationIconFilePath);
      this._contextMenu.items[0].enabled = true;
      this._mostRecentNotifierIndex = index;
      return this;
    }
  }

  /**
   * Check whether old settings exist.
   * @param {Object} oldSettings - Old settings.
   * @return {boolean} true if old settings exist.
   */
  const hasOldSettings = oldSettings => {
    for (const key in oldSettings) {
      if (Object.prototype.hasOwnProperty.call(oldSettings, key) && oldSettings[key] !== null) {
        return true;
      }
    }

    return false;
  };

  /**
   * Migrate the settings of Redmine Notifier 0.5.0 or 0.6.0.
   * @return {boolean} true if old settings are migrated.
   */
  const migrateOldSettings = () => {
    const oldSettings = {
      url: localStorage.getItem('url'),
      apiKey: localStorage.getItem('apiKey'),
      projectId: localStorage.getItem('projectId'),
      fetchIntervalSec: localStorage.getItem('fetchIntervalSec'),
      lastExecutionTime: localStorage.getItem('lastExecutionTime')
    };

    if (!hasOldSettings(oldSettings)) {
      return false;
    }

    // Copy to index 0
    const notifier = new RedmineNotifier(0);
    delete oldSettings.lastExecutionTime; // Strictly speaking, `lastExecutionTime` is not a setting
    notifier._settings = oldSettings;
    notifier.updateSettings();
    notifier.updateLastExecutionTime();

    localStorage.setItem('notifierCount', 1);
    localStorage.setItem('lastDisplayedNotifierIndex', 0);

    // Delete old settings
    localStorage.removeItem('url');
    localStorage.removeItem('apiKey');
    localStorage.removeItem('projectId');
    localStorage.removeItem('fetchIntervalSec');
    localStorage.removeItem('lastExecutionTime');

    return true;
  };

  window.addEventListener('load', () => {
    migrateOldSettings();

    notie.setOptions({
      classes: {
        selectChoice: 'notie-select-choice'
      }
    });

    const notifiers = [];
    const notifierCount = Number(localStorage.getItem('notifierCount'));

    for (let i = 0; i < notifierCount; i++) {
      const notifier = new RedmineNotifier(i);
      notifier.updateLastExecutionTime()
        .readStoredSettings();

      if (notifier.validateSettings()) {
        notifier.initFetch();
      }

      notifiers.push(notifier);
    }

    if (notifiers.length === 0) {
      const notifier = new RedmineNotifier(0);
      notifier.updateLastExecutionTime()
        .readStoredSettings();
      notifiers.push(notifier);
    }

    notifierScreen = new RedmineNotifierScreen();
    notifierScreen.initNotifiers(notifiers)
      .initMenu()
      .initEventListener()
      .displayDefaultSettings();
  });
})();

