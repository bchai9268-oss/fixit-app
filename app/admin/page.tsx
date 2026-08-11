import AdminDashboard from "./AdminDashboard";
import AdminLogin from "./AdminLogin";
import { getAdminSession, hasAdminAccount } from "../admin-auth";

export const dynamic = "force-dynamic";

type AdminPageProps = { searchParams: Promise<{ error?: string; setup?: string }> };

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const session = await getAdminSession();
  if (session) return <AdminDashboard admin={session} />;

  const params = await searchParams;
  const configured = await hasAdminAccount();
  return <AdminLogin error={params.error} setupComplete={params.setup === "complete"} configured={configured} />;
}
