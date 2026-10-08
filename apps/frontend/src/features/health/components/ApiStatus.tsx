import { cn } from "@/common/lib/cn";
import { extractErrorMessage } from "@/common/utils/errors/errors";
import { useHealthQuery } from "@/features/health/queries/useHealthQuery";

function StatusRow({ label, isUp, note }: { label: string; isUp: boolean; note?: string }) {
  return (
    <li className="flex items-center gap-2">
      <span
        aria-hidden
        className={cn("size-2.5 rounded-full", isUp ? "bg-green-500" : "bg-destructive")}
      />
      <span className="font-medium">{label}:</span>
      <span>{isUp ? "up" : "down"}</span>
      {note && <span className="text-muted-foreground">— {note}</span>}
    </li>
  );
}

export function ApiStatus() {
  const { data, error, isPending } = useHealthQuery();

  if (isPending) {
    return <p className="text-muted-foreground">Checking API…</p>;
  }

  if (error) {
    return (
      <ul>
        <StatusRow label="API" isUp={false} note={extractErrorMessage(error)} />
      </ul>
    );
  }

  return (
    <ul className="space-y-1">
      <StatusRow label="API" isUp />
      {Object.entries(data.details).map(([name, indicator]) => (
        <StatusRow
          key={name}
          label={name}
          isUp={indicator.status === "up"}
          note={indicator.message}
        />
      ))}
    </ul>
  );
}
