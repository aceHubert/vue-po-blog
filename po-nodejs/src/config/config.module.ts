import { DynamicModule, Module, Provider, Global } from '@nestjs/common';
import { ConfigService } from './config.service';
import { getOptionsFromFile, mergeDefaults } from './utils';
import { CONFIG_OPTIONS } from './constants';

// Types
import { ConfigOptions } from './interfaces/config-options.interface';
import {
  ConfigModuleOptions,
  ConfigModuleAsyncOptions,
  ConfigModuleOptionsFactory,
} from './interfaces/config-module-options.interface';

@Global()
@Module({})
export class ConfigModule {
  static forRoot(options: ConfigModuleOptions): DynamicModule {
    let configOptions = options as ConfigOptions;
    if (options.path) {
      configOptions = getOptionsFromFile(options.path);
    }
    configOptions = mergeDefaults(configOptions);
    return {
      module: ConfigModule,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: configOptions,
        },
        ConfigService,
      ],
      exports: [ConfigService],
    };
  }

  static forRootAsync(options: ConfigModuleAsyncOptions): DynamicModule {
    return {
      module: ConfigModule,
      imports: options.imports,
      providers: [...this.createAsyncProviders(options), ConfigService],
      exports: [ConfigService],
    };
  }

  private static createAsyncProviders(options: ConfigModuleAsyncOptions): Provider[] {
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

  private static createAsyncOptionsProvider(options: ConfigModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: CONFIG_OPTIONS,
        useFactory: async (...args: any[]) => {
          const moduleOptions = await options.useFactory(...args);
          let configOptions = moduleOptions as ConfigOptions;
          if (moduleOptions.path) {
            configOptions = getOptionsFromFile(moduleOptions.path);
          }
          return mergeDefaults(configOptions);
        },
        inject: options.inject || [],
      };
    }
    return {
      provide: CONFIG_OPTIONS,
      useFactory: async (optionsFactory: ConfigModuleOptionsFactory) => {
        const moduleOptions = await optionsFactory.createConfigOptions();
        let configOptions = moduleOptions as ConfigOptions;
        if (moduleOptions.path) {
          configOptions = getOptionsFromFile(moduleOptions.path);
        }
        return mergeDefaults(configOptions);
      },
      inject: [options.useExisting! || options.useClass!],
    };
  }
}
