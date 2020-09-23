const path = require('path');
const fs = require('fs');
const execa = require('execa');

module.exports = {
  // 执行 build lib
  exec: function (entry, { name, filename, dest = 'dist', watch = false, noClean = false } = {}) {
    const file = require.resolve('@vue/cli-service/bin/vue-cli-service');
    const args = ['build', '--target', 'lib', '--formats', 'umd,umd-min']
      .concat(name ? ['--name', name] : [])
      .concat(filename ? ['--filename', filename] : [])
      .concat(noClean ? ['--no-clean'] : [])
      .concat(watch ? ['--watch'] : [])
      .concat('--dest', dest)
      .concat(entry);
    return execa(file, args);
  },
  // 从文件夹中查的入口文件
  findExecFile: async function (rootDir, filename = 'index') {
    const dir = await fs.promises.opendir(rootDir);
    for await (const dirent of dir) {
      const extname = path.extname(dirent.name);
      const basename = path.basename(dirent.name, extname);

      if (dirent.isFile() && (isJsOrTsFile(dirent) || isVueFile(dirent)) && basename === filename) {
        return path.resolve(rootDir, dirent.name);
      }
    }
  },
  // loading, return: unloading function
  startLoading: function () {
    var P = ['|', '/', '-', '\\'];
    var x = 0;

    const interval = setInterval(() => {
      process.stdout.write('\r' + P[x++]);
      x &= 3;
    }, 300);

    return () => {
      clearInterval(interval);
      process.stdout.write('\r');
    };
  },
};

// *.{js(x),ts(x),!d.ts}
function isJsOrTsFile(dirent) {
  return !dirent.name.endsWith('.d.ts') && ['.js', '.jsx', '.ts', '.tsx'].includes(path.extname(dirent.name));
}

// *.vue
function isVueFile(dirent) {
  return ['.vue'].includes(path.extname(dirent.name));
}
