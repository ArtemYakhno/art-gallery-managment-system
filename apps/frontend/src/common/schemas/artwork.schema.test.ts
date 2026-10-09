import { ARTWORK_PRICE_MAX } from "@/common/constants/artwork.constants";
import { artworkFormSchema, artworkListSchema } from "./artwork.schema";

describe("artworkFormSchema", () => {
  const validBody = {
    title: "Sunset Over the Ocean",
    artist: "Claude Monet",
    type: "painting",
    price: 4500,
    availability: true,
  };

  it("accepts the example body from the brief", () => {
    expect(artworkFormSchema.parse(validBody)).toEqual(validBody);
  });

  it("trims surrounding spaces off the text fields", () => {
    const result = artworkFormSchema.parse({
      ...validBody,
      title: "  Water Lilies ",
      artist: " Claude Monet  ",
    });

    expect(result.title).toBe("Water Lilies");
    expect(result.artist).toBe("Claude Monet");
  });

  it("accepts a price with cents and a false availability", () => {
    const body = { ...validBody, price: 2750.5, availability: false };

    expect(artworkFormSchema.parse(body)).toEqual(body);
  });

  it.each([
    ["a title of exactly 99 characters", { title: "a".repeat(99) }],
    ["an artist of exactly 50 characters", { artist: "a".repeat(50) }],
    ["the smallest price", { price: 0.01 }],
    ["the largest price", { price: ARTWORK_PRICE_MAX }],
  ])("accepts %s", (_case, override) => {
    expect(
      artworkFormSchema.safeParse({ ...validBody, ...override }).success,
    ).toBe(true);
  });

  it.each([
    ["an empty title", { title: "" }],
    ["a title of spaces only", { title: "   " }],
    ["a title longer than 99 characters", { title: "a".repeat(100) }],
    ["an empty artist", { artist: "" }],
    ["an artist longer than 50 characters", { artist: "a".repeat(51) }],
    ["a type outside the predefined list", { type: "poster" }],
    ["a zero price", { price: 0 }],
    ["a negative price", { price: -10 }],
    ["an empty price input (NaN)", { price: Number.NaN }],
    ["a price with more than two decimals", { price: 19.999 }],
    ["a price above the maximum", { price: 10_000_000_000 }],
  ])("rejects %s", (_case, override) => {
    expect(
      artworkFormSchema.safeParse({ ...validBody, ...override }).success,
    ).toBe(false);
  });
});

describe("artworkListSchema", () => {
  const artwork = {
    id: "00000000-0000-4000-8000-000000000001",
    title: "Sunset Over the Ocean",
    artist: "Claude Monet",
    type: "painting",
    price: 4500,
    availability: true,
  };

  it("accepts a list in the API response shape", () => {
    expect(artworkListSchema.parse([artwork])).toEqual([artwork]);
  });

  it("rejects a price sent as a string", () => {
    expect(
      artworkListSchema.safeParse([{ ...artwork, price: "4500" }]).success,
    ).toBe(false);
  });
});
