import { Module } from '@nestjs/common';
import { ShareService } from './share.service';
import { ShareController } from './share.controller';
import { PrismaService } from 'prisma/prisma.service';
import { PublicShareController } from './public-share.controller';

@Module({
  controllers: [ShareController, PublicShareController],
  providers: [ShareService, PrismaService],
})
export class ShareModule {}
