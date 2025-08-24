import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  
  useEffect(() => {
    if (loading) return; // Wait for auth to load
    
    if (user && profile?.role) {
      // Redirect authenticated users to their welcome page
      if (profile.role === 'developer') {
        navigate('/welcome/developer');
      } else if (profile.role === 'company') {
        navigate('/welcome/company');
      }
    } else {
      // Redirect unauthenticated users to landing page
      navigate('/landing');
    }
  }, [user, profile, loading, navigate]);

  return null;
};

export default Index;
