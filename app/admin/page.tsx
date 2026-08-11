import AdminDashboard from "./AdminDashboard";
import { requireAdmin } from "../admin-auth";
import { chatGPTSignOutPath } from "../chatgpt-auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await requireAdmin();

  return (
    <AdminDashboard
      admin={{
        displayName: admin.fullName ?? "ผู้ดูแลระบบ",
        email: admin.email,
      }}
      signOutPath={chatGPTSignOutPath("/")}
    />
  );
}
