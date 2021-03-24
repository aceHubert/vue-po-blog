import { Module } from '@nestjs/common';
import { LinkResolver } from './link.resolver';

@Module({
  providers: [LinkResolver],
})
export class LinkModule {}
