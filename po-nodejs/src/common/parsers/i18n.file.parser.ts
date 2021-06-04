import { Inject, OnModuleDestroy } from '@nestjs/common';
import { I18nParser, I18N_PARSER_OPTIONS, I18nTranslation } from 'nestjs-i18n';
import * as chokidar from 'chokidar';
import { Observable, Subject, merge as ObservableMerge, from as ObservableFrom } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { I18nParseFactory, I18nParserOptions } from '../utils/i18n-parse-factory';

export type I18nFileParserOptions = I18nParserOptions & {
  /** 目录文件监控，默认： false */
  watch?: boolean;
};

export class I18nFileParser extends I18nParser implements OnModuleDestroy {
  private watcher?: chokidar.FSWatcher;
  private events: Subject<string>;
  private parseFactory: I18nParseFactory;

  constructor(
    @Inject(I18N_PARSER_OPTIONS)
    private readonly options: I18nFileParserOptions,
  ) {
    super();
    this.events = new Subject();
    this.parseFactory = new I18nParseFactory(options);

    if (this.options.watch === true) {
      this.watcher = chokidar.watch(this.options.path, { ignoreInitial: false }).on('all', (event) => {
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
    if (this.options.watch === true) {
      return ObservableMerge(
        ObservableFrom(this.parseFactory.parseLanguages()),
        this.events.pipe(switchMap(() => this.parseFactory.parseLanguages())),
      );
    }
    return this.parseFactory.parseLanguages();
  }

  async parse(): Promise<I18nTranslation | Observable<I18nTranslation>> {
    if (this.options.watch === true) {
      return ObservableMerge(
        ObservableFrom(this.parseFactory.parseTranslations()),
        this.events.pipe(switchMap(() => this.parseFactory.parseTranslations())),
      );
    }
    return this.parseFactory.parseTranslations();
  }
}
