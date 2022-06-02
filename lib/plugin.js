/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("node:child_process");
const updateManifest = require("./manifest");
/**
 * @typedef {object} ELEVENTY_DIRECTORIES
 * @property {string} input - 11ty template path
 * @property {string} output - 11ty build path
 * @property {string} [includes] - 11ty includes path relativ to input
 * @property {string} [layouts] - 11ty separate layouts path relative to input
 * @property {string} [watch] - add more watchTargets to 11ty
 */

/**
 * @typedef {object} ASSETS
 * @property {string} base - base path for assets like assets/ relative to the build folder
 * @property {string} css - path to the css folder relative to the base
 * @property {string} js - path to the js folder relative to the base
 */

/**
 * @typedef {object} USER_OPTIONS
 * @property {string} mixManifest - path to the mixManifest file relative to the build folder
 * @property {ASSETS} [assets] - where to find all the assets relative to the build folder
 * @property {ELEVENTY_DIRECTORIES} dir - 11ty folder decisions
 */

/**
 * Cleans up the build folder
 *
 * @param {ELEVENTY_DIRECTORIES["output"]} buildFolder
 */
const emptyFolder = (buildFolder) => {
  try {
    fs.rmSync(path.join(process.cwd(), buildFolder), {
      recursive: true,
      force: true,
    });
  } catch (error) {
    console.error(error);
  }
};

/**
 * This spawns a synchronous child_process to build the assets
 * with the "@factorial/stack-core". Sync is important here - this
 * prevents eleventy from simply continuing to process the tasks
 * and thus assets are not available.
 *
 * NOTE: A .factorialrc.js is needed for this. Please
 * take a look at the fstack documentation
 * Ref: https://github.com/factorial-io/fstack
 */
const fstackBuild = () => {
  try {
    spawnSync("yarn", ["factorial", "build"], { stdio: "inherit" });
  } catch (error) {
    console.error(error);
  }
};

/**
 * Throws errors if certain required options are not part of the
 * userOptions object
 *
 * @param {USER_OPTIONS} userOptions
 */
const handleErrors = (userOptions) => {
  const errors = [];
  if (typeof userOptions !== "object" && userOptions == null) {
    errors.push(
      "Missing userOptions option. Please provide a proper configuration object."
    );
  }

  if (!userOptions.mixManifest) {
    errors.push("userOptions.mixManifest is not defined.");
  }

  if (!userOptions.mixManifest?.match(/^[\w-_]+.json$/)) {
    errors.push(
      "userOptions.mixManifest does not provide a valid filename (for example 'foobar.json')."
    );
  }

  if (userOptions.mixManifest && !userOptions.assets) {
    errors.push(
      "userOptions.mixManifest requires userOptions.assets.{base, js, css} to be defined."
    );
  }

  if (!userOptions.dir) {
    errors.push("userOptions.dir is not defined.");
  }

  if (userOptions.dir && !userOptions.dir.output) {
    errors.push(
      "userOptions.dir requires userOptions.dir.output to be defined."
    );
  }

  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }
};

/**
 * This extends the eleventyConfig with a watchTarget depending
 * on the ELEVENTY_DIRECTORIES setup, cleans up the build folder
 * before every triggered build process, adds the factorial build
 * task and updates the assets mix-manifest
 *
 * @param {import("@11ty/eleventy").UserConfig} eleventyConfig
 * @param {USER_OPTIONS} userOptions
 */
module.exports = (eleventyConfig, userOptions) => {
  // ERRORS
  handleErrors(userOptions);

  // WATCH
  if (userOptions.dir.watch) {
    eleventyConfig.addWatchTarget(userOptions.dir.watch);
  }

  // EVENTS
  eleventyConfig.on("eleventy.before", () =>
    emptyFolder(userOptions.dir.output)
  );
  eleventyConfig.on("eleventy.before", () => fstackBuild());

  // OPTIONAL EVENTS
  if (userOptions.mixManifest) {
    eleventyConfig.on("eleventy.before", () => updateManifest(userOptions));
  }
};
