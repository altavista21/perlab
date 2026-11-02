"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CameraOff, CheckCircle2, LoaderCircle, RefreshCw, SwitchCamera } from "lucide-react";
import type { FaceLandmarker } from "@mediapipe/tasks-vision";

type Facing = "user" | "environment";
type Stage = "loading" | "ready" | "blink" | "turn" | "center" | "success" | "error";
type Direction = "left" | "right";

const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm";

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function eyeRatio(points: { x: number; y: number }[], ids: number[]) {
  const p = ids.map((id) => points[id]);
  if (p.some((point) => !point)) return 1;
  return (distance(p[1], p[5]) + distance(p[2], p[4])) / (2 * distance(p[0], p[3]));
}

export function LiveFaceCheck({ onVerified }: { onVerified: (verified: boolean) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const baselineRef = useRef<number | null>(null);
  const blinkClosedRef = useRef(false);
  const [facing, setFacing] = useState<Facing>("user");
  const [stage, setStage] = useState<Stage>("loading");
  const [direction, setDirection] = useState<Direction>("left");
  const [cameraError, setCameraError] = useState("");
  const [faceFound, setFaceFound] = useState(false);
  const [busy, setBusy] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    let frame = 0;

    async function initialize() {
      try {
        const vision = await import("@mediapipe/tasks-vision");
        const fileset = await vision.FilesetResolver.forVisionTasks(WASM_URL);
        const landmarker = await vision.FaceLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: "CPU" },
          runningMode: "VIDEO",
          numFaces: 1,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
        });
        if (cancelled) {
          landmarker.close();
          return;
        }
        landmarkerRef.current = landmarker;
        setStage("ready");
      } catch {
        if (!cancelled) {
          setStage("error");
          setCameraError("Model deteksi wajah gagal dimuat. Periksa koneksi internet lalu muat ulang halaman.");
        }
      }
    }

    initialize();
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      stopCamera();
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, [stopCamera]);

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      stopCamera();
      setCameraError("");
      setFaceFound(false);
      onVerified(false);
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("Browser ini tidak mendukung akses kamera. Gunakan browser modern melalui HTTPS.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: facing }, width: { ideal: 640 }, height: { ideal: 480 } },
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
      } catch {
        if (!cancelled) setCameraError("Kamera tidak dapat dibuka. Izinkan akses kamera di pengaturan browser.");
      }
    }

    startCamera();
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [facing, onVerified, stopCamera]);

  useEffect(() => {
    if (!["blink", "turn", "center"].includes(stage)) return;
    let active = true;
    let frame = 0;
    let lastFaceState = false;

    const tick = () => {
      if (!active) return;
      const video = videoRef.current;
      const landmarker = landmarkerRef.current;
      if (video && landmarker && video.readyState >= 2 && video.videoWidth > 0) {
        try {
          const result = landmarker.detectForVideo(video, performance.now());
          const points = result.faceLandmarks?.[0];
          const found = Boolean(points && points.length > 263);
          if (found !== lastFaceState) {
            lastFaceState = found;
            setFaceFound(found);
          }

          if (points) {
            const noseX = points[1].x;
            if (baselineRef.current === null) baselineRef.current = noseX;

            if (stage === "blink") {
              const leftEye = eyeRatio(points, [33, 160, 158, 133, 153, 144]);
              const rightEye = eyeRatio(points, [362, 385, 387, 263, 373, 380]);
              const average = (leftEye + rightEye) / 2;
              if (average < 0.19) blinkClosedRef.current = true;
              if (blinkClosedRef.current && average > 0.23) {
                setStage("turn");
              }
            } else if (stage === "turn") {
              const delta = noseX - (baselineRef.current ?? noseX);
              const moved = direction === "left" ? delta > 0.045 : delta < -0.045;
              if (moved) setStage("center");
            } else if (stage === "center") {
              const delta = Math.abs(noseX - (baselineRef.current ?? noseX));
              if (delta < 0.025) {
                setStage("success");
                onVerified(true);
              }
            }
          }
        } catch {
          // A transient frame can be unavailable while the camera starts.
        }
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      active = false;
      cancelAnimationFrame(frame);
    };
  }, [stage, direction, onVerified]);

  function beginChallenge() {
    baselineRef.current = null;
    blinkClosedRef.current = false;
    setDirection(Math.random() < 0.5 ? "left" : "right");
    setFaceFound(false);
    setBusy(true);
    onVerified(false);
    setStage("blink");
  }

  function retry() {
    baselineRef.current = null;
    blinkClosedRef.current = false;
    setBusy(false);
    onVerified(false);
    setStage(landmarkerRef.current ? "ready" : "loading");
  }

  const instruction =
    stage === "loading" ? "Memuat model deteksi wajah…" :
    stage === "ready" ? "Posisikan wajah di dalam bingkai, lalu mulai pemeriksaan." :
    stage === "blink" ? "Kedipkan mata satu kali." :
    stage === "turn" ? `Perlahan tolehkan kepala ke ${direction === "left" ? "kiri layar" : "kanan layar"}.` :
    stage === "center" ? "Kembalikan wajah menghadap lurus ke kamera." :
    stage === "success" ? "Tantangan gerakan selesai." :
    cameraError || "Pemeriksaan tidak dapat dimulai.";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">Pemeriksaan wajah hidup</span>
        <button type="button" onClick={() => setFacing((value) => value === "user" ? "environment" : "user")} className="inline-flex min-h-9 items-center gap-2 rounded-lg px-2 text-xs font-semibold text-perlab-700 hover:bg-perlab-50">
          <SwitchCamera size={16} /> Ganti kamera
        </button>
      </div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-950">
        <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className={`h-[72%] w-[54%] rounded-[50%] border-[3px] ${stage === "success" ? "border-emerald-400" : "border-white/90"} shadow-[0_0_0_999px_rgba(15,23,42,0.35)]`} />
        </div>
        {cameraError && <div className="absolute inset-0 grid place-items-center bg-slate-900/85 p-5 text-center text-sm text-white"><div><CameraOff className="mx-auto mb-2" size={26} />{cameraError}</div></div>}
        {stage === "success" && <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"><CheckCircle2 size={15} /> Tantangan selesai</div>}
      </div>
      <p aria-live="polite" className="mt-3 min-h-10 rounded-xl bg-slate-50 p-3 text-sm font-medium leading-5 text-slate-700">
        {stage === "loading" && <LoaderCircle className="mr-2 inline animate-spin" size={16} />}
        {instruction}
      </p>
      {stage !== "success" ? (
        <button type="button" onClick={beginChallenge} disabled={stage === "loading" || Boolean(cameraError) || busy && ["blink", "turn", "center"].includes(stage)} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-perlab-700 px-3 text-sm font-semibold text-white hover:bg-perlab-800 disabled:cursor-not-allowed disabled:opacity-50">
          <Camera size={17} /> {busy ? "Ikuti instruksi di atas…" : "Mulai pemeriksaan liveness"}
        </button>
      ) : (
        <button type="button" onClick={retry} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          <RefreshCw size={16} /> Ulangi pemeriksaan
        </button>
      )}
      <p className="mt-2 text-xs leading-5 text-slate-500">
        Sistem mendeteksi landmark wajah dan memeriksa urutan kedipan, gerakan kepala, serta posisi kembali ke tengah. Ini pemeriksaan liveness aktif dasar, bukan sertifikasi anti-spoofing tingkat tinggi; video replay canggih masih dapat mengelabui pemeriksaan berbasis browser.
      </p>
      {faceFound && <p className="mt-1 text-xs text-emerald-700">Wajah terdeteksi oleh model.</p>}
    </div>
  );
}
