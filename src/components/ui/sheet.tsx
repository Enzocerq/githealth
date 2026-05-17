"use client";

import { Dialog } from "@base-ui/react/dialog";
import { cn } from "@/lib/utils";

export const Sheet = Dialog.Root;

export function SheetTrigger({
  children,
  render,
}: {
  children?: React.ReactNode;
  render?: React.ReactElement;
}) {
  return <Dialog.Trigger render={render}>{children}</Dialog.Trigger>;
}

export function SheetContent({
  side = "right",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { side?: "left" | "right" }) {
  return (
    <Dialog.Portal>
      <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 transition-opacity duration-200" />
      <Dialog.Popup
        className={cn(
          "fixed inset-y-0 z-50 flex flex-col gap-4 bg-background p-6 shadow-xl transition-transform duration-300",
          side === "left"
            ? "left-0 data-[ending-style]:-translate-x-full data-[starting-style]:-translate-x-full"
            : "right-0 data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full",
          className,
        )}
        {...props}
      >
        {children}
      </Dialog.Popup>
    </Dialog.Portal>
  );
}

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5", className)} {...props} />;
}

export function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <Dialog.Title
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
}
