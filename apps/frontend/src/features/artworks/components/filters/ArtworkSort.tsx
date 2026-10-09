import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { priceSortOrderSchema } from "@/common/schemas/artwork.schema";
import type { PriceSortOrder } from "@/common/types/artwork";

const NEWEST = "newest";

const SORT_OPTIONS = [
  { value: NEWEST, label: "Newest" },
  { value: "asc", label: "Price: Low to High" },
  { value: "desc", label: "Price: High to Low" },
] as const;

interface ArtworkSortProps {
  value: PriceSortOrder | null;
  onChange: (value: PriceSortOrder | null) => void;
}

export function ArtworkSort({ value, onChange }: ArtworkSortProps) {
  return (
    <Select
      value={value ?? NEWEST}
      onValueChange={(next) =>
        onChange(priceSortOrderSchema.safeParse(next).data ?? null)
      }
    >
      <SelectTrigger aria-label="Sort by" className="w-full sm:w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper">
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
