'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  FaStore, 
  FaLock, 
  FaQuestion,
  FaVideo,
  FaGamepad,
  FaComments,
  FaClock,
  FaCheck
} from 'react-icons/fa';
import { useRLM, SHOP_PRICES, ShopItem } from '@/contexts/RLMContext';

const PERMANENT_SHOP_ITEMS = [
  {
    id: 'perm-replay',
    type: 'replay_analysis' as const,
    name: 'Replay Elemzés',
    description: 'Részletes elemzés a replay fájlodról személyre szabott tippekkel és tanácsokkal.',
    icon: FaVideo,
    boostCost: SHOP_PRICES.replay_analysis,
  },
  {
    id: 'perm-game',
    type: 'common_game' as const,
    name: 'Közös Játék',
    description: 'Játssz együtt a coach-al és tanulj valós időben a hibáidból.',
    icon: FaGamepad,
    boostCost: SHOP_PRICES.common_game,
  },
  {
    id: 'perm-coaching',
    type: 'coaching' as const,
    name: 'Coaching Session',
    description: 'Személyre szabott 1-on-1 coaching session a fejlődésedért.',
    icon: FaComments,
    boostCost: SHOP_PRICES.coaching,
  },
];

function MysteryItem({ item, onReveal, onPurchase }: { 
  item: ShopItem; 
  onReveal: () => void;
  onPurchase: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative bg-gradient-to-br from-purple-900/50 to-black/50 rounded-2xl border border-purple-500/30 overflow-hidden"
    >
      {!item.revealed ? (
        // Mystery state
        <div className="aspect-square flex flex-col items-center justify-center p-6">
          <motion.div
            animate={{ 
              rotate: isHovered ? [0, -10, 10, -10, 10, 0] : 0,
              scale: isHovered ? 1.1 : 1
            }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4"
          >
            <FaQuestion className="w-10 h-10 text-white" />
          </motion.div>
          <h3 className="text-white font-bold text-lg mb-2">Rejtélyes Tárgy</h3>
          <p className="text-gray-400 text-sm text-center mb-4">Kattints a felfedéshez!</p>
          <button
            onClick={onReveal}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            Felfedés
          </button>
        </div>
      ) : (
        // Revealed state
        <div>
          <div className="aspect-square bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center">
            {item.image ? (
              <Image src={item.image} alt={item.name} fill className="object-cover" />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🎁</span>
              </div>
            )}
          </div>
          <div className="p-4">
            <span className="text-xs text-purple-400 font-medium">
              {item.type === 'profile_picture' ? 'Profilkép' : 'Profilbanner'}
            </span>
            <h3 className="text-white font-bold mt-1">{item.name}</h3>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <Image src="/Boost.png" alt="Boost" width={20} height={20} />
                <span className="text-white font-bold">{item.boostCost}</span>
              </div>
              <button
                onClick={onPurchase}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg text-sm hover:from-orange-600 hover:to-red-600 transition-all"
              >
                Megveszem
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function PermanentShopItem({ item, onPurchase, canAfford }: { 
  item: typeof PERMANENT_SHOP_ITEMS[0]; 
  onPurchase: () => void;
  canAfford: boolean;
}) {
  const Icon = item.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden"
    >
      <div className="p-6">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
        <p className="text-gray-400 text-sm mb-4">{item.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/Boost.png" alt="Boost" width={24} height={24} />
            <span className="text-xl font-bold text-white">{item.boostCost}</span>
          </div>
          <button
            onClick={onPurchase}
            disabled={!canAfford}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
              canAfford
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                : 'bg-white/10 text-gray-500 cursor-not-allowed'
            }`}
          >
            {canAfford ? 'Megveszem' : 'Nincs elég Boost'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function ShopPage() {
  const { profile, revealShopItem, purchaseItem, purchaseShopItem, addNotification } = useRLM();
  const [purchaseModal, setPurchaseModal] = useState<{ type: string; name: string } | null>(null);

  const isLocked = profile.level < 10;

  // Calculate time until next shop refresh
  const getTimeUntilRefresh = () => {
    const lastRefresh = new Date(profile.shopLastRefresh);
    const nextRefresh = new Date(lastRefresh.getTime() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diff = nextRefresh.getTime() - now.getTime();
    
    if (diff <= 0) return 'Frissül hamarosan...';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days}n ${hours}ó`;
  };

  const handlePurchaseMystery = (item: ShopItem) => {
    if (profile.boost < item.boostCost) {
      addNotification('Nincs elég Boost-od a vásárláshoz!', 'error');
      return;
    }
    purchaseItem(item);
    addNotification(`Sikeresen megvásároltad: ${item.name}`, 'success');
  };

  const handlePurchasePermanent = (itemType: 'replay_analysis' | 'common_game' | 'coaching') => {
    const success = purchaseShopItem(itemType);
    if (success) {
      const names = {
        replay_analysis: 'Replay Elemzés',
        common_game: 'Közös Játék',
        coaching: 'Coaching Session',
      };
      addNotification(`Sikeresen megvásároltad: ${names[itemType]}`, 'success');
      setPurchaseModal(null);
    } else {
      addNotification('Nincs elég Boost-od a vásárláshoz!', 'error');
    }
  };

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FaLock className="w-12 h-12 text-gray-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Shop Zárolva</h1>
          <p className="text-gray-400 mb-6">Érd el a 10. szintet a Shop feloldásához!</p>
          <div className="bg-white/5 rounded-xl px-6 py-3 inline-flex items-center gap-3">
            <span className="text-gray-400">Jelenlegi szinted:</span>
            <span className="text-2xl font-bold text-orange-500">{profile.level}</span>
            <span className="text-gray-400">/ 10</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FaStore className="text-orange-500" />
            Shop
          </h1>
          <p className="text-gray-400 mt-1">Vásárolj egyedi tárgyakat Boost-ért</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2">
          <Image src="/Boost.png" alt="Boost" width={24} height={24} />
          <span className="text-xl font-bold text-white">{profile.boost}</span>
          <span className="text-gray-400">Boost</span>
        </div>
      </div>

      {/* Permanent Shop */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">Állandó Kínálat</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PERMANENT_SHOP_ITEMS.map(item => (
            <PermanentShopItem
              key={item.id}
              item={item}
              onPurchase={() => setPurchaseModal({ type: item.type, name: item.name })}
              canAfford={profile.boost >= item.boostCost}
            />
          ))}
        </div>
      </section>

      {/* Weekly Mystery Shop */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Heti Mystery Shop</h2>
          <div className="flex items-center gap-2 text-gray-400">
            <FaClock className="w-4 h-4" />
            <span className="text-sm">Frissül: {getTimeUntilRefresh()}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {profile.weeklyShopItems.map(item => (
            <MysteryItem
              key={item.id}
              item={item}
              onReveal={() => revealShopItem(item.id)}
              onPurchase={() => handlePurchaseMystery(item)}
            />
          ))}
          {profile.weeklyShopItems.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-gray-400">A heti shop hamarosan frissül!</p>
            </div>
          )}
        </div>
      </section>

      {/* Purchase Confirmation Modal */}
      <AnimatePresence>
        {purchaseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setPurchaseModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0D1321] border border-white/10 rounded-2xl p-6 max-w-md w-full"
            >
              <h2 className="text-xl font-bold text-white mb-2">Vásárlás megerősítése</h2>
              <p className="text-gray-400 mb-6">
                Biztosan meg szeretnéd vásárolni: <span className="text-white font-medium">{purchaseModal.name}</span>?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setPurchaseModal(null)}
                  className="flex-1 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
                >
                  Mégse
                </button>
                <button
                  onClick={() => handlePurchasePermanent(purchaseModal.type as 'replay_analysis' | 'common_game' | 'coaching')}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium hover:from-orange-600 hover:to-red-600 transition-colors"
                >
                  Megveszem
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
