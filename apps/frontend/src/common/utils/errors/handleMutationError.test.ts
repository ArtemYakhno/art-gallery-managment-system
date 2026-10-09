import { toast } from "sonner";
import { handleMutationError } from "./handleMutationError";

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const toastError = vi.mocked(toast.error);

type Form = { title: string };

describe("handleMutationError", () => {
  beforeEach(() => toastError.mockReset());

  it("puts known field errors under the fields without a toast", () => {
    const setError = vi.fn();
    const error = {
      response: {
        data: { message: "Validation failed", errors: { title: ["too long"] } },
      },
    };

    handleMutationError<Form>(error, setError, { title: "title" });

    expect(setError).toHaveBeenCalledWith("title", {
      type: "server",
      message: "too long",
    });
    expect(toastError).not.toHaveBeenCalled();
  });

  it("shows a toast when there are no field errors", () => {
    const setError = vi.fn();
    const error = { response: { data: { message: "Artwork not found" } } };

    handleMutationError<Form>(error, setError, { title: "title" });

    expect(setError).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenCalledWith("Artwork not found");
  });

  it("puts known fields under the form and shows a toast for the rest", () => {
    const setError = vi.fn();
    const error = {
      response: {
        data: {
          message: "Validation failed",
          errors: { title: ["too long"], unknown: ["not allowed"] },
        },
      },
    };

    handleMutationError<Form>(error, setError, { title: "title" });

    expect(setError).toHaveBeenCalledExactlyOnceWith("title", {
      type: "server",
      message: "too long",
    });
    expect(toastError).toHaveBeenCalledWith("Validation failed");
  });

  it("shows a toast for field errors when there is no form", () => {
    const error = {
      response: {
        data: { message: "Validation failed", errors: { title: ["too long"] } },
      },
    };

    handleMutationError(error);

    expect(toastError).toHaveBeenCalledWith("Validation failed");
  });
});
