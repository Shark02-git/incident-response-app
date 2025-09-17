
import React, { useState } from 'react';
import LoginPage from './components/LoginPage.tsx';
import DashboardPage from './components/DashboardPage.tsx';
import { LocalizationProvider } from './lib/i18n.tsx';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <LocalizationProvider>
      <div className="min-h-screen w-full bg-slate-50">
        {isLoggedIn ? (
          <DashboardPage onLogout={handleLogout} />
        ) : (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        )}
      </div>
    </LocalizationProvider>
  );
};

export default App;