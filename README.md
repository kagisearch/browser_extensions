# Kagi Search Extension

This contains the source for the [Kagi Search](https://kagi.com) extension for Firefox and Chrome.

[Get the Firefox Addon here!](https://addons.mozilla.org/en-US/firefox/addon/kagi-search-for-firefox/)\
[Get the Chrome Addon here!](https://chrome.google.com/webstore/detail/kagi-search-for-chrome/cdglnehniifkbagbbombnjghhcihifij)

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

## Extension Features

- Sets Kagi as your default search engine
- Automatic login when searching in incognito/private browsing
- ... more in the future!

## Other Browsers

We currently only officially support Chrome and Firefox.\
Support for other browsers will come in the future!

## Installing from source

### Download

First, obtain the source code from the release page:

[GitHub Releases](https://github.com/kagisearch/browser_extensions/releases)

Or by cloning the repo:

`git clone https://github.com/kagisearch/browser_extensions`

### Load the extension

#### Firefox
1. Head to `about:debugging`
2. Click on "This Firefox"
3. Click "Load Temporary Add-On"
4. Select the zip file or manifest.json of the extension.

#### Chrome
1. Head to `chrome://extensions`
2. Turn on "Developer mode" in the top right and then some new buttons will pop up.
3. Click on `Load unpacked extension`
4. Select the zip file or cloned folder that you downloaded and you're done!

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
