/* eslint-disable no-console */
const path = require('path');
const express = require('express');
const { loadNuxt } = require('nuxt');

const { exec } = require('../src/utils');

exports.command = 'dev <entry>';

exports.describe = 'devtools';

exports.builder = (yargs) => {
  yargs
    .positional('entry', {
      type: 'string',
      describe: 'entry file',
    })
    .option('plugin', {
      type: 'boolean',
      describe: 'run as plugin, otherwise will run as theme',
      default: false,
    })
    .option('port', {
      type: 'number',
      describe: ' specify port',
      default: 5005,
    })
    .option('host', {
      type: 'string',
      describe: ' specify host',
      default: '0.0.0.0',
    });
};

exports.handler = async function (args) {
  const execDir = process.cwd();
  const entry = path.join(execDir, args.entry);
  const port = args.port;
  const host = args.host;
  const isPlugin = args.plugin;

  const moduleName = 'plumemoDev';
  const filename = 'plumemo-dev';
  const buildDir = '.plumemo-dev';
  const dest = `content/${isPlugin ? 'plugins' : 'themes'}`;

  exec(entry, { name: moduleName, filename, dest: path.join(buildDir, dest), watch: true }).stdout.pipe(process.stdout);

  const app = express();
  app.use('/', express.static(path.resolve(process.cwd(), buildDir)));
  app.use('/dev-modules', (req, resp) => {
    resp.send({
      success: 1,
      models: [
        {
          moduleName,
          entry: `http://localhost:${port}/${dest}/${filename}.umd.js`,
          styles: [`http://localhost:${port}/${dest}/${filename}.css`],
          isTheme: !isPlugin,
        },
      ],
      message: 'devtools',
    });
  });

  startCore(app, port, host);
};

// 执行 nuxt stsrt
async function startCore(app, port, host) {
  const coreEntey = path.dirname(require.resolve('@plumemo/core/package.json'));

  const nuxt = await loadNuxt({
    for: 'start',
    rootDir: coreEntey,
    configFile: 'nuxt.config',
    configContext: {
      devtools: true,
      proxyModuleTarget: `http://localhost:${port}/dev-modules`,
    },
  });

  // start server
  app.use(nuxt.render);
  app.listen(port, host, () => console.log(`server is listening on: ${host}:${port}`));
}
