import { Module, DynamicModule, Provider, OnApplicationShutdown } from '@nestjs/common';
import { createEntityProvider } from './entity.provider';
import { EntityService } from './entity.service';
import { SEQUELIZE_ENTITY_OPTIONS } from './constants';

// Types
import {
  EntityModuleOptions,
  EntityModuleAsyncOptions,
  EntityOptionsFactory,
} from './interfaces/entity-options.interface';

@Module({
  providers: [EntityService],
  exports: [EntityService],
})
export class EntityModule implements OnApplicationShutdown {
  constructor(private readonly entityService: EntityService) {}

  static register(config: EntityModuleOptions): DynamicModule {
    return {
      module: EntityModule,
      providers: createEntityProvider(config),
    };
  }

  static registerAsync(options: EntityModuleAsyncOptions): DynamicModule {
    return {
      module: EntityModule,
      imports: options.imports || [],
      providers: this.createAsyncProviders(options),
    };
  }

  private static createAsyncProviders(options: EntityModuleAsyncOptions): Provider[] {
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

  private static createAsyncOptionsProvider(options: EntityModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: SEQUELIZE_ENTITY_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    return {
      provide: SEQUELIZE_ENTITY_OPTIONS,
      useFactory: async (optionsFactory: EntityOptionsFactory) => await optionsFactory.createEntityOptions(),
      inject: [options.useExisting! || options.useClass!],
    };
  }

  onApplicationShutdown() {
    // close db connection
    this.entityService.sequelize && this.entityService.sequelize.close();
  }
}
