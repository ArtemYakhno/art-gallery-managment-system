import { act, renderHook, waitFor } from "@testing-library/react";
import {
  withNuqsTestingAdapter,
  type OnUrlUpdateFunction,
} from "nuqs/adapters/testing";
import { useArtworksParams } from "./useArtworksParams";

function renderParams(searchParams = "") {
  const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
  const { result } = renderHook(() => useArtworksParams(), {
    wrapper: withNuqsTestingAdapter({ searchParams, onUrlUpdate }),
  });
  return { result, onUrlUpdate };
}

const lastQueryString = (
  onUrlUpdate: ReturnType<typeof vi.fn<OnUrlUpdateFunction>>,
) => onUrlUpdate.mock.lastCall?.[0].queryString;

describe("useArtworksParams", () => {
  it("reads the filters from the URL in the brief's example", () => {
    const { result } = renderParams("?price=asc&artist=Picasso&type=painting");

    expect(result.current.filters).toEqual({
      price: "asc",
      artist: "Picasso",
      type: "painting",
    });
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it("ignores invalid values in the URL", () => {
    const { result } = renderParams("?type=poster&price=cheap");

    expect(result.current.filters).toEqual({
      price: undefined,
      artist: undefined,
      type: undefined,
    });
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it("writes a selected type to the URL and removes it when cleared", async () => {
    const { result, onUrlUpdate } = renderParams();

    act(() => result.current.setType("painting"));
    await waitFor(() =>
      expect(lastQueryString(onUrlUpdate)).toBe("?type=painting"),
    );

    act(() => result.current.setType(null));
    await waitFor(() => expect(lastQueryString(onUrlUpdate)).toBe(""));
  });

  it("writes a selected price order to the URL", async () => {
    const { result, onUrlUpdate } = renderParams();

    act(() => result.current.setPrice("desc"));

    expect(result.current.filters.price).toBe("desc");
    await waitFor(() =>
      expect(lastQueryString(onUrlUpdate)).toBe("?price=desc"),
    );
  });

  it("does not send an artist of spaces only to the API", () => {
    const { result } = renderParams("?artist=%20%20");

    expect(result.current.filters.artist).toBeUndefined();
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it("does not write an empty artist to the URL", async () => {
    const { result, onUrlUpdate } = renderParams("?artist=Monet");

    act(() => result.current.setArtist(""));
    await waitFor(() => expect(lastQueryString(onUrlUpdate)).toBe(""));
  });

  it("resets all filters to a clean URL", async () => {
    const { result, onUrlUpdate } = renderParams(
      "?price=desc&artist=Rodin&type=sculpture",
    );

    act(() => result.current.resetFilters());
    await waitFor(() => expect(lastQueryString(onUrlUpdate)).toBe(""));
  });
});
