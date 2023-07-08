# Kagi Search Extension

This contains the source for the [Kagi Search](https://kagi.com) extension for Firefox and Chrome.

Get it for your browser here:

- [Chrome](https://chrome.google.com/webstore/detail/kagi-search-for-chrome/cdglnehniifkbagbbombnjghhcihifij)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/kagi-search-for-firefox/)

## Contents

- [Extension Features](#extension-features)
- [Other Browsers](#other-browsers)
- [Installing from source](#installing-from-source)
  - [Download](#download)
  - [Load the extension](#load-the-extension)
    - [Firefox](#firefox)
    - [Chrome](#chrome)
- [Contributing](#contributing)
  - [Accepted Contributions](#accepted-contributions)
  - [Instructions](#instructions)
  - [Development](#development)
  - [Testing/sharing/debugging](#testing-sharing-debugging)

## Extension Features

- Sets Kagi as your default search engine
- Automatic login when searching in incognito/private browsing
- ... more in the future!

## Other Browsers

- [Safari (iOS)](https://apps.apple.com/us/app/kagi-search-for-safari/id1607766153)

## Loading from source

### Building

To build the extension, you will need node and npm installed.

1. Obtain the files from this repo, either via `git clone https://github.com/kagisearch/browser_extensions` or by downloading the source zip.
2. run `npm i` to install `adm-zip` which is used to package up the files.
3. You can now run `npm run build-firefox` or `npm run build-chrome` to zip up the relevant files and output a zip file.

You can also download a pre-packaged zip from our releases page.

### Download

First, obtain the source code from the release page:

[GitHub Releases](https://github.com/kagisearch/browser_extensions/releases)

Or by cloning the repo:

`git clone https://github.com/kagisearch/browser_extensions`

### Loading the extension

#### Firefox

1. Head to `about:debugging`
2. Click on "This Firefox"
3. Click "Load Temporary Add-On"
4. Select the zip file or manifest.json of the extension.

#### Chrome

1. Head to `chrome://extensions`
2. Turn on "Developer mode" in the top right and then some new buttons will pop up.
3. Click on `Load unpacked extension`
4. Select the zip file or you may have to unzip the zip and select the folder outputted from extraction.

## Contributing

### Accepted Contributions

Bugfixes and improvements to the extension's code are welcome!

At the time we are not accepting PRs for new features without prior approval.

You can inquire about new features or report bugs here:

- [Issue tracker](https://github.com/kagisearch/browser_extensions/issues)
- [Kagi Feedback Forum](https://kagifeedback.org/)

### Instructions

1. Fork it (<https://github.com/kagisearch/browser_extensions/fork>)
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request

### Development

Check the recommended and required `node` and `npm` versions in the `package.json` and `.nvmrc` files.

```sh
npm ci  # install dependencies
npm run watch-firefox  # builds the firefox zip file and unzips it into the `built/` directory every time a file changes
npm run watch-chrome  # builds the chrome zip file and unzips it into the `built/` directory every time a file changes
npm run format  # formats the code
```

### Testing/sharing/debugging

```sh
npm run test  # runs the linter & formatter checks
npm run build  # builds the chrome and firefox zip files in the `built/` directory
npm run build-firefox  # builds the firefox zip file in the `built/` directory
npm run build-chrome  # builds the chrome zip file in the `built/` directory
```
