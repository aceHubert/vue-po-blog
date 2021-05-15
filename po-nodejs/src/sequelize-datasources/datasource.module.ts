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
        host: config.get('db_host') || '127.0.0.1',
        port: config.get('db_port') || 3306,
        dialect: config.get('db_dialect') || 'mysql',
        charset: config.get('db_charset') || 'utf8',
        collate: config.get('db_collate') || '',
        database: config.get('db_name') || '',
        username: config.get('db_user') || '',
        password: config.get('db_password') || '',
        tablePrefix: config.get('table_prefix') || 'po_',
      }),
      inject: [ConfigService],
    }),
  ],
  providers: providers,
  exports: providers,
})
export class DataSourceModule {}
