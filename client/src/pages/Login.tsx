import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function Login() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState<'login' | 'register'>(
    params.get('mode') === 'register' ? 'register' : 'login'
  );
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const redirect = params.get('redirect') || '/account';

  usePageMeta({ title: `${mode === 'login' ? 'Login' : 'Register'} — Manju's Atelier` });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      notify(mode === 'login' ? 'Welcome back!' : 'Account created!');
      navigate(redirect);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-x grid min-h-[80vh] place-items-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-surface w-full max-w-md p-8"
      >
        <div className="text-center">
          <img
            src="/logo-256.png"
            alt="Manju's Atelier"
            width={64}
            height={64}
            className="mx-auto h-16 w-16 rounded-full object-cover ring-1 ring-gold/40"
          />
          <h1 className="mt-4 font-serif text-3xl text-brown-dark dark:text-beige">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="mt-1 text-sm text-brown/60 dark:text-beige/60">
            {mode === 'login'
              ? 'Log in to continue your handmade journey.'
              : 'Join us and start collecting handmade treasures.'}
          </p>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === 'register' && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brown-dark dark:text-beige">
                Name
              </span>
              <input
                required
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
          )}
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-brown-dark dark:text-beige">
              Email
            </span>
            <input
              required
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-brown-dark dark:text-beige">
              Password
            </span>
            <input
              required
              type="password"
              minLength={8}
              className="input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          <Button type="submit" size="lg" fullWidth disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Create Account'}
          </Button>
        </form>

        {mode === 'login' && (
          <p className="mt-4 rounded-lg bg-beige/40 p-3 text-center text-xs text-brown/70 dark:bg-beige/10">
            Demo: <strong>demo@manjusatelier.com</strong> / <strong>Demo@12345</strong>
          </p>
        )}

        <p className="mt-6 text-center text-sm text-brown/60 dark:text-beige/60">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="font-medium text-brown underline"
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
        <Link
          to="/"
          className="mt-3 block text-center text-xs text-brown/40 hover:text-brown"
        >
          ← Back to home
        </Link>
      </motion.div>
    </div>
  );
}
