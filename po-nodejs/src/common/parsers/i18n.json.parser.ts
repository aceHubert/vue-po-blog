import { Inject, OnModuleDestroy } from '@nestjs/common';
import { I18nParser, I18N_PARSER_OPTIONS, I18nTranslation } from 'nestjs-i18n';
import { getFiles } from 'nestjs-i18n/dist/utils/file';
import { flattenDeep } from 'lodash';
import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';
import * as chokidar from 'chokidar';
import { Observable, Subject, merge as ObservableMerge, from as ObservableFrom } from 'rxjs';
import { switchMap } from 'rxjs/operators';

const readFile = promisify(fs.readFile);
const access = promisify(fs.access);

export interface I18nJsonParserOptions {
  paths: string[];
  filePattern?: string;
  watch?: boolean;
}

const defaultOptions: Partial<I18nJsonParserOptions> = {
  filePattern: '*.json',
  watch: false,
};

/**
 * 重写默认 JsonParaser(支持多目录)
 * 支持多文件目录（后面的会替换前面的参数）
 * 配置文件名定义规则：
 * [prefix].[locale].josn => locale{prefix:{...}}
 * [prefix].json Global 会合并到所有语言里面格式为 {prefix:{...}}
 */
export class I18nJsonParser extends I18nParser implements OnModuleDestroy {
  private watcher?: chokidar.FSWatcher;

  private events: Subject<string> = new Subject();

  constructor(
    @Inject(I18N_PARSER_OPTIONS)
    private options: I18nJsonParserOptions,
  ) {
    super();
    this.options = this.sanitizeOptions(options);

    if (this.options.watch) {
      this.watcher = chokidar.watch(this.options.paths, { ignoreInitial: true }).on('all', (event) => {
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
    const i18nPaths = await Promise.all(
      this.options.paths.map(async (i18nPath) => {
        const _path = path.normalize(i18nPath + path.sep);

        try {
          await access(i18nPath, fs.constants.R_OK);
        } catch (err) {
          throw new Error(`Error to read i18n file, ${err.message}`);
        }
        return _path;
      }),
    );

    const translations: I18nTranslation = {};

    if (!this.options.filePattern?.match(/\*\.[A-z]+/)) {
      throw new Error(`filePattern should be formatted like: *.json, *.txt, *.custom etc`);
    }

    const languages = await this.parseLanguages();

    const pattern = new RegExp('.' + this.options.filePattern.replace('.', '.'));

    await Promise.all(
      i18nPaths.map(async (i18nPath) => {
        await parseFileTranslations(i18nPath, languages, pattern, translations);
      }),
    );

    return translations;

    async function parseFileTranslations(
      i18nPath: string,
      languages: string[],
      pattern: RegExp,
      translations: I18nTranslation = {},
    ) {
      const files = await getFiles(i18nPath, pattern);

      for (const file of files) {
        let global = false;

        const split = path.basename(file).split('.');

        if (split.length !== 3) {
          global = true;
        }

        const data = JSON.parse(await readFile(file, 'utf8'));

        const prefix = split[0];
        for (const property of Object.keys(data)) {
          [...(global ? languages : [split[1]])].forEach((lang) => {
            const langTranslations = (translations[lang] = translations[lang] || {}) as {
              [key: string]: I18nTranslation;
            };
            langTranslations[prefix] = langTranslations[prefix] || {};
            langTranslations[prefix][property] = data[property];
          });
        }
      }
    }
  }

  private async parseLanguages(): Promise<string[]> {
    const i18nPaths = this.options.paths.map((_path) => path.normalize(_path + path.sep));

    if (!this.options.filePattern?.match(/\*\.[A-z]+/)) {
      throw new Error(`filePattern should be formatted like: *.json, *.txt, *.custom etc`);
    }

    const pattern = new RegExp('.' + this.options.filePattern.replace('.', '.'));

    const languages = await Promise.all(
      i18nPaths.map(
        async (i18nPath) =>
          (await getFiles(i18nPath, pattern))
            .map((file) => {
              const split = path.basename(file).split('.');
              // xxx.en-US.json
              if (split.length === 3) {
                return split[1];
              }
              return false;
            })
            .filter(Boolean) as string[],
      ),
    );
    return Array.from(new Set(flattenDeep(languages)));
  }

  private sanitizeOptions(options: I18nJsonParserOptions) {
    options = { ...defaultOptions, ...options };

    options.paths = options.paths.map((_path) => path.normalize(_path + path.sep));
    if (!options.filePattern?.startsWith('*.')) {
      options.filePattern = '*.' + options.filePattern;
    }

    return options;
  }
}
