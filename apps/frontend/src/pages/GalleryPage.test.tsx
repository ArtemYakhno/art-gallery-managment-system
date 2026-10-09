import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { artworksService } from "@/common/api/artworks";
import type { Artwork } from "@/common/types/artwork";
import { renderWithProviders } from "@/test/renderWithProviders";
import { GalleryPage } from "./GalleryPage";

vi.mock("@/common/api/artworks", () => ({
  artworksService: { getAll: vi.fn() },
}));

const getAll = vi.mocked(artworksService.getAll);

const artworks: Artwork[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    title: "Sunset Over the Ocean",
    artist: "Claude Monet",
    type: "painting",
    price: 4500,
    availability: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    title: "The Thinker",
    artist: "Auguste Rodin",
    type: "sculpture",
    price: 30000,
    availability: false,
  },
];

describe("GalleryPage list", () => {
  beforeEach(() => {
    getAll.mockReset();
    getAll.mockResolvedValue([]);
  });

  it("shows a card for every artwork from the API", async () => {
    getAll.mockResolvedValue(artworks);
    renderWithProviders(<GalleryPage />);

    expect(
      await screen.findByText("Sunset Over the Ocean"),
    ).toBeInTheDocument();
    expect(screen.getByText("The Thinker")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("shows the error and loads the list again on retry", async () => {
    getAll.mockRejectedValueOnce(new Error("Network Error"));
    const user = userEvent.setup();
    renderWithProviders(<GalleryPage />);

    expect(await screen.findByText("No server connection")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("No artworks found")).toBeInTheDocument();
    expect(getAll).toHaveBeenCalledTimes(2);
  });

  it("clears the filters from the empty state", async () => {
    const user = userEvent.setup();
    renderWithProviders(<GalleryPage />, { searchParams: "?type=painting" });

    await user.click(
      await screen.findByRole("button", { name: "Reset filters" }),
    );

    expect(await screen.findByText("No artworks found")).toBeInTheDocument();
    await waitFor(() =>
      expect(getAll).toHaveBeenLastCalledWith({
        price: undefined,
        artist: undefined,
        type: undefined,
      }),
    );
  });
});

describe("GalleryPage filters", () => {
  beforeEach(() => {
    getAll.mockReset();
    getAll.mockResolvedValue([]);
  });

  it("requests artworks with the filters from the URL", async () => {
    renderWithProviders(<GalleryPage />, { searchParams: "?type=painting" });

    expect(
      await screen.findByText("No artworks match your filters"),
    ).toBeInTheDocument();
    expect(getAll).toHaveBeenCalledWith({
      price: undefined,
      artist: undefined,
      type: "painting",
    });
  });

  it("requests artworks sorted by price after choosing a sort option", async () => {
    const user = userEvent.setup();
    renderWithProviders(<GalleryPage />);
    await screen.findByText("No artworks found");

    await user.click(screen.getByRole("combobox", { name: "Sort by" }));
    await user.click(
      await screen.findByRole("option", { name: "Price: Low to High" }),
    );

    await vi.waitFor(() =>
      expect(getAll).toHaveBeenLastCalledWith({
        price: "asc",
        artist: undefined,
        type: undefined,
      }),
    );
  });
});
