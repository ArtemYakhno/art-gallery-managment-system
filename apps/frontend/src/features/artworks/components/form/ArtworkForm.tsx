import { useId, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  Controller,
  useForm,
  type DefaultValues,
  type Path,
} from "react-hook-form";
import { Button } from "@/app/components/ui/button";
import { DialogClose, DialogFooter } from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Switch } from "@/app/components/ui/switch";
import {
  artworkFormSchema,
  artworkTypeSchema,
} from "@/common/schemas/artwork.schema";
import type { Artwork, ArtworkFormValues } from "@/common/types/artwork";
import { ARTWORK_TYPE_CONFIG } from "@/features/artworks/constants/artworkType.config";
import { useSaveArtworkMutation } from "@/features/artworks/queries/useSaveArtworkMutation";
import { FormField } from "./FormField";

const emptyArtwork: DefaultValues<ArtworkFormValues> = {
  title: "",
  artist: "",
  availability: true,
};

interface ArtworkFormProps {
  artwork?: Artwork;
  closeDialog: () => void;
}

export function ArtworkForm({ artwork, closeDialog }: ArtworkFormProps) {
  const id = useId();
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<ArtworkFormValues>({
    resolver: zodResolver(artworkFormSchema),
    defaultValues: artwork
      ? {
          title: artwork.title,
          artist: artwork.artist,
          type: artwork.type,
          price: artwork.price,
          availability: artwork.availability,
        }
      : emptyArtwork,
  });

  const { mutate: saveArtwork, isPending } = useSaveArtworkMutation(
    artwork,
    setError,
  );

  const isSaving = useRef(false);

  const onValidSubmit = (values: ArtworkFormValues) => {
    if (isSaving.current) return;
    isSaving.current = true;

    saveArtwork(values, {
      onSuccess: closeDialog,
      onSettled: () => {
        isSaving.current = false;
      },
    });
  };

  const fieldId = (name: Path<ArtworkFormValues>) => `${id}-${name}`;
  const errorProps = (name: Path<ArtworkFormValues>) => ({
    id: fieldId(name),
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${fieldId(name)}-error` : undefined,
  });

  return (
    <form
      onSubmit={(event) => void handleSubmit(onValidSubmit)(event)}
      noValidate
      className="grid gap-4"
    >
      <FormField
        id={fieldId("title")}
        label="Title"
        error={errors.title?.message}
      >
        <Input
          {...errorProps("title")}
          placeholder="e.g. Sunset Over the Ocean"
          {...register("title")}
        />
      </FormField>

      <FormField
        id={fieldId("artist")}
        label="Artist"
        error={errors.artist?.message}
      >
        <Input
          {...errorProps("artist")}
          placeholder="e.g. Claude Monet"
          {...register("artist")}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id={fieldId("type")}
          label="Type"
          error={errors.type?.message}
        >
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger
                  {...errorProps("type")}
                  className="w-full"
                  onBlur={field.onBlur}
                >
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {artworkTypeSchema.options.map((type) => (
                    <SelectItem key={type} value={type}>
                      {ARTWORK_TYPE_CONFIG[type].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <FormField
          id={fieldId("price")}
          label="Price, $"
          error={errors.price?.message}
        >
          <Input
            {...errorProps("price")}
            type="number"
            inputMode="decimal"
            step="100"
            min="0"
            placeholder="e.g. 4500.50"
            {...register("price", { valueAsNumber: true })}
          />
        </FormField>
      </div>

      <Controller
        control={control}
        name="availability"
        render={({ field }) => (
          <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
            <div className="grid gap-0.5">
              <label htmlFor={fieldId("availability")} className="font-medium">
                Available for sale
              </label>
              <p className="text-xs text-muted-foreground">
                Off — exhibition only
              </p>
            </div>
            <Switch
              id={fieldId("availability")}
              checked={field.value}
              onCheckedChange={field.onChange}
              onBlur={field.onBlur}
            />
          </div>
        )}
      />

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isPending}>
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isPending || (artwork && !isDirty)}>
          {isPending && <Loader2 className="animate-spin" aria-hidden />}
          {artwork ? "Save changes" : "Add artwork"}
        </Button>
      </DialogFooter>
    </form>
  );
}
