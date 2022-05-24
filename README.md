# [Eleventy](https://www.11ty.dev) + [Factorial Stack](https://github.com/factorial-io/fstack)

<p style="font-size: 2rem">
<img 
  style="margin:2rem; width:8rem; height:8rem;" 
  align="center" 
  width="128" 
  height="128"
  alt="11ty Logo"
  src="https://camo.githubusercontent.com/124e337fb005b0e70eb3758b431b051eaf5419b3a709062fbcce6d661a6ea116/68747470733a2f2f7777772e313174792e6465762f696d672f6c6f676f2d6769746875622e737667">+
<img 
  style="margin:2rem; width:5.6rem; height:8rem;" 
  align="center" 
  width="91" 
  height="128"
  alt="Factorial Logo"
  src="https://logo.factorial.io/color.png">
</p>

This package adds a simple build task to the Eleventy build pipeline via `eleventy.before`. Furthermore it cleans the build folder before every build due to the fact, that caching is currently not available within our `@factorial-io/eleventy-plugin-twig` templating plugin.

## Getting Started

Clone the latest release into a separate folder in your existing eleventy installation and install via `yarn`:

```sh
mkdir plugins && cd plugins
git clone https://source.factorial.io/factorial/eleventy-plugin-fstack.git
cd eleventy-plugin-fstack && yarn install --frozen-lockfile
```

Then use `yarn link` inside the `eleventy-plugin-fstack` folder to generate a package link and attach that to your eleventy installation from inside your eleventy folder with `yarn link "@factorial/eleventy-plugin-fstack"`. Now you can `require("@factorial/eleventy-plugin-fstack")` like below.

Please also add `@factorial/stack-core` and all necessary packages to your project dependencies via `yarn`:

```sh
yarn add @factorial/stack-core @factorial/stack-css ...
```

## Usage

### Config @factorial/fstack

First define a `.factorialrc.js` in your projects root folder. For details please check the [`@factorial/fstack` repository](https://github.com/factorial-io/fstack).

**Note**: `eleventy-plugin-fstack` requires `@factorial/stack` to generate hashed `css` and `js` files. Please do not forget to set the `addHashes: true` option in `.factorialrc.js`.

### Config eleventy-plugin-fstack

For Eleventy to recognize this you have to **register this as a plugin**. To do so modify the `.eleventy.js` config file:

```js
const fstack = require("@factorial/eleventy-plugin-fstack");

module.exports = function(eleventyConfig) {
  ...
  eleventyConfig.addPlugin(fstack, USER_OPTIONS);
  ...
  return {
    dir: {
      input: USER_OPTIONS.dir.input,
      output: USER_OPTIONS.dir.output,
      includes: getIncludesFolderFromNamespaces(
        USER_OPTIONS.dir.input,
        USER_OPTIONS.twig.namespaces
      ),
      layouts: path.relative(
        path.join(process.cwd(), USER_OPTIONS.dir.input),
        path.join(__dirname, USER_OPTIONS.dir.layouts)
      ),
    },
  };
}
```

If you use the [@factorial/eleventy-plugin-twig](https://github.com/factorial-io/eleventy-plugin-twig) plugin you could utilize the `TWIG_OPTIONS.namespaces` here as well and use `getIncludesFolderFromNamespaces(input, namespaces)`. This method you could copy from here:

```js
/**
 * Uses the namespaces provided for twig to generate
 * a proper glob for eleventies include folder
 *
 * @param {USER_OPTIONS["dir"]["input"]} input
 * @param {USER_OPTIONS["twig"]["namespaces"]} namespaces
 * @returns {string}
 */
const getIncludesFolderFromNamespaces = (input, namespaces) => {
  return Object.keys(namespaces).reduce((acc, curr, index, arr) => {
    acc += path.relative(
      path.join(process.cwd(), input),
      path.join(__dirname, namespaces[curr])
    );
    if (index + 1 === arr.length) {
      acc += "}";
    } else {
      acc += ", ";
    }
    return acc;
  }, "{");
};
```

As mentioned in the `eleventyConfig.addPlugin(fstack, USER_OPTIONS)` you have to define some directories. Currently `@factorial/eleventy-plugin-fstack` provides the following configuration object:

```js
/**
 * @typedef {object} ELEVENTY_DIRECTORIES
 * @property {string} input
 * @property {string} output
 * @property {string} [includes]
 * @property {string} [layouts]
 * @property {string} [watch]
 */

/**
 * @typedef {object} ASSETS_PATH
 * @property {string} base
 * @property {string} css
 * @property {string} js
 */

/**
 * @typedef {object} USER_OPTIONS
 * @property {string} mixManifest,
 * @property {ASSETS_PATH} [assetsPath]
 * @property {ELEVENTY_DIRECTORIES} dir
 * @property {import("@factorial/eleventy-plugin-twig").TWIG_OPTIONS} [twig] // just if u use @factorial/eleventy-plugin/twig
 */
```

You could use this as a starting point and customize to your individual needs:

```js
/**
 * Default userOptions for eleventy
 *
 * @type {USER_OPTIONS} USER_OPTIONS
 */
const USER_OPTIONS = {
  twig: {
    shortcodes: [],
    namespaces: {
      elements: "src/include/elements",
      patterns: "src/include/patterns",
      "template-components": "src/include/template-components",
      templates: "src/include/templates",
    },
  },
  mixManifest: "mix-manifest.json",
  assetsPath: {
    base: "assets",
    css: "css",
    js: "js",
  },
  dir: {
    input: "src/include/templates",
    output: "build",
    layouts: "src/layouts",
    watch: "src/**/*.{css,js,twig}",
  },
};
```

## Acknowledgements

This **Eleventy + Factorial Stack** plugin uses open source software and would not have been possible without the excellent work of the [Eslint](https://babeljs.io/team), [Eleventy](https://www.11ty.dev/docs/credits/), [Prettier](https://unifiedjs.com/community/member/), [debug](https://github.com/debug-js/debug) and [@factorial/fstack](https://github.com/factorial-io/fstack) teams! Thanks a lot!
