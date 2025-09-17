
import React, { useState } from 'react';
import UserIcon from './icons/UserIcon.tsx';
import LockIcon from './icons/LockIcon.tsx';
import EyeIcon from './icons/EyeIcon.tsx';
import EyeOffIcon from './icons/EyeOffIcon.tsx';
import { useTranslation } from '../lib/i18n.tsx';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    // Simulate API call
    setTimeout(() => {
      if (email === 'demo@example.com' && password === 'password') {
        onLoginSuccess();
      } else {
        setError(t('loginPage.invalidCredentials'));
      }
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-2xl shadow-slate-300/50 p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 tracking-wider">{t('loginPage.welcome')}</h1>
            <p className="text-slate-500 mt-2">{t('loginPage.signInToContinue')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('loginPage.emailLabel')}
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-300"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('loginPage.passwordLabel')}
                required
                className="w-full pl-10 pr-10 py-3 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>

            <div>
              <label htmlFor="remember-me" className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 rounded bg-slate-200 border-slate-300 text-cyan-600 focus:ring-cyan-500"/>
                <span className="ml-2 text-sm text-slate-600">{t('loginPage.rememberMe')}</span>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-cyan-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t('loginPage.signingIn') : t('loginPage.signIn')}
              </button>
            </div>
            
            {error && (
              <div className="p-3 rounded-lg text-center text-sm font-medium bg-red-100 text-red-700">
                {error}
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              {t('loginPage.forgotPasswordAdmin')}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;