'use strict';

(function() {
  const DEFAULT_FETCH_INTERVAL_SEC = 600;
  const NOTIE_DISPLAY_SEC = 1.5;
  const COLOR_ICON_FILENAME_64 = 'redmine_icon_color_64.png';

  var remote = window.require('remote');
  var shell = remote.require('shell');
  var fs = require('fs');
  var notie = require('notie');
  var notifier = require('node-notifier');

  var FETCH_MODE = Object.freeze({ TIME: 'TIME', DATE: 'DATE' });

  /**
   * Initialize the RedmineNotifier object.
   * @constructor
   */
  function RedmineNotifier() {
    this._lastExecutionTime = null;
    this._settings = null;
    this._fetchTimer = null;
    this._fetchMode = null;
  }

  /**
   * Initialize the event listeners.
   * @return {Object} Current object.
   */
  RedmineNotifier.prototype.initEventListener = function() {
    var _this = this;

    document.getElementById('save-button').addEventListener('click', function() {
      _this.readScreenSettings();

      if (_this.validateSettings()) {
        _this.initFetch()
          .updateSettings();
      } else {
        _this.readStoredSettings();
      }

      notie.alert(1, 'Settings have been saved.', NOTIE_DISPLAY_SEC);
    });

    document.getElementById('close-button').addEventListener('click', function() {
      _this.readStoredSettings()
        .displaySettings();
      remote.getCurrentWindow().hide();
      remote.getCurrentWindow().reload();
    });

    document.getElementById('test-connection-button').addEventListener('click', function() {
      _this.testConnection(FETCH_MODE.TIME);
    });

    return this;
  };

  /**
   * Display the default settings on the screen.
   * @return {Object} Current object.
   */
  RedmineNotifier.prototype.displayDefaultSettings = function() {
    document.getElementById('default-fetch-interval-sec').innerHTML = DEFAULT_FETCH_INTERVAL_SEC;
    return this;
  };

  /**
   * Display the settings on the screen.
   * @return {Object} Current object.
   */
  RedmineNotifier.prototype.displaySettings = function() {
    document.getElementById('url').value = this._settings.url;
    document.getElementById('api-key').value = this._settings.apiKey;
    document.getElementById('project-id').value = this._settings.projectId;
    document.getElementById('fetch-interval-sec').value = this._settings.fetchIntervalSec;
    return this;
  };

  /**
   * Get the settings from the screen.
   * @return {Object} Settings.
   */
  RedmineNotifier.prototype.getPageSettings = function() {
    return {
      url: document.getElementById('url').value,
      apiKey: document.getElementById('api-key').value,
      projectId: document.getElementById('project-id').value,
      fetchIntervalSec: document.getElementById('fetch-interval-sec').value
    };
  };

  /**
   * Read the settings from the screen.
   * @return {Object} Current object.
   */
  RedmineNotifier.prototype.readScreenSettings = function() {
    this._settings = this.getPageSettings();
    return this;
  };

  /**
   * Read the settings from the localStorage.
   * @return {Object} Current object.
   */
  RedmineNotifier.prototype.readStoredSettings = function() {
    this._settings = {
      url: localStorage.getItem('url'),
      apiKey: localStorage.getItem('apiKey'),
      projectId: localStorage.getItem('projectId'),
      fetchIntervalSec: localStorage.getItem('fetchIntervalSec')
    };

    return this;
  };

  /**
   * Update the stored last execution time.
   * @return {Object} Current object.
   */
  RedmineNotifier.prototype.updateLastExecutionTime = function() {
    this._lastExecutionTime = (new Date()).toISOString().replace(/\.\d+Z$/, 'Z');
    localStorage.setItem('lastExecutionTime', this._lastExecutionTime);
    return this;
  };

  /**
   * Update the stored settings.
   * @return {Object} Current object.
   */
  RedmineNotifier.prototype.updateSettings = function() {
    localStorage.setItem('url', this._settings.url);
    localStorage.setItem('apiKey', this._settings.apiKey);
    localStorage.setItem('projectId', this._settings.projectId);
    localStorage.setItem('fetchIntervalSec', this._settings.fetchIntervalSec);
    return this;
  };

  /**
   * Validate the settings.
   * @return {boolean} true if valid.
   */
  RedmineNotifier.prototype.validateSettings = function() {
    if (this._settings.url && this._settings.apiKey) {
      return true;
    } else {
      notie.alert(3, 'Please enter required fields.', NOTIE_DISPLAY_SEC);
      return false;
    }
  };

  /**
   * Initialize the fetch function.
   * @return {Object} Current object.
   */
  RedmineNotifier.prototype.initFetch = function() {
    var _this = this;
    var intervalMsec = 1000 * (this._settings.fetchIntervalSec || DEFAULT_FETCH_INTERVAL_SEC);

    clearInterval(this._fetchTimer);

    this._fetchTimer = setInterval(function() {
      _this.fetch(_this._fetchMode || FETCH_MODE.TIME);
    }, intervalMsec);

    return this;
  };

  /**
   * Fetch updated issues by using Redmine REST API.
   * @param {string} mode - Time or date.
   * @return {Object} Current object.
   */
  RedmineNotifier.prototype.fetch = function(mode) {
    var _this = this;
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        _this.handleResponseFetch(mode, xhr.status, xhr.responseText);
      }
    };

    xhr.open('GET', this._settings.url + '/issues.json' + this.getRequestParams(mode, this._settings.projectId));
    xhr.setRequestHeader('X-Redmine-API-Key', this._settings.apiKey);
    xhr.send();

    return this;
  };

  /**
   * Handle the response for the fetch.
   * @param {string} mode - Time or date.
   * @param {number} status - Response status.
   * @param {string} responseText - Response text.
   * @return {Object} Current object.
   */
  RedmineNotifier.prototype.handleResponseFetch = function(mode, status, responseText) {
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
  };

  /**
   * Get issues which were updated after last execution time.
   * @param {string} responseIssues - Response issues.
   * @return {Object[]} Processed issues.
   */
  RedmineNotifier.prototype.pickIssues = function(responseIssues) {
    var responseIssueCount = responseIssues.length;
    var lastExecutionTime = new Date(this._lastExecutionTime).getTime();
    var issues = [];
    var i;
    var updatedTime;

    for (i = 0; i < responseIssueCount; i++) {
      updatedTime = new Date(responseIssues[i].updated_on).getTime();

      if (updatedTime >= lastExecutionTime) {
        issues.push(responseIssues[i]);
      }
    }

    return issues;
  };

  /**
   * Test the connection to the Redmine.
   * @param {string} mode - Time or date.
   * @return {Object} Current object.
   */
  RedmineNotifier.prototype.testConnection = function(mode) {
    var _this = this;
    var xhr = new XMLHttpRequest();
    var pageSettings = this.getPageSettings();

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        _this.handleResponseTestConnection(mode, xhr.status);
      }
    };

    xhr.open('GET', pageSettings.url + '/issues.json' + this.getRequestParams(mode, pageSettings.projectId));
    xhr.setRequestHeader('X-Redmine-API-Key', pageSettings.apiKey);
    xhr.send();

    return this;
  };

  /**
   * Handle the response for the test connection.
   * @param {string} mode - Time or date.
   * @param {number} status - Response status.
   * @return {Object} Current object.
   */
  RedmineNotifier.prototype.handleResponseTestConnection = function(mode, status) {
    if (status === 200) {
      notie.alert(1, 'Connection succeeded.', NOTIE_DISPLAY_SEC);
      return this;
    }

    // Retry with date mode if Redmine API doesn't accept time format
    if (mode === FETCH_MODE.TIME && status === 422) {
      this.testConnection(FETCH_MODE.DATE);
      return this;
    }

    notie.alert(3, 'Connection failed.', NOTIE_DISPLAY_SEC);

    return this;
  };

  /**
   * Get the request parameters.
   * @param {string} mode - Time or date.
   * @param {string} projectId - Project ID (a numeric value, not a project identifier).
   * @return {string} Request parameters.
   */
  RedmineNotifier.prototype.getRequestParams = function(mode, projectId) {
    var params = [
      'updated_on=%3E%3D' + this.getLastExecutionTime(mode),
      'sort=updated_on:desc'
    ];

    if (typeof projectId === 'string' && projectId !== '') {
      params.unshift('project_id=' + projectId);
    }

    return '?' + params.join('&');
  };

  /**
   * Get last execution time by mode.
   * @param {string} mode - Time or date.
   * @return {string} Last execution time.
   */
  RedmineNotifier.prototype.getLastExecutionTime = function(mode) {
    if (mode === FETCH_MODE.TIME) {
      return this._lastExecutionTime;
    } else {
      return this._lastExecutionTime.replace(/T.*/, ''); // Date
    }
  };

  /**
   * Send the desktop notification.
   * @param {Object} issues - All of updated issues.
   * @return {Object} Current object.
   */
  RedmineNotifier.prototype.notify = function(issues) {
    var _this = this;
    var issueCount = issues.length;

    if (issueCount === 0) return this;

    var appDir = __dirname + '.unpacked'; // Production
    try {
      fs.statSync(appDir);
    } catch(e) {
      appDir = __dirname; // Development
    }

    // Display the latest issue's subject only
    notifier.notify({
      title: '(' + issueCount + ') Redmine Notifier',
      message: issues[0].subject,
      icon: appDir + '/images/' + COLOR_ICON_FILENAME_64,
      wait: true
    });

    notifier.removeAllListeners();

    notifier.once('click', function() {
      shell.openExternal(_this._settings.url + '/issues/' + issues[0].id);
      notifier.removeAllListeners();
    });

    notifier.once('timeout', function() {
      notifier.removeAllListeners();
    });

    return this;
  };

  window.addEventListener('load', function() {
    var redmineNotifier = new RedmineNotifier();
    redmineNotifier.initEventListener()
      .displayDefaultSettings()
      .updateLastExecutionTime()
      .readStoredSettings()
      .displaySettings();

    if (redmineNotifier.validateSettings()) {
      redmineNotifier.initFetch();
    }
  });
}());

