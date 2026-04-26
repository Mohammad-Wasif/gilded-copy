/**
 * Admin authentication helpers.
 *
 * The admin email is sourced exclusively from the VITE_ADMIN_EMAIL
 * environment variable. No hardcoded fallbacks are used.
 *
 * The admin password is NEVER stored on the frontend — authentication
 * is handled entirely by the Better Auth backend.
 */

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

if (!ADMIN_EMAIL) {
  console.warn(
    "[admin-auth] VITE_ADMIN_EMAIL is not set. Admin features will be unavailable."
  );
}

export function isAdminEmail(email?: string | null): boolean {
  if (!ADMIN_EMAIL) return false;
  return (
    (email ?? "").trim().toLowerCase() === ADMIN_EMAIL.trim().toLowerCase()
  );
}

export function isAdminUser(user?: any | null): boolean {
  if (!user) return false;
  // Strict RBAC: only trust the role field set in the database.
  return user.role === 'admin';
}
