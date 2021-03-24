import { Module, CacheModule, Global } from '@nestjs/common';
import { ConfigService } from '@/config/config.service';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        store: 'memory',
        ttl: configService.get('cache_ttl'),
        max: configService.get('cache_max'),
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [CacheModule],
})
export class GlobalCacheModule {}
