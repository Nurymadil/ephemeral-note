import {
  ForbiddenException,
  GoneException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateShareDto } from './dto/create-share.dto';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

@Injectable()
export class ShareService {
  constructor(private prisma: PrismaService) {}

  async create(noteId: number, userId: number, createShareDto: CreateShareDto) {
    await this.checkNoteOwnership(noteId, userId);
    const token = uuidv4();
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const ttl = new Date(Date.now() + createShareDto.ttlMinutes * 60 * 1000);
    await this.prisma.shareLink.create({
      data: {
        noteId,
        tokenHash,
        ttl,
        used: false,
      },
    });
    return { token };
  }

  async findAll(noteId: number, userId: number) {
    await this.checkNoteOwnership(noteId, userId);
    return this.prisma.shareLink.findMany({
      where: { noteId },
      select: { id: true, createdAt: true, ttl: true, used: true },
    });
  }

  async getPublicNote(token: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const shareLink = await this.prisma.shareLink.findUnique({
      where: { tokenHash },
    });
    if (!shareLink) {
      throw new NotFoundException('Link not found');
    }
    if (shareLink.used || shareLink.ttl < new Date()) {
      throw new GoneException('Link has expired or been used');
    }
    await this.prisma.shareLink.update({
      where: { tokenHash },
      data: { used: true },
    });
    return this.prisma.note.findUnique({
      where: { id: shareLink.noteId },
    });
  }

  async revoke(noteId: number, tokenId: number, userId: number) {
    await this.checkNoteOwnership(noteId, userId);
    const shareLink = await this.prisma.shareLink.findUnique({
      where: { id: tokenId },
    });
    if (!shareLink || shareLink.noteId !== noteId) {
      throw new NotFoundException();
    }
    await this.prisma.shareLink.delete({ where: { id: tokenId } });
  }

  private async checkNoteOwnership(noteId: number, userId: number) {
    const note = await this.prisma.note.findUnique({ where: { id: noteId } });
    if (!note || note.userId !== userId) {
      throw new ForbiddenException();
    }
  }
}
