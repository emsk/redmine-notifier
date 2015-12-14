# Redmine Notifier

Redmine Notifier is a simple updated issues checker that runs in the background.
It sends a desktop notification if there are any updates in issues.

## Downloads

Installers for OS X and Windows can be found on the [releases](../../releases) page.

## Settings

![Settings](assets/osx/redmine_notifier_settings.png)

The icon appears in the menu bar or task tray when Redmine Notifier is started.
Select "Preferences" in the context menu to open the settings window.

## Development

Redmine Notifier is powered by [Electron](http://electron.atom.io/), so we can develop it with web technologies.

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

See `scripts` in [`package.json`](package.json) with regard to other commands.

## Contributing

1. Fork it ( https://github.com/emsk/redmine-notifier/fork )
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request

## License

MIT
