
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { YoutubeIcon, AlertTriangleIcon } from './icons';

const LoginPage: React.FC = () => {
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

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // The onAuthStateChange listener in App.tsx will handle the redirect automatically.
      } else {
        const { error } = await supabase.auth.signUp({ 
            email, 
            password
        });
        if (error) throw error;
        setMessage('Check your email for the confirmation link!');
      }
    } catch (error: any) {
      setError(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md space-y-8">
        <div>
          <div className="flex items-center justify-center text-red-500">
             <YoutubeIcon className="h-12 w-12" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Link Guardian for YouTube
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Find and fix broken links in your video descriptions
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-8 shadow-2xl rounded-2xl">
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button 
                    onClick={() => { setIsLogin(true); setError(null); setMessage(null); }}
                    className={`flex-1 py-2 text-sm font-medium text-center ${isLogin ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    Sign In
                </button>
                <button 
                    onClick={() => { setIsLogin(false); setError(null); setMessage(null); }}
                    className={`flex-1 py-2 text-sm font-medium text-center ${!isLogin ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    Create Account
                </button>
            </div>

          <form className="space-y-6" onSubmit={handleAuth}>
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Password"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-hover disabled:bg-indigo-300"
              >
                {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </div>
          </form>
          {error && (
            <div className="mt-4 flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-md">
                <AlertTriangleIcon className="h-5 w-5 mr-2"/>
                {error}
            </div>
          )}
          {message && (
             <div className="mt-4 p-3 text-sm text-green-700 bg-green-100 rounded-md">
                {message}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
