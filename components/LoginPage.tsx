import React, { useState } from 'react';
import { YoutubeIcon, AlertTriangleIcon, LinkIcon } from './icons';

import { supabase } from '../services/supabase';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onBackToHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onBackToHome }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!supabase) {
      setError("Supabase is not connected. Please check your .env file.");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
        onLoginSuccess();
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;
        setMessage('Account created! You can now log in.');
        setTimeout(() => setIsLogin(true), 2000);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-dark-bg px-4 overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-[20%] left-[20%] w-[300px] h-[300px] bg-primary/10 rounded-full filter blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[20%] w-[300px] h-[300px] bg-purple-500/10 rounded-full filter blur-[100px] pointer-events-none"></div>

      {/* Back button */}
      <button 
        onClick={onBackToHome}
        className="absolute top-8 left-8 px-4 py-2 text-xs font-semibold rounded-xl glassmorphism-light hover:bg-white/10 hover:border-white/20 transition-all duration-200 flex items-center gap-1.5"
      >
        <span>← Back to Home</span>
      </button>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-purple-600 shadow-lg shadow-primary/20 text-white mb-4">
            <LinkIcon className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-heading font-extrabold tracking-tight text-white">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="mt-2 text-sm text-text-sec">
            {isLogin ? 'Sign in to access your TubeLink Audit dashboard' : 'Get started with TubeLink Audit for free'}
          </p>
        </div>

        <div className="bg-dark-surface border border-white/10 p-8 shadow-2xl rounded-2xl space-y-6">
          {/* Tabs */}
          <div className="flex border-b border-white/5 mb-2">
            <button 
              onClick={() => { setIsLogin(true); setError(null); setMessage(null); }}
              className={`flex-1 pb-3 text-sm font-semibold text-center transition-all ${isLogin ? 'text-primary border-b-2 border-primary' : 'text-text-sec hover:text-white'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(null); setMessage(null); }}
              className={`flex-1 pb-3 text-sm font-semibold text-center transition-all ${!isLogin ? 'text-primary border-b-2 border-primary' : 'text-text-sec hover:text-white'}`}
            >
              Create Account
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleAuth}>
            <div>
              <label className="block text-xs font-bold text-text-sec uppercase tracking-wider mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-white/10 placeholder-text-sec/40 text-white bg-dark-bg focus:outline-none focus:border-primary/50 sm:text-sm transition-all"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-sec uppercase tracking-wider mb-2" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-white/10 placeholder-text-sec/40 text-white bg-dark-bg focus:outline-none focus:border-primary/50 sm:text-sm transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-hover disabled:bg-primary/50 shadow-lg shadow-primary/10 transition-all duration-200"
              >
                {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Get Started Free'}
              </button>
            </div>
          </form>

          {error && (
            <div className="flex items-center p-3 text-xs text-error-accent bg-error-accent/5 border border-error-accent/15 rounded-xl">
              <AlertTriangleIcon className="h-4.5 w-4.5 mr-2 flex-shrink-0"/>
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="p-3 text-xs text-green-400 bg-green-500/5 border border-green-500/15 rounded-xl">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
