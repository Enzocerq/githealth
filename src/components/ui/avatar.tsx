import Image from "next/image";

import { cn } from "@/lib/utils";

export function Avatar({
  src,
  alt,
  fallback,
  className,
}: {
  src?: string | null;
  alt: string;
  fallback: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted",
        className,
      )}
    >
      {src ? (
        <Image src={src} alt={alt} fill className="object-cover" sizes="32px" />
      ) : (
        <span className="text-xs font-medium uppercase text-muted-foreground">
          {fallback.slice(0, 2)}
        </span>
      )}
    </div>
  );
}
