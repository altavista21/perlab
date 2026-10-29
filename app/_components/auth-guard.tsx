"use client";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";

type Role = "citizen" | "agent";

export function AuthGuard({ role, children }: { role: Role; children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [problem, setProblem] = useState("");

  useEffect(() => {
    if (!auth || !db) {
      setProblem("Konfigurasi Firebase belum lengkap. Lengkapi variabel NEXT_PUBLIC_FIREBASE_* terlebih dahulu.");
      setReady(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace(role === "agent" ? "/agent/login" : "/user/login");
        return;
      }

      try {
        const profile = await getDoc(doc(db, "users", user.uid));
        if (!profile.exists() || profile.data().role !== role) {
          await signOut(auth);
          setProblem("Akun ini belum memiliki peran yang sesuai. Admin harus menyiapkan dokumen users/{UID} di Firestore terlebih dahulu.");
          setReady(true);
          return;
        }
        setProblem("");
        setReady(true);
      } catch {
        setProblem("Profil tidak dapat diverifikasi. Periksa Firestore Security Rules dan pastikan dokumen profil tersedia.");
        setReady(true);
      }
    });

    return unsubscribe;
  }, [role, router]);

  if (problem) {
    return <main className="grid min-h-screen place-items-center bg-slate-50 p-5"><section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6"><h1 className="text-lg font-bold text-slate-900">Akses belum tersedia</h1><p className="mt-2 text-sm leading-6 text-slate-600">{problem}</p><Link href={role === "agent" ? "/agent/login" : "/user/login"} className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-perlab-700 px-4 text-sm font-semibold text-white">Kembali ke login</Link></section></main>;
  }

  if (!ready) {
    return <main className="grid min-h-screen place-items-center bg-slate-50"><p className="text-sm text-slate-600">Memeriksa sesi dan peran akun…</p></main>;
  }

  return <>{children}</>;
}
