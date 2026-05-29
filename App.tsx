import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import DashboardPage from './components/DashboardPage';
import LoginModal from './components/LoginModal';
import { supabase } from './services/supabase';

const App: React.FC = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Supabase auth state
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setIsInitializing(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

      return () => subscription.unsubscribe();
    } else {
      setIsInitializing(false);
    }
  }, []);

  const handleStartScan = () => {
    if (session) {
      navigate('/dashboard');
    } else {
      setShowLoginModal(true);
    }
  };

  if (isInitializing) return null;

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      <Routes>
        <Route 
          path="/" 
          element={
            <LandingPage 
              session={session}
              onStartFreeScan={handleStartScan}
              onNavigateLogin={() => setShowLoginModal(true)}
              onNavigateDashboard={() => navigate('/dashboard')}
            />
          } 
        />
        <Route 
          path="/dashboard/*" 
          element={
            session ? (
              <DashboardPage 
                session={session} 
                onBackToHome={() => navigate('/')} 
              />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
      </Routes>

      {/* New OTP Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={() => {
          setShowLoginModal(false);
          navigate('/dashboard');
        }}
      />
    </div>
  );
};

export default App;
