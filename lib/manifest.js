/* eslint no-console: 0 */

const fs = require("fs");
const path = require("path");

/**
 * This updates the manifest by crawling the buildPath/assets
 * and looking for css/js files and map those into an json
 * object which is stored in the build folder/userOptions.mixManifest
 *
 * @param {import("./plugin").USER_OPTIONS} userOptions
 */
module.exports = (userOptions) => {
  const manifest = {};
  const buildPath = `/${userOptions.dir.output}`;
  const assetsPath = `/${userOptions.assets.base}`;
  const assetsCssPath = path.join(
    process.cwd(),
    buildPath,
    assetsPath,
    `/${userOptions.assets.css}`
  );
  const assetsJsPath = path.join(
    process.cwd(),
    buildPath,
    assetsPath,
    `/${userOptions.assets.js}`
  );

  /**
   * Read the folders recursivley and process files by generating
   * a filename without the hash and add those to the manifest object
   *
   * @param {string[]} entries
   * @param {string} folder
   * @param {string} shortFolder
   */
  function processEntries(entries, folder, shortFolder) {
    entries.forEach((entry) => {
      const stats = fs.lstatSync(path.join(folder, entry));
      if (stats.isFile()) {
        const fileNameWithoutHash = entry.replace(
          /hash-[a-z\d]{8,10}\.(?!.*([a-z\d]{8,10}\.))/,
          ""
        );
        manifest[path.join(assetsPath, shortFolder, fileNameWithoutHash)] =
          path.join(assetsPath, shortFolder, entry);
      } else if (stats.isDirectory()) {
        checkIfFolderExists(path.join(folder, entry)); // recursivley crawl directories
      }
    });
  }

  /**
   * Read the folder and process entries if available
   *
   * @param {string} folder
   * @param {string} shortFolder
   */
  function processFolder(folder, shortFolder) {
    const entries = fs.readdirSync(folder);
    if (entries.length) {
      processEntries(entries, folder, shortFolder);
    } else {
      console.error(`No assets were found in ${shortFolder}`);
    }
  }

  /**
   * Check if folder exists and process if possible
   *
   * @param {string} folder
   */
  function checkIfFolderExists(folder) {
    const shortFolder = folder.replace(
      path.join(process.cwd(), buildPath, assetsPath),
      ""
    );
    if (fs.existsSync(folder)) {
      processFolder(folder, shortFolder);
    } else {
      console.error(shortFolder, " is not a directory");
    }
  }

  /**
   * Write the manifest to the by userOptions defined file
   */
  function writeManifest() {
    fs.writeFile(
      path.join(process.cwd(), buildPath, userOptions.mixManifest),
      JSON.stringify(manifest),
      (error) => {
        if (error) {
          console.error(error);
        }
      }
    );
  }

  console.log(`\nGenerating ${userOptions.mixManifest}...`);

  // Combine all assetsPaths and check for assets to process
  [assetsCssPath, assetsJsPath].forEach((folder) => {
    checkIfFolderExists(folder);
  });

  console.log(`\nWriting updated ${userOptions.mixManifest}...\n`);

  writeManifest();
};
