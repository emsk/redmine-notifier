# Redmine Notifier

[![Build Status](https://travis-ci.org/emsk/redmine-notifier.svg?branch=master)](https://travis-ci.org/emsk/redmine-notifier)
[![Code Climate](https://codeclimate.com/github/emsk/redmine-notifier/badges/gpa.svg)](https://codeclimate.com/github/emsk/redmine-notifier)
[![Dependency Status](https://gemnasium.com/emsk/redmine-notifier.svg)](https://gemnasium.com/emsk/redmine-notifier)
[![Inline docs](http://inch-ci.org/github/emsk/redmine-notifier.svg?branch=master)](http://inch-ci.org/github/emsk/redmine-notifier)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Redmine Notifier is a simple updated issues checker that runs in the background.
It sends a desktop notification if there are any updates in issues.

## Installation

Installers for OS X and Windows can be found on the [releases](../../releases) page.

For Windows, the app is installed to `C:\Users\[UserName]\AppData\Local\redmine\app-[AppVersion]\Redmine Notifier.exe`.

## Main Notifications

The number of issues that were updated after previous fetch is shown in parentheses.
Also, the subject is shown only about the latest issue.

![Notification Mac 10.10](examples/notification_osx_10.10.png?raw=true)
![Notification Win 8.1](examples/notification_win_8.1.png?raw=true)
![Notification Win 7](examples/notification_win_7.png?raw=true)

## Sub Notifications

When Redmine Notifier is started, an icon appears in the menu bar or task tray.
If there is a notification in the most recent fetch, the icon is replaced by the notification icon.

##### Menu Icon (OS X)

Normal: ![Icon Mac Normal](examples/icon_osx_normal.png?raw=true) Notification: ![Icon Mac Notification](examples/icon_osx_notification.png?raw=true)

##### Tray Icon (Windows)

Normal: ![Icon Win Normal](examples/icon_win_normal.png?raw=true) Notification: ![Icon Win Notification](examples/icon_win_notification.png?raw=true)

## Settings

Open the context menu and select "Preferences".

![Settings](examples/redmine_notifier_settings.png?raw=true)

## Development

Redmine Notifier is powered by [Electron](http://electron.atom.io/), so we can develop it with web technologies.

### Dependencies

##### Production

* [node-notifier](https://github.com/mikaelbr/node-notifier)
* [notie](https://github.com/jaredreich/notie)

##### Development

* [chai](https://github.com/chaijs/chai)
* [chai-as-promised](https://github.com/domenic/chai-as-promised)
* [electron-builder](https://github.com/electron-userland/electron-builder)
* [electron-prebuilt](https://github.com/electron-userland/electron-prebuilt)
* [eslint](https://github.com/eslint/eslint)
* [mocha](https://github.com/mochajs/mocha)
* [spectron](https://github.com/electron/spectron)
* [stylelint](https://github.com/stylelint/stylelint)
* [stylelint-config-standard](https://github.com/stylelint/stylelint-config-standard)
* [textlint](https://github.com/textlint/textlint)
* [textlint-rule-write-good](https://github.com/nodaguti/textlint-rule-write-good)

See `dependencies` and `devDependencies` in [`package.json`](package.json).

### Installing dependencies

```sh
cd /path/to/redmine-notifier
npm run prepare
```

### Starting app

```sh
npm start
```

### Building apps

```sh
npm run build
```

### Building installers

```sh
npm run pack
```

### Linting JavaScript, CSS, and Markdown files

```sh
npm run lint
```

### Testing app

```sh
npm test
```

See `scripts` in [`package.json`](package.json) with regard to other commands.

## Contributing

1. Fork it ( https://github.com/emsk/redmine-notifier/fork )
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request

## Related

* [Redmine Now](https://github.com/emsk/redmine-now) - A desktop app to know what's happening now on your Redmine

## License

[MIT](LICENSE)
