const AdmZip = require('adm-zip');
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: node build.js <extension to build>');
  process.exit(1);
}

const extension = args[0];
if (extension !== 'firefox' && extension !== 'chrome') {
  console.log('Only firefox and chrome extension building is supported');
  process.exit(1);
}

const isWatching = args[1] === 'watch';

// Load the manifest json to grab version information and name.
const manifest = require(`./${extension}/manifest.json`);
const version = manifest.version;

/*
 * We want to zip up the relevant extension files, which would be
 * all `shared/*` files and then the relevant `extension/*` files.
 * This approach seemed easier than copying some things around to a temp directory.
 * And! It's cross-platform!
 */
const zip = new AdmZip();
zip.addLocalFolder('shared');
zip.addLocalFolder(extension);

zip.writeZip(`${__dirname}/built/kagi_${extension}_${version}.zip`);
console.log(`Done: built/kagi_${extension}_${version}.zip`);

if (isWatching) {
  zip.extractAllTo(`${__dirname}/built/`, true);
  console.log(`Done: Extracted built/kagi_${extension}_${version}.zip`);
}
