import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { artworksService } from "@/common/api/artworks";
import type { Artwork } from "@/common/types/artwork";
import { renderWithProviders } from "@/test/renderWithProviders";
import { AddArtworkButton } from "./AddArtworkButton";
import { EditArtworkButton } from "./EditArtworkButton";

vi.mock("@/common/api/artworks", () => ({
  artworksService: { create: vi.fn(), update: vi.fn() },
}));

const create = vi.mocked(artworksService.create);
const update = vi.mocked(artworksService.update);

const artwork: Artwork = {
  id: "00000000-0000-4000-8000-000000000001",
  title: "Sunset Over the Ocean",
  artist: "Claude Monet",
  type: "painting",
  price: 4500,
  availability: true,
};

async function openAddDialog(user: UserEvent) {
  renderWithProviders(<AddArtworkButton />);
  await user.click(screen.getByRole("button", { name: "Add New Artwork" }));
}

async function fillValidForm(user: UserEvent) {
  await user.type(screen.getByLabelText("Title"), "  Water Lilies ");
  await user.type(screen.getByLabelText("Artist"), "Claude Monet");
  await user.click(screen.getByRole("combobox", { name: "Type" }));
  await user.click(await screen.findByRole("option", { name: "Painting" }));
  await user.type(screen.getByLabelText("Price, $"), "4500");
}

describe("Add artwork dialog", () => {
  beforeEach(() => {
    create.mockReset();
  });

  it("shows validation errors and skips the API for an empty form", async () => {
    const user = userEvent.setup();
    await openAddDialog(user);

    await user.click(screen.getByRole("button", { name: "Add artwork" }));

    // By role: "Select a type" is also the placeholder text.
    const alerts = await screen.findAllByRole("alert");
    expect(alerts.map((alert) => alert.textContent)).toEqual([
      "Title is required",
      "Artist is required",
      "Select a type",
      "Price must be a number",
    ]);
    expect(create).not.toHaveBeenCalled();
  });

  it("sends the trimmed values and closes the dialog", async () => {
    create.mockResolvedValue({ ...artwork, title: "Water Lilies" });
    const user = userEvent.setup();
    await openAddDialog(user);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Add artwork" }));

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(create).toHaveBeenCalledWith({
      title: "Water Lilies",
      artist: "Claude Monet",
      type: "painting",
      price: 4500,
      availability: true,
    });

    await user.click(screen.getByRole("button", { name: "Add New Artwork" }));
    expect(screen.getByLabelText("Title")).toHaveValue("");
    expect(screen.getByLabelText("Price, $")).toHaveValue(null);
  });

  it("sends availability false when the switch is turned off", async () => {
    create.mockResolvedValue({ ...artwork, availability: false });
    const user = userEvent.setup();
    await openAddDialog(user);

    await fillValidForm(user);
    await user.click(
      screen.getByRole("switch", { name: "Available for sale" }),
    );
    await user.click(screen.getByRole("button", { name: "Add artwork" }));

    await waitFor(() =>
      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({ availability: false }),
      ),
    );
  });

  it("sends one request for a double click", async () => {
    create.mockReturnValue(new Promise(() => {})); // never settles
    const user = userEvent.setup();
    await openAddDialog(user);

    await fillValidForm(user);
    const submit = screen.getByRole("button", { name: "Add artwork" });
    // Same tick, before React re-renders the button as disabled.
    fireEvent.click(submit);
    fireEvent.click(submit);

    await waitFor(() => expect(submit).toBeDisabled());
    expect(create).toHaveBeenCalledOnce();
  });

  it("cannot be closed with Escape while saving", async () => {
    create.mockReturnValue(new Promise(() => {})); // never settles
    const user = userEvent.setup();
    await openAddDialog(user);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Add artwork" }));
    await waitFor(() => expect(create).toHaveBeenCalledOnce());
    await user.keyboard("{Escape}");

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("shows a server validation error under its field", async () => {
    const serverMessage =
      "title must be shorter than or equal to 99 characters";
    create.mockRejectedValue({
      response: {
        status: 400,
        data: {
          message: "Validation failed",
          errors: { title: [serverMessage] },
        },
      },
    });
    const user = userEvent.setup();
    await openAddDialog(user);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Add artwork" }));

    expect(await screen.findByText(serverMessage)).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

describe("Edit artwork dialog", () => {
  beforeEach(() => {
    update.mockReset();
  });

  it("starts with the artwork values and sends the changed body", async () => {
    update.mockResolvedValue({ ...artwork, price: 5000 });
    const user = userEvent.setup();
    renderWithProviders(<EditArtworkButton artwork={artwork} />);

    await user.click(
      screen.getByRole("button", { name: "Edit Sunset Over the Ocean" }),
    );

    expect(screen.getByLabelText("Title")).toHaveValue("Sunset Over the Ocean");
    const save = screen.getByRole("button", { name: "Save changes" });
    expect(save).toBeDisabled();

    const price = screen.getByLabelText("Price, $");
    await user.clear(price);
    await user.type(price, "5000");
    await user.click(save);

    await waitFor(() => expect(update).toHaveBeenCalledOnce());
    expect(update).toHaveBeenCalledWith(artwork.id, {
      title: "Sunset Over the Ocean",
      artist: "Claude Monet",
      type: "painting",
      price: 5000,
      availability: true,
    });
  });
});
