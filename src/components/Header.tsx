"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Search } from "lucide-react";
import { useApp } from "./AppProvider";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const { setSearchOpen } = useApp();
  const pathname = usePathname();
  const link = (href: string, text: string, icon?: React.ReactNode) => (
    <Link
      href={href}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors hover:text-crimson ${pathname === href ? "bg-gold/15 font-medium text-crimson" : "text-muted"}`}
    >
      {icon}{text}
    </Link>
  );
  return (
    <header className="border-b border-line/70">
      <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-3">
        <Link href="/" className="mr-auto flex items-center gap-2.5" aria-label="Śrī Lalitā Sahasranāma home">
          <span className="deva flex h-9 w-9 items-center justify-center rounded-full bg-crimson text-lg leading-none text-[#fff4d6]" aria-hidden>ॐ</span>
          <span className="font-display text-xl font-semibold leading-tight text-crimson sm:text-2xl">Lalitā Sahasranāma</span>
        </Link>
        <nav className="hidden items-center sm:flex">{link("/", "Reader")}{link("/sadhana", "Sadhana", <Flame size={15} />)}</nav>
        <button className="btn" onClick={() => setSearchOpen(true)} aria-label="Search (Ctrl or Cmd + K)">
          <Search size={16} />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden rounded border border-line px-1.5 text-[11px] text-muted sm:inline">⌘K</kbd>
        </button>
        <ThemeToggle />
      </div>
      <nav className="flex justify-center gap-2 pb-2 sm:hidden">{link("/", "Reader")}{link("/sadhana", "Sadhana", <Flame size={15} />)}</nav>
    </header>
  );
}
