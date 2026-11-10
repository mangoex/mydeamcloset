import React, { useState } from 'react';
import { UserProfile } from '../types/auth';
import { registerUser, loginUser, getRegisteredUsers } from '../services/authService';
import {
  Lock,
  Mail,
  User,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  X,
  Heart,
  Check,
  AlertCircle,
  Users,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onAuthSuccess: (user: UserProfile) => void;
  canClose?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  canClose = false,
}) => {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [favoriteStyle, setFavoriteStyle] = useState<string>('Casual Chic');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const registeredUsers = getRegisteredUsers();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    if (mode === 'register') {
      const res = registerUser(name, email, password, favoriteStyle);
      setIsLoading(false);
      if (res.error) {
        setErrorMessage(res.error);
      } else if (res.user) {
        onAuthSuccess(res.user);
      }
    } else {
      const res = loginUser(email, password);
      setIsLoading(false);
      if (res.error) {
        setErrorMessage(res.error);
      } else if (res.user) {
        onAuthSuccess(res.user);
      }
    }
  };

  const handleQuickLogin = (user: UserProfile) => {
    setErrorMessage(null);
    // Fill credentials and auto-login
    setEmail(user.email);
    setPassword('1234'); // Demo password fallback
    const res = loginUser(user.email, '1234');
    if (res.user) {
      onAuthSuccess(res.user);
    } else {
      setMode('login');
      setEmail(user.email);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Editorial Top Brand Header */}
        <div className="p-6 bg-gradient-to-b from-stone-900 to-stone-850 text-white relative">
          {canClose && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="text-[11px] font-mono uppercase tracking-widest text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Armario Privado & Estilista Personal</span>
          </div>

          <h2 className="text-2xl font-serif font-bold tracking-tight text-white mt-1">
            My Dream <span className="italic font-normal text-stone-300">Closet</span>
          </h2>

          <p className="text-stone-300 text-xs mt-1.5 leading-relaxed">
            Cada persona tiene su propio armario privado, fotos aisladas en estudio y su asistente personal de moda.
          </p>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-stone-800/80 p-1 rounded-xl mt-5 border border-stone-700/60">
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center ${
                mode === 'register'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              Crear Cuenta
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center ${
                mode === 'login'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              Iniciar Sesión
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Tu Nombre o Apodo
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Ej: Sofia, Valentina, Carlos..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50/50"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="Mínimo 4 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50/50"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Tu Estilo Predilecto
              </label>
              <select
                value={favoriteStyle}
                onChange={(e) => setFavoriteStyle(e.target.value)}
                className="w-full px-3 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50/50 text-stone-800 cursor-pointer"
              >
                <option value="Casual Chic">Casual Chic (Cómodo & Elegante)</option>
                <option value="Minimalista">Minimalista (Limpio & Neutro)</option>
                <option value="Alta Costura">Alta Costura (Sofisticado & Editorial)</option>
                <option value="Streetwear">Streetwear (Urbano & Moderno)</option>
                <option value="Romántico">Romántico & Femenino</option>
                <option value="Deportivo">Deportivo & Athleisure</option>
              </select>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm active:scale-98 disabled:opacity-50"
            >
              <span>{mode === 'register' ? 'Crear mi armario privado' : 'Entrar a mi armario'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Privacy Guarantee Note */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400 text-center pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tus prendas, fotos y looks son 100% privados para tu cuenta.</span>
          </div>
        </form>

        {/* Existing Accounts Switcher (if other users registered on this browser) */}
        {registeredUsers.length > 0 && (
          <div className="p-4 bg-stone-50 border-t border-stone-100 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-stone-600" />
                <span>Cuentas en la Base de Datos ({registeredUsers.length}):</span>
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {registeredUsers.slice(0, 4).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickLogin(u)}
                  className="px-2.5 py-1.5 bg-white border border-stone-200 hover:border-stone-400 rounded-lg text-xs font-medium text-stone-800 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                >
                  <span className={`w-3.5 h-3.5 rounded-full ${u.avatarColor} text-white text-[8px] flex items-center justify-center font-bold`}>
                    {u.name.charAt(0).toUpperCase()}
                  </span>
                  <span>{u.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
