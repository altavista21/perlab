import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Perlab | Perlindungan Abadi",
  description: "Portal simulasi pengajuan dan verifikasi bantuan sosial.",
  applicationName: "Perlab",
  themeColor: "#0f766e"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
