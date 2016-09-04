'use strict';

(() => {
  const DEFAULT_FETCH_INTERVAL_SEC = 600;
  const NOTIE_DISPLAY_SEC = 1.5;
  const COLOR_ICON_FILENAME_64 = 'redmine_icon_color_64.png';
  const BLACK_ICON_FILENAME_24 = 'redmine_icon_black_24.png';
  const BLACK_ICON_FILENAME_24_NOTIFICATION = 'redmine_icon_black_24_notification.png';
  const COLOR_ICON_FILENAME_24 = 'redmine_icon_color_24.png';
  const COLOR_ICON_FILENAME_24_NOTIFICATION = 'redmine_icon_color_24_notification.png';

  const electron = require('electron');
  const remote = electron.remote;
  const shell = remote.shell;
  const Menu = remote.Menu;
  const Tray = remote.Tray;
  const fs = require('fs');
  const notie = require('notie');
  const nodeNotifier = require('node-notifier');

  const FETCH_MODE = Object.freeze({ TIME: 'TIME', DATE: 'DATE' });

  let notifierScreen = null;

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

      if (process.platform === 'darwin') {
        this._iconFilePath             = `${__dirname}/images/${BLACK_ICON_FILENAME_24}`;
        this._notificationIconFilePath = `${__dirname}/images/${BLACK_ICON_FILENAME_24_NOTIFICATION}`;
      } else {
        this._iconFilePath             = `${__dirname}/images/${COLOR_ICON_FILENAME_24}`;
        this._notificationIconFilePath = `${__dirname}/images/${COLOR_ICON_FILENAME_24_NOTIFICATION}`;
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
            { role: 'undo' },
            { role: 'redo' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' },
            { role: 'selectall' }
          ]
        }
      ]);

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

          notie.alert('success', 'Settings have been saved.', NOTIE_DISPLAY_SEC);
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
        notifier.testConnection(FETCH_MODE.TIME);
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

      document.getElementById('delete-link').addEventListener('click', () => {
        notie.confirm('Are you sure you want to delete this setting?', 'Yes', 'No', () => {
          this.deleteCurrentNotifierSettings();
          this.resetAllSettings();
          this.updateNotifierCount();

          // Display the first RedmineNotifier's settings
          this._currentNotifierIndex = 0;
          this.updateLastDisplayedNotifierIndex();
          if (this._notifiers.length === 0) {
            this.addNotifier(0);
          }
          this._notifiers[0].displaySettings();

          notie.alert('success', 'Settings have been deleted.', NOTIE_DISPLAY_SEC);
        });
      });

      return this;
    }

    /**
     * Display the default settings on the screen.
     * @return {Object} Current object.
     */
    displayDefaultSettings() {
      document.getElementById('default-fetch-interval-sec').innerHTML = DEFAULT_FETCH_INTERVAL_SEC;
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
     * Open the URL menu.
     * @return {Object} Current object.
     */
    openURLMenu() {
      let choices = [];

      // Remove invalid RedmineNotifier objects
      this._notifiers = this._notifiers.filter((notifier) => {
        return notifier._settings.url !== null;
      });

      this._notifiers.forEach((notifier, index) => {
        choices.push({
          title: notifier.getStoredSetting('url'),
          color: '#628db6',
          handler: () => {
            this._currentNotifierIndex = index;
            this.updateLastDisplayedNotifierIndex();
            notifier.readStoredSettings()
              .displaySettings();
          }
        });
      });

      notie.select('Stored URLs', 'Cancel', choices);

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
      // Remove invalid RedmineNotifier objects
      this._notifiers = this._notifiers.filter((notifier) => {
        return notifier._settings.url !== null;
      });

      localStorage.clear();

      this._notifiers.forEach((notifier, index) => {
        notifier._index = index;
        notifier.updateSettings();
      });

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
      } else {
        notie.alert('error', 'Please enter required fields.', NOTIE_DISPLAY_SEC);
        return false;
      }
    }

    /**
     * Initialize the fetch function.
     * @return {Object} Current object.
     */
    initFetch() {
      const intervalMsec = 1000 * (this._settings.fetchIntervalSec || DEFAULT_FETCH_INTERVAL_SEC);

      clearInterval(this._fetchTimer);

      this._fetchTimer = setInterval(() => {
        this.fetch(this._fetchMode || FETCH_MODE.TIME);
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
      if (mode === FETCH_MODE.TIME) {
        if (status === 200) {
          this.notify(JSON.parse(responseText).issues)
            .updateLastExecutionTime();
        } else if (status === 422) {
          // Retry with date mode if Redmine API doesn't accept time format
          this._fetchMode = FETCH_MODE.DATE;
          this.fetch(FETCH_MODE.DATE);
        }
      } else {
        if (status === 200) {
          this.notify(this.pickIssues(JSON.parse(responseText).issues));
        }

        this.updateLastExecutionTime();
      }

      return this;
    }

    /**
     * Get issues which were updated after last execution time.
     * @param {string} responseIssues - Response issues.
     * @return {Object[]} Processed issues.
     */
    pickIssues(responseIssues) {
      const lastExecutionTime = new Date(this._lastExecutionTime).getTime();

      const issues = responseIssues.filter((issue) => {
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
        notie.alert('success', 'Connection succeeded.', NOTIE_DISPLAY_SEC);
        return this;
      }

      // Retry with date mode if Redmine API doesn't accept time format
      if (mode === FETCH_MODE.TIME && status === 422) {
        this.testConnection(FETCH_MODE.DATE);
        return this;
      }

      notie.alert('error', 'Connection failed.', NOTIE_DISPLAY_SEC);

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
        'sort=updated_on:desc'
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
      if (mode === FETCH_MODE.TIME) {
        return this._lastExecutionTime;
      } else {
        return this._lastExecutionTime.replace(/T.*/, ''); // Date
      }
    }

    /**
     * Send the desktop notification.
     * @param {Object} issues - All of updated issues.
     * @return {Object} Current object.
     */
    notify(issues) {
      const issueCount = issues.length;

      if (issueCount === 0) return this;

      let appDir = `${__dirname}.unpacked`; // Production
      try {
        fs.statSync(appDir);
      } catch(e) {
        appDir = __dirname; // Development
      }

      this._mostRecentIssueId = issues[0].id;
      notifierScreen.setNotificationIcon(this._index);

      // Display the latest issue's subject only
      nodeNotifier.notify({
        title: `(${issueCount}) Redmine Notifier`,
        message: issues[0].subject,
        icon: `${appDir}/images/${COLOR_ICON_FILENAME_64}`,
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
  }

  window.addEventListener('load', () => {
    // Delete settings of Redmine Notifier <= 0.6.0
    localStorage.removeItem('url');
    localStorage.removeItem('apiKey');
    localStorage.removeItem('projectId');
    localStorage.removeItem('fetchIntervalSec');
    localStorage.removeItem('lastExecutionTime');

    notie.setOptions({ colorInfo: '#3e5b76' });

    let notifiers = [];
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

