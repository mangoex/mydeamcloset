import React, { useState } from 'react';
import {
  Sparkles,
  Shirt,
  Wand2,
  BookmarkCheck,
  CalendarCheck,
  Plus,
  Shuffle,
  Layers,
  User,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { UserProfile } from '../types/auth';

export type NavTab = 'wardrobe' | 'combiner' | 'generator' | 'daily' | 'saved';

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenUpload: () => void;
  wardrobeCount: number;
  savedCount: number;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenUpload,
  wardrobeCount,
  savedCount,
  user,
  onOpenAuth,
  onLogout,
}) => {
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => setActiveTab('wardrobe')}
          className="text-left group cursor-pointer focus-visible:outline-none shrink-0"
        >
          <span className="text-2xl font-serif font-bold tracking-tight text-stone-900 group-hover:text-stone-700 transition-colors whitespace-nowrap">
            My Dream <span className="italic font-normal text-stone-600">Closet</span>
          </span>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-stone-600">
          <button
            onClick={() => setActiveTab('wardrobe')}
            className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors relative py-1 ${
              activeTab === 'wardrobe'
                ? 'text-stone-950 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-stone-900'
                : 'hover:text-stone-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Shirt className="w-4 h-4 text-stone-500" />
              <span>Mi Armario</span>
              <span className="text-xs text-stone-400 font-mono">({wardrobeCount})</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('combiner')}
            className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors relative py-1 ${
              activeTab === 'combiner'
                ? 'text-stone-950 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-stone-900'
                : 'hover:text-stone-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-stone-500" />
              <span>Probador Visual</span>
              <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] font-mono font-bold rounded">NUEVO</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('generator')}
            className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors relative py-1 ${
              activeTab === 'generator'
                ? 'text-stone-950 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-stone-900'
                : 'hover:text-stone-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Wand2 className="w-4 h-4 text-stone-500" />
              <span>Crear con IA</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('daily')}
            className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors relative py-1 ${
              activeTab === 'daily'
                ? 'text-stone-950 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-stone-900'
                : 'hover:text-stone-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <CalendarCheck className="w-4 h-4 text-stone-500" />
              <span>¿Qué me pongo hoy?</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors relative py-1 ${
              activeTab === 'saved'
                ? 'text-stone-950 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-stone-900'
                : 'hover:text-stone-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <BookmarkCheck className="w-4 h-4 text-stone-500" />
              <span>Mis Looks</span>
              {savedCount > 0 && (
                <span className="text-xs text-stone-400 font-mono">({savedCount})</span>
              )}
            </span>
          </button>
        </nav>

        {/* Zone 3: Add Garment & User Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer shadow-sm whitespace-nowrap shrink-0 active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Añadir Prenda</span>
            <span className="sm:hidden">Subir</span>
          </button>

          {/* User Account / Profile */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-stone-200 hover:border-stone-300 bg-white cursor-pointer shadow-2xs transition-colors"
                title={`Cuenta activa: ${user.name}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg ${user.avatarColor} text-white flex items-center justify-center font-bold text-xs shadow-2xs`}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="text-xs font-semibold text-stone-800 max-w-[100px] truncate block leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono block leading-none">
                    Armario Propio
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div
                  onMouseLeave={() => setShowUserMenu(false)}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1"
                >
                  <div className="px-3 py-2 border-b border-stone-100">
                    <p className="text-xs font-bold text-stone-900 truncate">Closet de {user.name}</p>
                    <p className="text-[11px] text-stone-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-100 text-stone-600">
                      {wardrobeCount} prendas privadas
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenAuth();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <User className="w-4 h-4 text-stone-500" />
                    <span>Cambiar de Cuenta</span>
                  </button>

                  <div className="border-t border-stone-100 pt-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white transition-colors cursor-pointer"
            >
              Registrarse / Entrar
            </button>
          )}
        </div>
      </div>

      {/* Mobile navigation bar */}
      <div className="lg:hidden flex items-center justify-around border-t border-stone-100 py-2.5 px-1 bg-white text-xs text-stone-600">
        <button
          onClick={() => setActiveTab('wardrobe')}
          className={`flex flex-col items-center gap-1 py-1 px-1.5 ${
            activeTab === 'wardrobe' ? 'text-stone-900 font-semibold' : 'text-stone-500'
          }`}
        >
          <Shirt className="w-4 h-4" />
          <span>Armario</span>
        </button>
        <button
          onClick={() => setActiveTab('combiner')}
          className={`flex flex-col items-center gap-1 py-1 px-1.5 ${
            activeTab === 'combiner' ? 'text-stone-900 font-semibold' : 'text-stone-500'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Probador</span>
        </button>
        <button
          onClick={() => setActiveTab('generator')}
          className={`flex flex-col items-center gap-1 py-1 px-1.5 ${
            activeTab === 'generator' ? 'text-stone-900 font-semibold' : 'text-stone-500'
          }`}
        >
          <Wand2 className="w-4 h-4" />
          <span>Outfits</span>
        </button>
        <button
          onClick={() => setActiveTab('daily')}
          className={`flex flex-col items-center gap-1 py-1 px-1.5 ${
            activeTab === 'daily' ? 'text-stone-900 font-semibold' : 'text-stone-500'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Hoy</span>
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex flex-col items-center gap-1 py-1 px-1.5 ${
            activeTab === 'saved' ? 'text-stone-900 font-semibold' : 'text-stone-500'
          }`}
        >
          <BookmarkCheck className="w-4 h-4" />
          <span>Looks ({savedCount})</span>
        </button>
      </div>
    </header>
  );
};
