import { act, fireEvent, render, screen } from "@testing-library/react";
import { ArtworkSearchInput, SEARCH_DEBOUNCE_MS } from "./ArtworkSearchInput";

describe("ArtworkSearchInput", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("reports the typed value only after the debounce delay", () => {
    const onChange = vi.fn();
    render(<ArtworkSearchInput value="" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("Search by artist"), {
      target: { value: "Monet" },
    });
    expect(onChange).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS));
    expect(onChange).toHaveBeenCalledExactlyOnceWith("Monet");
  });

  it("shows a new value that comes from outside (e.g. reset)", () => {
    const { rerender } = render(
      <ArtworkSearchInput value="Monet" onChange={vi.fn()} />,
    );

    rerender(<ArtworkSearchInput value="" onChange={vi.fn()} />);

    expect(screen.getByLabelText("Search by artist")).toHaveValue("");
  });

  it("restarts the delay on every keystroke and reports only the last value", () => {
    const onChange = vi.fn();
    render(<ArtworkSearchInput value="" onChange={onChange} />);
    const input = screen.getByLabelText("Search by artist");

    fireEvent.change(input, { target: { value: "Mo" } });
    act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 100));
    fireEvent.change(input, { target: { value: "Monet" } });
    act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 100));
    expect(onChange).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(100));
    expect(onChange).toHaveBeenCalledExactlyOnceWith("Monet");
  });
});
