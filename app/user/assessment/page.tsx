import { AuthGuard } from "../../_components/auth-guard";
import { Shell, PageHeading } from "../../_components/shell";
import { AssessmentForm } from "./assessment-form";

export default function AssessmentPage() {
  return <AuthGuard role="citizen"><Shell><PageHeading eyebrow="Pengajuan warga" title="Data kondisi keluarga" description="Isi kriteria data uji untuk membuat pengajuan yang dapat ditinjau petugas."/><AssessmentForm /></Shell></AuthGuard>;
}
