import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Loader2, Check } from 'lucide-react';
import { Logo } from '../components/Logo';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/auth';
import { apiError } from '../services/api';

interface RegisterForm {
  name: string;
  cpf: string;
  email: string;
  phone: string;
  password: string;
  passwordConfirm: string;
  acceptTerms: boolean;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = watch('password');

  async function onSubmit(data: RegisterForm) {
    setLoading(true);
    setError('');
    try {
      const res = await authService.register({
        name: data.name,
        cpf: data.cpf.replace(/\D/g, ''),
        email: data.email,
        phone: data.phone.replace(/\D/g, ''),
        password: data.password,
      });
      setAuth(res.user, res.token);
      navigate('/app/conectar');
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-nan-primary-light to-white">
      <header className="p-6">
        <Link to="/">
          <Logo />
        </Link>
      </header>

      <div className="flex justify-center px-4 py-4 pb-12">
        <div className="w-full max-w-md">
          <div className="card shadow-lg">
            <h1 className="heading-lg mb-2">Criar sua conta</h1>
            <p className="text-nan-gray mb-6">
              Rápido e sem envio de documentos. Você escolhe o que compartilhar.
            </p>

            {error && (
              <div className="p-3 mb-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <label className="label">Nome completo</label>
                <input
                  className="input"
                  placeholder="João da Silva"
                  {...register('name', { required: 'Nome obrigatório', minLength: 3 })}
                />
                {errors.name && (
                  <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">CPF</label>
                  <input
                    className="input font-mono"
                    placeholder="000.000.000-00"
                    {...register('cpf', {
                      required: 'CPF obrigatório',
                      minLength: { value: 11, message: 'CPF inválido' },
                    })}
                  />
                  {errors.cpf && (
                    <p className="text-xs text-red-600 mt-1">{errors.cpf.message}</p>
                  )}
                </div>

                <div>
                  <label className="label">Celular</label>
                  <input
                    className="input font-mono"
                    placeholder="91988887777"
                    {...register('phone', { required: 'Celular obrigatório', minLength: 10 })}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  placeholder="voce@email.com"
                  {...register('email', { required: 'Email obrigatório' })}
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
                  placeholder="Mínimo 6 caracteres"
                  {...register('password', {
                    required: 'Senha obrigatória',
                    minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                  })}
                />
                {errors.password && (
                  <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="label">Confirmar senha</label>
                <input
                  type="password"
                  className="input"
                  placeholder="Digite novamente"
                  {...register('passwordConfirm', {
                    required: 'Confirme sua senha',
                    validate: (v) => v === password || 'Senhas não conferem',
                  })}
                />
                {errors.passwordConfirm && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.passwordConfirm.message}
                  </p>
                )}
              </div>

              <div className="flex items-start gap-2 py-2">
                <input
                  id="terms"
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 text-nan-primary rounded"
                  {...register('acceptTerms', { required: 'Aceite os termos para continuar' })}
                />
                <label htmlFor="terms" className="text-xs text-nan-gray leading-snug">
                  Li e aceito os{' '}
                  <a className="text-nan-primary font-semibold">Termos de Uso</a> e{' '}
                  <a className="text-nan-primary font-semibold">Política de Privacidade</a>.
                  Entendo que nada será compartilhado sem meu consentimento explícito.
                </label>
              </div>
              {errors.acceptTerms && (
                <p className="text-xs text-red-600">{errors.acceptTerms.message}</p>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    Criar minha conta <Check size={18} />
                  </>
                )}
              </button>
            </form>

            <p className="text-sm text-center mt-6 text-nan-gray">
              Já tem conta?{' '}
              <Link to="/login" className="text-nan-primary font-semibold">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
