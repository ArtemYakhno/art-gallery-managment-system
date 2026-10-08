import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ArtworksService } from './artworks.service.js';
import { ArtworkResponseDto } from './dto/artwork-response.dto.js';
import { CreateArtworkDto } from './dto/create-artwork.dto.js';
import { GetArtworksQueryDto } from './dto/get-artworks-query.dto.js';
import { ReplaceArtworkDto } from './dto/replace-artwork.dto.js';

@ApiTags('Artworks')
@Controller('artworks')
export class ArtworksController {
  constructor(private readonly artworksService: ArtworksService) {}

  @Get()
  @ApiOperation({ summary: 'List artworks with optional sorting and filters' })
  @ApiResponse({ status: HttpStatus.OK, type: [ArtworkResponseDto] })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST })
  findAll(@Query() query: GetArtworksQueryDto): Promise<ArtworkResponseDto[]> {
    return this.artworksService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single artwork' })
  @ApiResponse({ status: HttpStatus.OK, type: ArtworkResponseDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ArtworkResponseDto> {
    return this.artworksService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add an artwork' })
  @ApiResponse({ status: HttpStatus.CREATED, type: ArtworkResponseDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST })
  create(@Body() dto: CreateArtworkDto): Promise<ArtworkResponseDto> {
    return this.artworksService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Replace an artwork' })
  @ApiResponse({ status: HttpStatus.OK, type: ArtworkResponseDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  replace(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReplaceArtworkDto,
  ): Promise<ArtworkResponseDto> {
    return this.artworksService.replace(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an artwork' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.artworksService.remove(id);
  }
}
