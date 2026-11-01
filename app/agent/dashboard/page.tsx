import { AuthGuard } from "../../_components/auth-guard";
import { Shell, PageHeading } from "../../_components/shell";
import { AgentQueue } from "./agent-queue";

export default function AgentDashboardPage() {
  return <AuthGuard role="agent"><Shell role="agent"><PageHeading eyebrow="Area petugas" title="Antrean verifikasi" description="Tinjau pengajuan yang dikirim warga dan catat hasil pemeriksaan."/><AgentQueue /></Shell></AuthGuard>;
}
