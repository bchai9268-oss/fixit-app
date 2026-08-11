import AdminDashboard from "./AdminDashboard";
import AdminLogin from "./AdminLogin";
import { getAdminSession, hasAdminAccount } from "../admin-auth";
import { listRepairs, type RepairJob } from "../repairs";

export const dynamic = "force-dynamic";

type AdminPageProps = { searchParams: Promise<{ error?: string; setup?: string }> };

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const session = await getAdminSession();
  if (session) {
    let jobs: RepairJob[] = [];
    try { jobs = await listRepairs(); } catch (error) { console.error("Unable to load repair jobs", error); }
    return <AdminDashboard admin={session} initialJobs={jobs} />;
  }

  const params = await searchParams;
  const configured = await hasAdminAccount();
  return <AdminLogin error={params.error} setupComplete={params.setup === "complete"} configured={configured} />;
}
