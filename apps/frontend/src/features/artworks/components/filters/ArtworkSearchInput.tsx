import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/app/components/ui/input";

export const SEARCH_DEBOUNCE_MS = 400;

interface ArtworkSearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function ArtworkSearchInput({
  value,
  onChange,
}: ArtworkSearchInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);

  // Sync with the URL when it changes from outside (Reset).
  if (value !== prevValue) {
    setPrevValue(value);
    setInputValue(value);
  }

  useEffect(() => {
    if (inputValue === value) return;

    const timeoutId = window.setTimeout(
      () => onChange(inputValue),
      SEARCH_DEBOUNCE_MS,
    );
    return () => window.clearTimeout(timeoutId);
  }, [inputValue, value, onChange]);

  return (
    <div className="relative w-full sm:max-w-xs">
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        aria-label="Search by artist"
        placeholder="Search by artist..."
        className="pl-8"
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
      />
    </div>
  );
}
