import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Max,
  MaxLength,
} from 'class-validator';
import { Trim } from '../../common/decorators/trim.decorator.js';
import { ArtworkType } from '../../generated/prisma/enums.js';

// The largest value the price column (Decimal(12, 2)) can hold.
const MAX_PRICE = 9_999_999_999.99;

export class CreateArtworkDto {
  @ApiProperty({ maxLength: 99, example: 'Sunset Over the Ocean' })
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(99)
  title: string;

  @ApiProperty({ maxLength: 50, example: 'Claude Monet' })
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  artist: string;

  @ApiProperty({ enum: ArtworkType, enumName: 'ArtworkType' })
  @IsEnum(ArtworkType)
  type: ArtworkType;

  @ApiProperty({
    minimum: 0,
    exclusiveMinimum: true,
    maximum: MAX_PRICE,
    example: 4500,
  })
  @IsNumber({ maxDecimalPlaces: 2, allowNaN: false, allowInfinity: false })
  @IsPositive()
  @Max(MAX_PRICE)
  price: number;

  // No @IsOptional — it would also let null  through, and the column is NOT NULL
  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  availability: boolean = true;
}
