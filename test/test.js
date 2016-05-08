'use strict';

describe('application launch', function() {
  this.timeout(10000);

  const Application = require('spectron').Application;
  const chai = require('chai');
  const chaiAsPromised = require('chai-as-promised');
  const app = new Application({
    path: `${__dirname}/../dist/Redmine Notifier-darwin-x64/Redmine Notifier.app/Contents/MacOS/Redmine Notifier`
  });

  chai.should();
  chai.use(chaiAsPromised);
  chaiAsPromised.transferPromiseness = app.transferPromiseness;

  beforeEach(() => {
    return app.start();
  });

  afterEach(() => {
    if (app && app.isRunning()) {
      return app.stop();
    }
  });

  it('opens a window', () => {
    return app.client.waitUntilWindowLoaded()
      .getWindowCount().should.eventually.equal(1)
      .browserWindow.getBounds().should.eventually.have.property('width').equal(850)
      .browserWindow.getBounds().should.eventually.have.property('height').equal(300)
      .browserWindow.isVisible().should.eventually.be.false
      .browserWindow.isResizable().should.eventually.be.false
      .browserWindow.isFocused().should.eventually.be.false
      .browserWindow.isMaximized().should.eventually.be.false
      .browserWindow.isMinimized().should.eventually.be.false
      .browserWindow.isFullScreen().should.eventually.be.false
      .browserWindow.isMovable().should.eventually.be.true
      .browserWindow.isMaximizable().should.eventually.be.false
      .browserWindow.isMinimizable().should.eventually.be.true
      .browserWindow.isFullScreenable().should.eventually.be.true
      .browserWindow.isClosable().should.eventually.be.true
      .browserWindow.isAlwaysOnTop().should.eventually.be.false
      .browserWindow.isKiosk().should.eventually.be.false
      .browserWindow.isDocumentEdited().should.eventually.be.false
      .browserWindow.isMenuBarAutoHide().should.eventually.be.false
      .browserWindow.isMenuBarVisible().should.eventually.be.true
      .browserWindow.isVisibleOnAllWorkspaces().should.eventually.be.false
      .browserWindow.isDevToolsOpened().should.eventually.be.false
      .browserWindow.isDevToolsFocused().should.eventually.be.false;
  });
});

