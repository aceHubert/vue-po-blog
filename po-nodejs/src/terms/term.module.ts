import { Module } from '@nestjs/common';
import { TermResolver } from './term.resolver';

@Module({
  providers: [TermResolver],
})
export class TermModule {}
