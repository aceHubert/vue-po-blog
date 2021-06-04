import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';
import { DynamicModule, Module, Provider, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { getDirectories } from 'nestjs-i18n/dist/utils/file';
import { LocaleController } from './locale.controller';
import { LocaleService } from './locale.service';
import { mergeDefaults } from './utils/merge-defaults.util';
import { LOCALE_MODULE_OPTIONS } from './constants';

// Types
import {
  LocaleModuleOptions,
  LocaleModuleAsyncOptions,
  LocaleModuleOptionsFactory,
} from './interfaces/locale-module-options.interface';

const stat = promisify(fs.stat);

@Module({
  controllers: [LocaleController],
  providers: [LocaleService],
})
export class LocaleModule implements OnModuleInit {
  private readonly logger = new Logger('LocaleModule');

  constructor(@Inject(LOCALE_MODULE_OPTIONS) private readonly options: Required<LocaleModuleOptions>) {}

  static forRoot(options: LocaleModuleOptions): DynamicModule {
    options = mergeDefaults(options);
    return {
      module: LocaleModule,
      controllers: [LocaleController],
      providers: [
        {
          provide: LOCALE_MODULE_OPTIONS,
          useValue: options,
        },
        LocaleService,
      ],
      exports: [LocaleService],
    };
  }

  static forRotAsync(options: LocaleModuleAsyncOptions): DynamicModule {
    return {
      module: LocaleModule,
      imports: options.imports,
      controllers: [LocaleController],
      providers: [...this.createAsyncProviders(options), LocaleService],
      exports: [LocaleService],
    };
  }

  private static createAsyncProviders(options: LocaleModuleAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass!,
        useClass: options.useClass!,
      },
    ];
  }

  private static createAsyncOptionsProvider(options: LocaleModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: LOCALE_MODULE_OPTIONS,
        useFactory: async (...args: any[]) => mergeDefaults(await options.useFactory(...args)),
        inject: options.inject || [],
      };
    }
    return {
      provide: LOCALE_MODULE_OPTIONS,
      useFactory: async (optionsFactory: LocaleModuleOptionsFactory) =>
        mergeDefaults(await optionsFactory.createLocaleOptions()),
      inject: [options.useExisting! || options.useClass!],
    };
  }

  async onModuleInit() {
    try {
      const fileStat = await stat(this.options.path);
      if (!fileStat.isDirectory()) {
        this.logger.error('Module options "path" must be a directory!');
      }

      const dirNames = (await getDirectories(this.options.path)).map((dir) => path.basename(dir));
      if (!this.options.sites.every((site) => dirNames.includes(site))) {
        this.logger.error('Some of "sites" do not exists in "path" directory!');
      }
    } catch (err) {
      if (err.code === 'ENOENT') {
        this.logger.error(`Path "${this.options.path}" is not exists!`);
      }
    }
  }
}
