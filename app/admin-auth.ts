import { env } from "cloudflare:workers";
import { redirect } from "next/navigation";
import { requireChatGPTUser, type ChatGPTUser } from "./chatgpt-auth";
import { isAdminEmail } from "./admin-permissions";

export async function requireAdmin(): Promise<ChatGPTUser> {
  const user = await requireChatGPTUser("/admin");
  const allowlist = typeof env.ADMIN_EMAILS === "string" ? env.ADMIN_EMAILS : "";

  if (!isAdminEmail(user.email, allowlist)) {
    redirect("/unauthorized");
  }

  return user;
}
