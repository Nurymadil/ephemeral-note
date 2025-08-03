import { Module } from '@nestjs/common';
import { ShareService } from './share.service';
import { ShareController } from './share.controller';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [ShareController],
  providers: [ShareService, PrismaService],
})
export class ShareModule {}
