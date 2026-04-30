export function Spinner({ label }: { label?: string }) {
  return (
    <output className="block py-16 text-center text-imarah-muted" aria-busy="true">
      <span className="inline-flex items-center gap-2">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-imarah-primary border-t-transparent motion-reduce:animate-none" />
        <span>{label ?? "Loading…"}</span>
      </span>
    </output>
  );
}
