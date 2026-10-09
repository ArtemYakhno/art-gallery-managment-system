import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { artworkTypeSchema } from "@/common/schemas/artwork.schema";
import type { ArtworkType } from "@/common/types/artwork";
import { ARTWORK_TYPE_CONFIG } from "@/features/artworks/constants/artworkType.config";

// Radix Select does not allow "" as an item value.
const ALL_TYPES = "all";

interface ArtworkTypeFilterProps {
  value: ArtworkType | null;
  onChange: (value: ArtworkType | null) => void;
}

export function ArtworkTypeFilter({ value, onChange }: ArtworkTypeFilterProps) {
  return (
    <Select
      value={value ?? ALL_TYPES}
      onValueChange={(next) =>
        onChange(artworkTypeSchema.safeParse(next).data ?? null)
      }
    >
      <SelectTrigger aria-label="Filter by type" className="w-full sm:w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectItem value={ALL_TYPES}>All types</SelectItem>
        {artworkTypeSchema.options.map((type) => (
          <SelectItem key={type} value={type}>
            {ARTWORK_TYPE_CONFIG[type].label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
