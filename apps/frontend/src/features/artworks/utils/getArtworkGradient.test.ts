import { getArtworkGradient } from "./getArtworkGradient";

describe("getArtworkGradient", () => {
  const firstId = "00000000-0000-4000-8000-000000000001";
  const secondId = "00000000-0000-4000-8000-000000000002";

  it("returns the same gradient for the same id", () => {
    expect(getArtworkGradient(firstId)).toBe(getArtworkGradient(firstId));
  });

  it("returns different gradients for different ids", () => {
    expect(getArtworkGradient(firstId)).not.toBe(getArtworkGradient(secondId));
  });
});
