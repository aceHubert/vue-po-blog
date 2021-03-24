import { Module } from '@nestjs/common';
import { OptionResolver } from './option.resolver';

@Module({
  providers: [OptionResolver],
})
export class OptionModule {}
