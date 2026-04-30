import { NavLink } from "react-router-dom";

const navClass = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-imarah-primary text-white shadow-sm"
      : "text-imarah-ink hover:bg-white/80 hover:text-imarah-primary",
  ].join(" ");

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-imarah-border/80 bg-imarah-light/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <NavLink to="/" className="group flex items-center gap-3">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-imarah-primary text-imarah-goldlight shadow-inner"
            aria-hidden
          >
            <svg viewBox="0 0 32 32" className="h-6 w-6" fill="currentColor" aria-hidden>
              <path d="M16 4l2.8 9.7L28 16l-9.2 2.3L16 28l-2.8-9.7L4 16l9.2-2.3L16 4z" />
            </svg>
          </span>
          <div className="text-left leading-tight">
            <span className="block font-display text-xl font-semibold tracking-wide text-imarah-deep sm:text-2xl">
              IMARAH
            </span>
            <span className="block text-xs text-imarah-muted sm:text-sm">
              Integrated Ummah Centre of Excellence
            </span>
          </div>
        </NavLink>

        <nav
          className="flex w-full flex-wrap items-center justify-end gap-1 sm:w-auto"
          aria-label="Utama"
        >
          <NavLink to="/" className={navClass} end>
            <span className="block sm:inline">Utama</span>
            <span className="hidden text-imarah-muted sm:mx-1 sm:inline">·</span>
            <span className="hidden text-xs font-normal text-imarah-muted sm:inline">Home</span>
          </NavLink>
          <NavLink to="/masjid" className={navClass}>
            <span className="block sm:inline">Masjid &amp; Surau</span>
            <span className="hidden text-imarah-muted sm:mx-1 sm:inline">·</span>
            <span className="hidden text-xs font-normal text-imarah-muted sm:inline">Directory</span>
          </NavLink>
          <NavLink to="/tentang" className={navClass}>
            <span className="block sm:inline">Tentang</span>
            <span className="hidden text-imarah-muted sm:mx-1 sm:inline">·</span>
            <span className="hidden text-xs font-normal text-imarah-muted sm:inline">About</span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
