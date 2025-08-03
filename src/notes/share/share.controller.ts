import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ShareService } from './share.service';
import { CreateShareDto } from './dto/create-share.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Public } from '../../auth/public.decorator';

@ApiTags('notes')
@Controller('notes')
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/share')
  create(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() createShareDto: CreateShareDto,
  ) {
    return this.shareService.create(id, req.user.userId, createShareDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id/share')
  findAll(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.shareService.findAll(id, req.user.userId);
  }

  @Public()
  @Get('/public/notes/:token')
  getPublicNote(@Param('token') token: string) {
    return this.shareService.getPublicNote(token);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id/share/:tokenId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Param('tokenId', ParseIntPipe) tokenId: number,
    @Request() req,
  ) {
    return this.shareService.revoke(id, tokenId, req.user.userId);
  }
}
