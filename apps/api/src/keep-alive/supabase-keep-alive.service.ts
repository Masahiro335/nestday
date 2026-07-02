import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupabaseKeepAliveService {
  private readonly logger = new Logger(SupabaseKeepAliveService.name);

  constructor(private readonly prisma: PrismaService) {}

  // 毎週月・木 9:00 UTC に実行。Supabase 無料プランの 7 日間非アクティブ一時停止を防ぐ。
  @Cron('0 9 * * 1,4')
  async ping(): Promise<void> {
    try {
      await this.prisma.user.findFirst({ select: { id: true } });
      this.logger.log('[KeepAlive] Supabase ping succeeded');
    } catch (err) {
      this.logger.error('[KeepAlive] Supabase ping failed', err instanceof Error ? err.stack : String(err));
    }
  }
}
