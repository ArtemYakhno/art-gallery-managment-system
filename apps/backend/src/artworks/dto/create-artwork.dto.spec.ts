import {
  ArgumentMetadata,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';
import { validationConfig } from '../../common/configs/validation.config.js';
import { CreateArtworkDto } from './create-artwork.dto.js';
import { ReplaceArtworkDto } from './replace-artwork.dto.js';

describe('CreateArtworkDto', () => {
  const pipe = new ValidationPipe(validationConfig);
  const metadata: ArgumentMetadata = {
    type: 'body',
    metatype: CreateArtworkDto,
  };

  const validBody = {
    title: 'Sunset Over the Ocean',
    artist: 'Claude Monet',
    type: 'painting',
    price: 4500,
    availability: true,
  };

  it('accepts the example body from the brief', async () => {
    await expect(pipe.transform(validBody, metadata)).resolves.toEqual(
      validBody,
    );
  });

  it('defaults an omitted availability to true', async () => {
    const { availability: _omitted, ...body } = validBody;

    await expect(pipe.transform(body, metadata)).resolves.toEqual({
      ...body,
      availability: true,
    });
  });

  it('keeps an explicit false availability', async () => {
    await expect(
      pipe.transform({ ...validBody, availability: false }, metadata),
    ).resolves.toEqual({ ...validBody, availability: false });
  });

  it('trims surrounding spaces off the text fields', async () => {
    const result = (await pipe.transform(
      { ...validBody, title: '  Water Lilies ', artist: ' Claude Monet  ' },
      metadata,
    )) as CreateArtworkDto;

    expect(result.title).toBe('Water Lilies');
    expect(result.artist).toBe('Claude Monet');
  });

  it.each([
    ['a missing title', { title: undefined }],
    [
      'a blank title that only looked non-empty before trimming',
      { title: '   ' },
    ],
    ['a title longer than 99 characters', { title: 'a'.repeat(100) }],
    ['a missing artist', { artist: undefined }],
    ['an artist longer than 50 characters', { artist: 'a'.repeat(51) }],
    ['a type outside the predefined list', { type: 'poster' }],
    ['a zero price', { price: 0 }],
    ['a negative price', { price: -10 }],
    ['a price sent as a string', { price: '4500' }],
    ['a price with more than two decimals', { price: 19.999 }],
    ['a price that does not fit the column', { price: 10_000_000_000 }],
    ['a non-boolean availability', { availability: 'yes' }],
    ['a null availability (the column is NOT NULL)', { availability: null }],
    ['an unknown field', { imageUrl: 'https://example.com/a.jpg' }],
  ])('rejects %s', async (_case, override) => {
    await expect(
      pipe.transform({ ...validBody, ...override }, metadata),
    ).rejects.toThrow(BadRequestException);
  });
});

// Checks that validators, @Trim and the default are inherited.
describe('ReplaceArtworkDto', () => {
  const pipe = new ValidationPipe(validationConfig);
  const metadata: ArgumentMetadata = {
    type: 'body',
    metatype: ReplaceArtworkDto,
  };

  const body = {
    title: ' Sunset Over the Ocean ',
    artist: 'Claude Monet',
    type: 'painting',
    price: 4500,
  };

  it('trims text and defaults availability like the create body', async () => {
    await expect(pipe.transform(body, metadata)).resolves.toEqual({
      ...body,
      title: 'Sunset Over the Ocean',
      availability: true,
    });
  });

  it('requires the full body, not a partial one', async () => {
    await expect(
      pipe.transform({ title: 'Sunset Over the Ocean' }, metadata),
    ).rejects.toThrow(BadRequestException);
  });
});
