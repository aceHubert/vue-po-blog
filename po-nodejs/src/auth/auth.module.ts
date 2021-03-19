import { Module } from '@nestjs/common';
import { CustomCacheModule } from '@/custom-cache/custom-cache.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [CustomCacheModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
