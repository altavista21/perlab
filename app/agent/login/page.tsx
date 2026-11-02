"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Brand } from "../../_components/shell";
import { LiveFaceCheck } from "./live-face-check";
import { auth, db } from "../../../lib/firebase";

const AGENT_LIVENESS_KEY = "perlab_agent_liveness_passed";

export default function AgentLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agentAuthenticated, setAgentAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    sessionStorage.removeItem(AGENT_LIVENESS_KEY);
  }, []);

  const handleLiveness = useCallback((verified: boolean) => {
    if (!verified) {
      sessionStorage.removeItem(AGENT_LIVENESS_KEY);
      return;
    }
    sessionStorage.setItem(AGENT_LIVENESS_KEY, "true");
    window.location.assign("/agent/dashboard");
  }, []);

  async function handleCredentials(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!auth || !db) {
      setError("Konfigurasi Firebase belum lengkap. Lengkapi variabel NEXT_PUBLIC_FIREBASE_* di Vercel.");
      return;
    }

    setBusy(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const profile = await getDoc(doc(db, "users", credential.user.uid));
      const data = profile.exists() ? profile.data() : null;

      if (!data || data.role !== "agent") {
        await signOut(auth);
        setError("Akun ini tidak memiliki peran petugas. Hanya akun dengan role agent yang dapat masuk.");
        return;
      }

      sessionStorage.removeItem(AGENT_LIVENESS_KEY);
      setAgentAuthenticated(true);
    } catch (cause) {
      const code = cause && typeof cause === "object" && "code" in cause ? String(cause.code) : "";
      if (code === "auth/invalid-credential" || code === "auth/user-not-found" || code === "auth/wrong-password") {
        setError("Email atau kata sandi tidak cocok.");
      } else if (code === "auth/operation-not-allowed") {
        setError("Metode Email/Password belum aktif di Firebase Authentication.");
      } else if (code === "auth/too-many-requests") {
        setError("Terlalu banyak percobaan. Coba lagi beberapa saat.");
      } else {
        setError("Login gagal. Periksa konfigurasi Firebase dan Firestore Security Rules.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function cancelLiveness() {
    if (auth) await signOut(auth);
    sessionStorage.removeItem(AGENT_LIVENESS_KEY);
    setAgentAuthenticated(false);
    setPassword("");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:grid sm:place-items-center">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-7"><Brand /></div>
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft sm:p-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900">
            <ArrowLeft size={16} /> Kembali ke beranda
          </Link>
          <span className="mt-6 grid h-12 w-12 place-items-center rounded-2xl bg-perlab-50 text-perlab-700">
            <ShieldCheck size={24} />
          </span>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">Portal petugas</h1>
          {!agentAuthenticated ? (
            <>
              <p className="mt-2 text-sm leading-6 text-slate-500">Masukkan email dan kata sandi akun petugas untuk melanjutkan ke pemeriksaan wajah.</p>
              <form onSubmit={handleCredentials} className="mt-6 space-y-4">
                <label className="block text-sm font-semibold text-slate-700">
                  Email petugas
                  <input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={254} placeholder="petugas@email.com" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-perlab-600 focus:ring-4 focus:ring-perlab-100" />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Kata sandi
                  <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} maxLength={128} placeholder="Masukkan kata sandi" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-perlab-600 focus:ring-4 focus:ring-perlab-100" />
                </label>
                {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm leading-5 text-rose-800">{error}</p>}
                <button disabled={busy} className="min-h-12 w-full rounded-xl bg-perlab-700 px-4 font-semibold text-white hover:bg-perlab-800 disabled:cursor-wait disabled:opacity-60" type="submit">
                  {busy ? "Memeriksa akun…" : "Lanjutkan ke scan wajah"}
                </button>
              </form>
            </>
          ) : (
            <div className="mt-5 space-y-4">
              <div className="rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-800">Akun petugas terverifikasi. Selesaikan pemeriksaan wajah untuk membuka dashboard.</div>
              <LiveFaceCheck onVerified={handleLiveness} />
              <button type="button" onClick={cancelLiveness} className="min-h-11 w-full rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">Batalkan dan keluar</button>
            </div>
          )}
          <p className="mt-4 text-xs leading-5 text-slate-500">Akses dashboard memerlukan akun Firebase dengan role <code>agent</code> dan penyelesaian pemeriksaan liveness pada sesi ini.</p>
        </section>
      </div>
    </main>
  );
}
