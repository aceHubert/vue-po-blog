import multer from 'multer';
import { DynamicModule, Module, Provider } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigService } from '@/config/config.service';
import { FileManageService } from './file-manage.service';
import { FileManageController } from './file-manage.controller';
import { mergeDefaults } from './utils/merge-defaults.util';
import { FILE_MANAGE_MODULE_OPTIONS } from './constants';

// Types
import {
  FileManageModuleOptions,
  FileManageModuleAsyncOptions,
  FileManageModuleOptionsFactory,
} from './interfaces/file-manage-module-options.interface';

@Module({
  imports: [
    MulterModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        storage:
          config.get('file_storage') === 'disk'
            ? multer.diskStorage({ destination: config.get('file_dest') })
            : multer.memoryStorage(),
        limits: config.get('file_limits'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class FileManageModule {
  static forRoot(options: FileManageModuleOptions): DynamicModule {
    options = mergeDefaults(options);
    return {
      module: FileManageModule,
      controllers: [FileManageController],
      providers: [
        {
          provide: FILE_MANAGE_MODULE_OPTIONS,
          useValue: options,
        },
        FileManageService,
      ],
      exports: [FileManageService],
    };
  }

  static forRootAsync(options: FileManageModuleAsyncOptions): DynamicModule {
    return {
      module: FileManageModule,
      imports: options.imports,
      controllers: [FileManageController],
      providers: [...this.createAsyncProviders(options), FileManageService],
      exports: [FileManageService],
    };
  }

  private static createAsyncProviders(options: FileManageModuleAsyncOptions): Provider[] {
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

  private static createAsyncOptionsProvider(options: FileManageModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: FILE_MANAGE_MODULE_OPTIONS,
        useFactory: async (...args: any[]) => mergeDefaults(await options.useFactory(...args)),
        inject: options.inject || [],
      };
    }
    return {
      provide: FILE_MANAGE_MODULE_OPTIONS,
      useFactory: async (optionsFactory: FileManageModuleOptionsFactory) =>
        mergeDefaults(await optionsFactory.createFileManageOptions()),
      inject: [options.useExisting! || options.useClass!],
    };
  }
}
