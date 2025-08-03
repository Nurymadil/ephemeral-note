import { Controller, Get, Param } from '@nestjs/common';
import { ShareService } from './share.service';
import { Public } from '../../auth/public.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('public')
@Controller()
export class PublicShareController {
  constructor(private readonly shareService: ShareService) {}

  @Public()
  @Get('public/notes/:token')
  getPublicNote(@Param('token') token: string) {
    return this.shareService.getPublicNote(token);
  }
}
