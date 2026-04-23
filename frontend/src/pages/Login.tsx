import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { Logo } from '../components/Logo';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/auth';
import { apiError } from '../services/api';

interface LoginForm {
  email: string;
  password: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  async function onSubmit(data: LoginForm) {
    setLoading(true);
    setError('');
    try {
      const res = await authService.login(data);
      setAuth(res.user, res.token);
      navigate('/app');
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-nan-primary-light to-white">
      <header className="p-6">
        <Link to="/">
          <Logo />
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="card shadow-lg">
            <h1 className="heading-lg mb-2">Bem-vindo de volta</h1>
            <p className="text-nan-gray mb-6">Entre com sua conta NanDesk</p>

            {error && (
              <div className="p-3 mb-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  placeholder="voce@email.com"
                  {...register('email', { required: 'Email é obrigatório' })}
                />
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="label">Senha</label>
                <input
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  {...register('password', { required: 'Senha é obrigatória' })}
                />
                {errors.password && (
                  <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
                )}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Entrar'}
              </button>
            </form>

            <p className="text-sm text-center mt-6 text-nan-gray">
              Não tem conta?{' '}
              <Link to="/cadastro" className="text-nan-primary font-semibold">
                Criar conta
              </Link>
            </p>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-nan-gray mb-2">🎓 Contas de demonstração:</p>
              <div className="text-xs font-mono space-y-1 text-nan-gray">
                <div>joao@demo.com / demo123</div>
                <div>maria@demo.com / demo123</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
