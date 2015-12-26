'use strict';

(function() {
  const DEFAULT_FETCH_INTERVAL_SEC = 600;
  const STATIC_REQUEST_PARAMS = '&sort=updated_on:desc';
  const NOTIE_DISPLAY_SEC = 1.5;
  const COLOR_ICON_FILENAME_64 = 'redmine_icon_color_64.png';

  var remote = window.require('remote');
  var shell = remote.require('shell');
  var fs = require('fs');
  var notie = require('notie');
  var notifier = require('node-notifier');

  /**
   * Initialize the RedmineNotifier object.
   * @constructor
   */
  function RedmineNotifier() {
    this._lastExecutionTime = null;
    this._settings = null;
    this._fetchTimer = null;
  }

  /**
   * Initialize the event listeners.
   */
  RedmineNotifier.prototype.initEventListener = function() {
    var _this = this;

    document.getElementById('save-button').addEventListener('click', function() {
      _this.readScreenSettings();

      if (_this.validateSettings()) {
        _this.initFetch();
        _this.updateSettings();
      } else {
        _this.readStoredSettings();
      }

      notie.alert(1, 'Settings have been saved.', NOTIE_DISPLAY_SEC);
    });

    document.getElementById('close-button').addEventListener('click', function() {
      _this.readStoredSettings();
      _this.displaySettings();
      remote.getCurrentWindow().hide();
    });

    document.getElementById('test-connection-button').addEventListener('click', function() {
      _this.testConnection();
    });
  };

  /**
   * Display the default settings on the screen.
   */
  RedmineNotifier.prototype.displayDefaultSettings = function() {
    document.getElementById('default-fetch-interval-sec').innerHTML = DEFAULT_FETCH_INTERVAL_SEC;
  };

  /**
   * Display the settings on the screen.
   */
  RedmineNotifier.prototype.displaySettings = function() {
    document.getElementById('url').value = this._settings.url;
    document.getElementById('api-key').value = this._settings.apiKey;
    document.getElementById('fetch-interval-sec').value = this._settings.fetchIntervalSec;
  };

  /**
   * Get the settings from the screen.
   */
  RedmineNotifier.prototype.getPageSettings = function() {
    return {
      url: document.getElementById('url').value,
      apiKey: document.getElementById('api-key').value,
      fetchIntervalSec: document.getElementById('fetch-interval-sec').value
    };
  };

  /**
   * Read the settings from the screen.
   */
  RedmineNotifier.prototype.readScreenSettings = function() {
    this._settings = this.getPageSettings();
  };

  /**
   * Read the settings from the localStorage.
   */
  RedmineNotifier.prototype.readStoredSettings = function() {
    this._settings = {
      url: localStorage.getItem('url'),
      apiKey: localStorage.getItem('apiKey'),
      fetchIntervalSec: localStorage.getItem('fetchIntervalSec')
    };
  };

  /**
   * Update the stored last execution time.
   */
  RedmineNotifier.prototype.updateLastExecutionTime = function() {
    this._lastExecutionTime = (new Date()).toISOString().replace(/\.\d+Z$/, 'Z');
    localStorage.setItem('lastExecutionTime', this._lastExecutionTime);
  };

  /**
   * Update the stored settings.
   */
  RedmineNotifier.prototype.updateSettings = function() {
    localStorage.setItem('url', this._settings.url);
    localStorage.setItem('apiKey', this._settings.apiKey);
    localStorage.setItem('fetchIntervalSec', this._settings.fetchIntervalSec);
  };

  /**
   * Validate the settings.
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
   */
  RedmineNotifier.prototype.initFetch = function() {
    var _this = this;
    var intervalMsec = 1000 * (this._settings.fetchIntervalSec || DEFAULT_FETCH_INTERVAL_SEC);

    clearInterval(this._fetchTimer);

    this._fetchTimer = setInterval(function() {
      _this.fetch();
    }, intervalMsec);
  };

  /**
   * Fetch updated issues by using Redmine REST API.
   */
  RedmineNotifier.prototype.fetch = function() {
    var _this = this;
    var xhr = new XMLHttpRequest();
    var requestParams = '?updated_on=%3E%3D' + this._lastExecutionTime + STATIC_REQUEST_PARAMS;

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        _this.notify(JSON.parse(xhr.responseText).issues);
      }
    };

    xhr.open('GET', this._settings.url + '/issues.json' + requestParams);
    xhr.setRequestHeader('X-Redmine-API-Key', this._settings.apiKey);
    xhr.send();

    this.updateLastExecutionTime();
  };

  /**
   * Test the connection to the Redmine.
   */
  RedmineNotifier.prototype.testConnection = function() {
    var xhr = new XMLHttpRequest();
    var pageSettings = this.getPageSettings();
    var requestParams = '?updated_on=%3E%3D' + this._lastExecutionTime + STATIC_REQUEST_PARAMS;

    xhr.onreadystatechange = function() {
      var style = 3;
      var message = 'Connection failed.';

      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          style = 1;
          message = 'Connection succeeded.';
        }

        notie.alert(style, message, NOTIE_DISPLAY_SEC);
      }
    };

    xhr.open('GET', pageSettings.url + '/issues.json' + requestParams);
    xhr.setRequestHeader('X-Redmine-API-Key', pageSettings.apiKey);
    xhr.send();
  };

  /**
   * Send the desktop notification.
   * @param {Object} issues - All of updated issues.
   */
  RedmineNotifier.prototype.notify = function(issues) {
    var _this = this;
    var issueCount = issues.length;

    if (issueCount === 0) return;

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

    notifier.once('click', function(notifierObject, options) {
      shell.openExternal(_this._settings.url + '/issues/' + issues[0].id);
      notifier.removeAllListeners();
    });

    notifier.once('timeout', function(notifierObject, options) {
      notifier.removeAllListeners();
    });
  };

  window.onload = function() {
    var redmineNotifier = new RedmineNotifier();
    redmineNotifier.initEventListener();
    redmineNotifier.displayDefaultSettings();
    redmineNotifier.updateLastExecutionTime();
    redmineNotifier.readStoredSettings();
    redmineNotifier.displaySettings();

    if (redmineNotifier.validateSettings()) {
      redmineNotifier.initFetch();
    }
  };
})();

