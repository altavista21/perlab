"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./logout-button";
import {
  ShieldCheck,
  LayoutDashboard,
  ClipboardCheck,
  Users,
  FileText,
  CircleHelp
} from "lucide-react";

const userLinks = [
  { href: "/user/dashboard", label: "Beranda", desktopLabel: "Dashboard", icon: LayoutDashboard },
  { href: "/user/assessment", label: "Evaluasi", desktopLabel: "Evaluasi bansos", icon: ClipboardCheck },
  { href: "/user/sanggah", label: "Sanggah", desktopLabel: "Sanggahan", icon: FileText }
];

const agentLinks = [
  { href: "/agent/dashboard", label: "Antrean", desktopLabel: "Antrean verifikasi", icon: Users }
];

export function Brand() {
  return (
    <Link href="/" className="inline-flex min-w-0 items-center gap-2.5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-perlab-700 text-white shadow-sm">
        <ShieldCheck size={21} />
      </span>
      <span className="min-w-0">
        <span className="block text-lg font-bold leading-5 tracking-tight text-slate-900">perlab</span>
        <span className="block text-[9px] font-semibold tracking-[0.12em] text-slate-500">PERLINDUNGAN ABADI</span>
      </span>
    </Link>
  );
}

export function Shell({ children, role = "user" }: { children: React.ReactNode; role?: "user" | "agent" }) {
  const pathname = usePathname();
  const links = role === "user" ? userLinks : agentLinks;
  const allLinks = [...links, { href: "/", label: "Tentang", desktopLabel: "Tentang Perlab", icon: CircleHelp }];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-slate-200/90 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[60px] max-w-7xl items-center justify-between px-4 sm:h-[68px] sm:px-6">
          <Brand />
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 sm:inline-flex">
              {role === "user" ? "Portal Masyarakat" : "Portal Petugas"}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-4 pb-24 pt-5 sm:px-6 sm:pt-7 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-8 lg:pb-8 lg:pt-8">
        <aside className="hidden h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:block">
          <p className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Menu utama</p>
          <nav className="flex flex-col gap-1">
            {allLinks.map(({ href, desktopLabel, icon: Icon }) => {
              const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${active ? "bg-perlab-50 text-perlab-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                >
                  <Icon size={18} />{desktopLabel}
                </Link>
              );
            })}
          </nav>
          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
            Mode prototipe. Data dan hasil pada tahap ini belum merupakan keputusan resmi pemerintah.
          </div>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>

      <footer className="hidden border-t border-slate-200 bg-white lg:block">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Perlab · Perlindungan Abadi</span>
          <span>Prototipe layanan publik · Bukan portal resmi pemerintah</span>
        </div>
      </footer>

      <nav aria-label="Navigasi utama" className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 pt-2 backdrop-blur lg:hidden" style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}>
        <div className="mx-auto flex max-w-lg items-stretch justify-around">
          {allLinks.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-semibold transition ${active ? "text-perlab-800" : "text-slate-500 hover:text-slate-800"}`}
              >
                <span className={`grid h-8 w-12 place-items-center rounded-xl ${active ? "bg-perlab-50" : ""}`}>
                  <Icon size={19} strokeWidth={active ? 2.5 : 2} />
                </span>
                <span className="max-w-full truncate">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="mb-6">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-perlab-700">{eyebrow}</p>
      <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">{description}</p>
    </div>
  );
}
