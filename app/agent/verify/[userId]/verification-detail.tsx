"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db } from "../../../../lib/firebase";
import { ArrowLeft, CheckCircle2, RefreshCw, XCircle } from "lucide-react";

type RecordData = { applicantName?: string; programs?: string[]; dayaListrik?: string; motorCount?: number; carCount?: number; hasSchoolMember?: boolean; hasElderlyMember?: boolean; status: string; reviewNote?: string; reviewedAt?: { toDate: () => Date } };

export function VerificationDetail({ applicationId }: { applicationId: string }) {
  const [record, setRecord] = useState<RecordData | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    if (!db) { setError("Firebase belum dikonfigurasi."); setLoading(false); return; }
    setLoading(true); setError("");
    try {
      const snapshot = await getDoc(doc(db, "applications", applicationId));
      if (!snapshot.exists()) { setRecord(null); setError("Pengajuan tidak ditemukan."); return; }
      const data = snapshot.data() as RecordData;
      setRecord(data); setNote(data.reviewNote || "");
    } catch { setError("Detail tidak dapat dibaca. Periksa Firestore Rules."); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, [applicationId]);

  async function decide(status: "approved" | "rejected") {
    const user = auth?.currentUser;
    if (!db || !user || !record) return;
    if (record.status !== "pending") { setError("Pengajuan ini sudah pernah diputuskan."); return; }
    const cleanNote = note.trim();
    if (cleanNote.length < 10 || cleanNote.length > 1000) { setError("Catatan wajib diisi 10 sampai 1.000 karakter."); return; }
    setSaving(true); setError(""); setMessage("");
    try {
      await updateDoc(doc(db, "applications", applicationId), { status, reviewNote: cleanNote, reviewedBy: user.uid, reviewedAt: serverTimestamp() });
      setMessage(status === "approved" ? "Pengajuan ditandai disetujui." : "Pengajuan ditandai ditolak.");
      await load();
    } catch { setError("Keputusan gagal disimpan. Pastikan Firestore Rules terbaru sudah dipublikasikan dan akun Anda ber-role agent."); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Memuat detail pengajuan...</div>;
  if (error && !record) return <div className="rounded-2xl border border-slate-200 bg-white p-6"><p role="alert" className="text-sm text-rose-700">{error}</p><Link href="/agent/dashboard" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-perlab-700"><ArrowLeft size={16}/> Kembali</Link></div>;
  if (!record) return null;

  return <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-5"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">ID pengajuan</p><h2 className="mt-1 break-all text-lg font-bold text-slate-900">{applicationId}</h2><p className="mt-1 text-sm text-slate-500">{record.applicantName || "Warga Perlab"}</p></div><span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">{record.status === "pending" ? "Menunggu verifikasi" : record.status === "approved" ? "Disetujui" : "Ditolak"}</span></div>
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Program dipilih</p><p className="mt-1 font-semibold text-slate-900">{record.programs?.join(" · ") || "-"}</p></div>
      <div className="rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Daya listrik</p><p className="mt-1 font-semibold text-slate-900">{record.dayaListrik || "-"}</p></div>
      <div className="rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Jumlah kendaraan</p><p className="mt-1 font-semibold text-slate-900">Motor: {record.motorCount ?? 0} · Mobil: {record.carCount ?? 0}</p></div>
      <div className="rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Kondisi keluarga</p><p className="mt-1 text-sm text-slate-900">{record.hasSchoolMember ? "Ada anggota sekolah" : "Tidak ada data anggota sekolah"} · {record.hasElderlyMember ? "Ada lansia" : "Tidak ada data lansia"}</p></div>
    </div>
    {record.status === "pending" ? <div className="mt-6"><label htmlFor="review-note" className="text-sm font-semibold text-slate-900">Catatan hasil peninjauan <span className="font-normal text-slate-500">(wajib, 10-1.000 karakter)</span></label><textarea id="review-note" value={note} onChange={event => setNote(event.target.value)} maxLength={1000} rows={4} className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-sm" placeholder="Tuliskan hasil pemeriksaan data uji..." /><div className="mt-1 text-right text-xs text-slate-400">{note.length}/1000</div><div className="mt-4 flex flex-col gap-3 sm:flex-row"><button onClick={() => void decide("approved")} disabled={saving} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 font-semibold text-white disabled:opacity-50"><CheckCircle2 size={18}/>{saving ? "Menyimpan..." : "Setujui pengajuan"}</button><button onClick={() => void decide("rejected")} disabled={saving} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-rose-700 px-5 font-semibold text-white disabled:opacity-50"><XCircle size={18}/>Tolak pengajuan</button></div></div> : <div className="mt-6 rounded-xl bg-slate-50 p-4"><p className="font-semibold text-slate-900">Catatan petugas</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{record.reviewNote || "Tidak ada catatan."}</p>{record.reviewedAt?.toDate && <p className="mt-2 text-xs text-slate-500">Diputuskan: {record.reviewedAt.toDate().toLocaleString("id-ID")}</p>}</div>}
    {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
    {message && <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
    <div className="mt-6 flex flex-wrap gap-3"><Link href="/agent/dashboard" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700"><ArrowLeft size={16}/> Kembali ke antrean</Link><button onClick={() => void load()} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700"><RefreshCw size={15}/> Muat ulang</button></div>
  </div>;
}
