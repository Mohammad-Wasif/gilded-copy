import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { authClient } from '../lib/auth-client';
import { isAdminUser } from '../lib/admin-auth';

const PageFallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export function AdminProtectedRoute() {
  const location = useLocation();
  const { data: session, isPending } = authClient.useSession();

  if (typeof window === 'undefined' || isPending) {
    return <PageFallback />;
  }

  if (!session?.user || !isAdminUser(session.user)) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
