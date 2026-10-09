import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { artworksService } from "@/common/api/artworks";
import type { Artwork } from "@/common/types/artwork";
import { renderWithProviders } from "@/test/renderWithProviders";
import { DeleteArtworkDialog } from "./DeleteArtworkDialog";

vi.mock("@/common/api/artworks", () => ({
  artworksService: { remove: vi.fn() },
}));

const remove = vi.mocked(artworksService.remove);

const artwork: Artwork = {
  id: "00000000-0000-4000-8000-000000000001",
  title: "Sunset Over the Ocean",
  artist: "Claude Monet",
  type: "painting",
  price: 4500,
  availability: true,
};

describe("DeleteArtworkDialog", () => {
  beforeEach(() => {
    remove.mockReset();
  });

  async function openDialog() {
    const user = userEvent.setup();
    renderWithProviders(<DeleteArtworkDialog artwork={artwork} />);
    await user.click(
      screen.getByRole("button", { name: "Delete Sunset Over the Ocean" }),
    );
    return user;
  }

  it("deletes the artwork after confirming and closes the dialog", async () => {
    remove.mockResolvedValue(undefined);
    const user = await openDialog();

    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() =>
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
    );
    expect(remove).toHaveBeenCalledOnce();
    expect(remove).toHaveBeenCalledWith(artwork.id, expect.anything());
  });

  it("keeps the dialog open after a failed delete and allows a retry", async () => {
    remove.mockRejectedValueOnce({
      response: { status: 404, data: { message: "Artwork not found" } },
    });
    remove.mockResolvedValueOnce(undefined);
    const user = await openDialog();
    const confirm = screen.getByRole("button", { name: "Delete" });

    await user.click(confirm);

    await waitFor(() => expect(confirm).toBeEnabled());
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

    await user.click(confirm);

    await waitFor(() =>
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
    );
    expect(remove).toHaveBeenCalledTimes(2);
  });

  it("cannot be closed with Escape while deleting", async () => {
    remove.mockReturnValue(new Promise(() => {})); // never settles
    const user = await openDialog();

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.keyboard("{Escape}");

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  it("does not delete anything on cancel", async () => {
    const user = await openDialog();

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(remove).not.toHaveBeenCalled();
  });

  it("sends one request for a double click", async () => {
    remove.mockReturnValue(new Promise(() => {})); // never settles
    await openDialog();

    const confirm = screen.getByRole("button", { name: "Delete" });
    // Same tick, before React re-renders the button as disabled.
    fireEvent.click(confirm);
    fireEvent.click(confirm);

    await waitFor(() => expect(confirm).toBeDisabled());
    expect(remove).toHaveBeenCalledOnce();
  });
});
