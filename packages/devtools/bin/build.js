/* eslint-disable no-console */
const path = require('path');
const fs = require('fs');
const camelCase = require('lodash.camelcase');
const { exec, findExecFile, startLoading } = require('../src/utils');

exports.command = 'build <entry>';

exports.describe = 'build modules';

exports.builder = (yargs) => {
  yargs
    .positional('entry', {
      type: 'string',
      describe: 'entry file or directory',
    })
    .option('name', {
      type: 'string',
      describe: `name for lib  (default: "name" in package.json or entry filename),
        it will be ignored when entry is a directory`,
      // demandOption: true,
    })
    .option('filename', {
      type: 'string',
      describe: `file name for output (default: value of --name),
      it will be ignored when entry is a directory`,
      // demandOption: true,
    })
    .option('dest', {
      type: 'string',
      default: 'dist',
      describe: 'output directory',
    })
    .option('info', {
      type: 'boolean',
      default: false,
      describe: 'show build info details',
    });
};

exports.handler = async function (args) {
  const entry = path.resolve(process.cwd(), args.entry);
  const name = args.name;
  const filename = args.filename;
  let dest = args.dest;
  const showResult = args.info;

  const lstat = await fs.promises.lstat(entry);
  if (lstat.isFile()) {
    const stoploading = startLoading();
    var result = await exec(entry, { name, filename, dest });
    stoploading();
    showResult ? console.log(result) : console.log('\x1b[36m', 'build successful', '\x1b[0m');
  } else if (lstat.isDirectory()) {
    // 文件夹 /file.[js(x),ts(x),vue] or /dir/index.[js(x),ts(x),vue]
    const dir = await fs.promises.opendir(entry);
    dest = dest || 'dist';
    let result = '';
    const stoploading = startLoading();
    for await (const dirent of dir) {
      if (dirent.isFile()) {
        result +=
          '\r' +
          (await exec(path.join(entry, dirent.name), {
            name: camelCase(dirent.name),
            filename: dirent.name,
            dest: path.join(dest, dirent.name),
          }));
      } else {
        const indexFile = await findExecFile(path.join(entry, dirent.name));
        if (indexFile) {
          result +=
            '\r' +
            (await exec(indexFile, {
              name: camelCase(dirent.name),
              filename: 'index',
              dext: path.join(dest, dirent.name),
            }));
        } else {
          // 未找到入口文件
          continue;
        }
        const adminFile = await findExecFile(path.join(entry, dirent.name), 'admin');
        if (adminFile) {
          result +=
            '\r' +
            (await exec(adminFile, {
              name: camelCase(dirent.name),
              filename: 'admin',
              dest: path.join(dest, dirent.name),
              noClean: true,
            }));
        } else {
          // 未找到入口文件
          continue;
        }
      }
    }
    stoploading();
    showResult ? console.log(result) : console.log('\x1b[36m', 'build successful', '\x1b[0m');
  } else {
    console.error('entry file not found');
  }
};
