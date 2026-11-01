"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, onSnapshot, query, serverTimestamp, where } from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";
import { ArrowLeft, ClipboardCheck, Info } from "lucide-react";
import Link from "next/link";

const options = [
  { value: "BPNT", label: "BPNT" },
  { value: "PKH", label: "PKH" },
  { value: "KIP", label: "KIP" },
  { value: "SUBSIDI_LISTRIK", label: "Subsidi Listrik" },
  { value: "SUBSIDI_BBM", label: "Subsidi BBM" },
  { value: "SUBSIDI_GAS", label: "Subsidi Gas 3kg" },
  { value: "LANSIA", label: "Bansos Lansia" },
];

export function AssessmentForm() {
  const router = useRouter();
  const [programs, setPrograms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingApproval, setCheckingApproval] = useState(true);
  const [hasApprovedApplication, setHasApprovedApplication] = useState(false);

  useEffect(() => {
    const user = auth?.currentUser;
    if (!db || !user) {
      setCheckingApproval(false);
      return;
    }
    const ownApplications = query(
      collection(db, "applications"),
      where("ownerUid", "==", user.uid)
    );
    return onSnapshot(ownApplications, (snapshot) => {
      setHasApprovedApplication(snapshot.docs.some((item) => item.data().status === "approved"));
      setCheckingApproval(false);
    }, () => {
      setError("Status pengajuan belum dapat diperiksa. Muat ulang halaman sebelum mengirim pengajuan.");
      setCheckingApproval(false);
    });
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (checkingApproval || hasApprovedApplication) {
      setError(hasApprovedApplication ? "Akun ini sudah memiliki pengajuan yang disetujui. Pengajuan baru tidak dapat dibuat." : "Sedang memeriksa status pengajuan. Coba lagi sebentar.");
      return;
    }
    const user = auth?.currentUser;
    if (!db || !user) {
      setError("Sesi login tidak ditemukan. Silakan login kembali.");
      return;
    }
    if (!programs.length) {
      setError("Pilih minimal satu program bantuan.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const motorCount = Number(form.get("motorCount"));
    const carCount = Number(form.get("carCount"));
    if (!Number.isInteger(motorCount) || motorCount < 0 || motorCount > 99 ||
        !Number.isInteger(carCount) || carCount < 0 || carCount > 99) {
      setError("Jumlah kendaraan harus berupa angka 0 sampai 99.");
      return;
    }

    setLoading(true);
    try {
      const ref = await addDoc(collection(db, "applications"), {
        ownerUid: user.uid,
        applicantName: user.displayName?.trim() || "Warga Perlab",
        applicantEmail: user.email || "",
        programs,
        dayaListrik: String(form.get("dayaListrik") || ""),
        motorCount,
        carCount,
        hasSchoolMember: form.get("hasSchoolMember") === "on",
        hasElderlyMember: form.get("hasElderlyMember") === "on",
        status: "pending",
        createdAt: serverTimestamp(),
      });
      router.push("/user/dashboard?submitted=" + encodeURIComponent(ref.id));
    } catch {
      setError("Pengajuan belum berhasil disimpan. Periksa Firestore Rules yang sudah dipublikasikan, lalu coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  const field = "mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm";
  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
      <div className="mb-6 flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        <Info size={19} className="mt-0.5 shrink-0" />
        <p>Mode uji coba. Gunakan data contoh saja. Jangan masukkan NIK, nomor KK, alamat rinci, foto identitas, atau data pribadi warga sungguhan.</p>
      </div>
      {hasApprovedApplication && (
        <div role="status" className="mb-5 rounded-xl border border-slate-200 bg-slate-100 p-4 text-sm leading-6 text-slate-700">
          Pengajuan akun ini sudah disetujui. Pembuatan pengajuan baru dinonaktifkan.
          <Link href="/user/dashboard" className="ml-1 font-semibold text-perlab-800 underline">Lihat status pengajuan</Link>
        </div>
      )}
      <h2 className="font-bold text-slate-900">Kriteria ekonomi (data uji)</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">Daya listrik rumah
          <select name="dayaListrik" defaultValue="" required className={field}>
            <option value="" disabled>Pilih daya listrik</option>
            <option>450 VA</option><option>900 VA</option><option>1300 VA</option><option>2200 VA</option><option>&gt; 2200 VA</option>
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">Jumlah motor
          <input name="motorCount" type="number" min="0" max="99" defaultValue="0" required className={field} />
        </label>
        <label className="text-sm font-medium text-slate-700">Jumlah mobil
          <input name="carCount" type="number" min="0" max="99" defaultValue="0" required className={field} />
        </label>
      </div>
      <div className="mt-5 space-y-3">
        <label className="flex min-h-14 items-center gap-3 rounded-xl border border-slate-200 p-4 text-sm text-slate-700">
          <input name="hasSchoolMember" type="checkbox" className="h-5 w-5 accent-teal-700" /> Ada anggota keluarga yang masih bersekolah
        </label>
        <label className="flex min-h-14 items-center gap-3 rounded-xl border border-slate-200 p-4 text-sm text-slate-700">
          <input name="hasElderlyMember" type="checkbox" className="h-5 w-5 accent-teal-700" /> Ada anggota keluarga berusia 60 tahun atau lebih
        </label>
      </div>
      <fieldset className="mt-6">
        <legend className="text-sm font-bold text-slate-900">Program yang ingin diajukan</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {options.map((option) => (
            <label key={option.value} className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 px-3 text-sm text-slate-700">
              <input type="checkbox" checked={programs.includes(option.value)} onChange={(event) => setPrograms((current) => event.target.checked ? [...current, option.value] : current.filter((item) => item !== option.value))} className="h-4 w-4 accent-teal-700" />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
      {error && <p role="alert" className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Link href="/user/dashboard" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700"><ArrowLeft size={16}/> Kembali</Link>
        <button disabled={loading || checkingApproval || hasApprovedApplication} type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-perlab-700 px-5 font-semibold text-white transition hover:bg-perlab-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 disabled:shadow-none"><ClipboardCheck size={18}/>{loading ? "Mengirim..." : checkingApproval ? "Memeriksa status..." : hasApprovedApplication ? "Pengajuan sudah disetujui" : "Kirim pengajuan"}</button>
      </div>
    </form>
  );
}
