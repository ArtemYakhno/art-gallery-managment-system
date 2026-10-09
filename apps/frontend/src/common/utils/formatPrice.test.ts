import { formatPrice } from "./formatPrice";

describe("formatPrice", () => {
  it.each([
    [4500, "$4,500"],
    [30000, "$30,000"],
    [2750.5, "$2,750.50"],
  ])("formats %s as %s", (price, expected) => {
    expect(formatPrice(price)).toBe(expected);
  });
});
