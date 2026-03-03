import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Components
import AIHead from './components/AIHead';
import FunctionalSide from './components/FunctionalSide';
import ControlPanel from './components/ControlPanel';
import FeedbackCard from './components/FeedbackCard';

// Store
import { useAuthStore } from './store/authStore';

function App() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication on app load
    checkAuth().finally(() => setIsLoading(false));
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rendix-dark via-rendix-light to-rendix-dark">
        <div className="text-center">
          <div className="loading-dna mx-auto mb-4"></div>
          <p className="text-rendix-blue text-lg font-semibold animate-pulse">Initializing Rendix...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-rendix-dark via-rendix-light to-rendix-dark relative overflow-hidden">
        {/* Background particles */}
        <div className="particle-container">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="particle-dot"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Header */}
          <header className="text-center py-6">
            <h1 className="rendix-title text-5xl md:text-6xl font-bold mb-2">
              RENDIX
            </h1>
            <p className="text-gray-400 text-sm md:text-base">
              Advanced Vocal AI Assistant
            </p>
          </header>

          {/* Main Layout */}
          <main className="flex-1 container mx-auto px-4 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
              
              {/* Left Panel - Functional Side */}
              <div className="lg:col-span-3">
                <FunctionalSide />
              </div>

              {/* Center - AI Head and Feedback */}
              <div className="lg:col-span-6 flex flex-col items-center justify-center space-y-6">
                {/* AI Head */}
                <div className="w-full max-w-md">
                  <AIHead />
                </div>

                {/* Feedback Card */}
                <div className="w-full max-w-2xl">
                  <FeedbackCard />
                </div>
              </div>

              {/* Right Panel - Control Panel */}
              <div className="lg:col-span-3">
                <ControlPanel />
              </div>

            </div>
          </main>
        </div>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(26, 31, 58, 0.9)',
              color: '#fff',
              border: '1px solid rgba(0, 102, 255, 0.3)',
              backdropFilter: 'blur(10px)',
            },
            success: {
              iconTheme: {
                primary: '#00ff88',
                secondary: '#0a0e27',
              },
            },
            error: {
              iconTheme: {
                primary: '#ff0088',
                secondary: '#0a0e27',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
