import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { Trim } from '../../common/decorators/trim.decorator.js';
import { ArtworkType } from '../../generated/prisma/enums.js';

export const PRICE_SORT_ORDERS = ['asc', 'desc'] as const;
export type PriceSortOrder = (typeof PRICE_SORT_ORDERS)[number];

export class GetArtworksQueryDto {
  @ApiPropertyOptional({
    enum: PRICE_SORT_ORDERS,
    description: 'Sort by price',
  })
  @IsOptional()
  @IsIn(PRICE_SORT_ORDERS)
  price?: PriceSortOrder;

  @ApiPropertyOptional({
    maxLength: 50,
    description: 'Artist name, case-insensitive partial match',
  })
  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(50)
  artist?: string;

  @ApiPropertyOptional({ enum: ArtworkType, enumName: 'ArtworkType' })
  @IsOptional()
  @IsEnum(ArtworkType)
  type?: ArtworkType;
}
