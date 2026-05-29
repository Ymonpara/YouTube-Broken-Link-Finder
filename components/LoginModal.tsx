import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { SpinnerIcon, LinkIcon, AlertTriangleIcon } from './icons';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setStep('email');
      setEmail('');
      setOtp('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!supabase) throw new Error("Supabase is not connected.");

      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
        }
      });

      if (error) throw error;
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      setError('Please enter the 6-digit code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!supabase) throw new Error("Supabase is not connected.");

      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp,
        type: 'email'
      });

      if (error) throw error;

      if (data?.session) {
        onLoginSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-dark-bg/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-md bg-dark-surface border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-float" style={{ animation: 'float 3s ease-in-out infinite' }}>
        {/* Glow Effects */}
        <div className="absolute top-0 left-[20%] w-[200px] h-[200px] bg-primary/20 rounded-full filter blur-[80px] pointer-events-none"></div>

        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-2 text-text-sec hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full z-50 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8 relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-purple-600 shadow-lg shadow-primary/20 mb-4">
              <LinkIcon className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-heading font-extrabold text-white">
              {step === 'email' ? 'Sign in to start scanning' : 'Check your email'}
            </h2>
            <p className="text-sm text-text-sec">
              {step === 'email'
                ? 'Enter your email and we will send you a secure login code.'
                : `We sent an 8-digit code to ${email}`
              }
            </p>
          </div>

          {step === 'email' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 bg-dark-bg border border-white/10 rounded-xl text-white placeholder-text-sec focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20 disabled:bg-primary/50 transition-all duration-200 flex items-center justify-center"
              >
                {loading ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : 'Send Login Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.trim())}
                  placeholder="8-digit code"
                  className="w-full px-4 py-3 bg-dark-bg border border-white/10 rounded-xl text-white text-center tracking-[0.5em] font-mono placeholder-text-sec focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-lg"
                  maxLength={8}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20 disabled:bg-primary/50 disabled:opacity-50 transition-all duration-200 flex items-center justify-center"
              >
                {loading ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : 'Verify Code'}
              </button>

              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-xs text-text-sec hover:text-white transition-colors py-2"
              >
                Use a different email
              </button>
            </form>
          )}

          {error && (
            <div className="flex items-center p-3 text-xs text-error-accent bg-error-accent/5 border border-error-accent/15 rounded-xl">
              <AlertTriangleIcon className="h-4.5 w-4.5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
