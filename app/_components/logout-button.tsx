"use client";

import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { auth } from "../../lib/firebase";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    if (auth) await signOut(auth);
    router.replace("/");
  }

  return <button type="button" onClick={handleLogout} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><LogOut size={16} />Keluar</button>;
}
