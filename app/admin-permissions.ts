export function isAdminEmail(email: string, allowlist: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  return allowlist
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
    .includes(normalizedEmail);
}
