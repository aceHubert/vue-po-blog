import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';
import { flattenDeep } from 'lodash';
import { I18nTranslation } from 'nestjs-i18n';
import { getDirectories, getFiles } from 'nestjs-i18n/dist/utils/file';

const readFile = promisify(fs.readFile);
const access = promisify(fs.access);

export interface I18nParserOptions {
  /** 语言文件目录 */
  path: string;
  /** 文件类型，默认：*.json */
  filePattern?: string;
  /** 文件内容转换方法 */
  parseFactory?: (source: string) => I18nTranslation;
}

const defaultOptions: Required<Omit<I18nParserOptions, 'path'>> = {
  filePattern: '*.json',
  parseFactory: (source) => JSON.parse(source),
};

/**
 * [path]
 * |- core
 *   |- user.zh-CN.json  // core.user.[key]
 *   |- user.fr.json
 *   |- user.json  // global, 合并到所有 user.[locale].json 中
 * |- plugin
 *   |- home.zh-CN.json  // plugin.home.[key]
 *   |- home.fr.json
 */
export class I18nParseFactory {
  private options: Required<I18nParserOptions>;

  constructor(options: I18nParserOptions) {
    this.options = this.sanitizeOptions(options);
  }

  async parseTranslations(): Promise<{ [locale: string]: I18nTranslation }> {
    const i18nPath = path.normalize(this.options.path + path.sep);

    try {
      await access(i18nPath, fs.constants.R_OK);
    } catch (err) {
      throw new Error(`Error: ${err.message}`);
    }

    if (!this.options.filePattern?.match(/\*\.[A-z]+/)) {
      throw new Error(`filePattern should be formatted like: *.json, *.txt, *.custom etc`);
    }

    const translations: { [locale: string]: I18nTranslation } = {};
    const languages = await this.parseLanguages();
    const pattern = new RegExp('.' + this.options.filePattern!.replace('.', '.'));
    const files = await this.getDepthFiles(i18nPath, pattern);

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
      const data = this.options.parseFactory(await readFile(file, 'utf8'));

      for (const property of Object.keys(data)) {
        [...(global ? languages : [split[1]])].forEach((lang) => {
          let nestedTranslations = (translations[lang] = translations[lang] || {}) as I18nTranslation;
          prefixs.forEach((prefix) => {
            nestedTranslations = (nestedTranslations[prefix] = nestedTranslations[prefix] || {}) as I18nTranslation;
          });
          nestedTranslations[property] = data[property];
        });
      }
    }

    return translations;
  }

  async parseLanguages(): Promise<string[]> {
    const i18nPath = path.normalize(this.options.path + path.sep);

    if (!this.options.filePattern?.match(/\*\.[A-z]+/)) {
      throw new Error(`filePattern should be formatted like: *.json, *.txt, *.custom etc`);
    }

    const pattern = new RegExp('.' + this.options.filePattern.replace('.', '.'));

    const languages = (await this.getDepthFiles(i18nPath, pattern))
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

  private async getDepthFiles(source: string, pattern: RegExp) {
    let files: string[] = [];
    const dirs = await getDirectories(source);
    for (const dir of dirs) {
      files = files.concat(await this.getDepthFiles(dir, pattern));
    }
    files = files.concat(await getFiles(source, pattern));
    return files;
  }

  private sanitizeOptions(options: I18nParserOptions) {
    options = { ...defaultOptions, ...options };

    options.path = path.normalize(options.path + path.sep);

    if (!options.filePattern?.startsWith('*.')) {
      options.filePattern = '*.' + options.filePattern;
    }

    return options as Required<I18nParserOptions>;
  }
}
