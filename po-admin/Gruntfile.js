const less = require('less');

// This somewhat changed in Less 3.x. Now the file name comes without the
// automatically added extension whereas the extension is passed in as `options.ext`.
// So, if the file name matches this regexp, we simply ignore the proposed extension.
const IS_SPECIAL_MODULE_IMPORT = /^~[^/]+$/;

// Examples:
// - ~package
// - ~package/
// - ~@org
// - ~@org/
// - ~@org/package
// - ~@org/package/
const MODULE_REQUEST_REGEX = /^[^?]*~@?/;

/**
 * Creates a Less plugin that support relative path with module.
 *
 * @returns {LessPlugin}
 */
function createModuleLessPlugin() {
  class ModuleFileManager extends less.FileManager {
    supports() {
      return true;
    }

    supportsSync() {
      return true;
    }

    async loadFile(filename, ...args) {
      let result;

      try {
        if (IS_SPECIAL_MODULE_IMPORT.test(filename)) {
          const error = new Error();

          error.type = 'Next';

          throw error;
        }

        result = await super.loadFile(filename, ...args);
      } catch (error) {
        if (error.type !== 'File' && error.type !== 'Next') {
          return Promise.reject(error);
        }

        // A `~` or `~@` makes the url an module
        if (MODULE_REQUEST_REGEX.test(filename)) {
          filename = filename.replace(MODULE_REQUEST_REGEX, '');
        }

        result = await super.loadFile(filename, ...args);
      }

      return result;
    }
  }

  return {
    install(lessInstance, pluginManager) {
      pluginManager.addFileManager(new ModuleFileManager());
    },
    minVersion: [3, 0, 0],
  };
}

module.exports = function (grunt) {
  require('jit-grunt')(grunt);

  grunt.initConfig({
    less: {
      development: {
        options: {
          relativeUrls: true,
          javascriptEnabled: true,
          sourceMap: { outputSourceFiles: true },
          paths: ['node_modules', 'src'],
          plugins: [createModuleLessPlugin()],
        },
        files: {
          'src/static/assets/themes/light.css': 'src/assets/styles/themes/light/index.less',
          'src/static/assets/themes/dark.css': 'src/assets/styles/themes/dark/index.less',
        },
      },
      production: {
        options: {
          relativeUrls: true,
          javascriptEnabled: true,
          sourceMap: { outputSourceFiles: true },
          paths: ['node_modules', 'src'],
          plugins: [
            createModuleLessPlugin(),
            new (require('less-plugin-autoprefix'))({ browsers: ['last 2 versions'] }),
            new (require('less-plugin-clean-css'))({ compatibility: 'ie9' }),
          ],
        },
        files: {
          'src/static/assets/themes/light.css': 'src/assets/styles/themes/light/index.less',
          'src/static/assets/themes/dark.css': 'src/assets/styles/themes/dark/index.less',
        },
      },
    },
    watch: {
      styles: {
        files: ['src/assets/styles/themes/**/*.less'], // which files to watch
        tasks: ['less'],
        options: {
          nospawn: true,
        },
      },
    },
  });

  grunt.registerTask('less-watch', ['less:development', 'watch']);
};
