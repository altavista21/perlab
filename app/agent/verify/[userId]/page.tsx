import { AuthGuard } from "../../../_components/auth-guard";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, FileText, MapPin, ShieldAlert } from "lucide-react";
import { Shell, PageHeading } from "../../../_components/shell";

export default function VerifyPage({ params }: { params: { userId: string } }) {
  const { userId } = params;
  return <AuthGuard role="agent"><Shell role="agent"><PageHeading eyebrow="Detail kunjungan" title="Tinjau pengajuan" description="Informasi contoh untuk membantu merancang alur verifikasi lapangan."/>
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"><div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">ID pengajuan</p><h2 className="mt-1 text-xl font-bold text-slate-900">{userId}</h2><p className="mt-1 text-sm text-slate-500">Pendaftar contoh · bukan data warga nyata</p></div><span className="w-fit rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">Menunggu peninjauan</span></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2"><div className="rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Program dipilih</p><p className="mt-1 font-semibold text-slate-900">BPNT · PKH (contoh)</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Hasil mesin aturan</p><p className="mt-1 font-semibold text-slate-900">Belum dievaluasi</p></div></div>
      <div className="mt-5 rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-2 font-semibold text-slate-900"><MapPin size={18}/> Catatan kunjungan</div><p className="mt-2 text-sm leading-6 text-slate-500">Bagian catatan lapangan akan tersedia setelah autentikasi agen dan penyimpanan data diterapkan.</p></div>
      <div className="mt-4 rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-2 font-semibold text-slate-900"><FileText size={18}/> Data sanggahan</div><p className="mt-2 text-sm leading-6 text-slate-500">Belum ada data sanggahan yang tersimpan pada prototipe.</p></div>
      <div className="mt-5 flex items-start gap-3 rounded-xl bg-rose-50 p-4 text-sm leading-6 text-rose-900"><ShieldAlert size={19} className="mt-0.5 shrink-0"/><p>Aksi persetujuan belum aktif. Keputusan kelayakan tidak boleh dilakukan sebelum identitas petugas, kewenangan, dan catatan audit diverifikasi di server.</p></div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row"><Link href="/agent/dashboard" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700"><ArrowLeft size={16}/> Kembali ke antrean</Link><button type="button" disabled className="inline-flex min-h-12 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-200 px-5 font-semibold text-slate-500"><CheckCircle2 size={18}/> Persetujuan belum aktif</button></div>
    </div>
  </Shell></AuthGuard>;
}
