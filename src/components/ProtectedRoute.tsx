import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'developer' | 'company';
}

export function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('ProtectedRoute useEffect:', { loading, user: !!user, profile, location: location.pathname, requireRole });
    
    if (loading) return;

    if (!user) {
      console.log('No user, redirecting to login');
      navigate('/login', { state: { from: location } });
      return;
    }

    if (requireRole && profile?.role !== requireRole) {
      console.log('Role mismatch, redirecting based on role:', profile?.role);
      // Redirect based on user's actual role
      if (profile?.role === 'developer') {
        navigate('/welcome/developer');
      } else if (profile?.role === 'company') {
        navigate('/welcome/company');
      } else {
        navigate('/login');
      }
      return;
    }

    // If user is logged in but on login/register/landing page, redirect to appropriate welcome page
    if (user && (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/')) {
      console.log('User logged in on login/register/landing page, redirecting to welcome page');
      if (profile?.role === 'developer') {
        console.log('Redirecting to developer welcome');
        navigate('/welcome/developer');
      } else if (profile?.role === 'company') {
        console.log('Redirecting to company welcome');
        navigate('/welcome/company');
      }
    }
  }, [user, profile, loading, navigate, location, requireRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requireRole && profile?.role !== requireRole) {
    return null;
  }

  return <>{children}</>;
}