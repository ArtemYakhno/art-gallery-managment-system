import { Palette } from "lucide-react";

export function Header() {
  return (
    <header className="border-b bg-background sticky top-0 z-10">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 ">
        <Palette className="size-5" aria-hidden />
        <span className="font-bold">ArtGalleryManager</span>
      </div>
    </header>
  );
}
