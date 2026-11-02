"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
  ArrowLeft,
  Camera,
  CameraOff,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  SwitchCamera,
} from "lucide-react";
import { Brand } from "../../_components/shell";
import { auth, db } from "../../../lib/firebase";

type CameraFacing = "user" | "environment";

export default function AgentLoginPage() {
  const [nip, setNip] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [facing, setFacing] = useState<CameraFacing>("user");
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [faceHash, setFaceHash] = useState("");
  const [scanBusy, setScanBusy] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraReady(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      setCameraError("");
      setCameraReady(false);
      setFaceHash("");
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("Browser tidak mendukung akses kamera. Buka Perlab melalui browser modern dengan koneksi HTTPS.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        if (!cancelled) setCameraReady(true);
      } catch {
        if (!cancelled) {
          setCameraError("Kamera tidak dapat dibuka. Izinkan akses kamera di browser, lalu tekan Coba lagi.");
        }
      }
    }

    startCamera();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [facing]);

  async function captureFace() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !cameraReady || video.videoWidth === 0) {
      setError("Kamera belum siap. Tunggu hingga gambar tampil, lalu coba lagi.");
      return;
    }

    setScanBusy(true);
    setError("");
    try {
      const width = 640;
      const height = Math.round((video.videoHeight / video.videoWidth) * width);
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas tidak tersedia");
      context.drawImage(video, 0, 0, width, height);
      const image = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Gagal mengambil gambar")), "image/jpeg", 0.82);
      });
      const digest = await crypto.subtle.digest("SHA-256", await image.arrayBuffer());
      const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
      setFaceHash(hash);
    } catch {
      setError("Gagal memproses hasil kamera. Pastikan browser mendukung pemrosesan gambar, lalu ulangi.");
      setFaceHash("");
    } finally {
      setScanBusy(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!/^\\d{18}$/.test(nip)) {
      setError("NIP harus terdiri dari tepat 18 digit angka.");
      return;
    }
    if (!faceHash) {
      setError("Lakukan pemindaian kamera terlebih dahulu sebelum masuk.");
      return;
    }
    if (!auth || !db) {
      setError("Konfigurasi Firebase belum lengkap. Isi variabel NEXT_PUBLIC_FIREBASE_* di Vercel atau .env.local.");
      return;
    }

    setBusy(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const profile = await getDoc(doc(db, "users", credential.user.uid));
      const data = profile.exists() ? profile.data() : null;

      if (!data || data.role !== "agent") {
        await signOut(auth);
        setError("Akun ini tidak memiliki peran petugas. Hanya akun yang ditetapkan admin sebagai agent yang dapat masuk.");
        return;
      }
      if (String(data.nip ?? "") !== nip) {
        await signOut(auth);
        setError("NIP tidak cocok atau belum didaftarkan pada profil petugas. Minta admin mengisi field nip pada users/{UID} di Firestore.");
        return;
      }

      window.location.assign("/agent/dashboard");
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
          <p className="mt-2 text-sm leading-6 text-slate-500">Masukkan NIP dan lakukan pemindaian kamera. Akun petugas tetap diverifikasi melalui Firebase.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-sm font-semibold text-slate-700">
              NIP (18 digit)
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={nip}
                onChange={(event) => setNip(event.target.value.replace(/\\D/g, "").slice(0, 18))}
                required
                minLength={18}
                maxLength={18}
                pattern="[0-9]{18}"
                placeholder="Masukkan 18 digit NIP"
                className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-perlab-600 focus:ring-4 focus:ring-perlab-100"
              />
            </label>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">Pemindaian wajah</label>
                <button
                  type="button"
                  onClick={() => setFacing((current) => current === "user" ? "environment" : "user")}
                  className="inline-flex min-h-9 items-center gap-2 rounded-lg px-2 text-xs font-semibold text-perlab-700 hover:bg-perlab-50"
                >
                  <SwitchCamera size={16} /> Ganti kamera
                </button>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-950">
                <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
                <div className="pointer-events-none absolute inset-0 grid place-items-center">
                  <div className="h-[72%] w-[54%] rounded-[50%] border-[3px] border-white/90 shadow-[0_0_0_999px_rgba(15,23,42,0.35)]" />
                </div>
                {!cameraReady && (
                  <div className="absolute inset-0 grid place-items-center bg-slate-900/80 px-5 text-center text-sm text-white">
                    <div><CameraOff className="mx-auto mb-2" size={26} />{cameraError || "Mengaktifkan kamera…"}</div>
                  </div>
                )}
                {faceHash && (
                  <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white">
                    <CheckCircle2 size={15} /> Gambar berhasil diproses
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button type="button" onClick={captureFace} disabled={!cameraReady || scanBusy} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-perlab-700 px-3 text-sm font-semibold text-white hover:bg-perlab-800 disabled:opacity-50">
                  <Camera size={17} /> {scanBusy ? "Memproses…" : "Ambil & verifikasi"}
                </button>
                <button type="button" onClick={() => { setFaceHash(""); setCameraError(""); setFacing((current) => current); }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  <RefreshCw size={16} /> Ulangi scan
                </button>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">Kamera depan aktif secara default. Bingkai oval membantu posisi wajah. Fitur ini saat ini simulasi pemindaian: browser mengambil gambar dan membuat hash SHA-256, bukan mendeteksi wajah hidup atau mencegah spoofing.</p>
              {cameraError && <button type="button" onClick={() => setFacing((current) => current === "user" ? "environment" : "user")} className="mt-2 text-xs font-semibold text-perlab-700 underline">Coba kamera lagi</button>}
            </div>

            <div className="border-t border-slate-100 pt-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Autentikasi akun petugas</p>
              <label className="block text-sm font-semibold text-slate-700">
                Email petugas
                <input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={254} placeholder="petugas@email.com" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-perlab-600 focus:ring-4 focus:ring-perlab-100" />
              </label>
              <label className="mt-4 block text-sm font-semibold text-slate-700">
                Kata sandi
                <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} maxLength={128} placeholder="Masukkan kata sandi" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-perlab-600 focus:ring-4 focus:ring-perlab-100" />
              </label>
            </div>

            {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm leading-5 text-rose-800">{error}</p>}
            <button disabled={busy || scanBusy} className="min-h-12 w-full rounded-xl bg-perlab-700 px-4 font-semibold text-white hover:bg-perlab-800 disabled:cursor-wait disabled:opacity-60" type="submit">
              {busy ? "Memeriksa akun…" : "Verifikasi & masuk"}
            </button>
          </form>
          <p className="mt-4 text-xs leading-5 text-slate-500">Admin perlu mengisi field <code>nip</code> pada dokumen <code>users/{'{UID}'}</code> di Firestore dan memastikan role bernilai <code>agent</code>. NIP harus cocok dengan data tersebut.</p>
        </section>
      </div>
    </main>
  );
}
