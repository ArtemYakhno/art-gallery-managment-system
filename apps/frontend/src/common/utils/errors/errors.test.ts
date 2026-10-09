import { ZodError } from "zod";
import {
  ApiValidationError,
  extractErrorMessage,
  extractFieldErrors,
} from "./errors";

describe("extractErrorMessage", () => {
  it("returns the message from the backend error body", () => {
    const error = { response: { data: { message: "Artwork not found" } } };

    expect(extractErrorMessage(error)).toBe("Artwork not found");
  });

  it("reports a missing connection when there is no response", () => {
    expect(extractErrorMessage(new Error("Network Error"))).toBe(
      "No server connection",
    );
  });

  it("falls back to a generic message for a response without a message", () => {
    const error = { response: { data: {} } };

    expect(extractErrorMessage(error)).toBe("An unknown error occurred");
  });

  it("reports unexpected data for a response that failed validation", () => {
    const error = new ApiValidationError("Invalid response", new ZodError([]));

    expect(extractErrorMessage(error)).toBe("Server returned unexpected data");
  });
});

describe("extractFieldErrors", () => {
  it("takes the first message of every field and skips empty ones", () => {
    const error = {
      response: {
        data: {
          errors: { title: ["too long", "not a string"], artist: [] },
        },
      },
    };

    expect(extractFieldErrors(error)).toEqual({ title: "too long" });
  });

  it("returns an empty object when the body has no field errors", () => {
    expect(extractFieldErrors(new Error("Network Error"))).toEqual({});
  });
});
