import { ApiProperty } from '@nestjs/swagger';
import { ArtworkType } from '../../generated/prisma/enums.js';

export class ArtworkResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Sunset Over the Ocean' })
  title: string;

  @ApiProperty({ example: 'Claude Monet' })
  artist: string;

  @ApiProperty({ enum: ArtworkType, enumName: 'ArtworkType' })
  type: ArtworkType;

  @ApiProperty({ example: 4500 })
  price: number;

  @ApiProperty()
  availability: boolean;
}
