/* eslint-disable no-console */
import path from 'path';
import express from 'express';
import { loadNuxt } from 'nuxt';
import { exec } from './utils';

export async function run(
  file: string,
  args: {
    name?: string;
    filename?: string;
    dest?: string;
    plugin?: boolean;
    port?: number;
    host?: string;
  } = {},
) {
  const entry = path.join(process.cwd(), file);
  const name = args.name;
  const filename = args.filename;
  const dest = args.dest || 'dist';
  const isPlugin = !!args.plugin;
  const port = args.port || 5007;
  const host = args.host || 'localhost';

  const apiPath = `dev-${isPlugin ? 'plugins' : 'theme'}`;
  const staticPath = path.resolve(process.cwd(), dest);
  const packageJosn = require(path.resolve(process.cwd(), 'package'));

  /**
   * 自定义 name 或 package.json 中的 name 或文件名
   */
  const moduleName = name || packageJosn.name || path.basename(entry);
  let moduleEntry = packageJosn['main'] || '';
  if (moduleEntry.startsWith(dest)) {
    moduleEntry = moduleEntry.substr(dest.length);
  }
  let moduleStyles = packageJosn['main:styles'];
  if (typeof moduleStyles === 'string') {
    moduleStyles = [moduleStyles];
  }
  if (moduleStyles && moduleStyles.length) {
    moduleStyles = moduleStyles.map((style: string) => {
      return style.startsWith(dest) ? style.substr(dest.length) : style;
    });
  }

  // build module and watch
  exec(entry, { name, filename, dest, watch: true }).stdout!.pipe(process.stdout);

  const app = express();
  // 静态文件服务器
  app.use('/', express.static(staticPath));
  // 创建代理到静态文件服务器上
  app.use(`/${apiPath}`, (req, resp) => {
    // plugin 返回数组, theme 返回对象
    const data = {
      moduleName,
      entry: moduleEntry,
      styles: moduleStyles,
    };
    resp.send({
      success: 1,
      message: 'devtools',
      ...(isPlugin ? { models: [data] } : { model: data }),
    });
  });

  return await startCore(host, port, apiPath);

  // 执行 nuxt stsrt
  async function startCore(host: string, port: number, apiPath: string) {
    const nuxtConfigFile = 'nuxt.config';
    const proxyPath = `http://${host}:${port}/${apiPath}`;
    const rootDir = path.resolve(__dirname, '../dev-core');
    const nuxtConfig = require(path.resolve(rootDir, nuxtConfigFile));
    const staticDir = nuxtConfig.dir && nuxtConfig.dir.static ? nuxtConfig.dir.static : 'static';

    const nuxt = await loadNuxt({
      for: 'start',
      rootDir,
      // configFile: nuxtConfigFile,
      configContext: {
        devtools: true,
        ...(isPlugin ? { proxyPluginTarget: proxyPath } : { proxyThemeTarget: proxyPath }),
      },
    });

    app.use(express.static(path.resolve(rootDir, staticDir)));
    app.use(nuxt.render);

    // start server
    app.listen(port, host, () =>
      console.log(
        '\x1b[36m',
        `server is listening on: http://${host}:${port} \n wait for module build completely \n`,
        '\x1b[0m',
      ),
    );
  }
}
