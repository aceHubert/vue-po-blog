import { Module } from '@nestjs/common';
import { DbInitController } from './db-init.controller';

@Module({
  controllers: [DbInitController],
})
export class DbInitModule {}
