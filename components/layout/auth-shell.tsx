export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-10%,color-mix(in_oklch,var(--primary)_16%,transparent),transparent_60%)]"
      />
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-base font-bold text-primary-foreground">
          B
        </span>
        {children}
      </div>
    </div>
  );
}
