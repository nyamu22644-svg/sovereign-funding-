import React from 'react';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  onRedirectToLogin: () => void;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, onRedirectToLogin }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-darkbg">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-gold/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-silver text-sm uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login
    React.useEffect(() => {
      onRedirectToLogin();
    }, []);
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-darkbg">
        <div className="text-center">
          <p className="text-silver">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
