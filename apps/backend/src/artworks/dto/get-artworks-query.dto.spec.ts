import {
  ArgumentMetadata,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';
import { validationConfig } from '../../common/configs/validation.config.js';
import { GetArtworksQueryDto } from './get-artworks-query.dto.js';

describe('GetArtworksQueryDto', () => {
  const pipe = new ValidationPipe(validationConfig);
  const metadata: ArgumentMetadata = {
    type: 'query',
    metatype: GetArtworksQueryDto,
  };

  it('accepts the example query from the brief', async () => {
    const query = { price: 'asc', artist: 'Picasso', type: 'painting' };

    await expect(pipe.transform(query, metadata)).resolves.toEqual(query);
  });

  it('accepts no params at all', async () => {
    await expect(pipe.transform({}, metadata)).resolves.toEqual({});
  });

  it('trims the artist filter', async () => {
    const result = (await pipe.transform(
      { artist: '  Monet ' },
      metadata,
    )) as GetArtworksQueryDto;

    expect(result.artist).toBe('Monet');
  });

  it('rejects an unknown sort order', async () => {
    await expect(pipe.transform({ price: 'cheap' }, metadata)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects an unknown artwork type', async () => {
    await expect(pipe.transform({ type: 'poster' }, metadata)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects an unknown query param', async () => {
    await expect(pipe.transform({ foo: '1' }, metadata)).rejects.toThrow(
      BadRequestException,
    );
  });
});
