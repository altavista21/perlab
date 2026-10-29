import { AuthGuard } from "../../_components/auth-guard";
import Link from "next/link";
import { ArrowLeft, FileText, Info } from "lucide-react";
import { Shell, PageHeading } from "../../_components/shell";

export default function SanggahPage() {
  return <AuthGuard role="citizen"><Shell><PageHeading eyebrow="Pengajuan sanggahan" title="Sampaikan informasi tambahan" description="Rancangan formulir untuk menjelaskan kondisi yang perlu ditinjau kembali."/>
    <form action="/user/dashboard" className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"><div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900"><Info size={19} className="mt-0.5 shrink-0"/><p>Ini masih formulir demo. Jangan masukkan nominal atau informasi harta yang sebenarnya sebelum penyimpanan aman tersedia.</p></div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-700">Perkiraan harta bergerak (Rp)<input name="hartaBergerak" type="number" min="0" placeholder="Contoh: 0" required className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3 font-normal"/></label><label className="text-sm font-semibold text-slate-700">Perkiraan harta tidak bergerak (Rp)<input name="hartaTidakBergerak" type="number" min="0" placeholder="Contoh: 0" required className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3 font-normal"/></label></div>
      <label className="mt-5 block text-sm font-semibold text-slate-700">Alasan sanggahan<textarea name="alasan" minLength={10} maxLength={2000} required rows={5} placeholder="Jelaskan informasi yang menurut Anda perlu ditinjau..." className="mt-2 w-full rounded-xl border border-slate-300 p-3 font-normal outline-none focus:border-perlab-600 focus:ring-4 focus:ring-perlab-100"/></label>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between"><Link href="/user/dashboard" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700"><ArrowLeft size={16}/> Kembali</Link><button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-perlab-700 px-5 font-semibold text-white hover:bg-perlab-800"><FileText size={18}/> Simpan demo</button></div>
      <p className="mt-4 text-xs text-slate-500">Status tidak akan berubah dan data tidak disimpan pada tahap UI ini.</p>
    </form>
  </Shell></AuthGuard>;
}
