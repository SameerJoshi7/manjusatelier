import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.put(`/auth/reset-password/${token}`, { password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/'); // They are logged in now
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password. Link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-cream dark:bg-[#1c1712] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-brown-dark rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-serif text-brown-dark dark:text-beige mb-2">Reset Password</h1>
            <p className="text-brown/70 dark:text-beige/70">
              Please enter your new password below.
            </p>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-medium text-brown-dark dark:text-beige mb-2">Password Reset Successful</h3>
              <p className="text-brown/70 dark:text-beige/70">Redirecting you to the home page...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 rounded-xl text-sm bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-brown-dark dark:text-beige mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brown/50 w-5 h-5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-cream dark:bg-[#1c1712] border-none rounded-xl focus:ring-2 focus:ring-gold outline-none transition-shadow text-brown-dark dark:text-beige"
                      placeholder="Enter new password"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brown-dark dark:text-beige mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brown/50 w-5 h-5" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-cream dark:bg-[#1c1712] border-none rounded-xl focus:ring-2 focus:ring-gold outline-none transition-shadow text-brown-dark dark:text-beige"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !password || !confirmPassword}
                  className="w-full bg-gold hover:bg-gold-light text-brown-dark font-medium py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
