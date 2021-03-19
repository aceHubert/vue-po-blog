import { Module, DynamicModule, OnApplicationShutdown } from '@nestjs/common';
import { EntityService } from './entity.service';
import { SEQUELIZE_ENTITY_OPTIONS } from './constants';

// Types
import { EntityModuleOptions, EntityModuleAsyncOptions } from './interfaces/entity-options.interface';

@Module({})
export class EntityModule implements OnApplicationShutdown {
  constructor(private readonly entityService: EntityService) {}

  static register(config: EntityModuleOptions): DynamicModule {
    return {
      module: EntityModule,
      providers: [
        {
          provide: SEQUELIZE_ENTITY_OPTIONS,
          useValue: config,
        },
        EntityService,
      ],
      exports: [EntityService],
    };
  }

  static registerAsync(options: EntityModuleAsyncOptions): DynamicModule {
    return {
      module: EntityModule,
      imports: options.imports,
      providers: [
        {
          provide: SEQUELIZE_ENTITY_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        EntityService,
      ],
      exports: [EntityService],
    };
  }

  onApplicationShutdown() {
    // close db connection
    this.entityService.sequelize && this.entityService.sequelize.close();
  }
}
