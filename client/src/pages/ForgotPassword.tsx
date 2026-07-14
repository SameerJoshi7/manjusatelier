import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await api.post('/auth/forgot-password', { email });
      setMessage({
        type: 'success',
        text: 'Email sent! Please check your inbox for password reset instructions.',
      });
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.error || 'Something went wrong. Please try again.',
      });
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
            <h1 className="text-3xl font-serif text-brown-dark dark:text-beige mb-2">Forgot Password</h1>
            <p className="text-brown/70 dark:text-beige/70">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {message && (
            <div
              className={`mb-6 p-4 rounded-xl text-sm ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brown-dark dark:text-beige mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brown/50 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-cream dark:bg-[#1c1712] border-none rounded-xl focus:ring-2 focus:ring-gold outline-none transition-shadow text-brown-dark dark:text-beige"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-gold hover:bg-gold-light text-brown-dark font-medium py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-brown hover:text-gold dark:text-beige/70 dark:hover:text-gold transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
