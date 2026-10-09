import {
  Camera,
  Landmark,
  Paintbrush,
  PencilLine,
  Printer,
  type LucideIcon,
} from "lucide-react";
import type { ArtworkType } from "@/common/types/artwork";

export const ARTWORK_TYPE_CONFIG: Record<
  ArtworkType,
  { label: string; icon: LucideIcon }
> = {
  painting: { label: "Painting", icon: Paintbrush },
  sculpture: { label: "Sculpture", icon: Landmark },
  photography: { label: "Photography", icon: Camera },
  drawing: { label: "Drawing", icon: PencilLine },
  print: { label: "Print", icon: Printer },
};
