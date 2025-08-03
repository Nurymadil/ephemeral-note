import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class CreateShareDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  ttlMinutes: number;
}
