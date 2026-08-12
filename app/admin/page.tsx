import AdminDashboard from "./AdminDashboard";
import AdminLogin from "./AdminLogin";
import { getAdminSession, hasAdminAccount } from "../admin-auth";
import { listRepairs, type RepairJob } from "../repairs";
import { getLineConnection } from "../line";
import { listPayments, type PaymentRecord } from "../payments";

export const dynamic = "force-dynamic";

type AdminPageProps = { searchParams: Promise<{ error?: string; setup?: string }> };

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const session = await getAdminSession();
  if (session) {
    let jobs: RepairJob[] = [];
    let payments: PaymentRecord[] = [];
    try { [jobs, payments] = await Promise.all([listRepairs(), listPayments()]); } catch (error) { console.error("Unable to load admin data", error); }
    const lineConnection = await getLineConnection();
    return <AdminDashboard admin={session} initialJobs={jobs} initialPayments={payments} lineConnection={lineConnection} />;
  }

  const params = await searchParams;
  const configured = await hasAdminAccount();
  return <AdminLogin error={params.error} setupComplete={params.setup === "complete"} configured={configured} />;
}
