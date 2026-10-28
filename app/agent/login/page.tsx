import Link from "next/link";
import { ArrowLeft, Camera, ShieldCheck } from "lucide-react";
import { Brand } from "../../_components/shell";

export default function AgentLoginPage() {
  return <main className="min-h-screen bg-slate-50 px-4 py-8 sm:grid sm:place-items-center"><div className="mx-auto w-full max-w-md">
    <div className="mb-7"><Brand/></div><section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"><ArrowLeft size={16}/> Kembali ke beranda</Link>
      <span className="mt-6 grid h-12 w-12 place-items-center rounded-2xl bg-perlab-50 text-perlab-700"><ShieldCheck size={24}/></span>
      <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">Portal petugas</h1><p className="mt-2 text-sm leading-6 text-slate-500">Masukkan NIP dummy untuk melihat rancangan area kerja agen.</p>
      <form action="/agent/dashboard" className="mt-6 space-y-5"><label className="block text-sm font-semibold text-slate-700">Nomor Induk Pegawai (NIP)<input name="nip" inputMode="numeric" pattern="[0-9]{18}" maxLength={18} minLength={18} placeholder="18 digit NIP dummy" required className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-perlab-600 focus:ring-4 focus:ring-perlab-100"/></label>
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-600"><Camera size={20}/></span><div><p className="text-sm font-semibold text-slate-800">Verifikasi kamera</p><p className="mt-1 text-xs leading-5 text-slate-500">Liveness scan akan dibuat pada tahap berikutnya.</p></div></div><button type="button" disabled className="mt-4 min-h-11 w-full cursor-not-allowed rounded-xl bg-slate-200 px-4 text-sm font-semibold text-slate-500">Kamera belum tersedia</button></div>
      <button className="min-h-12 w-full rounded-xl bg-perlab-700 px-4 font-semibold text-white hover:bg-perlab-800" type="submit">Lanjut ke dashboard demo</button></form>
      <p className="mt-4 text-xs leading-5 text-slate-500">Halaman ini belum membuktikan identitas petugas dan tidak boleh digunakan untuk persetujuan nyata.</p>
    </section></div></main>;
}
