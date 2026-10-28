import Link from "next/link";
import { ArrowRight, BadgeCheck, ClipboardList, HandHeart, ShieldCheck, UsersRound } from "lucide-react";
import { Brand } from "./_components/shell";

const features = [
  { icon: ClipboardList, title: "Evaluasi terstruktur", text: "Isi data kriteria dan lihat hasil simulasi berdasarkan aturan yang dijelaskan." },
  { icon: HandHeart, title: "Jalur sanggahan", text: "Ajukan keterangan tambahan ketika hasil evaluasi perlu ditinjau kembali." },
  { icon: UsersRound, title: "Verifikasi lapangan", text: "Petugas memiliki area kerja terpisah untuk meninjau antrean pengajuan." }
];

export default function HomePage() {
  return <main className="min-h-screen bg-slate-50">
    <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6"><Brand /><a href="#cara-kerja" className="hidden text-sm font-medium text-slate-600 hover:text-perlab-700 sm:block">Cara kerja</a><span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">Versi prototipe</span></div></header>
    <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
      <div><div className="mb-5 inline-flex items-center gap-2 rounded-full border border-perlab-100 bg-white px-3 py-2 text-xs font-semibold text-perlab-800"><ShieldCheck size={15}/> Portal simulasi perlindungan sosial</div>
        <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">Bantuan yang tepat, proses yang <span className="text-perlab-700">lebih transparan.</span></h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">Perlab membantu menyimulasikan evaluasi kriteria bantuan sosial, pengajuan sanggahan, dan alur verifikasi petugas dalam satu portal yang mudah digunakan.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/user/login" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-perlab-700 px-5 font-semibold text-white shadow-sm transition hover:bg-perlab-800">Masuk sebagai masyarakat <ArrowRight size={18}/></Link><Link href="/agent/login" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 font-semibold text-slate-700 transition hover:bg-slate-100">Portal petugas <UsersRound size={18}/></Link></div>
        <p className="mt-4 max-w-xl text-xs leading-5 text-slate-500">Perlab saat ini merupakan prototipe independen. Belum terhubung ke data kependudukan, sistem bansos, atau penyaluran dana pemerintah.</p>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft sm:p-7">
        <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-slate-500">Ringkasan layanan</p><h2 className="mt-1 text-xl font-bold text-slate-900">Satu alur, tiga langkah</h2></div><span className="grid h-11 w-11 place-items-center rounded-2xl bg-perlab-50 text-perlab-700"><BadgeCheck size={22}/></span></div>
        <div className="mt-6 space-y-4">{[{n:"01",title:"Isi kriteria",text:"Pilih program dan lengkapi informasi dasar."},{n:"02",title:"Tinjau hasil",text:"Pahami hasil simulasi atau ajukan sanggahan."},{n:"03",title:"Verifikasi petugas",text:"Lihat bagaimana alur peninjauan lapangan dirancang."}].map(s=><div key={s.n} className="flex gap-4 rounded-2xl border border-slate-100 p-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">{s.n}</span><div><h3 className="font-semibold text-slate-900">{s.title}</h3><p className="mt-1 text-sm leading-5 text-slate-500">{s.text}</p></div></div>)}</div>
        <div className="mt-5 flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900"><ShieldCheck size={17} className="shrink-0"/><span>Hasil simulasi tidak menjamin atau menggantikan keputusan resmi kelayakan bansos.</span></div>
      </div>
    </section>
    <section id="cara-kerja" className="border-y border-slate-200 bg-white"><div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16"><p className="text-xs font-bold uppercase tracking-[0.16em] text-perlab-700">Dirancang untuk alur yang jelas</p><h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Layanan yang mudah dipahami sejak awal</h2><div className="mt-7 grid gap-4 md:grid-cols-3">{features.map(({icon:Icon,title,text})=><article key={title} className="rounded-2xl border border-slate-200 p-5"><span className="grid h-11 w-11 place-items-center rounded-xl bg-perlab-50 text-perlab-700"><Icon size={21}/></span><h3 className="mt-4 font-bold text-slate-900">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p></article>)}</div></div></section>
    <footer className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-slate-500 sm:px-6 sm:flex-row sm:justify-between"><span>© {new Date().getFullYear()} Perlab · Perlindungan Abadi</span><span>Prototipe independen, bukan situs resmi pemerintah.</span></footer>
  </main>;
}
