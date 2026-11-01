import { AuthGuard } from "../../_components/auth-guard";
import { Shell, PageHeading } from "../../_components/shell";
import { UserDashboard } from "./user-dashboard";

export default function UserDashboardPage() {
  return (
    <AuthGuard role="citizen">
      <Shell>
        <PageHeading
          eyebrow="Area masyarakat"
          title="Dashboard pengajuan"
          description="Pantau identitas akun dan perkembangan setiap pengajuan bantuan Anda."
        />
        <UserDashboard />
      </Shell>
    </AuthGuard>
  );
}
