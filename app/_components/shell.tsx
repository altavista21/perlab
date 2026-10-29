import { LogoutButton } from "./logout-button";
import Link from "next/link";
import { ShieldCheck, LayoutDashboard, ClipboardCheck, Users, FileText, CircleHelp } from "lucide-react";

const userLinks = [
  { href: "/user/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/user/assessment", label: "Evaluasi bansos", icon: ClipboardCheck },
  { href: "/user/sanggah", label: "Sanggahan", icon: FileText }
];
const agentLinks = [
  { href: "/agent/dashboard", label: "Antrean verifikasi", icon: Users }
];

export function Brand() {
  return <Link href="/" className="inline-flex items-center gap-3">
    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-perlab-700 text-white shadow-sm"><ShieldCheck size={23} /></span>
    <span><span className="block text-lg font-bold tracking-tight text-slate-900">perlab</span><span className="block text-[11px] font-medium tracking-wide text-slate-500">PERLINDUNGAN ABADI</span></span>
  </Link>;
}

export function Shell({ children, role = "user" }: { children: React.ReactNode; role?: "user" | "agent" }) {
  const links = role === "user" ? userLinks : agentLinks;
  return <div className="min-h-screen">
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Brand />
        <div className="flex items-center gap-2"><span className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 sm:inline-flex">{role === "user" ? "Portal Masyarakat" : "Portal Petugas"}</span><LogoutButton /></div>
      </div>
    </header>
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:py-8">
      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <p className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Menu utama</p>
        <nav className="flex gap-1 overflow-x-auto lg:flex-col">
          {links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className="flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-600 transition hover:bg-perlab-50 hover:text-perlab-800">
            <Icon size={18} />{label}
          </Link>)}
          <Link href="/" className="flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-600 hover:bg-slate-50"><CircleHelp size={18} />Tentang Perlab</Link>
        </nav>
        <div className="mt-4 hidden rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500 lg:block">Mode prototipe. Data dan hasil pada tahap ini belum merupakan keputusan resmi pemerintah.</div>
      </aside>
      <main className="min-w-0">{children}</main>
    </div>
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-5 text-xs text-slate-500 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} Perlab · Perlindungan Abadi</span><span>Prototipe layanan publik · Bukan portal resmi pemerintah</span>
      </div>
    </footer>
  </div>;
}

export function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="mb-6"><p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-perlab-700">{eyebrow}</p><h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">{description}</p></div>;
}
