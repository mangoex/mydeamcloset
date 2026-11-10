import React, { useState, useEffect } from 'react';
import { ClothingItem, ClothingCategory, Outfit } from './types/wardrobe';
import { UserProfile } from './types/auth';
import {
  getActiveSessionUser,
  logoutUser,
  getUserWardrobe,
  setUserWardrobe,
  getUserSavedOutfits,
  setUserSavedOutfits,
  ensureIsolatedClosets,
} from './services/authService';
import { Header, NavTab } from './components/Header';
import { WardrobeView } from './components/WardrobeView';
import { OutfitCombinerSlot } from './components/OutfitCombinerSlot';
import { OutfitGenerator } from './components/OutfitGenerator';
import { DailyWeatherStylist } from './components/DailyWeatherStylist';
import { SavedOutfitsView } from './components/SavedOutfitsView';
import { UploadModal } from './components/UploadModal';
import { AuthModal } from './components/AuthModal';
import { ShieldCheck, User } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('wardrobe');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [preselectedCategory, setPreselectedCategory] = useState<ClothingCategory | undefined>(undefined);
  const [anchorItem, setAnchorItem] = useState<ClothingItem | null>(null);

  // Run isolation check once on startup to guarantee Renata's closet is hers and Miguel's is clean
  useEffect(() => {
    ensureIsolatedClosets();
  }, []);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getActiveSessionUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(() => !getActiveSessionUser());

  // User Wardrobe State (Strictly isolated per currentUser.id)
  const [wardrobe, setWardrobe] = useState<ClothingItem[]>(() => {
    ensureIsolatedClosets();
    const active = getActiveSessionUser();
    if (!active) return [];
    return getUserWardrobe(active.id);
  });

  // User Saved Outfits State (Strictly isolated per currentUser.id)
  const [savedOutfits, setSavedOutfits] = useState<Outfit[]>(() => {
    const active = getActiveSessionUser();
    if (!active) return [];
    return getUserSavedOutfits(active.id);
  });

  // Handle successful login or registration
  const handleAuthSuccess = (user: UserProfile) => {
    ensureIsolatedClosets();
    setCurrentUser(user);
    setIsAuthModalOpen(false);

    // Strictly load this specific user's private wardrobe
    const userItems = getUserWardrobe(user.id);
    setWardrobe(userItems);

    // Strictly load this specific user's saved outfits
    const userOutfits = getUserSavedOutfits(user.id);
    setSavedOutfits(userOutfits);
  };

  // Handle logout
  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setWardrobe([]);
    setSavedOutfits([]);
    setAnchorItem(null);
    setIsAuthModalOpen(true);
  };

  const handleSaveItem = (item: ClothingItem) => {
    setWardrobe((prev) => {
      const updated = [item, ...prev];
      if (currentUser) {
        setUserWardrobe(currentUser.id, updated);
      }
      return updated;
    });
  };

  const handleDeleteItem = (id: string) => {
    setWardrobe((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      if (currentUser) {
        setUserWardrobe(currentUser.id, updated);
      }
      return updated;
    });
    if (anchorItem?.id === id) {
      setAnchorItem(null);
    }
  };

  const handleDeleteMultipleItems = (ids: string[]) => {
    setWardrobe((prev) => {
      const updated = prev.filter((item) => !ids.includes(item.id));
      if (currentUser) {
        setUserWardrobe(currentUser.id, updated);
      }
      return updated;
    });
    if (anchorItem && ids.includes(anchorItem.id)) {
      setAnchorItem(null);
    }
  };

  const handleSaveOutfit = (outfit: Outfit) => {
    setSavedOutfits((prev) => {
      if (prev.some((o) => o.id === outfit.id)) return prev;
      const updated = [outfit, ...prev];
      if (currentUser) {
        setUserSavedOutfits(currentUser.id, updated);
      }
      return updated;
    });
  };

  const handleDeleteOutfit = (id: string) => {
    setSavedOutfits((prev) => {
      const updated = prev.filter((o) => o.id !== id);
      if (currentUser) {
        setUserSavedOutfits(currentUser.id, updated);
      }
      return updated;
    });
  };

  const handleOpenUpload = (cat?: ClothingCategory) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setPreselectedCategory(cat);
    setIsUploadModalOpen(true);
  };

  const handleSelectAnchorItem = (item: ClothingItem) => {
    setAnchorItem(item);
    setActiveTab('generator');
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] text-stone-900 flex flex-col selection:bg-stone-200">
      {/* 3-Zone Header Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={() => handleOpenUpload()}
        wardrobeCount={wardrobe.length}
        savedCount={savedOutfits.length}
        user={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Unauthenticated Notification Banner if guest is browsing */}
      {!currentUser && (
        <div className="bg-amber-50/90 border-b border-amber-200 py-3 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-amber-900">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Modo Privado:</strong> Inicia sesión o regístrate para acceder a tu propio armario exclusivo.
              </span>
            </div>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs cursor-pointer transition-colors shadow-2xs whitespace-nowrap"
            >
              Iniciar Sesión / Registrarme
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'wardrobe' && (
          <WardrobeView
            wardrobe={wardrobe}
            onOpenUpload={() => handleOpenUpload()}
            onDeleteItem={handleDeleteItem}
            onDeleteMultipleItems={handleDeleteMultipleItems}
            onSelectAnchorItem={handleSelectAnchorItem}
            onNavigateToCombiner={() => setActiveTab('combiner')}
            userName={currentUser?.name}
          />
        )}

        {activeTab === 'combiner' && (
          <OutfitCombinerSlot
            wardrobe={wardrobe}
            savedOutfits={savedOutfits}
            onSaveOutfit={handleSaveOutfit}
            onOpenUpload={handleOpenUpload}
          />
        )}

        {activeTab === 'generator' && (
          <OutfitGenerator
            wardrobe={wardrobe}
            anchorItem={anchorItem}
            onClearAnchorItem={() => setAnchorItem(null)}
            onSaveOutfit={handleSaveOutfit}
            onOpenUpload={() => handleOpenUpload()}
          />
        )}

        {activeTab === 'daily' && (
          <DailyWeatherStylist
            wardrobe={wardrobe}
            onSaveOutfit={handleSaveOutfit}
            onOpenUpload={() => handleOpenUpload()}
          />
        )}

        {activeTab === 'saved' && (
          <SavedOutfitsView
            savedOutfits={savedOutfits}
            wardrobe={wardrobe}
            onDeleteOutfit={handleDeleteOutfit}
            onNavigateToGenerator={() => setActiveTab('generator')}
          />
        )}
      </main>

      {/* Upload & Clean Garment Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setPreselectedCategory(undefined);
        }}
        onSaveItem={handleSaveItem}
        initialCategory={preselectedCategory}
      />

      {/* User Registration & Multi-Account Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          if (currentUser) {
            setIsAuthModalOpen(false);
          }
        }}
        onAuthSuccess={handleAuthSuccess}
        canClose={!!currentUser}
      />

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-8 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-stone-900">My Dream Closet</span>
            <span>·</span>
            <span>
              {currentUser ? `Armario personal de ${currentUser.name}` : 'Armario digital privado por cuenta'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-stone-400">
            <span>Privacidad garantizada por cuenta</span>
            <span>·</span>
            <span>Probador Visual 3 Secciones</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
