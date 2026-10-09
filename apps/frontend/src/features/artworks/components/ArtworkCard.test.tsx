import { screen } from "@testing-library/react";
import type { Artwork } from "@/common/types/artwork";
import { renderWithProviders } from "@/test/renderWithProviders";
import { ArtworkCard } from "./ArtworkCard";

const artwork: Artwork = {
  id: "00000000-0000-4000-8000-000000000001",
  title: "Sunset Over the Ocean",
  artist: "Claude Monet",
  type: "painting",
  price: 4500,
  availability: true,
};

describe("ArtworkCard", () => {
  it("shows the artwork details", () => {
    renderWithProviders(<ArtworkCard artwork={artwork} />);

    expect(screen.getByText("Sunset Over the Ocean")).toBeInTheDocument();
    expect(screen.getByText("By: Claude Monet")).toBeInTheDocument();
    expect(screen.getByText("$4,500")).toBeInTheDocument();
    expect(screen.getByText("Painting")).toBeInTheDocument();
    expect(screen.getByText("For sale")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Edit Sunset Over the Ocean" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Delete Sunset Over the Ocean" }),
    ).toBeInTheDocument();
  });

  it("marks an artwork that is not for sale as exhibition only", () => {
    renderWithProviders(
      <ArtworkCard artwork={{ ...artwork, availability: false }} />,
    );

    expect(screen.getByText("Exhibition only")).toBeInTheDocument();
    expect(screen.queryByText("For sale")).not.toBeInTheDocument();
  });
});
