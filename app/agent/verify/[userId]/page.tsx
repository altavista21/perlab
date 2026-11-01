import { AuthGuard } from "../../../_components/auth-guard";
import { Shell, PageHeading } from "../../../_components/shell";
import { VerificationDetail } from "./verification-detail";

export default function VerifyPage({ params }: { params: { userId: string } }) {
  return <AuthGuard role="agent"><Shell role="agent"><PageHeading eyebrow="Detail pengajuan" title="Tinjau pengajuan" description="Periksa data uji dan catat keputusan petugas."/><VerificationDetail applicationId={params.userId} /></Shell></AuthGuard>;
}
