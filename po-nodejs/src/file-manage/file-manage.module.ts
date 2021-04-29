import { promisify } from 'util';
import * as fs from 'fs';
import express, { Express } from 'express';
import multer from 'multer';
import { HttpAdapterHost } from '@nestjs/core';
import { DynamicModule, Module, Provider, Inject, Logger, OnModuleInit } from '@nestjs/common';
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

const mkdir = promisify(fs.mkdir);

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
export class FileManageModule implements OnModuleInit {
  private readonly logger = new Logger('FileManageModule');

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    @Inject(FILE_MANAGE_MODULE_OPTIONS) private readonly options: Required<FileManageModuleOptions>,
  ) {}

  static register(options: FileManageModuleOptions): DynamicModule {
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

  static registerAsync(options: FileManageModuleAsyncOptions): DynamicModule {
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

  async onModuleInit() {
    let dest: string | null = null;
    try {
      const fileStat = fs.statSync(this.options.dest);
      if (!fileStat.isDirectory()) {
        this.logger.warn('FileManage "options.dest" must be a directory');
      } else {
        dest = this.options.dest;
      }
    } catch (err) {
      if (err.code === 'ENOENT') {
        this.logger.warn(`Dest directory "${this.options.dest}" is not exists`);
        // 新建目录目录
        await mkdir(this.options.dest);
        dest = this.options.dest;
      }
    }
    dest && this.registerFileStaticPath(dest, this.options.staticPrefix);
  }

  private registerFileStaticPath(dest: string, path: string) {
    const httpAdapter = this.httpAdapterHost.httpAdapter;
    const platformName = httpAdapter.getType();

    if (platformName === 'express') {
      this.registerExpress(dest, path);
    }
    // todo:暂时不使用
    // else if (platformName === 'fastify') {
    //
    // }
    else {
      throw new Error(`No support for current HttpAdapter: ${platformName}`);
    }
  }

  private registerExpress(dest: string, path: string) {
    const httpAdapter = this.httpAdapterHost.httpAdapter;
    const app = httpAdapter.getInstance<Express>();
    app.use(path, express.static(dest));

    this.logger.log(`Static file mapped {${path}} route`);
  }
}
