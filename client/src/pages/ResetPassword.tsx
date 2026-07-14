import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // State for user details
  const [verifying, setVerifying] = useState(true);
  const [userDetails, setUserDetails] = useState<{ name: string; email: string } | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Verify the token on mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await api.get<{ success: boolean; email: string; name: string }>(`/auth/reset-password/${token}`);
        setUserDetails({ name: res.name, email: res.email });
      } catch (err: any) {
        setTokenError(err.response?.data?.error || 'Invalid or expired reset link.');
      } finally {
        setVerifying(false);
      }
    };
    verifyToken();
  }, [token]);

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
        navigate('/'); // Redirect to home (user is logged in automatically)
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password. Link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-[#1c1712]">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-[#1c1712] px-4">
        <div className="w-full max-w-md bg-white dark:bg-brown-dark rounded-2xl shadow-xl overflow-hidden p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500 mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif text-brown-dark dark:text-beige mb-2">Invalid Link</h2>
          <p className="text-brown/70 dark:text-beige/70 mb-6">{tokenError}</p>
          <Link to="/" className="btn bg-brown text-cream px-6 py-2 hover:bg-brown-dark">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-[#1c1712] px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-brown-dark rounded-2xl shadow-xl overflow-hidden border border-brown/10 dark:border-beige/10"
      >
        <div className="p-8">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-serif text-brown-dark dark:text-beige mb-2">Reset Password</h1>
            
            {/* Displaying the user context here */}
            {userDetails && (
              <div className="mt-4 p-3 bg-cream dark:bg-[#2c2621] rounded-xl inline-block px-6">
                <p className="text-sm text-brown/70 dark:text-beige/70 mb-1">Resetting password for:</p>
                <p className="font-medium text-brown-dark dark:text-beige">{userDetails.name}</p>
                <p className="text-xs text-brown/50 dark:text-beige/50">{userDetails.email}</p>
              </div>
            )}
          </div>

          {success ? (
            <div className="text-center py-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-forest mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-2xl font-serif text-brown-dark dark:text-beige mb-2">Password Reset Successful!</h2>
              <p className="text-brown/70 dark:text-beige/70">
                The password for <strong>{userDetails?.email}</strong> has been updated. Logging you in...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-500 dark:bg-red-500/10">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-brown-dark dark:text-beige">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border-none bg-cream px-4 py-3 text-brown-dark outline-none focus:ring-2 focus:ring-gold dark:bg-[#2c2621] dark:text-beige"
                  placeholder="Enter new password"
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-brown-dark dark:text-beige">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border-none bg-cream px-4 py-3 text-brown-dark outline-none focus:ring-2 focus:ring-gold dark:bg-[#2c2621] dark:text-beige"
                  placeholder="Confirm new password"
                  required
                  minLength={8}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center rounded-xl bg-gold px-6 py-3 font-medium text-brown-dark transition-colors hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
