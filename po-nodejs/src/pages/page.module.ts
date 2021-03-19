import { Module } from '@nestjs/common';
import { PageResolver } from './page.resolver';

@Module({
  providers: [PageResolver],
})
export class PageModule {}
