'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  FaBoxOpen, 
  FaUser, 
  FaImage, 
  FaTrophy, 
  FaVideo, 
  FaGamepad,
  FaComments,
  FaCheck,
  FaTimes,
  FaFilter
} from 'react-icons/fa';
import { useRLM, InventoryItem, ItemType } from '@/contexts/RLMContext';

const ITEM_TYPE_LABELS: Record<ItemType, { label: string; icon: React.ElementType }> = {
  profile_picture: { label: 'Profilkép', icon: FaUser },
  profile_banner: { label: 'Profilbanner', icon: FaImage },
  badge: { label: 'Badge', icon: FaTrophy },
  coaching: { label: 'Coaching', icon: FaComments },
  replay_analysis: { label: 'Replay Elemzés', icon: FaVideo },
  common_game: { label: 'Közös Játék', icon: FaGamepad },
};

const FILTER_OPTIONS: { value: ItemType | 'all'; label: string }[] = [
  { value: 'all', label: 'Összes' },
  { value: 'profile_picture', label: 'Profilképek' },
  { value: 'profile_banner', label: 'Bannerek' },
  { value: 'badge', label: 'Badge-ek' },
  { value: 'coaching', label: 'Coaching' },
  { value: 'replay_analysis', label: 'Replay Elemzések' },
  { value: 'common_game', label: 'Közös Játékok' },
];

function InventoryItemCard({ item, onEquip, onUse }: { 
  item: InventoryItem; 
  onEquip?: () => void;
  onUse?: () => void;
}) {
  const typeInfo = ITEM_TYPE_LABELS[item.type];
  const Icon = typeInfo.icon;
  const isEquippable = item.type === 'profile_picture' || item.type === 'profile_banner';
  const isUsable = item.type === 'coaching' || item.type === 'replay_analysis' || item.type === 'common_game';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-white/5 rounded-2xl border overflow-hidden transition-all ${
        item.equipped 
          ? 'border-orange-500/50 ring-2 ring-orange-500/20' 
          : 'border-white/10 hover:border-white/20'
      }`}
    >
      {/* Image/Icon */}
      <div className="aspect-square bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center relative">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
          />
        ) : (
          <Icon className="w-12 h-12 text-gray-500" />
        )}
        
        {item.equipped && (
          <div className="absolute top-2 right-2 bg-orange-500 rounded-full p-1">
            <FaCheck className="w-3 h-3 text-white" />
          </div>
        )}
        
        {item.used && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-gray-400 font-medium">Felhasználva</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-orange-400 font-medium">{typeInfo.label}</span>
        </div>
        <h3 className="text-white font-medium mb-1">{item.name}</h3>
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{item.description}</p>

        {/* Admin Response */}
        {item.adminResponse && (
          <div className="mb-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-xs text-blue-400 font-medium mb-1">Coach üzenet:</p>
            <p className="text-sm text-gray-300">{item.adminResponse}</p>
          </div>
        )}

        {/* Actions */}
        {isEquippable && !item.used && (
          <button
            onClick={onEquip}
            className={`w-full py-2 rounded-lg font-medium text-sm transition-all ${
              item.equipped
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {item.equipped ? 'Felszerelve' : 'Felszerel'}
          </button>
        )}

        {isUsable && !item.used && (
          <button
            onClick={onUse}
            className="w-full py-2 rounded-lg font-medium text-sm bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 transition-all"
          >
            Beváltás
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function InventoryPage() {
  const { profile, equipItem, unequipItem } = useRLM();
  const [filter, setFilter] = useState<ItemType | 'all'>('all');
  const [showRedeemModal, setShowRedeemModal] = useState<InventoryItem | null>(null);

  const filteredItems = profile.inventory.filter(item => 
    filter === 'all' || item.type === filter
  );

  const handleEquip = (item: InventoryItem) => {
    if (item.equipped) {
      unequipItem(item.type);
    } else {
      equipItem(item.id);
    }
  };

  const handleUse = (item: InventoryItem) => {
    setShowRedeemModal(item);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FaBoxOpen className="text-orange-500" />
            Raktár
          </h1>
          <p className="text-gray-400 mt-1">Minden megszerzett tárgyad egy helyen</p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <FaFilter className="text-gray-400" />
          {FILTER_OPTIONS.map(option => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === option.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map(item => (
            <InventoryItemCard
              key={item.id}
              item={item}
              onEquip={() => handleEquip(item)}
              onUse={() => handleUse(item)}
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 bg-white/5 rounded-2xl border border-white/10"
        >
          <FaBoxOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-400 mb-2">
            {filter === 'all' ? 'A raktárad üres' : 'Nincs ilyen típusú tárgyad'}
          </h3>
          <p className="text-gray-500">
            Szerezz tárgyakat a Shop-ból vagy teljesíts küldetéseket!
          </p>
        </motion.div>
      )}

      {/* Redeem Modal */}
      <AnimatePresence>
        {showRedeemModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowRedeemModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0D1321] border border-white/10 rounded-2xl p-6 max-w-md w-full"
            >
              <h2 className="text-xl font-bold text-white mb-4">
                {showRedeemModal.name} beváltása
              </h2>
              <p className="text-gray-400 mb-6">
                {showRedeemModal.type === 'coaching' && 
                  'A coaching session egyeztetéséhez vedd fel a kapcsolatot a coach-al Discord-on vagy az üzeneteken keresztül.'
                }
                {showRedeemModal.type === 'replay_analysis' && 
                  'Küldj be egy replay fájlt a Mission Pass oldalon az elemzéshez.'
                }
                {showRedeemModal.type === 'common_game' && 
                  'A közös játék egyeztetéséhez vedd fel a kapcsolatot a coach-al.'
                }
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRedeemModal(null)}
                  className="flex-1 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
                >
                  Mégse
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement actual redemption logic
                    setShowRedeemModal(null);
                  }}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium hover:from-orange-600 hover:to-red-600 transition-colors"
                >
                  Beváltom
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
