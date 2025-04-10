'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CloudArrowUpIcon, VideoCameraIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

interface Replay {
  id: string;
  title: string;
  date: string;
  duration: string;
  gameMode: string;
  score: string;
  status: 'pending' | 'analyzed' | 'reviewing';
  feedback?: string;
}

const sampleReplays: Replay[] = [
  {
    id: '1',
    title: 'Ranked 2v2 - Champion II',
    date: '2024-02-15',
    duration: '5:32',
    gameMode: '2v2',
    score: '3-2',
    status: 'analyzed',
    feedback: 'Jó rotáció és positioning, de a boost management-en még dolgozni kell. A 3:15-nél egy kritikus védelmi hiba történt.',
  },
  {
    id: '2',
    title: 'Tournament Finals',
    date: '2024-02-14',
    duration: '7:15',
    gameMode: '3v3',
    score: '4-3',
    status: 'reviewing',
  },
  {
    id: '3',
    title: 'Casual 1v1',
    date: '2024-02-13',
    duration: '4:45',
    gameMode: '1v1',
    score: '5-4',
    status: 'pending',
  },
];

export default function ReplayAnalyzer() {
  const [selectedReplay, setSelectedReplay] = useState<Replay | null>(null);

  const getStatusColor = (status: Replay['status']) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500';
      case 'analyzed':
        return 'text-green-500';
      case 'reviewing':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusText = (status: Replay['status']) => {
    switch (status) {
      case 'pending':
        return 'Elemzésre vár';
      case 'analyzed':
        return 'Elemezve';
      case 'reviewing':
        return 'Felülvizsgálat alatt';
      default:
        return 'Ismeretlen';
    }
  };

  return (
    <div className="space-y-6">
      {/* Replay feltöltés */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center justify-center h-48 border-2 border-dashed border-gray-600 rounded-xl">
          <div className="text-center">
            <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Replay Feltöltése
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-400">
              vagy húzd ide a fájlt
            </p>
          </div>
        </div>
      </motion.div>

      {/* Replay lista */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 rounded-2xl p-6 border border-white/10"
      >
        <h3 className="text-xl font-bold text-white mb-6">Replay Könyvtár</h3>
        <div className="space-y-4">
          {sampleReplays.map((replay) => (
            <motion.div
              key={replay.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`bg-white/5 rounded-xl p-4 border border-white/10 cursor-pointer transition hover:bg-white/10 ${
                selectedReplay?.id === replay.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedReplay(replay)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <VideoCameraIcon className="h-8 w-8 text-gray-400" />
                  <div>
                    <h4 className="text-lg font-semibold text-white">
                      {replay.title}
                    </h4>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-gray-400">
                        {replay.date}
                      </span>
                      <span className="text-sm text-gray-400">
                        {replay.duration}
                      </span>
                      <span className="text-sm text-gray-400">
                        {replay.gameMode}
                      </span>
                      <span className="text-sm text-gray-400">
                        {replay.score}
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`text-sm font-medium ${getStatusColor(replay.status)}`}>
                  {getStatusText(replay.status)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Elemzés részletei */}
      {selectedReplay && selectedReplay.status === 'analyzed' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-start gap-4">
            <ChatBubbleLeftIcon className="h-6 w-6 text-blue-500 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Coach Visszajelzés</h3>
              <p className="text-gray-300 leading-relaxed">{selectedReplay.feedback}</p>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Erősségek</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Kiváló rotáció</li>
                    <li>• Jó positioning</li>
                    <li>• Hatékony csapatjáték</li>
                  </ul>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Fejlesztendő Területek</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Boost management</li>
                    <li>• Védelmi helyezkedés</li>
                  </ul>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Következő Lépések</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Boost pad útvonalak gyakorlása</li>
                    <li>• Védekező pozíciók áttekintése</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
} 