import { Inject, OnModuleDestroy } from '@nestjs/common';
import { I18nParser, I18N_PARSER_OPTIONS, I18nTranslation } from 'nestjs-i18n';
import { getDirectories, getFiles } from 'nestjs-i18n/dist/utils/file';
import { flattenDeep } from 'lodash';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';
import * as chokidar from 'chokidar';
import { Observable, Subject, merge as ObservableMerge, from as ObservableFrom } from 'rxjs';
import { switchMap } from 'rxjs/operators';

const readFile = promisify(fs.readFile);
const access = promisify(fs.access);

export interface I18nJsonParserOptions {
  path: string;
  filePattern?: string;
  watch?: boolean;
}

const defaultOptions: Partial<I18nJsonParserOptions> = {
  filePattern: '*.json',
  watch: false,
};

/**
 * 重写默认 JsonParaser(支持多级目录)
 * 支持多文件目录（后面的会替换前面的参数）
 * 配置文件名定义规则：
 * [prefix].[locale].josn => locale{[pathPrefix.]prefix:{...}}
 * [prefix].json Global 会合并到所有语言里面格式为 {[pathPrefix.]prefix:{...}}
 */
export class I18nJsonParser extends I18nParser implements OnModuleDestroy {
  private watcher?: chokidar.FSWatcher;
  private events: Subject<string>;

  constructor(
    @Inject(I18N_PARSER_OPTIONS)
    private options: I18nJsonParserOptions,
  ) {
    super();
    this.events = new Subject();
    this.options = this.sanitizeOptions(options);

    if (this.options.watch) {
      this.watcher = chokidar.watch(this.options.path, { ignoreInitial: true }).on('all', (event) => {
        this.events.next(event);
      });
    }
  }

  async onModuleDestroy() {
    if (this.watcher) {
      await this.watcher.close();
    }
  }

  async languages(): Promise<string[] | Observable<string[]>> {
    if (this.options.watch) {
      return ObservableMerge(
        ObservableFrom(this.parseLanguages()),
        this.events.pipe(switchMap(() => this.parseLanguages())),
      );
    }
    return this.parseLanguages();
  }

  async parse(): Promise<I18nTranslation | Observable<I18nTranslation>> {
    if (this.options.watch) {
      return ObservableMerge(
        ObservableFrom(this.parseTranslations()),
        this.events.pipe(switchMap(() => this.parseTranslations())),
      );
    }
    return this.parseTranslations();
  }

  private async parseTranslations(): Promise<I18nTranslation> {
    const i18nPath = path.normalize(this.options.path + path.sep);

    try {
      await access(i18nPath, fs.constants.R_OK);
    } catch (err) {
      throw new Error(`Error to read file, ${err.message}`);
    }

    if (!this.options.filePattern?.match(/\*\.[A-z]+/)) {
      throw new Error(`filePattern should be formatted like: *.json, *.txt, *.custom etc`);
    }

    const translations: I18nTranslation = {};
    const languages = await this.parseLanguages();
    const pattern = new RegExp('.' + this.options.filePattern!.replace('.', '.'));
    const files = await this.getDeepFiles(i18nPath, pattern);

    for (const file of files) {
      let global = false;

      const split = path.basename(file).split('.');

      if (split.length !== 3) {
        global = true;
      }

      const prefixs = path
        .relative(this.options.path, path.dirname(file))
        .split(path.sep)
        .concat(split[0])
        .filter((prefix) => !!prefix);
      const data = JSON.parse(await readFile(file, 'utf8'));

      for (const property of Object.keys(data)) {
        [...(global ? languages : [split[1]])].forEach((lang) => {
          let nestedTranslations = (translations[lang] = translations[lang] || {}) as {
            [key: string]: I18nTranslation;
          };
          prefixs.forEach((prefix) => {
            nestedTranslations = (nestedTranslations[prefix] = nestedTranslations[prefix] || {}) as {
              [key: string]: I18nTranslation;
            };
          });
          nestedTranslations[property] = data[property];
        });
      }
    }

    return translations;
  }

  private async parseLanguages(): Promise<string[]> {
    const i18nPath = path.normalize(this.options.path + path.sep);

    if (!this.options.filePattern?.match(/\*\.[A-z]+/)) {
      throw new Error(`filePattern should be formatted like: *.json, *.txt, *.custom etc`);
    }

    const pattern = new RegExp('.' + this.options.filePattern.replace('.', '.'));

    const languages = (await this.getDeepFiles(i18nPath, pattern))
      .map((file) => {
        const split = path.basename(file).split('.');
        // xxx.en-US.json
        if (split.length === 3) {
          return split[1];
        }
        return false;
      })
      .filter(Boolean) as string[];
    return Array.from(new Set(flattenDeep(languages)));
  }

  private async getDeepFiles(source: string, pattern: RegExp) {
    let files: string[] = [];
    const dirs = await getDirectories(source);
    for (const dir of dirs) {
      files = files.concat(await this.getDeepFiles(dir, pattern));
    }
    files = files.concat(await getFiles(source, pattern));
    return files;
  }

  private sanitizeOptions(options: I18nJsonParserOptions) {
    options = { ...defaultOptions, ...options };

    options.path = path.normalize(options.path + path.sep);

    if (!options.filePattern?.startsWith('*.')) {
      options.filePattern = '*.' + options.filePattern;
    }

    return options;
  }
}
