import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Home } from './pages/Home';
import { Profile } from './pages/Profile';
import { Browse } from './pages/Browse';
import { SwapRequests } from './pages/SwapRequests';
import { Admin } from './pages/Admin';
import { AuthProvider } from './contexts/AuthContext';
import { SwapProvider } from './contexts/SwapContext';
import { Footer } from './components/layout/Footer';
export function App() {
  return <Router>
      <AuthProvider>
        <SwapProvider>
          <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />
            <main className="flex-grow w-full">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/browse" element={<Browse />} />
                <Route path="/swap-requests" element={<SwapRequests />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </SwapProvider>
      </AuthProvider>
    </Router>;
}