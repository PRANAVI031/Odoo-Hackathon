import React, { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar/navbar';
import LandingPage from './components/Landingpage/landingpage';
import AuthModal from './components/AuthModal/auth'; 

function App(): React.ReactElement {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleCloseAuth = () => {
    setIsAuthModalOpen(false);
  };

  const handleSwitchMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login');
  };

  return (
    <>
      <Navbar onOpenAuth={handleOpenAuth} />
      <LandingPage />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleCloseAuth}
        mode={authMode}
        onSwitchMode={handleSwitchMode}
      />
    </>
  );
}

export default App;