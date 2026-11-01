"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { ArrowUpRight, RefreshCw } from "lucide-react";

type Application = { id: string; applicantName?: string; programs?: string[]; status?: string; createdAt?: { toDate: () => Date } };

export function AgentQueue() {
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    if (!db) { setError("Firebase belum dikonfigurasi."); setLoading(false); return; }
    setLoading(true); setError("");
    try {
      const result = await getDocs(query(collection(db, "applications"), orderBy("createdAt", "desc")));
      setItems(result.docs.map((item) => ({ id: item.id, ...item.data() } as Application)));
    } catch {
      setError("Daftar pengajuan gagal dimuat. Pastikan Firestore Rules terbaru sudah dipublikasikan.");
    } finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  const pending = items.filter((item) => item.status === "pending").length;
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Total pengajuan</p><p className="mt-2 text-2xl font-bold text-slate-900">{items.length}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Menunggu verifikasi</p><p className="mt-2 text-2xl font-bold text-amber-700">{pending}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Sudah ditinjau</p><p className="mt-2 text-2xl font-bold text-emerald-700">{items.length - pending}</p></div>
      </div>
      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-5"><div><h2 className="font-bold text-slate-900">Daftar pengajuan</h2><p className="mt-1 text-sm text-slate-500">Data langsung dari Firestore.</p></div><button onClick={() => void load()} disabled={loading} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-300 px-3 text-sm font-semibold text-slate-700 disabled:opacity-50"><RefreshCw size={15}/> Muat ulang</button></div>
        {loading ? <p className="p-6 text-sm text-slate-500">Memuat pengajuan...</p> : error ? <p role="alert" className="m-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{error}</p> : items.length === 0 ? <p className="p-6 text-sm text-slate-500">Belum ada pengajuan masuk.</p> : (
          <div className="divide-y divide-slate-100">{items.map((item) => <div key={item.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-slate-900">{item.applicantName || "Warga Perlab"}</h3><span className={"rounded-full px-2.5 py-1 text-xs font-semibold " + (item.status === "pending" ? "bg-amber-50 text-amber-800" : item.status === "approved" ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800")}>{item.status === "pending" ? "Menunggu" : item.status === "approved" ? "Disetujui" : "Ditolak"}</span></div><p className="mt-1 text-xs text-slate-500">{item.programs?.join(" · ") || "Program tidak tersedia"} · {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleString("id-ID") : "Waktu tidak tersedia"}</p><p className="mt-1 text-xs text-slate-400">ID: {item.id}</p></div><Link href={"/agent/verify/" + item.id} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">Tinjau <ArrowUpRight size={16}/></Link></div>)}</div>
        )}
      </section>
    </>
  );
}
