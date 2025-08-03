import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createNoteDto: CreateNoteDto) {
    return this.prisma.note.create({
      data: {
        userId,
        title: createNoteDto.title,
        body: createNoteDto.body,
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.note.findMany({ where: { userId } });
  }

  async findOne(id: number, userId: number) {
    const note = await this.prisma.note.findUnique({ where: { id } });
    if (!note) throw new NotFoundException();
    if (note.userId !== userId) throw new ForbiddenException();
    return note;
  }

  async update(id: number, userId: number, updateNoteDto: UpdateNoteDto) {
    await this.checkOwnership(id, userId);
    return this.prisma.note.update({
      where: { id },
      data: updateNoteDto,
    });
  }

  async remove(id: number, userId: number) {
    await this.checkOwnership(id, userId);
    return this.prisma.note.delete({ where: { id } });
  }

  private async checkOwnership(id: number, userId: number) {
    const note = await this.prisma.note.findUnique({ where: { id } });
    if (!note) throw new NotFoundException();
    if (note.userId !== userId) throw new ForbiddenException();
  }
}
