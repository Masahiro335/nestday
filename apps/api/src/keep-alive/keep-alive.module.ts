import { Module } from '@nestjs/common';
import { SupabaseKeepAliveService } from './supabase-keep-alive.service';

@Module({
  providers: [SupabaseKeepAliveService],
})
export class KeepAliveModule {}
