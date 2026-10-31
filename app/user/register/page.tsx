"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { createUserWithEmailAndPassword, deleteUser, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { ArrowLeft, UserRoundPlus } from "lucide-react";
import { Brand } from "../../_components/shell";
import { auth, db } from "../../../lib/firebase";

export default function UserRegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!auth || !db) {
      setError("Konfigurasi Firebase belum lengkap. Periksa variabel NEXT_PUBLIC_FIREBASE_* di Vercel.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi kata sandi belum sama.");
      return;
    }

    if (password.length < 8) {
      setError("Kata sandi minimal 8 karakter.");
      return;
    }

    setBusy(true);
    let createdUser: import("firebase/auth").User | null = null;

    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      createdUser = credential.user;
      await updateProfile(credential.user, { displayName: name.trim() });
      await setDoc(doc(db, "users", credential.user.uid), {
        name: name.trim(),
        email: credential.user.email,
        role: "citizen",
        createdAt: serverTimestamp(),
      });
      window.location.assign("/user/dashboard");
    } catch (cause) {
      if (createdUser) {
        try {
          await deleteUser(createdUser);
        } catch {
          // If rollback is blocked, the account remains without a citizen profile
          // and cannot access the protected citizen dashboard.
        }
      }

      const code = cause && typeof cause === "object" && "code" in cause ? String(cause.code) : "";
      if (code === "auth/email-already-in-use") {
        setError("Email ini sudah terdaftar. Silakan masuk menggunakan akun tersebut.");
      } else if (code === "auth/invalid-email") {
        setError("Format email tidak valid.");
      } else if (code === "auth/weak-password") {
        setError("Kata sandi terlalu lemah. Gunakan minimal 8 karakter.");
      } else if (code === "auth/operation-not-allowed") {
        setError("Pendaftaran email dan kata sandi belum diaktifkan di Firebase Authentication.");
      } else if (code === "permission-denied") {
        setError("Profil gagal disimpan. Admin perlu menerbitkan Firestore Rules terbaru dari repository Perlab.");
      } else {
        setError("Pendaftaran gagal. Periksa koneksi dan konfigurasi Firebase, lalu coba lagi.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:grid sm:place-items-center">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-7"><Brand /></div>
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900">
            <ArrowLeft size={16} /> Kembali ke beranda
          </Link>
          <span className="mt-6 grid h-12 w-12 place-items-center rounded-2xl bg-perlab-50 text-perlab-700">
            <UserRoundPlus size={24} />
          </span>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">Daftar akun masyarakat</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Buat akun untuk mengakses portal masyarakat Perlab. Pendaftaran ini belum memverifikasi NIK atau kelayakan bantuan sosial.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-sm font-semibold text-slate-700">
              Nama lengkap
              <input
                type="text"
                autoComplete="name"
                value={name}
                onChange={event => setName(event.target.value)}
                required
                minLength={2}
                maxLength={80}
                placeholder="Masukkan nama lengkap"
                className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-perlab-600 focus:ring-4 focus:ring-perlab-100"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Email aktif
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                required
                maxLength={254}
                placeholder="nama@email.com"
                className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-perlab-600 focus:ring-4 focus:ring-perlab-100"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Kata sandi
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                required
                minLength={8}
                maxLength={128}
                placeholder="Minimal 8 karakter"
                className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-perlab-600 focus:ring-4 focus:ring-perlab-100"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Ulangi kata sandi
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={event => setConfirmPassword(event.target.value)}
                required
                minLength={8}
                maxLength={128}
                placeholder="Ulangi kata sandi"
                className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-perlab-600 focus:ring-4 focus:ring-perlab-100"
              />
            </label>

            {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm leading-5 text-rose-800">{error}</p>}

            <button
              disabled={busy}
              type="submit"
              className="min-h-12 w-full rounded-xl bg-perlab-700 px-4 font-semibold text-white transition hover:bg-perlab-800 disabled:cursor-wait disabled:opacity-60"
            >
              {busy ? "Membuat akun…" : "Daftar sebagai masyarakat"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-600">
            Sudah punya akun?{" "}
            <Link href="/user/login" className="font-semibold text-perlab-700 hover:underline">Masuk di sini</Link>
          </p>
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">
            Akun yang dibuat melalui halaman ini hanya mendapat peran masyarakat. Pendaftaran petugas tidak tersedia untuk umum dan harus ditetapkan oleh admin.
          </p>
        </section>
      </div>
    </main>
  );
}
