import { Module, Global } from '@nestjs/common';
import { EntityModule } from '@/sequelize-entities/entity.module';
import { ConfigService } from '@/config/config.service';
import * as DataSources from './datasources';

const providers = Object.values(DataSources);

@Global()
@Module({
  imports: [
    EntityModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        host: config.get('DB_HOST') || '127.0.0.1',
        port: config.get('DB_PORT') || 3306,
        dialect: config.get('DB_DIALECT') || 'mysql',
        charset: config.get('DB_CHARSET') || 'utf8',
        collate: config.get('DB_COLLATE') || '',
        database: config.get('DB_NAME') || '',
        username: config.get('DB_USER') || '',
        password: config.get('DB_PASSWORD') || '',
        tablePrefix: config.get('table_prefix') || 'po_',
      }),
      inject: [ConfigService],
    }),
  ],
  providers: providers,
  exports: providers,
})
export class DataSourceModule {}
