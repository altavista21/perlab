"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  FileText,
  LockKeyhole,
  RefreshCw,
  XCircle,
} from "lucide-react";

type Application = {
  id: string;
  applicantName?: string;
  applicantEmail?: string;
  programs?: string[];
  status: "pending" | "approved" | "rejected" | string;
  reviewNote?: string;
  createdAt?: Timestamp;
  reviewedAt?: Timestamp;
};

const programLabels: Record<string, string> = {
  BPNT: "BPNT",
  PKH: "PKH",
  KIP: "KIP",
  SUBSIDI_LISTRIK: "Subsidi Listrik",
  SUBSIDI_BBM: "Subsidi BBM",
  SUBSIDI_GAS: "Subsidi Gas 3kg",
  LANSIA: "Bansos Lansia",
};

function formatDate(value?: Timestamp) {
  if (!value?.toDate) return "Waktu belum tersedia";
  return value.toDate().toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function UserDashboard() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = auth?.currentUser;
    if (!db || !user) {
      setError("Sesi akun tidak ditemukan. Silakan login kembali.");
      setLoading(false);
      return;
    }

    setEmail(user.email || "-");
    let active = true;

    void getDoc(doc(db, "users", user.uid))
      .then((profile) => {
        if (!active) return;
        const profileName = profile.exists() ? profile.data().name : "";
        setName(
          typeof profileName === "string" && profileName.trim()
            ? profileName.trim()
            : user.displayName?.trim() || "Warga Perlab"
        );
      })
      .catch(() => {
        if (active) setName(user.displayName?.trim() || "Warga Perlab");
      });

    const ownApplications = query(
      collection(db, "applications"),
      where("ownerUid", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      ownApplications,
      (snapshot) => {
        if (!active) return;
        const items = snapshot.docs.map((item) => ({
          id: item.id,
          ...(item.data() as Omit<Application, "id">),
        }));
        items.sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() ?? 0;
          const bTime = b.createdAt?.toMillis?.() ?? 0;
          return bTime - aTime;
        });
        setApplications(items);
        setError("");
        setLoading(false);
      },
      () => {
        if (!active) return;
        setError(
          "Riwayat pengajuan belum dapat dimuat. Pastikan Firestore Rules terbaru sudah dipublikasikan."
        );
        setLoading(false);
      }
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const approvedCount = applications.filter((item) => item.status === "approved").length;
  const pendingCount = applications.filter((item) => item.status === "pending").length;

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-perlab-50 text-lg font-bold text-perlab-800">
            {(name || "W").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Akun masyarakat</p>
            <h2 className="truncate text-lg font-bold text-slate-900">{name || "Memuat nama..."}</h2>
            <p className="break-all text-sm text-slate-600">{email || "Memuat email..."}</p>
          </div>
        </div>
      </section>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <span className="text-sm text-slate-500">Total pengajuan</span>
          <p className="mt-2 text-2xl font-bold text-slate-900">{applications.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <span className="text-sm text-slate-500">Menunggu verifikasi</span>
          <div className="mt-2 flex items-center gap-2 text-amber-700">
            <Clock3 size={20} /><span className="text-2xl font-bold">{pendingCount}</span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <span className="text-sm text-slate-500">Disetujui</span>
          <div className="mt-2 flex items-center gap-2 text-emerald-700">
            <CheckCircle2 size={20} /><span className="text-2xl font-bold">{approvedCount}</span>
          </div>
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Riwayat pengajuan saya</h2>
            <p className="mt-1 text-sm text-slate-500">Status diperbarui otomatis saat petugas memberikan keputusan.</p>
          </div>
          {approvedCount > 0 ? (
            <button type="button" disabled aria-disabled="true" className="inline-flex min-h-11 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-200 px-4 text-sm font-semibold text-slate-500">
              Pengajuan disetujui <CheckCircle2 size={17} />
            </button>
          ) : (
            <Link href="/user/assessment" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-perlab-700 px-4 text-sm font-semibold text-white hover:bg-perlab-800">
              Buat pengajuan <ArrowUpRight size={17} />
            </Link>
          )}
        </div>

        {loading && <p className="mt-5 text-sm text-slate-500">Memuat riwayat pengajuan...</p>}
        {error && <p role="alert" className="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{error}</p>}
        {!loading && !error && applications.length === 0 && (
          <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-6 text-center">
            <FileText className="mx-auto text-slate-400" size={26} />
            <p className="mt-3 font-semibold text-slate-800">Belum ada pengajuan</p>
            <p className="mt-1 text-sm text-slate-500">Pengajuan yang Anda kirim akan muncul di bagian ini.</p>
          </div>
        )}

        <div className="mt-5 space-y-3">
          {applications.map((item) => {
            const approved = item.status === "approved";
            const rejected = item.status === "rejected";
            const statusLabel = approved ? "Disetujui" : rejected ? "Ditolak" : "Menunggu verifikasi";
            return (
              <article key={item.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-500">Tanggal pengajuan: {formatDate(item.createdAt)}</p>
                    <h3 className="mt-1 font-bold text-slate-900">
                      {item.programs?.map((program) => programLabels[program] || program).join(", ") || "Program bantuan"}
                    </h3>
                  </div>
                  <span className={approved
                    ? "rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800"
                    : rejected
                      ? "rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-800"
                      : "rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800"
                  }>
                    {statusLabel}
                  </span>
                </div>
                {(approved || rejected) && item.reviewNote && (
                  <div className="mt-3 rounded-lg bg-slate-50 p-3">
                    <p className="text-xs font-semibold text-slate-600">Catatan petugas</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.reviewNote}</p>
                    {item.reviewedAt && <p className="mt-2 text-xs text-slate-500">Diputuskan: {formatDate(item.reviewedAt)}</p>}
                  </div>
                )}
                <p className="mt-3 break-all text-xs text-slate-400">ID pengajuan: {item.id}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <Link href="/user/sanggah" className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-perlab-300">
          <FileText size={20} className="text-slate-700" />
          <h3 className="mt-3 font-bold text-slate-900">Sanggahan</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">Buka formulir untuk memberikan alasan dan informasi tambahan.</p>
        </Link>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <LockKeyhole size={20} className="text-slate-500" />
          <h3 className="mt-3 font-bold text-slate-900">Informasi pencairan</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">Persetujuan dalam Perlab adalah status peninjauan aplikasi, bukan konfirmasi pencairan bantuan.</p>
        </div>
      </section>
    </>
  );
}
