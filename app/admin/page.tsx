import AdminDashboard from "./AdminDashboard";
import AdminLogin from "./AdminLogin";
import { getAdminLoginEmail, getAdminSession, hasAdminAccount } from "../admin-auth";
import { listRepairs, type RepairJob } from "../repairs";
import { getLineConnection } from "../line";

export const dynamic = "force-dynamic";

type AdminPageProps = { searchParams: Promise<{ error?: string; setup?: string }> };

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const session = await getAdminSession();
  if (session) {
    let jobs: RepairJob[] = [];
    try { jobs = await listRepairs(); } catch (error) { console.error("Unable to load repair jobs", error); }
    const lineConnection = await getLineConnection();
    return <AdminDashboard admin={session} initialJobs={jobs} lineConnection={lineConnection} />;
  }

  const params = await searchParams;
  const configured = await hasAdminAccount();
  const adminEmail = configured ? await getAdminLoginEmail() : "";
  return <AdminLogin error={params.error} setupComplete={params.setup === "complete"} configured={configured} adminEmail={adminEmail} />;
}
