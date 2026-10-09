import { Globe, Mail, Share2 } from "lucide-react";

const FOOTER_ICONS = [Globe, Mail, Share2];

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-6">
        <div>
          <p className="font-bold">ArtGalleryManager</p>
          <p className="text-xs text-neutral-400">
            Your go-to platform for managing and exploring exquisite art pieces.
          </p>
        </div>
        <div className="flex shrink-0 gap-3" aria-hidden>
          {FOOTER_ICONS.map((Icon, index) => (
            <Icon key={index} className="size-6 text-neutral-400" />
          ))}
        </div>
      </div>
    </footer>
  );
}
